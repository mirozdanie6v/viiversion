from pathlib import Path
import json
import shutil

BASE = 'https://rusinfocenter.viiversion.com'
BOT_DEMO = BASE + '/notification'
MINI_APP = BASE + '/'


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
        {'label': 'Прототип Telegram-бота', 'url': BOT_DEMO},
        {'label': 'Прототип Mini App', 'url': MINI_APP},
    ],
    'en': [
        {'label': 'Telegram bot prototype', 'url': BOT_DEMO},
        {'label': 'Mini App prototype', 'url': MINI_APP},
    ],
    'vi': [
        {'label': 'Prototype Telegram bot', 'url': BOT_DEMO},
        {'label': 'Prototype Mini App', 'url': MINI_APP},
    ],
}

ric = {
    'ru': {
        'name': 'РИЦ · RUSSIAN INFORMATION CENTER',
        'industry': 'Туризм и экскурсии · Nha Trang',
        'status': 'Рабочий прототип',
        'desc': 'Telegram-бот и Mini App для выбора экскурсий, бронирования, оплаты и сопровождения туриста в Нячанге.',
        'flow': ['Telegram', 'Mini App', 'Экскурсии', 'Бронирование'],
        'live': live['ru'],
        'caseUrl': 'cases/ric.html',
    },
    'en': {
        'name': 'RIC · RUSSIAN INFORMATION CENTER',
        'industry': 'Tours & travel · Nha Trang',
        'status': 'Working prototype',
        'desc': 'Telegram bot and Mini App prototype for tour discovery, booking, payment and tourist support in Nha Trang.',
        'flow': ['Telegram', 'Mini App', 'Tours', 'Booking'],
        'live': live['en'],
        'caseUrl': 'cases/ric.html',
    },
    'vi': {
        'name': 'RIC · RUSSIAN INFORMATION CENTER',
        'industry': 'Du lịch & tour · Nha Trang',
        'status': 'Prototype hoạt động',
        'desc': 'Prototype Telegram bot và Mini App để chọn tour, đặt chỗ, thanh toán và hỗ trợ du khách tại Nha Trang.',
        'flow': ['Telegram', 'Mini App', 'Tour', 'Đặt chỗ'],
        'live': live['vi'],
        'caseUrl': 'cases/ric.html',
    },
}

# Main landing + preview.
for name in ('index.html', 'preview.html'):
    path = Path('public') / name
    text, start, end, data, semicolon = load(path, 'window.SITE_I18N=')
    for lang in ('ru', 'en', 'vi'):
        items = data[lang].setdefault('protoItems', [])
        items[:] = [x for x in items if x.get('name') not in ('РИЦ · RUSSIAN INFORMATION CENTER', 'RIC · RUSSIAN INFORMATION CENTER')]
        items.insert(0, ric[lang])
    save(path, text, start, end, data, semicolon)

# Prototype library.
path = Path('public/prototypes.html')
text, start, end, data, semicolon = load(path, 'window.PROTOTYPE_I18N=')
for lang in ('ru', 'en', 'vi'):
    items = data[lang].setdefault('items', [])
    items[:] = [x for x in items if x.get('name') not in ('РИЦ · RUSSIAN INFORMATION CENTER', 'RIC · RUSSIAN INFORMATION CENTER')]
    items.insert(0, ric[lang])
save(path, text, start, end, data, semicolon)

# Dedicated case page using the existing case shell.
template = Path('public/cases/true-surf.html')
out = Path('public/cases/ric.html')
shutil.copyfile(template, out)
text, start, end, data, semicolon = load(out, 'window.CASE_DATA=')

