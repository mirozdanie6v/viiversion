from pathlib import Path

SCRIPT = '<script defer src="https://dashboard.viiversion.com/tracker.js" data-project="VIIVERSION"></script>'

updated = 0
for path in Path('public').rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    if 'dashboard.viiversion.com/tracker.js' in text:
        continue
    marker = '</body>'
    if marker not in text:
        continue
    text = text.replace(marker, f'  {SCRIPT}\n{marker}', 1)
    path.write_text(text, encoding='utf-8')
    updated += 1

print(f'VIIVERSION analytics injected into {updated} HTML files.')
