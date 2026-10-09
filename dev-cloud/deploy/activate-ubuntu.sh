#!/usr/bin/env bash
# Enable only after owner authorizes Codex and configures the repository allowlist.
set -Eeuo pipefail
umask 077

user=viidev
home=/home/viidev
fail() { echo "ERROR: $*" >&2; exit 1; }
[[ $EUID -eq 0 ]] || fail "Run as root: sudo bash activate-ubuntu.sh"
id -u "$user" >/dev/null || fail "Bootstrap user missing"
[[ -r "$home/.config/viiversion-dev-cloud/projects.json" ]] || fail "Missing project allowlist. Add only disposable test Git repos initially."
[[ -x "$home/.local/bin/codex" ]] || fail "Codex CLI missing"

# Only perform read-only checks before enabling any service. Do not show tokens.
if ! runuser -u "$user" -- env HOME="$home" PATH="$home/.local/bin:/usr/bin:/bin" \
  "$home/.local/bin/codex" login status >/dev/null 2>&1; then
  fail "No authorized Codex login for viidev; run sudo -iu viidev and codex login --device-auth"
fi
if ! runuser -u "$user" -- env HOME="$home" \
  /usr/bin/python3 "$home/viiversion/dev-cloud/viidev.py" status >/dev/null; then
  fail "Queue initialization failed"
fi

uid="$(id -u "$user")"
loginctl enable-linger "$user"
systemctl start "user@$uid.service"
runuser -u "$user" -- env XDG_RUNTIME_DIR="/run/user/$uid" \
  systemctl --user daemon-reload
runuser -u "$user" -- env XDG_RUNTIME_DIR="/run/user/$uid" \
  systemctl --user enable --now viiversion-dev-cloud.service
runuser -u "$user" -- env XDG_RUNTIME_DIR="/run/user/$uid" \
  systemctl --user is-active viiversion-dev-cloud.service
echo "viiversion-dev-cloud.service active for $user"
