from pathlib import Path
import json
import shutil

BASE = 'https://uniq-smart-rent.mirozdanie6v.workers.dev'


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
    'ru': [{'label': 'Веб-приложение', 'url': BASE + '/'}],
    'en': [{'label': 'Web app', 'url': BASE + '/'}],
    'vi': [{'label': 'Web app', 'url': BASE + '/'}],
}

# Keep the existing UNIQ card, but guarantee the current live URL and case link.
for name in ('index.html', 'preview.html'):
    path = Path('public') / name
    text, start, end, data, semicolon = load(path, 'window.SITE_I18N=')
    for lang in ('ru', 'en', 'vi'):
        for item in data[lang].get('protoItems', []):
            if item.get('name') == 'UNIQ SMART RENT':
                item['live'] = live[lang]
                item['caseUrl'] = 'cases/uniq-smart-rent.html'
    save(path, text, start, end, data, semicolon)

path = Path('public/prototypes.html')
text, start, end, data, semicolon = load(path, 'window.PROTOTYPE_I18N=')
for lang in ('ru', 'en', 'vi'):
    for item in data[lang].get('items', []):
        if item.get('name') == 'UNIQ SMART RENT':
            item['live'] = live[lang]
            item['caseUrl'] = 'cases/uniq-smart-rent.html'
save(path, text, start, end, data, semicolon)

# Build a dedicated case page from the existing VIIVERSION case shell.
template = Path('public/cases/true-surf.html')
out = Path('public/cases/uniq-smart-rent.html')
shutil.copyfile(template, out)
text, start, end, data, semicolon = load(out, 'window.CASE_DATA=')

