#!/usr/bin/env bash
# Verify real reboot survival with a durable SQLite marker.
# Run BEFORE a reboot, then AFTER reboot. Never reboots the machine itself.
# Usage: sudo bash reboot-probe-ubuntu.sh before|after
set -Eeuo pipefail
umask 077
[[ $EUID -eq 0 ]] || { echo "Run via sudo" >&2; exit 1; }
[[ ${1:-} == before || ${1:-} == after ]] || { echo "Usage: $0 before|after" >&2; exit 2; }
mode=$1
user=viidev
home=/home/viidev
uid="$(id -u "$user")"
runuser -u "$user" -- env HOME="$home" /usr/bin/python3 "$home/viiversion/dev-cloud/viidev.py" status >/dev/null
# This marker is stored inside the same persistent SQLite DB as tasks.
runuser -u "$user" -- env HOME="$home" /usr/bin/python3 - "$mode" <<'PY'
import os
from pathlib import Path
import sqlite3
import sys
mode = sys.argv[1]
boot_id = Path("/proc/sys/kernel/random/boot_id").read_text().strip()
db = sqlite3.connect(Path.home() / ".local/share/viiversion-dev-cloud/state.sqlite3")
if mode == "before":
    db.execute("INSERT INTO flags(key,value) VALUES ('reboot_probe',?) "
               "ON CONFLICT(key) DO UPDATE SET value=excluded.value", (boot_id,))
    db.commit()
    print("Persistent checkpoint saved in SQLite, boot ID:", boot_id)
else:
    row = db.execute("SELECT value FROM flags WHERE key='reboot_probe'").fetchone()
    if not row:
        sys.exit("FAIL: no pre-reboot checkpoint in SQLite")
    if row[0] == boot_id:
        sys.exit("FAIL: machine has not rebooted since checkpoint")
    print("PASS: SQLite state persisted across a real reboot")
    print("previous boot:", row[0], "current boot:", boot_id)
PY
if [[ "$mode" == after ]]; then
  runuser -u "$user" -- env XDG_RUNTIME_DIR="/run/user/$uid" \
    systemctl --user is-active --quiet viiversion-dev-cloud.service ||
    { echo "FAIL: worker service is not active after reboot" >&2; exit 1; }
  echo "PASS: worker active after reboot"
fi
