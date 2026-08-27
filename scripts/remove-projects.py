from pathlib import Path
import json
import re

MARKER = 'window.SITE_I18N='

for name in ('index.html', 'preview.html'):
    path = Path('public') / name
    text = path.read_text(encoding='utf-8')

    # Remove the Projects navigation target.
    text = text.replace('<a href="#cases-section"></a>', '', 1)

    # Remove the visible projects/proposals section. Keep one hidden render target
    # so the existing runtime code remains valid without changing other logic.
    text = re.sub(
        r'<section class="section" id="cases-section">.*?</section>\s*(?=<section class="section" id="process-section">)',
        '<div id="cases" hidden></div>\n',
        text,
        count=1,
        flags=re.S,
    )

    # Keep navigation labels aligned after removing the Projects link.
    start = text.index(MARKER) + len(MARKER)
    end = text.index('</script>', start)
    raw = text[start:end].strip()
    semicolon = raw.endswith(';')
    if semicolon:
        raw = raw[:-1]
    data = json.loads(raw)
    for lang in ('ru', 'en', 'vi'):
        nav = data.get(lang, {}).get('nav', [])
        if len(nav) >= 5:
            data[lang]['nav'] = nav[:3] + nav[4:]
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')) + (';' if semicolon else '')
    text = text[:start] + payload + text[end:]

    path.write_text(text, encoding='utf-8')

print('Projects and proposals section removed from landing.')