content = {
    'ru': {
        'kicker': 'РАБОЧАЯ ДЕМОВЕРСИЯ · NHA TRANG',
        'title': 'UNIQ SMART RENT',
        'lead': 'Единый интерфейс для онлайн-аренды, заявок, клиентской базы и управления несколькими точками прямо со смартфона.',
        'meta': ['Прокат мототехники', 'Nha Trang', 'Web App + CRM-контур', 'RU / EN / VI / KO'],
        'systemTitle': 'Объединить каталог, заявки, клиентов и работу двух точек продаж в одной управляемой системе.',
        'flow': ['Сайт и реклама', 'Каталог', 'Заявка', 'CRM', 'Менеджер', 'Статистика'],
        'status': 'Рабочая демоверсия',
        'format': 'Цифровая система аренды',
        'band': {'client':'UNIQ SMART RENT','industry':'Аренда мототехники · Nha Trang','source':'Рабочая демоверсия','status':'Рабочая демоверсия'},
        'sections': [
            {'label':'UNIQ SMART RENT · КЕЙС','title':'Цифровая система аренды','lead':'Каталог, заявки, клиенты и управление в одном интерфейсе.','blocks':[{'type':'callout','title':'Задача','text':'Упростить бронирование, соединить заявки двух точек в единую систему и дать владельцу понятное управление бизнесом со смартфона.'}]},
            {'label':'КЛИЕНТСКИЙ СЦЕНАРИЙ','title':'Аренда начинается с выбора техники','lead':'Клиент выбирает даты, технику и видит расчёт тарифа.','blocks':[{'type':'callout','title':'Что уже работает','text':'Каталог с официальными фото, тарифный расчёт, заявка на бронирование и клиентский сценарий MY UNIQ.'}]},
            {'label':'ЕДИНАЯ БАЗА','title':'Все обращения в одном контуре','lead':'Заявки из сайта и внешних каналов можно сводить в единую CRM-логику.','blocks':[{'type':'callout','title':'Результат','text':'Менеджер видит клиента, выбранную технику, сроки аренды и текущий статус заявки в одном рабочем процессе.'}]},
            {'label':'УПРАВЛЕНИЕ','title':'Контроль бизнеса со смартфона','lead':'Командный и владельческий режимы для ежедневной работы.','blocks':[{'type':'callout','title':'В демоверсии','text':'Статусы заявок, данные по парку и точкам, рабочие переходы по жизненному циклу аренды и демонстрационная управленческая статистика.'}]},
            {'label':'ТЕКУЩИЙ СТАТУС','title':'Рабочая публичная демоверсия','lead':'Приложение опубликовано в Cloudflare Workers.','blocks':[{'type':'callout','title':'Сейчас','text':'Публичная версия использует подтверждённые данные из открытого каталога UNIQ. Финальная доступность техники и условия аренды подтверждаются менеджером.'}]},
        ],
        'liveProducts': [{'name':'UNIQ SMART RENT','kind':'Веб-приложение · публичная демоверсия','status':'Рабочая демоверсия','desc':'Актуальная опубликованная версия клиентского и демонстрационного рабочего интерфейса.','url':BASE + '/','cta':'Открыть приложение'}],
    },
    'en': {
        'kicker':'WORKING DEMO · NHA TRANG','title':'UNIQ SMART RENT','lead':'A unified interface for online rental requests, customer data and multi-location management from a smartphone.','meta':['Motorbike rental','Nha Trang','Web App + CRM layer','RU / EN / VI / KO'],'systemTitle':'Unify catalog, requests, customers and two sales locations in one manageable system.','flow':['Site & ads','Catalog','Request','CRM','Manager','Analytics'],'status':'Working demo','format':'Rental digital system','band':{'client':'UNIQ SMART RENT','industry':'Motorbike rental · Nha Trang','source':'Working demo','status':'Working demo'},
        'sections':[
            {'label':'UNIQ SMART RENT · CASE','title':'Rental digital system','lead':'Catalog, requests, customers and management in one interface.','blocks':[{'type':'callout','title':'Goal','text':'Simplify booking, connect requests from two locations and give the owner clear smartphone-based control.'}]},
            {'label':'CUSTOMER FLOW','title':'Rental starts with vehicle selection','lead':'The customer selects dates and a vehicle and sees a tariff estimate.','blocks':[{'type':'callout','title':'Already working','text':'Official vehicle imagery, tariff calculation, booking request and MY UNIQ customer flow.'}]},
            {'label':'UNIFIED DATABASE','title':'All requests in one workflow','lead':'Website and external-channel requests can be brought into one CRM logic.','blocks':[{'type':'callout','title':'Result','text':'The manager sees the customer, selected vehicle, rental dates and current request status in one workflow.'}]},
            {'label':'MANAGEMENT','title':'Business control from a smartphone','lead':'Team and owner modes for daily operations.','blocks':[{'type':'callout','title':'In the demo','text':'Request statuses, fleet and location data, rental lifecycle transitions and demonstration management analytics.'}]},
            {'label':'CURRENT STATUS','title':'Working public demo','lead':'The application is published on Cloudflare Workers.','blocks':[{'type':'callout','title':'Now','text':'The public version uses verified data from UNIQ public sources. Final availability and rental terms remain manager-confirmed.'}]},
        ],
        'liveProducts':[{'name':'UNIQ SMART RENT','kind':'Web app · public demo','status':'Working demo','desc':'Current published client and operational demo interface.','url':BASE + '/','cta':'Open app'}],
    },
    'vi': {
        'kicker':'BẢN DEMO HOẠT ĐỘNG · NHA TRANG','title':'UNIQ SMART RENT','lead':'Một giao diện thống nhất cho thuê trực tuyến, yêu cầu, dữ liệu khách hàng và quản lý nhiều điểm ngay trên điện thoại.','meta':['Cho thuê xe máy','Nha Trang','Web App + lớp CRM','RU / EN / VI / KO'],'systemTitle':'Kết nối danh mục, yêu cầu, khách hàng và hai điểm bán trong một hệ thống quản lý.','flow':['Website & quảng cáo','Danh mục','Yêu cầu','CRM','Quản lý','Thống kê'],'status':'Bản demo hoạt động','format':'Hệ thống số cho thuê xe','band':{'client':'UNIQ SMART RENT','industry':'Cho thuê xe máy · Nha Trang','source':'Bản demo hoạt động','status':'Bản demo hoạt động'},
        'sections':[
            {'label':'UNIQ SMART RENT · CASE','title':'Hệ thống số cho thuê xe','lead':'Danh mục, yêu cầu, khách hàng và quản lý trong một giao diện.','blocks':[{'type':'callout','title':'Mục tiêu','text':'Đơn giản hóa đặt xe, kết nối yêu cầu từ hai điểm và giúp chủ doanh nghiệp quản lý rõ ràng trên điện thoại.'}]},
            {'label':'HÀNH TRÌNH KHÁCH HÀNG','title':'Bắt đầu từ chọn xe','lead':'Khách chọn ngày, xe và xem ước tính giá.','blocks':[{'type':'callout','title':'Đã hoạt động','text':'Ảnh xe chính thức, tính giá, yêu cầu đặt xe và hành trình khách hàng MY UNIQ.'}]},
            {'label':'CƠ SỞ DỮ LIỆU CHUNG','title':'Tất cả yêu cầu trong một quy trình','lead':'Yêu cầu từ website và kênh ngoài có thể được gom vào một logic CRM.','blocks':[{'type':'callout','title':'Kết quả','text':'Quản lý thấy khách hàng, xe đã chọn, thời gian thuê và trạng thái yêu cầu trong một quy trình.'}]},
            {'label':'QUẢN LÝ','title':'Kiểm soát kinh doanh trên điện thoại','lead':'Chế độ cho đội ngũ và chủ doanh nghiệp.','blocks':[{'type':'callout','title':'Trong bản demo','text':'Trạng thái yêu cầu, dữ liệu đội xe và điểm bán, vòng đời thuê xe và thống kê quản lý demo.'}]},
            {'label':'TRẠNG THÁI HIỆN TẠI','title':'Bản demo công khai đang hoạt động','lead':'Ứng dụng đã được xuất bản trên Cloudflare Workers.','blocks':[{'type':'callout','title':'Hiện tại','text':'Phiên bản công khai dùng dữ liệu đã xác minh từ nguồn công khai của UNIQ. Tình trạng xe và điều kiện cuối cùng được quản lý xác nhận.'}]},
        ],
        'liveProducts':[{'name':'UNIQ SMART RENT','kind':'Web app · demo công khai','status':'Bản demo hoạt động','desc':'Phiên bản giao diện khách hàng và vận hành demo hiện tại.','url':BASE + '/','cta':'Mở ứng dụng'}],
    },
}

for lang in ('ru','en','vi'):
    ui = data[lang].get('ui', {})
    next_block = data[lang].get('next', {})
    data[lang] = {**content[lang], 'ui': ui, 'next': next_block}
    # Keep library navigation valid.
    data[lang]['next'] = {'title': 'G-Beauty Viễn Triều', 'href': 'gbeauty.html'}

save(out, text, start, end, data, semicolon)
print('UNIQ SMART RENT case and live link added.')
