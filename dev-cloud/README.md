# VIIVERSION Dev Cloud — Linux Codex MVP

**Status: Stage 1 / VII-156.** Code lives only in the feature branch of `mirozdanie6v/viiversion`. This is a local, fail-closed MVP; **no VPS has been provisioned or proven**.

## What works

- Durable SQLite tasks and audit events (`~/.local/share/viiversion-dev-cloud`).
- One worker across processes via `flock`; only one task is executed at once.
- Allowlisted Git repositories; every task gets a new local `devcloud/<id>` branch and independent Git worktree.
- Codex CLI noninteractive `codex exec`, `workspace-write` sandbox, timeout and private JSONL logs.
- Crashed/stale `running` tasks become `needs_review` on restart; never silently replay changes.
- `pause` prevents *new* tasks. Successful Codex exits **also require human review**. Explicit approval unlocks the next queued task.
- No automatic push, merge, production deployment, or Linear/Telegram credentials.

## Prerequisites

Ubuntu/Linux, Python 3.10+, `git`, and Codex CLI. Install Codex CLI using current OpenAI instructions (for example `npm install -g @openai/codex`), then log in **as the same unprivileged Linux user that runs the worker** using `codex login --device-auth`, if device-code login is enabled for your account. Check `codex login status` and `codex exec --help` before starting. An active ChatGPT subscription has usage limits; it is not unlimited compute.

**Use a dedicated Linux user** with access only to explicitly authorized repositories, and never place cloud, production or personal secrets in a Codex-readable worktree. `--sandbox workspace-write` is not a substitute for VM/container isolation and OS-level permissions.

## Local installation

The following example assumes repository checkout is at `~/viiversion`.

```bash
sudo apt-get update && sudo apt-get install -y python3 git
mkdir -p ~/.config/viiversion-dev-cloud
cat > ~/.config/viiversion-dev-cloud/projects.json <<'JSON'
{
  "sandbox": {
    "path": "/home/YOUR_LINUX_USER/projects/sandbox-repo",
    "base_branch": "main"
  }
}
JSON
chmod 700 ~/.config/viiversion-dev-cloud
chmod 600 ~/.config/viiversion-dev-cloud/projects.json
python3 ~/viiversion/dev-cloud/viidev.py init
python3 ~/viiversion/dev-cloud/viidev.py status
```

Prepare the named Git repository first, with an existing local `main` branch. **Do not initially add a production repository**. Use a disposable test repository. The checkout path above must be replaced with the actual filesystem path.

```bash
python3 ~/viiversion/dev-cloud/viidev.py add \
  --project sandbox \
  --title "Add a health check" \
  --prompt "Add a minimal testable health check. Run local tests."
python3 ~/viiversion/dev-cloud/viidev.py run-once
python3 ~/viiversion/dev-cloud/viidev.py list
```

Review the task's `worktree`, `branch`, Codex log and Git diff before approving:

```bash
git -C /path/to/task/worktree status --short
git -C /path/to/task/worktree diff
python3 ~/viiversion/dev-cloud/viidev.py approve FULL-TASK-UUID
```

`approve` is a **human attestation**, not an automated verification step. The worker will run the next queued task only after explicit approval. If execution fails or times out, inspect the preserved worktree. Automatic retry of partially edited worktrees is intentionally not implemented.

## Background service (stage 2: requires validation on a real VPS)

Place `deploy/viiversion-dev-cloud.service` in `~/.config/systemd/user/` and adjust the checkout path in the unit. This template assumes the checkout lives at `%h/viiversion` and `codex` is visible on the service PATH.

```bash
mkdir -p ~/.config/systemd/user
cp ~/viiversion/dev-cloud/deploy/viiversion-dev-cloud.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now viiversion-dev-cloud.service
systemctl --user status viiversion-dev-cloud.service
journalctl --user -u viiversion-dev-cloud -n 50
```

To keep the per-user service alive after logout, an administrator enables linger for the dedicated account: `sudo loginctl enable-linger YOUR_LINUX_USER`. Reboot recovery must be tested on the **actual** server.

## Android access (stage 3)

Use a private mesh VPN (e.g. Tailscale) and SSH keys, then access the Linux worker through SSH on Android. Run `status`, `list`, `pause`, and `approve` from your terminal. Do not expose the queue via public HTTP/SSH password authentication. The Codex app's mobile Remote protocol is not assumed to support this Linux host.

## Security and cost boundaries

- Repo is **public**. Do not commit real tokens, session files, SSH keys or `projects.json`.
- This MVP contains no Telegram bot, Linear synchronization, cloud provider resource creation, backups or verified 24/7 uptime.
- Free VPS tiers depend on region/quotas/provider retention policies; ChatGPT Codex quota remains separate.
- Queue state is persisted locally; back up the private HOME directory with proper access controls. SQLite WAL files are part of that state.

## Offline tests

```bash
python3 -m unittest discover -s dev-cloud/tests -v
```

Tests create disposable local Git repositories and a fake Codex executable; they make **no model calls**. CI runs these tests on the feature branch via the draft PR.
