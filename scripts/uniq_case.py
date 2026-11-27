"""UNIQ case: editorial proof page, RU/EN, scoped to this project."""
from pathlib import Path
from html import escape as e

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "site_assets" / "cases"
DEMO = "https://uniq-smart-rent.mirozdanie6v.workers.dev/"

COPY = {
"ru": {
"title": "UNIQ SMART RENT — от выбора транспорта до управления бизнесом",
"lead": "Цифровая система аренды транспорта: клиент самостоятельно выбирает технику и оформляет заявку, сотрудник ведёт её до возврата, владелец видит картину бизнеса. Три интерфейса в одном приложении.",
"status": "Интерактивная демонстрационная система · Нячанг, Вьетнам",
"open": "Открыть интерактивное демо", "discuss": "Обсудить систему для своего бизнеса",
"nav": [("customer","Клиент"),("employee","Сотрудник"),("owner","Владелец"),("engineering","Архитектура"),("adaptation","Адаптация")],
"metrics": [("3","ролевых интерфейса"),("89","позиций в проверяемом каталоге"),("5","языков приложения"),("2","точки выдачи")],
"context": ("Аренда — это не только каталог", "Прокату необходимо связать выбор транспорта, обработку обращений, выдачу, возврат и управленческий контроль. Если эти этапы разнесены по чатам и таблицам, сотрудникам приходится повторно уточнять данные, а руководителю сложнее видеть текущую ситуацию. Мы спроектировали единый сценарий для всех трёх участников — на примере UNIQ Moto."),
"roles": [
("customer","01 / Клиент","Вся аренда начинается в одном приложении","Пользователь может открыть приложение в браузере без установки и выбрать подходящий транспорт до разговора с менеджером.", [
("Главная и даты аренды","Быстрый вход в сценарий, выбор дат получения и возврата, подборка популярной техники. Клиент сразу понимает, что делать дальше.","client-home"),
("Каталог и поиск","Мотоциклы, скутеры и автомобили с реальными фотографиями из опубликованного каталога UNIQ. Поиск по названию и фильтр по типу позволяют быстрее найти подходящую технику.","client-catalog"),
("Карточка техники","Фотогалерея, год, характеристики, дневной, недельный и месячный тарифы, депозит и информация о подтверждении наличия. Условия видны до обращения к менеджеру.","client-detail"),
("Заявка на аренду","Из карточки открывается компактная форма: даты, имя и контакт. Приложение рассчитывает предварительную стоимость по опубликованным тарифам и передаёт контекст выбранной техники в сценарий заявки.","client-booking"),
("MY UNIQ — мои заявки","Пользователь видит выбранную технику, период и статус заявки в демонстрационном интерфейсе, не повторяя весь путь с начала.","client-requests"),
("Демонстрационная оплата","В исходном коде предусмотрен сценарий выбора способа оплаты и локальной отметки о платеже. Это демонстрация, без реального списания средств.","client-payment"),
("Контакты и выдача","Телефон, Telegram, Zalo, WhatsApp, адреса двух точек в Нячанге и ссылки на Google Maps. Если нужна консультация, связь с менеджером остаётся доступной.","client-contacts")],
"Потенциальный эффект: меньше однотипных вопросов, более подготовленные обращения и понятный путь от просмотра до заявки."),
("employee","02 / Сотрудник","От входящей заявки до возврата техники","Вместо отдельного клиентского сайта и несвязанного рабочего интерфейса — операционный сценарий, продолжающий путь клиента.",[
("Рабочий стол","Сводка открытых заявок, размер парка, готовность к выдаче и очередь последних обращений. Сотрудник видит, на чём сосредоточиться.","employee-dashboard"),
("Заявки клиентов","Карточка обращения содержит контакт, выбранную технику, сроки и предварительную сумму. Сотрудник может менять статус от первого контакта до завершения или отмены.","employee-requests"),
("Парк техники","Список транспорта с фотографиями, характеристиками и изменяемым рабочим состоянием: подтверждение менеджером, готов к выдаче, резерв, сервис. Это основа оперативной координации.","employee-fleet"),
("Выдачи и возвраты","В отдельном разделе собраны подтверждённые обращения и последующие стадии аренды. Не нужно вручную искать их среди новых заявок.","employee-handover"),
("Статус оплаты","В исходном коде предусмотрена демонстрационная отметка оплаты, доступная сотруднику для просмотра. Это не приём платежей и не интеграция с эквайрингом.","employee-payment")],
"Потенциальный эффект: единый контекст обращения, меньше повторного ввода и прозрачный операционный процесс."),
("owner","03 / Владелец","Пульс бизнеса — со смартфона","Управленческий интерфейс превращает данные заявок и парка в сводку, не перегружая владельца операционными деталями.",[
("Обзор бизнеса","Общее количество техники, клиентов, открытых и подтверждённых заявок, потенциальная сумма обращений по тарифам. Сумма заявок не равна выручке.","owner-overview"),
("Распределение по статусам","Визуальная сводка показывает, сколько заявок находится на каждой стадии. Это основа контроля очереди и последующего анализа конверсии.","owner-status"),
("Клиентские профили","Обращения группируются по контакту. История техники, дат, сумм и отметок оплаты позволяет увидеть повторные обращения и контекст клиента.","owner-clients"),
("Все заявки","Владелец может просматривать обращения и текущие статусы в отдельном разделе, не вмешиваясь в повседневную работу сотрудника.","owner-requests"),
("Состояние парка","Общий срез по готовности, резерву и сервису помогает увидеть распределение техники. Демонстрационные состояния не являются реальным календарём доступности.","owner-fleet")],
"Потенциальный эффект: доступ к управленческой информации в одном месте и основа для дальнейшего подключения реальной аналитики.")
],
"flow_title":"Один процесс вместо трёх отдельных приложений",
"flow":["Выбор техники","Заявка и расчёт","Контакт и подтверждение","Выдача и аренда","Возврат и завершение"],
"flow_note":"Интерфейсы используют общий сценарий и модель статусов. Это демонстрация сквозной логики; общая производственная база требует отдельной настройки и проверки.",
"engineering_title":"Инженерия за интерфейсом",
"engineering_lead":"Не просто витрина: проект включает клиентские сценарии, бизнес-правила, API и подготовленную модель хранения данных.",
"engineering":[("Продуктовая архитектура","Три ролевых режима, единая модель заявки, сценарии аренды и статусы парка. Публичное переключение ролей предназначено для демонстрации, а не для разграничения доступа в рабочей среде."),("Расчёт тарифов","Алгоритм сравнивает комбинации дневных, недельных и месячных ставок для периода аренды. Итоговые условия подтверждает менеджер."),("TypeScript и Cloudflare Workers","Типизированная предметная логика, статическое веб-приложение и серверные API каталога, доступности, заявок и обновления статусов."),("Данные и интеграции","Предусмотрены D1 и миграции для транспорта, цен, клиентов, заявок, аренды и связанных сущностей; серверные операции сотрудника защищаются ключом. Для запуска нужны рабочие роли, авторизация и подключение достоверного календаря."),("Мультиязычность и каналы","Русский, английский, вьетнамский, корейский и китайский в интерфейсе; браузер и предусмотренная интеграция Telegram WebApp."),("Проверяемость","В репозитории есть тесты предметной логики и браузерные E2E-сценарии для восьми размеров экрана, каталога, языков, заявки и ролевых режимов.")],
"adapt_title":"Та же архитектура — для других отраслей",
"adapt_lead":"Транспорт в каталоге можно заменить любым арендуемым ресурсом или услугой, сохраняя сквозную логику: выбор → заявка → обработка → исполнение → контроль.",
"adapt":[("Прокат авто и оборудования","Каталог ресурсов, даты, тарифы, резерв, выдача и возврат."),("Туризм и экскурсии","Каталог программ, дата, параметры заявки и сопровождение менеджером."),("Сервис и запись","Выбор услуги, обращение, этапы работы и управленческий обзор."),("Аренда недвижимости и пространств","Объекты, запросы на даты, согласование и операционные статусы.")],
"boundary_title":"Что уже можно проверить и что нужно для запуска",
"boundary":"Это публичная интерактивная демосистема, а не подтверждённое промышленное внедрение у UNIQ. Каталог и интерфейсы доступны для демонстрации; данные заявок, состояния парка, клиентские профили и отметки оплаты могут быть демонстрационными и храниться в браузере. Для производственной эксплуатации необходимы авторитетная база и календарь, права доступа, правила бизнеса и интеграции. Фактические продажи, выручка и рост конверсии не измерялись.",
"cta_title":"Покажите нам свой бизнес-процесс", "cta_lead":"Спроектируем клиентский путь, рабочие интерфейсы и интеграции вокруг ваших реальных операций — от одной задачи до связанной системы.",
"proof_note":"Реальный экран приложения", "demo_data":"Демонстрационные данные", "more":"Открыть демо и проверить сценарий"
},
"en": {
"title":"UNIQ SMART RENT — from vehicle selection to business operations",
"lead":"One rental system with three interfaces: customers choose vehicles and submit requests, employees manage the rental lifecycle, and owners see an operational overview.",
"status":"Interactive demonstration system · Nha Trang, Vietnam",
"open":"Explore the interactive demo","discuss":"Discuss a system for your business",
"nav":[("customer","Customer"),("employee","Employee"),("owner","Owner"),("engineering","Engineering"),("adaptation","Adaptation")],
"metrics":[("3","role-based interfaces"),("89","catalogue entries in test scope"),("5","app languages"),("2","pickup locations")],
"context":("Rental is more than a catalogue","A rental business needs to connect selection, enquiries, handover, return and oversight. Fragmented chats and spreadsheets can lead to repeated questions and limited visibility. We designed a continuous workflow for all three participants using UNIQ Moto as an example."),
"roles":[
("customer","01 / Customer","A complete rental journey in one app","Open the web app without installing software and choose a vehicle before speaking with a manager.",[
("Home and rental dates","Choose pickup and return dates and browse featured vehicles. A clear starting point guides customers to the catalogue.","client-home"),
("Catalogue and search","Browse motorcycles, scooters and cars with published UNIQ photos. Search by name and filter by vehicle type.","client-catalog"),
("Vehicle details","Photo gallery, year, specifications, daily, weekly and monthly rates, deposit and manager-confirmation notice.","client-detail"),
("Rental request","A compact form captures dates, name and contact. The application calculates an indicative tariff and carries the selected vehicle into the request flow.","client-booking"),
("MY UNIQ — my requests","See vehicle, dates and request status in the demo rather than restarting the selection journey.","client-requests"),
("Demo checkout","The source includes payment method selection and a local payment marker. No real money is charged.","client-payment"),
("Contact and pickup","Phone, Telegram, Zalo, WhatsApp, two pickup locations and Google Maps links keep manager assistance accessible.","client-contacts")],
"Potential benefit: fewer repetitive enquiries, better prepared requests and a clear path to booking."),
("employee","02 / Employee","From enquiry to vehicle return","An operational interface continues the customer journey instead of leaving the team with disconnected tools.",[
("Dashboard","Open requests, fleet size, readiness and recent enquiries in one working view.","employee-dashboard"),
("Customer requests","Contact, vehicle, rental dates, indicative amount and editable lifecycle status from initial contact to completion or cancellation.","employee-requests"),
("Fleet","Vehicle list with photos, specifications and editable states: manager confirmation, ready, reserved and service.","employee-fleet"),
("Handover and returns","A dedicated view brings confirmed requests and subsequent rental stages together.","employee-handover"),
("Payment status","The source includes a demo payment indicator for staff to review. It is not payment processing or acquiring integration.","employee-payment")],
"Potential benefit: shared request context, less repeated entry and clearer operations."),
("owner","03 / Owner","The pulse of the business on a phone","An overview turns request and fleet data into useful operational signals without overwhelming the owner.",[
("Business overview","Fleet size, customers, open and confirmed requests, and potential request value at current tariffs. Request value is not revenue.","owner-overview"),
("Status breakdown","See how many requests are at each stage, providing a basis for queue oversight and later conversion analysis.","owner-status"),
("Customer profiles","Requests are grouped by contact; vehicle, dates, amounts and payment records provide customer history.","owner-clients"),
("All requests","Review enquiries and statuses without taking over the employee workflow.","owner-requests"),
("Fleet overview","See readiness, reserved and service states. Demo states are not a live availability calendar.","owner-fleet")],
"Potential benefit: accessible management information and a foundation for future operational analytics.")],
"flow_title":"One workflow instead of three disconnected apps","flow":["Vehicle selection","Request and estimate","Contact and confirmation","Handover and rental","Return and completion"],
"flow_note":"Interfaces share the request model and workflow. A shared production database requires configuration and verification.",
"engineering_title":"Engineering behind the interface","engineering_lead":"Customer journeys, business rules, APIs and a prepared data model — not simply a catalogue.",
"engineering":[("Product architecture","Three role modes, shared request model, rental lifecycle and fleet statuses. The public role switch is for demonstration, not production access control."),("Tariff calculation","Compares daily, weekly and monthly tariff combinations for the rental period. Final terms require manager confirmation."),("TypeScript and Cloudflare Workers","Typed domain logic, static web application and server APIs for fleet, availability, requests and status updates."),("Data and integrations","D1 and migrations cover vehicles, prices, customers, bookings, rentals and related entities. Staff API writes require a key. Production needs real roles, authentication and authoritative availability."),("Languages and channels","Russian, English, Vietnamese, Korean and Chinese interface support, ordinary browser access and Telegram WebApp hooks."),("Testability","The repository includes domain tests and browser E2E scenarios for eight viewport sizes, catalogue, languages, requests and role interfaces.")],
"adapt_title":"The same architecture for other industries","adapt_lead":"Replace vehicles with other resources or services while preserving selection, request, processing, fulfilment and oversight.",
"adapt":[("Car and equipment rental","Resource catalogue, dates, tariffs, reservation, handover and return."),("Tourism and activities","Programme catalogue, date, request details and manager follow-up."),("Services and appointments","Service selection, request, work stages and management overview."),("Property and space rental","Listings, date enquiries, approvals and operational status.")],
"boundary_title":"What can be inspected and what remains for launch","boundary":"This is a public interactive demonstration, not a verified live UNIQ deployment. Request data, fleet states, customer profiles and payment records may be demo data stored in the browser. Production requires authoritative data and calendar, access control, business rules and integrations. Actual sales, revenue and conversion improvements have not been measured.",
"cta_title":"Show us your business workflow","cta_lead":"We design customer journeys, operational interfaces and integrations around real processes — from one task to a connected system.",
"proof_note":"Actual application screen","demo_data":"Demonstration data","more":"Open demo and explore the workflow"
}
}

