"""Reassemble the original PDF bytes for the Coral Anh demo only."""
from pathlib import Path
import hashlib
root = Path(__file__).resolve().parent.parent
parts = root / "site_assets/demo/coral-anh-pdf-parts"
data = b"".join((parts / f"{i:02d}.part").read_bytes() for i in range(8))
assert len(data) == 8367268
assert hashlib.sha256(data).hexdigest() == "f9444b9b030b736b6d3505cb70e84f46a2a95344c04f26029b1f0fb7cd457b0b"
target = root / "public/demo/coral-anh/coral-anh-menu.pdf"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_bytes(data)