content = {
    'ru': {
        'kicker': 'РАБОЧИЙ ПРОТОТИП · NHA TRANG',
        'title': 'РИЦ · RUSSIAN INFORMATION CENTER',
        'lead': 'Telegram-бот и Mini App как новый цифровой канал продаж экскурсий и сопровождения туристов.',
        'meta': ['Туризм и экскурсии', 'Nha Trang', 'Telegram Bot + Mini App', 'RU / EN / VI'],
        'systemTitle': 'Путь туриста от выбора экскурсии до бронирования, оплаты и сопровождения — в Telegram.',
        'flow': ['Telegram', 'Каталог', 'Дата', 'Бронирование', 'Оплата', 'Мои поездки'],
        'status': 'Рабочий прототип',
        'format': 'Telegram Bot + Mini App',
        'band': {'client':'РИЦ','industry':'Туризм и экскурсии · Nha Trang','source':'Рабочий прототип','status':'Рабочий прототип'},
        'sections': [
            {'label':'РИЦ · КЕЙС','title':'Новый цифровой канал для туриста','lead':'Экскурсии и сервисы РИЦ доступны в одном мобильном интерфейсе.','blocks':[{'type':'callout','title':'Задача','text':'Перенести ключевой клиентский путь в Telegram: выбор экскурсии, даты, бронирование, демонстрационная оплата и сопровождение после покупки.'}]},
            {'label':'MINI APP','title':'Каталог, бронирование и поездки','lead':'Турист может пройти основной сценарий прямо со смартфона.','blocks':[{'type':'callout','title':'В прототипе','text':'Каталог экскурсий, карточки с программой и датами, бронирование, demo-оплата, подтверждение, «Мои поездки» и AI-консультант.'}]},
            {'label':'TELEGRAM','title':'Бот как точка входа и коммуникации','lead':'Отдельный mock-экран показывает сценарий Telegram-уведомлений и сопровождения.','blocks':[{'type':'callout','title':'Связка','text':'Telegram ведёт пользователя в Mini App, а уведомления поддерживают сценарий после бронирования и перед поездкой.'}]},
        ],
        'liveProducts': [
            {'name':'РИЦ — Telegram-бот','kind':'Telegram mock · публичный прототип','status':'Рабочий прототип','desc':'Демонстрационный экран Telegram-коммуникации и уведомлений.','url':BOT_DEMO,'cta':'Открыть Telegram-бот'},
            {'name':'РИЦ — Mini App','kind':'Mini App · публичный прототип','status':'Рабочий прототип','desc':'Актуальная опубликованная версия клиентского Mini App РИЦ.','url':MINI_APP,'cta':'Открыть Mini App'},
        ],
    },
    'en': {
        'kicker': 'WORKING PROTOTYPE · NHA TRANG',
        'title': 'RIC · RUSSIAN INFORMATION CENTER',
        'lead': 'A Telegram bot and Mini App prototype as a digital sales and tourist-support channel.',
        'meta': ['Tours & travel', 'Nha Trang', 'Telegram Bot + Mini App', 'RU / EN / VI'],
        'systemTitle': 'From tour discovery to booking, payment and trip support — inside Telegram.',
        'flow': ['Telegram', 'Catalog', 'Date', 'Booking', 'Payment', 'My trips'],
        'status': 'Working prototype',
        'format': 'Telegram Bot + Mini App',
        'band': {'client':'RIC','industry':'Tours & travel · Nha Trang','source':'Working prototype','status':'Working prototype'},
        'sections': [
            {'label':'RIC · CASE','title':'A new digital tourist channel','lead':'RIC tours and services in one mobile interface.','blocks':[{'type':'callout','title':'Goal','text':'Move the core customer journey into Telegram: tour choice, date, booking, demo payment and post-purchase support.'}]},
            {'label':'MINI APP','title':'Catalog, booking and trips','lead':'The main customer flow works directly from a smartphone.','blocks':[{'type':'callout','title':'In the prototype','text':'Tour catalog, program and dates, booking, demo payment, confirmation, My Trips and an AI assistant.'}]},
            {'label':'TELEGRAM','title':'Bot as an entry and communication layer','lead':'A separate mock screen demonstrates Telegram notifications and support.','blocks':[{'type':'callout','title':'Connection','text':'Telegram leads the user into the Mini App while notifications support the journey after booking and before the trip.'}]},
        ],
        'liveProducts': [
            {'name':'RIC — Telegram bot','kind':'Telegram mock · public prototype','status':'Working prototype','desc':'Demo screen for Telegram communication and notifications.','url':BOT_DEMO,'cta':'Open Telegram bot'},
            {'name':'RIC — Mini App','kind':'Mini App · public prototype','status':'Working prototype','desc':'Current published RIC client Mini App prototype.','url':MINI_APP,'cta':'Open Mini App'},
        ],
    },
    'vi': {
        'kicker': 'PROTOTYPE HOẠT ĐỘNG · NHA TRANG',
        'title': 'RIC · RUSSIAN INFORMATION CENTER',
        'lead': 'Prototype Telegram bot và Mini App như một kênh bán tour và hỗ trợ du khách số.',
        'meta': ['Du lịch & tour', 'Nha Trang', 'Telegram Bot + Mini App', 'RU / EN / VI'],
        'systemTitle': 'Từ chọn tour đến đặt chỗ, thanh toán và hỗ trợ chuyến đi — trong Telegram.',
        'flow': ['Telegram', 'Danh mục', 'Ngày', 'Đặt chỗ', 'Thanh toán', 'Chuyến đi'],
        'status': 'Prototype hoạt động',
        'format': 'Telegram Bot + Mini App',
        'band': {'client':'RIC','industry':'Du lịch & tour · Nha Trang','source':'Prototype hoạt động','status':'Prototype hoạt động'},
        'sections': [
            {'label':'RIC · CASE','title':'Kênh số mới cho du khách','lead':'Tour và dịch vụ RIC trong một giao diện di động.','blocks':[{'type':'callout','title':'Mục tiêu','text':'Đưa hành trình chính vào Telegram: chọn tour, ngày, đặt chỗ, thanh toán demo và hỗ trợ sau mua.'}]},
            {'label':'MINI APP','title':'Danh mục, đặt chỗ và chuyến đi','lead':'Khách có thể đi qua luồng chính ngay trên điện thoại.','blocks':[{'type':'callout','title':'Trong prototype','text':'Danh mục tour, chương trình và ngày, đặt chỗ, thanh toán demo, xác nhận, chuyến đi của tôi và trợ lý AI.'}]},
            {'label':'TELEGRAM','title':'Bot là điểm vào và lớp giao tiếp','lead':'Màn hình mock riêng mô phỏng thông báo và hỗ trợ qua Telegram.','blocks':[{'type':'callout','title':'Liên kết','text':'Telegram dẫn khách vào Mini App, còn thông báo hỗ trợ sau đặt chỗ và trước chuyến đi.'}]},
        ],
        'liveProducts': [
            {'name':'RIC — Telegram bot','kind':'Telegram mock · prototype công khai','status':'Prototype hoạt động','desc':'Màn hình demo cho giao tiếp và thông báo Telegram.','url':BOT_DEMO,'cta':'Mở Telegram bot'},
            {'name':'RIC — Mini App','kind':'Mini App · prototype công khai','status':'Prototype hoạt động','desc':'Phiên bản Mini App RIC dành cho khách đang được xuất bản.','url':MINI_APP,'cta':'Mở Mini App'},
        ],
    },
}

for lang in ('ru', 'en', 'vi'):
    ui = data[lang].get('ui', {})
    data[lang] = {**content[lang], 'ui': ui, 'next': {'title': 'UNIQ SMART RENT', 'href': 'uniq-smart-rent.html'}}

save(out, text, start, end, data, semicolon)
print('RIC case and public prototype links added.')