STYLE = """<style>
.uniq-case{--u-ink:#071524;--u-line:#dfe6ee;--u-blue:#145dff;overflow:clip}
.uniq-case .u-intro{padding:44px 0 64px;background:linear-gradient(140deg,#06111f,#102e52);color:white}
.uniq-case .u-intro h1{font-size:clamp(36px,5.2vw,68px);line-height:1.06;max-width:890px;color:white;margin:16px 0 24px}
.uniq-case .u-intro p{max-width:760px;color:#dce8fa;font-size:clamp(17px,2vw,22px);line-height:1.55}
.uniq-case .u-intro .eyebrow{color:#b6d2ff}.uniq-case .u-project{display:block;font-size:clamp(20px,2.4vw,30px);letter-spacing:.035em;color:#b6d2ff;margin-bottom:12px}.uniq-case .u-intro .btn-primary{background:#145dff;color:#fff;border-color:#145dff}.uniq-case .u-intro .btn-primary:hover{background:#124cce}.uniq-case .u-hero-proof{margin:36px 0 0}
.uniq-case figure{margin:0;min-width:0}.uniq-case figure img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:contain;background:#e9eef5;border:1px solid var(--u-line);border-radius:12px}
.uniq-case figcaption{font-size:14px;color:#5a6878;margin-top:10px;line-height:1.5}
.uniq-case .u-intro figcaption{color:#dce8fa}
.uniq-case .u-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;padding:36px 0}
.uniq-case .u-metric{border-left:2px solid var(--u-blue);padding-left:14px;display:flex;flex-direction:column;gap:6px}
.uniq-case .u-metric b{font-size:clamp(30px,5vw,52px);line-height:1;color:var(--u-ink)}.uniq-case .u-metric span{font-size:15px}
.uniq-case .u-nav{display:flex;flex-wrap:wrap;gap:8px;padding:18px 0 22px;border-block:1px solid var(--u-line)}
.uniq-case .u-nav a{display:inline-flex;align-items:center;min-height:44px;padding:8px 14px;border:1px solid var(--u-line);border-radius:8px;color:var(--u-ink);text-decoration:none}
.uniq-case .u-section{padding:76px 0;scroll-margin-top:100px}.uniq-case .u-section h2{font-size:clamp(30px,4vw,49px);line-height:1.12;max-width:900px;margin:12px 0 20px}
.uniq-case .u-lead{max-width:760px;font-size:18px;line-height:1.65;color:#425366}
.uniq-case .u-feature{display:grid;grid-template-columns:minmax(0,0.72fr) minmax(0,1.28fr);align-items:center;gap:clamp(24px,5vw,72px);padding:32px 0;border-bottom:1px solid var(--u-line)}
.uniq-case .u-feature.no-proof{grid-template-columns:1fr}.uniq-case .u-feature h3{font-size:clamp(22px,3vw,30px);margin:8px 0 12px;line-height:1.2}
.uniq-case .u-feature p{font-size:17px;line-height:1.65;max-width:660px;margin:0}
.uniq-case .u-index{font-size:13px;letter-spacing:.1em;color:#52647b}
.uniq-case .u-benefit{border-left:3px solid var(--u-blue);padding:18px 20px;margin-top:32px;background:#fff;line-height:1.65;color:#18334f}
.uniq-case .u-flow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;list-style:none;padding:0;margin:30px 0}
.uniq-case .u-flow li{padding:18px 12px;background:white;border-top:3px solid var(--u-blue);font-weight:600;line-height:1.4}
.uniq-case .u-list{display:grid;grid-template-columns:1fr 1fr;gap:0 40px;margin:28px 0}
.uniq-case .u-list article{padding:22px 0;border-top:1px solid var(--u-line)}.uniq-case .u-list h3{margin:0 0 8px;font-size:22px}.uniq-case .u-list p{line-height:1.6;margin:0}
.uniq-case .u-soft{background:#f5f7fa}.uniq-case .u-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}
.uniq-case .u-section a:focus-visible,.uniq-case .u-nav a:focus-visible,.uniq-case .u-intro a:focus-visible{outline:3px solid #629eff;outline-offset:4px}
@media(max-width:760px){.uniq-case .u-intro{padding:32px 0 44px}.uniq-case .u-intro h1{font-size:clamp(30px,8vw,40px);margin:12px 0 18px}.uniq-case .u-intro p{font-size:17px}.uniq-case .u-hero-proof{margin-top:24px}.uniq-case .u-section{padding:52px 0}.uniq-case .u-metrics{grid-template-columns:1fr 1fr;gap:20px 14px}.uniq-case .u-feature{grid-template-columns:1fr;gap:18px;padding:28px 0}.uniq-case .u-flow,.uniq-case .u-list{grid-template-columns:1fr}.uniq-case .u-actions a{width:100%;justify-content:center}.uniq-case .u-nav a{padding:8px 10px}}
</style>"""

