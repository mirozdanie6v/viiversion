#!/usr/bin/env python3
"""VIIVERSION Dev Cloud MVP: durable single-worker Codex execution on Linux.

Standard-library only (Python 3.10+). Does not provision servers or deploy code.
"""
from __future__ import annotations

import argparse
import fcntl
import json
import os
from pathlib import Path
import re
import signal
import sqlite3
import subprocess
import sys
import time
import uuid

HOME = Path(os.environ.get("VII_DEV_HOME", "~/.local/share/viiversion-dev-cloud")).expanduser()
CONFIG = Path(os.environ.get("VII_DEV_CONFIG", "~/.config/viiversion-dev-cloud/projects.json")).expanduser()
CODEX = os.environ.get("VII_DEV_CODEX_BIN", "codex")
MAX_SECONDS = int(os.environ.get("VII_DEV_MAX_SECONDS", "3600"))


def setup():
    HOME.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(HOME, 0o700)
    (HOME / "runs").mkdir(mode=0o700, exist_ok=True)
    (HOME / "worktrees").mkdir(mode=0o700, exist_ok=True)
    db = sqlite3.connect(HOME / "state.sqlite3", timeout=15, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA busy_timeout=15000")
    db.execute("PRAGMA journal_mode=WAL")
    db.executescript("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY, project TEXT NOT NULL, title TEXT NOT NULL,
        prompt TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'queued',
        linear_id TEXT, attempts INTEGER NOT NULL DEFAULT 0,
        worktree TEXT, branch TEXT, note TEXT,
        created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL, at INTEGER NOT NULL,
        event TEXT NOT NULL, details TEXT
    );
    CREATE TABLE IF NOT EXISTS flags (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    INSERT OR IGNORE INTO flags(key,value) VALUES ('paused','0');
    """)
    os.chmod(HOME / "state.sqlite3", 0o600)
    return db


def event(db, task_id, kind, details=""):
    db.execute("INSERT INTO events(task_id,at,event,details) VALUES(?,?,?,?)",
               (task_id, int(time.time()), kind, details[:2000]))


def projects():
    data = json.loads(CONFIG.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not data:
        raise ValueError("projects.json must map project names to {path,base_branch}")
    return data


def repo_for(name):
    entry = projects().get(name)
    if not isinstance(entry, dict):
        raise ValueError(f"Project {name!r} is not allowlisted in {CONFIG}")
    path = Path(entry["path"]).expanduser().resolve(strict=True)
    head = subprocess.check_output(
        ["git", "-C", str(path), "rev-parse", "--show-toplevel"],
        text=True, timeout=15).strip()
    if Path(head).resolve() != path:
        raise ValueError("Project path must be the Git repository root")
    base = entry.get("base_branch", "main")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._/-]{0,100}", base) or ".." in base:
        raise ValueError("Invalid base branch")
    subprocess.run(["git", "-C", str(path), "rev-parse", "--verify",
                    f"refs/heads/{base}"], check=True, capture_output=True, timeout=15)
    return path, base


def enqueue(db, a):
    repo_for(a.project)  # fail closed if project is not allowlisted
    ident = str(uuid.uuid4())
    now = int(time.time())
    db.execute("""INSERT INTO tasks
        (id,project,title,prompt,linear_id,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?)""",
        (ident, a.project, a.title, a.prompt, a.linear_id, now, now))
    event(db, ident, "enqueued")
    return ident


def reconcile(db):
    # Server reboot or worker crash: never blindly replay a partially edited tree.
    running = db.execute("SELECT id FROM tasks WHERE status='running'").fetchall()
    for task in running:
        db.execute("""UPDATE tasks SET status='needs_review', updated_at=?,
            note='Process interrupted; inspect worktree before retry'
            WHERE id=?""", (int(time.time()), task["id"]))
        event(db, task["id"], "interrupted", "manual review required")
    return len(running)


def set_status(db, task_id, status, note):
    db.execute("UPDATE tasks SET status=?, note=?, updated_at=? WHERE id=?",
               (status, note, int(time.time()), task_id))
    event(db, task_id, status, note)


def run_one(db):
    if db.execute("SELECT value FROM flags WHERE key='paused'").fetchone()[0] == "1":
        return "paused"
    if db.execute("SELECT 1 FROM tasks WHERE status='needs_review' LIMIT 1").fetchone():
        return "review_required"
    task = db.execute("""SELECT * FROM tasks WHERE status='queued'
                          ORDER BY created_at,rowid LIMIT 1""").fetchone()
    if task is None:
        return "empty"
    ident = task["id"]
    try:
        repo, base = repo_for(task["project"])
        short = ident.split("-")[0]
        branch = f"devcloud/{short}"
        worktree = HOME / "worktrees" / ident
        if worktree.exists():
            raise RuntimeError("Worktree unexpectedly exists; inspect manually")
        subprocess.run(["git", "-C", str(repo), "worktree", "add", "-b",
                        branch, str(worktree), base],
                       check=True, capture_output=True, text=True, timeout=60)
        db.execute("""UPDATE tasks SET status='running', attempts=attempts+1,
            branch=?, worktree=?, updated_at=? WHERE id=?""",
            (branch, str(worktree), int(time.time()), ident))
        event(db, ident, "started", str(worktree))

        prompt = (
            "You are operating in an isolated VIIVERSION development worktree. "
            "Implement only the scoped task below. Run relevant local tests. "
            "Do not deploy, merge, push, print secrets, or make changes outside "
            "this worktree. Leave your work for human review.\n\n"
            f"Task: {task['title']}\n\n{task['prompt']}"
        )
        logs = HOME / "runs" / ident
        logs.mkdir(mode=0o700)
        cmd = [CODEX, "exec", "--json", "--sandbox", "workspace-write",
               "--ask-for-approval", "never", "-"]
        # Output to private files, not SQLite; no shell interpolation.
        with (logs / "events.jsonl").open("wb") as output, (logs / "stderr.log").open("wb") as errors:
            p = subprocess.Popen(cmd, cwd=worktree, stdin=subprocess.PIPE,
                                 stdout=output, stderr=errors,
                                 start_new_session=True)
            try:
                p.communicate(input=prompt.encode("utf-8"), timeout=MAX_SECONDS)
                code = p.returncode
            except subprocess.TimeoutExpired:
                os.killpg(p.pid, signal.SIGKILL)
                p.communicate()
                set_status(db, ident, "needs_review", "Codex timeout; worktree may contain partial changes")
                return "timeout"
        if code == 0:
            # Even successful model output does not equal verified/approved code.
            set_status(db, ident, "needs_review", "Codex exited 0; human must review diff and test evidence")
            return "needs_review"
        set_status(db, ident, "needs_review", f"Codex exited {code}; inspect logs and worktree")
        return "failed"
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as exc:
        set_status(db, ident, "needs_review", f"Execution/setup failed: {type(exc).__name__}: {exc}")
        return "failed"


def locked_worker(once=False, interval=10):
    HOME.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (HOME / "worker.lock").open("a+") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("Another VIIVERSION worker already owns the lock", file=sys.stderr)
            return 2
        db = setup()
        recovered = reconcile(db)
        if recovered:
            print(f"Recovered {recovered} interrupted run(s): manual review needed")
        while True:
            result = run_one(db)
            if once:
                print(result)
                return 0 if result in ("empty","paused","review_required","needs_review") else 1
            if result not in ("empty", "paused", "review_required"):
                print(result, flush=True)
            time.sleep(interval)


def main(argv=None):
    parser = argparse.ArgumentParser(description="VIIVERSION Linux Codex development worker")
    sub = parser.add_subparsers(dest="command", required=True)
    add = sub.add_parser("add")
    add.add_argument("--project", required=True)
    add.add_argument("--title", required=True)
    add.add_argument("--prompt", required=True)
    add.add_argument("--linear-id")
    sub.add_parser("init")
    sub.add_parser("status")
    sub.add_parser("list")
    sub.add_parser("run-once")
    worker = sub.add_parser("worker")
    worker.add_argument("--interval", type=int, default=10)
    for action in ("pause", "resume", "approve"):
        cmd = sub.add_parser(action)
        if action == "approve":
            cmd.add_argument("id")
    args = parser.parse_args(argv)
    if args.command in ("worker", "run-once"):
        return locked_worker(args.command == "run-once",
                             getattr(args, "interval", 10))
    db = setup()
    if args.command == "init":
        print(str(HOME))
    elif args.command == "add":
        print(enqueue(db, args))
    elif args.command == "list":
        rows = db.execute("""SELECT id,project,title,status,attempts,branch,note
                             FROM tasks ORDER BY created_at,rowid""").fetchall()
        print(json.dumps([dict(row) for row in rows], ensure_ascii=False, indent=2))
    elif args.command == "status":
        counts = {r["status"]: r["n"] for r in db.execute(
            "SELECT status, COUNT(*) n FROM tasks GROUP BY status")}
        paused = db.execute("SELECT value FROM flags WHERE key='paused'").fetchone()[0] == "1"
        print(json.dumps({"paused": paused, "counts": counts, "home": str(HOME)}, indent=2))
    elif args.command in ("pause","resume"):
        db.execute("UPDATE flags SET value=? WHERE key='paused'",
                   ("1" if args.command == "pause" else "0",))
        print(args.command)
    elif args.command == "approve":
        row = db.execute("SELECT status FROM tasks WHERE id=?", (args.id,)).fetchone()
        if not row or row["status"] != "needs_review":
            parser.error("Only an existing needs_review task may be approved")
        set_status(db, args.id, "done", "Explicitly approved by operator")
        print("done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
