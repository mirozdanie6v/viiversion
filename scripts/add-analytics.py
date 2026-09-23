from pathlib import Path

TELEGRAM = '<script src="https://telegram.org/js/telegram-web-app.js?63"></script>'
TRACKER = '<script defer src="https://dashboard.viiversion.com/tracker.js" data-project="VIIVERSION"></script>'

updated = 0
for path in Path('public').rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    changed = False

    if 'telegram.org/js/telegram-web-app.js' not in text and '</head>' in text:
        text = text.replace('</head>', f'  {TELEGRAM}\\n</head>', 1)
        changed = True

    if 'dashboard.viiversion.com/tracker.js' not in text and '</body>' in text:
        text = text.replace('</body>', f'  {TRACKER}\\n</body>', 1)
        changed = True

    if changed:
        path.write_text(text, encoding='utf-8')
        updated += 1

print(f'VIIVERSION Telegram analytics injected/verified in {updated} HTML files.')
