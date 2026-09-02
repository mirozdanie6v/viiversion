from pathlib import Path
import json

BASE = 'https://pet-nika.mirozdanie6v.workers.dev'


def load(path, marker):
    text = path.read_text(encoding='utf-8')
    start = text.index(marker) + len(marker)
    end = text.index('</script>', start)
    raw = text[start:end].strip()
    semicolon = raw.endswith(';')
    if semicolon:
        raw = raw[:-1]
    return text, start, end, json.loads(raw), semicolon


def save(path, text, start, end, data, semicolon):
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    if semicolon:
        payload += ';'
    path.write_text(text[:start] + payload + text[end:], encoding='utf-8')


# The current public Worker serves the PET NIKA client/Mini App interface at `/`.
# `/miniapp` exists in source, but the production Worker still returns 404 there,
# so every public CTA must use the verified live root route.
live = {
    'ru': [
        {'label': 'Прототип / Mini App', 'url': BASE + '/'},
    ],
    'en': [
        {'label': 'Prototype / Mini App', 'url': BASE + '/'},
    ],
    'vi': [
        {'label': 'Prototype / Mini App', 'url': BASE + '/'},
    ],
}

pet = {
    'ru': {
        'name': 'PET NIKA',
        'industry': 'Ветеринарная клиника · Nha Trang',
        'status': 'Кейс · персональная концепция',
        'desc': 'Сайт и Mini App для записи, профиля питомца, истории визитов, напоминаний и повторного контакта.',
        'flow': ['Сайт', 'Mini App', 'Питомец', 'Запись'],
        'live': live['ru'],
        'caseUrl': 'cases/pet-nika.html',
    },
    'en': {
        'name': 'PET NIKA',
        'industry': 'Veterinary clinic · Nha Trang',
        'status': 'Case · personalized concept',
        'desc': 'Website and Mini App concept for booking, pet profile, visit history, reminders and repeat contact.',
        'flow': ['Website', 'Mini App', 'Pet profile', 'Booking'],
        'live': live['en'],
        'caseUrl': 'cases/pet-nika.html',
    },
    'vi': {
        'name': 'PET NIKA',
        'industry': 'Phòng khám thú y · Nha Trang',
        'status': 'Case · concept cá nhân hóa',
        'desc': 'Concept website và Mini App cho đặt lịch, hồ sơ thú cưng, lịch sử khám, nhắc lịch và liên hệ lại.',
        'flow': ['Website', 'Mini App', 'Hồ sơ thú cưng', 'Đặt lịch'],
        'live': live['vi'],
        'caseUrl': 'cases/pet-nika.html',
    },
}

# Main landing + preview: add/update PET NIKA in the prototype library.
for name in ('index.html', 'preview.html'):
    path = Path('public') / name
    text, start, end, data, semicolon = load(path, 'window.SITE_I18N=')
    for lang in ('ru', 'en', 'vi'):
        items = data[lang].setdefault('protoItems', [])
        items[:] = [x for x in items if x.get('name') != 'PET NIKA']
        insert_at = 1 if items else 0
        items.insert(insert_at, pet[lang])
    save(path, text, start, end, data, semicolon)

# Dedicated prototypes page.
path = Path('public/prototypes.html')
text, start, end, data, semicolon = load(path, 'window.PROTOTYPE_I18N=')
for lang in ('ru', 'en', 'vi'):
    items = data[lang].setdefault('items', [])
    items[:] = [x for x in items if x.get('name') != 'PET NIKA']
    insert_at = 1 if items else 0
    items.insert(insert_at, pet[lang])
save(path, text, start, end, data, semicolon)

# Dedicated PET NIKA case page: publish the verified current public route.
case_products = {
    'ru': [
        {
            'name': 'PET NIKA — прототип / Mini App',
            'kind': 'Клиентский интерфейс · публичный прототип',
            'status': 'Публичный прототип',
            'desc': 'Актуальная опубликованная версия клиентского интерфейса PET NIKA, используемого как Mini App.',
            'url': BASE + '/',
            'cta': 'Открыть прототип',
        },
    ],
    'en': [
        {
            'name': 'PET NIKA — prototype / Mini App',
            'kind': 'Client interface · public prototype',
            'status': 'Public prototype',
            'desc': 'Current published PET NIKA client interface used as the Mini App prototype.',
            'url': BASE + '/',
            'cta': 'Open prototype',
        },
    ],
    'vi': [
        {
            'name': 'PET NIKA — prototype / Mini App',
            'kind': 'Giao diện khách hàng · prototype công khai',
            'status': 'Prototype công khai',
            'desc': 'Phiên bản giao diện khách hàng PET NIKA hiện tại dùng làm prototype Mini App.',
            'url': BASE + '/',
            'cta': 'Mở prototype',
        },
    ],
}

path = Path('public/cases/pet-nika.html')
text, start, end, data, semicolon = load(path, 'window.CASE_DATA=')
status = {
    'ru': 'Кейс · персональная концепция',
    'en': 'Case · personalized concept',
    'vi': 'Case · concept cá nhân hóa',
}
for lang in ('ru', 'en', 'vi'):
    data[lang]['status'] = status[lang]
    data[lang]['liveProducts'] = case_products[lang]
    if isinstance(data[lang].get('band'), dict):
        data[lang]['band']['status'] = status[lang]
save(path, text, start, end, data, semicolon)

print('PET NIKA case and verified public prototype link updated.')
