from pathlib import Path
import json

BASE = 'https://gbeauty-vien-trieu-prototype.mirozdanie6v.workers.dev'


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


labels = {
    'ru': [
        ('Лендинг', BASE + '/'),
        ('Mini App', BASE + '/miniapp/'),
        ('Демо-админка', BASE + '/admin/'),
    ],
    'en': [
        ('Landing', BASE + '/'),
        ('Mini App', BASE + '/miniapp/'),
        ('Demo admin', BASE + '/admin/'),
    ],
    'vi': [
        ('Landing', BASE + '/'),
        ('Mini App', BASE + '/miniapp/'),
        ('Demo admin', BASE + '/admin/'),
    ],
}

# Main landing + preview prototype cards.
for name in ('index.html', 'preview.html'):
    path = Path('public') / name
    text, start, end, data, semicolon = load(path, 'window.SITE_I18N=')
    for lang in ('ru', 'en', 'vi'):
        for item in data[lang].get('protoItems', []):
            if 'G-Beauty' in item.get('name', ''):
                item['live'] = [
                    {'label': label, 'url': url}
                    for label, url in labels[lang]
                ]
    save(path, text, start, end, data, semicolon)

# Dedicated prototypes page.
path = Path('public/prototypes.html')
text, start, end, data, semicolon = load(path, 'window.PROTOTYPE_I18N=')
for lang in ('ru', 'en', 'vi'):
    for item in data[lang].get('items', []):
        if 'G-Beauty' in item.get('name', ''):
            item['live'] = [
                {'label': label, 'url': url}
                for label, url in labels[lang]
            ]
save(path, text, start, end, data, semicolon)

# G-Beauty case live-products block.
case_products = {
    'ru': [
        {
            'name': 'G-Beauty Landing',
            'kind': 'Лендинг · публичный прототип',
            'status': 'Рабочая версия',
            'desc': 'Публичный клиентский лендинг G-Beauty Viễn Triều.',
            'url': BASE + '/',
            'cta': 'Открыть лендинг',
        },
        {
            'name': 'G-Beauty Mini App',
            'kind': 'Mini App · публичный прототип',
            'status': 'Рабочая версия',
            'desc': 'Мобильный клиентский прототип: услуги, запись и пользовательский сценарий.',
            'url': BASE + '/miniapp/',
            'cta': 'Открыть Mini App',
        },
        {
            'name': 'G-Beauty Demo Admin',
            'kind': 'Демо-админка',
            'status': 'Рабочая демоверсия',
            'desc': 'Демонстрационный административный интерфейс прототипа.',
            'url': BASE + '/admin/',
            'cta': 'Открыть админку',
        },
    ],
    'en': [
        {
            'name': 'G-Beauty Landing',
            'kind': 'Landing · public prototype',
            'status': 'Working version',
            'desc': 'Public client landing for G-Beauty Viễn Triều.',
            'url': BASE + '/',
            'cta': 'Open landing',
        },
        {
            'name': 'G-Beauty Mini App',
            'kind': 'Mini App · public prototype',
            'status': 'Working version',
            'desc': 'Mobile client prototype with services, booking and customer flow.',
            'url': BASE + '/miniapp/',
            'cta': 'Open Mini App',
        },
        {
            'name': 'G-Beauty Demo Admin',
            'kind': 'Demo admin',
            'status': 'Working demo',
            'desc': 'Demonstration admin interface for the prototype.',
            'url': BASE + '/admin/',
            'cta': 'Open admin',
        },
    ],
    'vi': [
        {
            'name': 'G-Beauty Landing',
            'kind': 'Landing · prototype công khai',
            'status': 'Phiên bản hoạt động',
            'desc': 'Landing công khai dành cho khách hàng G-Beauty Viễn Triều.',
            'url': BASE + '/',
            'cta': 'Mở landing',
        },
        {
            'name': 'G-Beauty Mini App',
            'kind': 'Mini App · prototype công khai',
            'status': 'Phiên bản hoạt động',
            'desc': 'Prototype mobile với dịch vụ, đặt lịch và hành trình khách hàng.',
            'url': BASE + '/miniapp/',
            'cta': 'Mở Mini App',
        },
        {
            'name': 'G-Beauty Demo Admin',
            'kind': 'Demo admin',
            'status': 'Bản demo hoạt động',
            'desc': 'Giao diện quản trị demo của prototype.',
            'url': BASE + '/admin/',
            'cta': 'Mở admin',
        },
    ],
}

path = Path('public/cases/gbeauty.html')
text, start, end, data, semicolon = load(path, 'window.CASE_DATA=')
for lang in ('ru', 'en', 'vi'):
    data[lang]['liveProducts'] = case_products[lang]
save(path, text, start, end, data, semicolon)

print('Confirmed G-Beauty public prototype links added.')