def screenshot(slug, caption, c, eager=False):
    name = "uniq-smart-rent.webp" if slug == "hero" else "uniq-" + slug + ".webp"
    if not (ASSETS / name).is_file():
        return ""
    note = c["proof_note"] if slug in ("hero","client-home","client-catalog","client-detail","client-booking","client-contacts") else c["proof_note"] + " · " + c["demo_data"]
    return f'<figure><a href="/assets/cases/{name}" target="_blank" rel="noopener"><img src="/assets/cases/{name}" alt="{e(caption)}" width="1280" height="800" loading="{"eager" if eager else "lazy"}" decoding="async"></a><figcaption>{e(caption)} · {e(note)}</figcaption></figure>'

def render_uniq_case(lang):
    c=COPY[lang]
    project,headline=c['title'].split(' — ',1)
    headline=headline[0].upper()+headline[1:]
    metrics="".join(f'<div class="u-metric"><b>{e(n)}</b><span>{e(label)}</span></div>' for n,label in c["metrics"])
    nav="".join(f'<a href="#{key}">{e(label)}</a>' for key,label in c["nav"])
    roles=[]
    for i,(key,kicker,title,lead,features,benefit) in enumerate(c["roles"]):
        rows=[]
        for n,(heading,body,slug) in enumerate(features,1):
            proof=screenshot(slug,heading,c)
            rows.append(f'<article class="u-feature{" no-proof" if not proof else ""}"><div><span class="u-index">{i+1:02d}.{n:02d}</span><h3>{e(heading)}</h3><p>{e(body)}</p></div>{proof}</article>')
        roles.append(f'<section id="{key}" class="u-section {"u-soft" if i==1 else ""}"><div class="wrap"><div class="eyebrow">{e(kicker)}</div><h2>{e(title)}</h2><p class="u-lead">{e(lead)}</p>{"".join(rows)}<p class="u-benefit">{e(benefit)}</p></div></section>')
    def items(entries):
        return "".join(f'<article><h3>{e(t)}</h3><p>{e(p)}</p></article>' for t,p in entries)
    flow="".join(f'<li>{i+1:02d} · {e(s)}</li>' for i,s in enumerate(c["flow"]))
    return STYLE+f'''<div class="uniq-case">
<section class="u-intro"><div class="wrap"><div class="eyebrow">{e(c["status"])}</div><h1><span class="u-project">{e(project)}</span>{e(headline)}</h1><p>{e(c["lead"])}</p><div class="u-actions"><a class="btn btn-primary" href="{DEMO}" target="_blank" rel="noopener">{e(c["open"])} →</a></div><div class="u-hero-proof">{screenshot("hero","UNIQ SMART RENT",c,True)}</div></div></section>
<div class="wrap"><div class="u-metrics">{metrics}</div><nav class="u-nav" aria-label="UNIQ SMART RENT">{nav}</nav></div>
<section class="u-section"><div class="wrap"><h2>{e(c["context"][0])}</h2><p class="u-lead">{e(c["context"][1])}</p></div></section>
{"".join(roles)}
<section class="u-section u-soft"><div class="wrap"><h2>{e(c["flow_title"])}</h2><ol class="u-flow">{flow}</ol><p class="u-lead">{e(c["flow_note"])}</p></div></section>
<section id="engineering" class="u-section"><div class="wrap"><h2>{e(c["engineering_title"])}</h2><p class="u-lead">{e(c["engineering_lead"])}</p><div class="u-list">{items(c["engineering"])}</div></div></section>
<section id="adaptation" class="u-section u-soft"><div class="wrap"><h2>{e(c["adapt_title"])}</h2><p class="u-lead">{e(c["adapt_lead"])}</p><div class="u-list">{items(c["adapt"])}</div></div></section>
<section class="u-section"><div class="wrap"><h2>{e(c["boundary_title"])}</h2><p class="u-lead">{e(c["boundary"])}</p><div class="u-actions"><a class="btn btn-primary" href="{DEMO}" target="_blank" rel="noopener">{e(c["more"])} →</a></div></div></section>
<section class="u-section u-soft"><div class="wrap"><h2>{e(c["cta_title"])}</h2><p class="u-lead">{e(c["cta_lead"])}</p><div class="u-actions"><a class="btn btn-primary" href="#contact" data-interest="UNIQ SMART RENT" data-cta="case">{e(c["discuss"])} →</a></div></div></section></div>'''
