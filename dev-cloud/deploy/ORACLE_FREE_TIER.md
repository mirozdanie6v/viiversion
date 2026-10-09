# VII-157 — Oracle Always Free Ubuntu deployment runbook

**STATUS: DEPLOYMENT NOT YET VERIFIED.** These instructions prepare a server once its owner has provisioned it. No VPS, SSH session, subscription, usage quota, payment method or Codex account authentication is created by this repository.

## Recommended VM

- Provider: Oracle Cloud Infrastructure Always Free **in the tenancy home region**.
- Shape: `VM.Standard.A1.Flex` (ARM64/AArch64), **2 OCPUs, 12 GB RAM** (free-tier example within 1,500 OCPU-hours and 9,000 GB-hours per month).
- OS image: Ubuntu 24.04 ARM64; choose an image marked *Always Free Eligible*.
- Boot volume: 50 GB, SSD-type boot block within the provider's shared Always Free storage allowance (verify your existing volumes first).
- Authentication: public SSH key stored in OCI VM provisioning. Never create a remote password login.
- Network: initially expose only TCP 22 to the operator's IP (avoid 0.0.0.0/0 where possible), then migrate SSH to Tailscale private networking in VII-158; no public web port is needed.
- Cost alert: verify console explicitly labels every VM and storage resource Always Free Eligible. Never allow automatic upgrade or additional paid resources.

Oracle free resources are capacity-dependent, and **reclamation of idle VMs is possible**. Hence a free server cannot promise guaranteed 24/7 availability. Back up source to GitHub and worker DB privately elsewhere.

Docs:
- https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/troubleshooting-out-of-host-capacity.htm

## Manual creation (until authenticated OCI tools are connected)

1. Sign in to OCI Console at https://cloud.oracle.com and inspect your **home region** and remaining Always Free shape/storage allocation.
2. Compute -> Instances -> Create Instance.
3. Select Ubuntu 24.04 ARM64, shape `VM.Standard.A1.Flex`, 2 OCPUs and 12 GB. Ensure pricing preview remains Always Free.
4. Add your existing SSH public key. Do not send a private key or password to ChatGPT, GitHub, or Linear.
5. Configure network security so only your administrative source IP can SSH until private access is in place.
6. Create the VM. A capacity error is a provider-side block; do not silently provision a paid alternative.

This project currently has **no connected Oracle account or OCI VM management tool** and therefore cannot perform the provider-side creation or observe its state.

## Bootstrap (Ubuntu 24.04 target; 22.04 may need Node.js LTS upgrade)

From the new server's **ordinary admin SSH account**:

```bash
ssh -i ~/.ssh/YOUR_KEY ubuntu@YOUR_VM_IP
git clone --depth 1 --branch feat/dev-cloud-codex-linux \
  https://github.com/mirozdanie6v/viiversion.git /tmp/viiversion-bootstrap
sudo bash /tmp/viiversion-bootstrap/dev-cloud/deploy/bootstrap-ubuntu.sh
```

Bootstrap creates the dedicated `viidev` account with no sudo rights, installs dependencies and Codex CLI **as that user**, checks out the feature branch into `/home/viidev/viiversion`, and copies a per-user systemd service. **It does not start Codex or the worker**.

Check that `node --version` is >=18. Older Ubuntu distributions may need supported Node.js LTS installed separately from a trusted vendor. Bootstrap aborts rather than running a potentially broken Codex install.

## Authorization and project allowlist

Authenticate **inside the dedicated account**, not under the admin/root account:

```bash
sudo -iu viidev
/home/viidev/.local/bin/codex login --device-auth
/home/viidev/.local/bin/codex login status
exit
```

Approve the device login through your account UI when prompted. Never paste device codes or tokens into public tickets. If device-auth is not permitted by your OpenAI account, resolve this in account settings or follow the documented supported CLI authentication flow.

Create a **disposable** sample Git repository owned by viidev before enabling service:

```bash
sudo -iu viidev
mkdir -p ~/projects/sandbox-repo
git -C ~/projects/sandbox-repo init -b main
git -C ~/projects/sandbox-repo config user.name 'VIIVERSION Dev Test'
git -C ~/projects/sandbox-repo config user.email 'devcloud@example.invalid'
printf 'Sandbox repo for Codex testing\n' > ~/projects/sandbox-repo/README.md
git -C ~/projects/sandbox-repo add README.md
git -C ~/projects/sandbox-repo commit -m 'sandbox init'
cat > ~/.config/viiversion-dev-cloud/projects.json <<'JSON'
{
  "sandbox": {
    "path": "/home/viidev/projects/sandbox-repo",
    "base_branch": "main"
  }
}
JSON
chmod 600 ~/.config/viiversion-dev-cloud/projects.json
python3 ~/viiversion/dev-cloud/viidev.py status
exit
```

**Do not allowlist customer or production repositories until owner review and a separate secrets isolation audit.**

## Activate service

```bash
sudo bash /home/viidev/viiversion/dev-cloud/deploy/activate-ubuntu.sh
sudo bash /home/viidev/viiversion/dev-cloud/deploy/healthcheck-ubuntu.sh
```

Run an actual, consented Codex sandbox trial on the separate worktree:

```bash
sudo -iu viidev
python3 ~/viiversion/dev-cloud/viidev.py add \
  --project sandbox \
  --title 'Sandbox README health probe' \
  --prompt 'Add a one-line status section to README.md. Run a local check.'
python3 ~/viiversion/dev-cloud/viidev.py list
exit
```

The daemon processes one queued task at a time. A completed run goes to `needs_review`; **a person must inspect** the diff and test evidence before running `approve <id>`. Nothing is auto-merged or deployed.

### Reboot acceptance gate (must be observed on the real VM)

```bash
sudo bash /home/viidev/viiversion/dev-cloud/deploy/reboot-probe-ubuntu.sh before
sudo reboot
# Reconnect after the new SSH session is available
sudo bash /home/viidev/viiversion/dev-cloud/deploy/reboot-probe-ubuntu.sh after
sudo bash /home/viidev/viiversion/dev-cloud/deploy/healthcheck-ubuntu.sh
```

The probe stores a marker in the real worker SQLite database, asserts that Linux boot ID changed, then verifies systemd resumed and the marker persisted. This is the evidence required for **VII-157 completion**, not merely a successful CI run.

## Operational notes

- `journalctl --user -u viiversion-dev-cloud -n 100 --no-pager` (run as viidev).
- `python3 ~/viiversion/dev-cloud/viidev.py pause` prevents new jobs; it does **not** interrupt a currently running Codex process.
- To stop current activity, use `systemctl --user stop viiversion-dev-cloud.service`; any interrupted task requires manual review on restart.
- No public HTTP endpoint, Telegram bot or Tailscale setup is implemented in this phase.
- Keep `~/.local/share/viiversion-dev-cloud/`, `~/.codex/`, SSH keys, tokens and private configs **out of Git** and restrict file permissions. Back up the SQLite database and worktrees securely.
- Do not mark this stage Done until actual VM, reboot, credential isolation, and CLI smoke test evidence exist.
