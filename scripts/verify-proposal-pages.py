"""Validate generated routes, links, safety and bilingual content offline."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1] / 'public'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.h1 = 0
        self.english = False
        self.scripts = 0
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        self.h1 += tag == 'h1'
        self.scripts += tag == 'script'
        self.english |= values.get('lang') == 'en'
        for name in ('href', 'src'):
            if name in values:
                self.links.append(values[name])

for route in ('', 'support', 'privacy', 'terms'):
    path = ROOT / 'proposal-studio' / route / 'index.html'
    text = path.read_text(encoding='utf-8')
    page = Page()
    page.feed(text)
    assert page.h1 == 1 and page.english, path
    assert page.scripts == 0, f'Unexpected script: {path}'
    assert 'lorem-ipsum' not in text and 'TODO' not in text, path
    for link in page.links:
        parsed = urlsplit(link)
        if parsed.scheme or not parsed.path:
            continue
        target = ROOT / parsed.path.lstrip('/') if link.startswith('/') else path.parent / parsed.path
        if target.is_dir():
            target /= 'index.html'
        assert target.is_file(), f'Broken local link: {link}'
    assert f'https://viiversion.com/proposal-studio/{route + "/" if route else ""}' in text
assert 'data-proposal-studio-links' in (ROOT / 'index.html').read_text(encoding='utf-8')
print('PASS: routes, bilingual content, internal links, canonical URLs and no-script checks.')
