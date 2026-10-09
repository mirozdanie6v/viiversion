#!/usr/bin/env bash
# Run as root on a fresh Ubuntu 22.04/24.04 VPS.
# Creates an unprivileged, non-sudo Codex worker user. Does NOT start a service.
set -Eeuo pipefail
umask 077

WORKER_USER=viidev
WORKER_HOME="/home/$WORKER_USER"
REPOSITORY="https://github.com/mirozdanie6v/viiversion.git"
BRANCH="feat/dev-cloud-codex-linux"
CHECKOUT="$WORKER_HOME/viiversion"

fail() { echo "ERROR: $*" >&2; exit 1; }
[[ $EUID -eq 0 ]] || fail "Run: sudo bash dev-cloud/deploy/bootstrap-ubuntu.sh"
[[ -r /etc/os-release ]] || fail "Unsupported platform"
. /etc/os-release
[[ "$ID" == ubuntu ]] || fail "Only Ubuntu is supported"
[[ "$VERSION_ID" == "22.04" || "$VERSION_ID" == "24.04" ]] || fail "Expected Ubuntu 22.04 or 24.04"
[[ "$(uname -m)" == "aarch64" || "$(uname -m)" == "x86_64" ]] || fail "Expected ARM64 or AMD64 CPU"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends ca-certificates git python3 nodejs npm

node_major="$(node --version | sed -E 's/^v([0-9]+).*/\1/')"
[[ "$node_major" =~ ^[0-9]+$ ]] || fail "Cannot read Node version"
(( node_major >= 18 )) || fail "Node.js >=18 required. Install a supported LTS version using trusted Ubuntu/Node distribution before proceeding."

if ! id -u "$WORKER_USER" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash --user-group "$WORKER_USER"
  passwd -l "$WORKER_USER" >/dev/null
fi
[[ "$(id -u "$WORKER_USER")" -ne 0 ]] || fail "Refusing root worker"
if id -nG "$WORKER_USER" | grep -Ewq '(sudo|docker|adm)'; then
  fail "Worker must not be in privileged sudo/docker/adm groups"
fi

install -d -o "$WORKER_USER" -g "$WORKER_USER" -m 0700 "$WORKER_HOME/.config/viiversion-dev-cloud"
install -d -o "$WORKER_USER" -g "$WORKER_USER" -m 0700 "$WORKER_HOME/.config/systemd/user"
install -d -o "$WORKER_USER" -g "$WORKER_USER" -m 0700 "$WORKER_HOME/.local"
install -d -o "$WORKER_USER" -g "$WORKER_USER" -m 0700 "$WORKER_HOME/projects"
chmod 0750 "$WORKER_HOME"

if [[ ! -d "$CHECKOUT" ]]; then
  runuser -u "$WORKER_USER" -- git clone --depth 1 --single-branch --branch "$BRANCH" "$REPOSITORY" "$CHECKOUT"
else
  [[ -d "$CHECKOUT/.git" ]] || fail "Existing checkout is not a Git clone; inspect manually: $CHECKOUT"
  remote="$(runuser -u "$WORKER_USER" -- git -C "$CHECKOUT" remote get-url origin)"
  [[ "$remote" == "$REPOSITORY" ]] || fail "Unexpected repository origin: $remote"
  echo "Existing checkout preserved; update manually after reviewing changes."
fi

# Node is available from the distro; install Codex in user-owned prefix,
# never via sudo npm -g. This operation downloads a package from npm.
runuser -u "$WORKER_USER" -- env HOME="$WORKER_HOME" \
  npm install --global --prefix "$WORKER_HOME/.local" @openai/codex@latest
runuser -u "$WORKER_USER" -- "$WORKER_HOME/.local/bin/codex" --version

install -o "$WORKER_USER" -g "$WORKER_USER" -m 0600 \
 "$CHECKOUT/dev-cloud/deploy/viiversion-dev-cloud.service" \
 "$WORKER_HOME/.config/systemd/user/viiversion-dev-cloud.service"

# Do not enable linger / service yet: Codex must be authorized by the owner
# and at least one disposable repository explicitly allowlisted first.
echo "Bootstrap complete. No daemon started."
echo "NEXT: sudo -iu $WORKER_USER"
echo "NEXT: $WORKER_HOME/.local/bin/codex login --device-auth"
echo "NEXT: configure $WORKER_HOME/.config/viiversion-dev-cloud/projects.json"
echo "NEXT: sudo bash $CHECKOUT/dev-cloud/deploy/activate-ubuntu.sh"
