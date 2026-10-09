#!/usr/bin/env bash
# Read-only post-reboot diagnostics. sudo bash healthcheck-ubuntu.sh
set -Eeuo pipefail
user=viidev
home=/home/viidev
[[ $EUID -eq 0 ]] || { echo "Please run via sudo" >&2; exit 1; }
uid="$(id -u "$user")"
echo "HOST: $(hostname)  ARCH: $(uname -m)  BOOT: $(uptime -s)"
echo "LINGER: $(loginctl show-user "$user" -p Linger --value)"
echo -n "SERVICE: "
runuser -u "$user" -- env XDG_RUNTIME_DIR="/run/user/$uid" \
 systemctl --user is-active viiversion-dev-cloud.service
echo "CODEX VERSION:"
runuser -u "$user" -- "$home/.local/bin/codex" --version
echo "CODEX AUTH (without printing account data):"
runuser -u "$user" -- env HOME="$home" \
 "$home/.local/bin/codex" login status >/dev/null && echo "authenticated"
echo "QUEUE:"
runuser -u "$user" -- env HOME="$home" \
 /usr/bin/python3 "$home/viiversion/dev-cloud/viidev.py" status
echo "LAST JOURNAL:"
runuser -u "$user" -- env XDG_RUNTIME_DIR="/run/user/$uid" \
 journalctl --user -u viiversion-dev-cloud.service -n 15 --no-pager
