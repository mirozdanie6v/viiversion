#!/usr/bin/env bash
set -euo pipefail

cat site.xz.b64.* | base64 -d > site.tar.xz
xz -dc site.tar.xz > site.tar
rm -rf public
mkdir -p public
tar -xf site.tar -C public

python3 - <<'PY'
from pathlib import Path
import re

LOGO = "data:image/webp;base64,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"
CSS = r"""
/* VIIVERSION logo: preserve intrinsic aspect ratio */
.vii-logo{
  display:block!important;
  height:46px!important;
  width:auto!important;
  max-width:none!important;
  object-fit:contain!important;
  object-position:left center!important;
  flex:none!important;
}
.brand>.vii-logo,.case-brand>.vii-logo{height:46px!important;width:auto!important}
.brand>span,.case-brand>span{display:none!important}
.brand-mark{display:none!important}
@media(max-width:640px){
  .vii-logo,.brand>.vii-logo,.case-brand>.vii-logo{height:38px!important;width:auto!important}
}
"""

pages = [
    Path("public/index.html"),
    Path("public/preview.html"),
    Path("public/prototypes.html"),
    Path("public/cases/ave-clinic.html"),
    Path("public/cases/pet-nika.html"),
    Path("public/cases/true-surf.html"),
    Path("public/cases/gbeauty.html"),
]

for p in pages:
    if not p.exists():
        raise SystemExit(f"Missing required page: {p}")
    text = p.read_text(encoding="utf-8")
    text = text.replace("Versum", "VIIVERSION").replace("VERSUM", "VIIVERSION")

    if p.parent.name == "cases":
        text = re.sub(
            r'<a class="brand(?: case-brand)?" href="\.\./index\.html"[^>]*>.*?</a>',
            f'<a class="brand case-brand" href="../index.html" aria-label="VIIVERSION"><img class="vii-logo" src="{LOGO}" alt="VIIVERSION"/></a>',
            text, count=1, flags=re.S
        )
    elif p.name == "prototypes.html":
        text = re.sub(
            r'<a class="brand" href="index\.html"[^>]*>.*?</a>',
            f'<a class="brand" href="index.html" aria-label="VIIVERSION"><img class="vii-logo" src="{LOGO}" alt="VIIVERSION"/></a>',
            text, count=1, flags=re.S
        )
    else:
        text = re.sub(
            r'<a class="brand" href="#top"[^>]*>.*?</a>',
            f'<a class="brand" href="#top" aria-label="VIIVERSION"><img class="vii-logo" src="{LOGO}" alt="VIIVERSION"/></a>',
            text, count=1, flags=re.S
        )

    if "VIIVERSION logo: preserve intrinsic aspect ratio" not in text:
        pos = text.rfind("</style>")
        if pos >= 0:
            text = text[:pos] + CSS + text[pos:]
        else:
            text = text.replace("</head>", "<style>"+CSS+"</style></head>", 1)

    # Use the supplied logo as favicon too.
    if 'rel="icon"' in text:
        text = re.sub(r'<link[^>]+rel="icon"[^>]*>', f'<link rel="icon" href="{LOGO}" type="image/webp">', text, count=1)
    else:
        text = text.replace("</head>", f'<link rel="icon" href="{LOGO}" type="image/webp"></head>', 1)

    p.write_text(text, encoding="utf-8")

print("VIIVERSION branding applied to all pages.")
PY

for file in \
  public/index.html \
  public/preview.html \
  public/prototypes.html \
  public/cases/ave-clinic.html \
  public/cases/pet-nika.html \
  public/cases/true-surf.html \
  public/cases/gbeauty.html; do
  test -f "$file"
done

grep -q "VIIVERSION" public/index.html
grep -q "vii-logo" public/index.html
grep -q "vii-logo" public/prototypes.html
grep -q "vii-logo" public/cases/ave-clinic.html

echo "VIIVERSION landing restored and branded successfully."
