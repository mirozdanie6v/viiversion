"""Local offline tests: no OpenAI token, cloud account, or network required."""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
import sqlite3
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("viidev", ROOT / "viidev.py")
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)


class Args:
    def __init__(self, title):
        self.project = "demo"
        self.title = title
        self.prompt = "Make an example artifact"
        self.linear_id = None


class WorkerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.repo = self.root / "repo"
        self.repo.mkdir()
        subprocess.run(["git", "init", "-q", "-b", "main", str(self.repo)], check=True)
        subprocess.run(["git", "-C", str(self.repo), "config", "user.email",
                        "test@example.invalid"], check=True)
        subprocess.run(["git", "-C", str(self.repo), "config", "user.name",
                        "Test"], check=True)
        (self.repo / "README.md").write_text("test", encoding="utf-8")
        subprocess.run(["git", "-C", str(self.repo), "add", "."], check=True)
        subprocess.run(["git", "-C", str(self.repo), "commit", "-qm", "base"], check=True)
        app.HOME = self.root / "state"
        app.CONFIG = self.root / "config.json"
        app.CONFIG.write_text(json.dumps({
            "demo": {"path": str(self.repo), "base_branch": "main"}
        }), encoding="utf-8")
        self.fake = self.root / "fake-codex"
        self.fake.write_text('#!/bin/sh\ncat >/dev/null\necho "{\\"type\\":\\"turn.completed\\"}"\nprintf "ok" > output.txt\n')
        self.fake.chmod(0o700)
        app.CODEX = str(self.fake)
        app.MAX_SECONDS = 5
        self.db = app.setup()

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    def task(self, ident):
        return self.db.execute("SELECT * FROM tasks WHERE id=?", (ident,)).fetchone()

    def test_queue_requires_human_review_to_advance(self):
        first = app.enqueue(self.db, Args("first"))
        second = app.enqueue(self.db, Args("second"))
        self.assertEqual(app.run_one(self.db), "needs_review")
        self.assertEqual(self.task(first)["status"], "needs_review")
        self.assertEqual(self.task(second)["status"], "queued")
        work = Path(self.task(first)["worktree"])
        self.assertEqual((work / "output.txt").read_text(), "ok")
        self.assertTrue((app.HOME / "runs" / first / "events.jsonl").exists())
        self.assertEqual(app.run_one(self.db), "review_required")
        app.set_status(self.db, first, "done", "human approved")
        self.assertEqual(app.run_one(self.db), "needs_review")
        self.assertEqual(self.task(second)["status"], "needs_review")
        self.assertFalse((self.repo / "output.txt").exists())

    def test_reboot_recovery_never_replays(self):
        ident = app.enqueue(self.db, Args("interrupted"))
        self.db.execute("UPDATE tasks SET status='running' WHERE id=?", (ident,))
        self.assertEqual(app.reconcile(self.db), 1)
        self.assertEqual(app.reconcile(self.db), 0)
        self.assertEqual(self.task(ident)["status"], "needs_review")
        self.assertEqual(app.run_one(self.db), "review_required")

    def test_pause_and_allowlist(self):
        ident = app.enqueue(self.db, Args("pause"))
        self.db.execute("UPDATE flags SET value='1' WHERE key='paused'")
        self.assertEqual(app.run_one(self.db), "paused")
        self.assertEqual(self.task(ident)["status"], "queued")
        wrong = Args("wrong")
        wrong.project = "not-allowed"
        with self.assertRaises(ValueError):
            app.enqueue(self.db, wrong)

    def test_timeout_requires_review(self):
        self.fake.write_text("#!/bin/sh\ncat >/dev/null\nsleep 10\n")
        app.MAX_SECONDS = 1
        ident = app.enqueue(self.db, Args("hang"))
        self.assertEqual(app.run_one(self.db), "timeout")
        self.assertEqual(self.task(ident)["status"], "needs_review")
        self.assertIn("timeout", self.task(ident)["note"].lower())


if __name__ == "__main__":
    unittest.main()
