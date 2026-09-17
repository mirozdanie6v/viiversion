"""Add scoped product pages after the existing landing build; no new hosting."""
from html import escape
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
SOURCE = ROOT / 'proposal-studio'
home = (PUBLIC / 'index.html').read_text(encoding='utf-8')
logo_match = re.search(r'<img class="vii-logo"[^>]*>', home)
if not logo_match:
    raise SystemExit('Existing VIIVERSION logo missing; refusing unbranded output')
logo = logo_match.group(0)
nav = '<nav class="nav" aria-label="Proposal Studio"><a href="/proposal-studio/">Продукт / Product</a><a href="/proposal-studio/support/">Support</a><a href="/proposal-studio/privacy/">Privacy</a><a href="/proposal-studio/terms/">Terms</a></nav>'
pages = {
    'product': ('', 'VIIVERSION Proposal Studio', 'Персональные коммерческие предложения: исследование, стратегия, текст и проверка качества.'),
    'support': ('support', 'Support — VIIVERSION Proposal Studio', 'Контакт поддержки, сообщения об ошибках и вопросы конфиденциальности.'),
    'privacy': ('privacy', 'Privacy Policy — VIIVERSION Proposal Studio', 'Обработка данных плагином, средой выполнения и поддержкой.'),
    'terms': ('terms', 'Terms of Use — VIIVERSION Proposal Studio', 'Назначение плагина, ответственность пользователя и ограничения результатов.'),
}
for source, (route, title, description) in pages.items():
    destination = PUBLIC / 'proposal-studio' / route
    destination.mkdir(parents=True, exist_ok=True)
    path = '/proposal-studio/' + (route + '/' if route else '')
    content = (SOURCE / f'{source}.html').read_text(encoding='utf-8')
    page = f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)}</title><meta name="description" content="{escape(description)}">
<link rel="canonical" href="https://viiversion.com{path}"><link rel="stylesheet" href="/proposal-studio/style.css">
</head><body><a class="skip" href="#main">К содержанию / Skip to content</a>
<header class="header"><div class="wrap"><a class="brand" href="/" aria-label="VIIVERSION — главная">{logo}</a>{nav}</div></header>
<main id="main" class="wrap">{content}</main>
<footer class="footer"><div class="wrap">© 2026 Ольга Ногтич / Olga Nogtich · VIIVERSION{nav}</div></footer>
</body></html>
'''
    (destination / 'index.html').write_text(page, encoding='utf-8')
shutil.copyfile(SOURCE / 'style.css', PUBLIC / 'proposal-studio' / 'style.css')
footer_links = '<div class="wrap" data-proposal-studio-links style="padding:16px 0;display:flex;gap:18px;flex-wrap:wrap;font-size:14px"><a href="/proposal-studio/">Proposal Studio</a><a href="/proposal-studio/support/">Support</a><a href="/proposal-studio/privacy/">Privacy</a><a href="/proposal-studio/terms/">Terms</a></div>'
for filename in ('index.html', 'preview.html'):
    file = PUBLIC / filename
    text = file.read_text(encoding='utf-8')
    if 'data-proposal-studio-links' not in text:
        if '</footer>' not in text:
            raise SystemExit(f'Missing footer in {filename}')
        file.write_text(text.replace('</footer>', footer_links + '</footer>', 1), encoding='utf-8')
print('PASS: four bilingual Proposal Studio pages added; existing landing preserved.')
