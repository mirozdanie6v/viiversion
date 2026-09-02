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


live = {
    'ru': [
        {'label': 'Прототип', 'url': BASE + '/'},
        {'label': 'Mini App', 'url': BASE + '/miniapp'},
    ],
    'en': [
        {'label': 'Prototype', 'url': BASE + '/'},
        {'label': 'Mini App', 'url': BASE + '/miniapp'},
    ],
    'vi': [
        {'label': 'Prototype', 'url': BASE + '/'},
        {'label': 'Mini App', 'url': BASE + '/miniapp'},
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

# Dedicated PET NIKA case page: publish current prototype links.
case_products = {
    'ru': [
        {
            'name': 'PET NIKA — прототип',
            'kind': 'Веб-прототип',
            'status': 'Публичный прототип',
            'desc': 'Актуальная опубликованная версия клиентского интерфейса PET NIKA.',
            'url': BASE + '/',
            'cta': 'Открыть прототип',
        },
        {
            'name': 'PET NIKA Mini App',
            'kind': 'Telegram Mini App · прототип',
            'status': 'Публичный прототип',
            'desc': 'Мобильный маршрут PET NIKA, подготовленный для запуска как Telegram Mini App.',
            'url': BASE + '/miniapp',
            'cta': 'Открыть Mini App',
        },
    ],
    'en': [
        {
            'name': 'PET NIKA — prototype',
            'kind': 'Web prototype',
            'status': 'Public prototype',
            'desc': 'Current published PET NIKA client interface.',
            'url': BASE + '/',
            'cta': 'Open prototype',
        },
        {
            'name': 'PET NIKA Mini App',
            'kind': 'Telegram Mini App · prototype',
            'status': 'Public prototype',
            'desc': 'Mobile PET NIKA route prepared for use as a Telegram Mini App.',
            'url': BASE + '/miniapp',
            'cta': 'Open Mini App',
        },
    ],
    'vi': [
        {
            'name': 'PET NIKA — prototype',
            'kind': 'Web prototype',
            'status': 'Prototype công khai',
            'desc': 'Phiên bản giao diện khách hàng PET NIKA hiện tại đã được xuất bản.',
            'url': BASE + '/',
            'cta': 'Mở prototype',
        },
        {
            'name': 'PET NIKA Mini App',
            'kind': 'Telegram Mini App · prototype',
            'status': 'Prototype công khai',
            'desc': 'Route mobile PET NIKA được chuẩn bị để chạy như Telegram Mini App.',
            'url': BASE + '/miniapp',
            'cta': 'Mở Mini App',
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

print('PET NIKA case and prototype links updated.')
