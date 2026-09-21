from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
HOME = PUBLIC / "index.html"
if not HOME.exists():
    raise SystemExit("legacy public/index.html is required")

legacy = HOME.read_text(encoding="utf-8")
m = re.search(r'<img class="vii-logo"[^>]*>', legacy)
LOGO = m.group(0) if m else '<span class="brand-word">VIIVERSION</span>'

# Keep already-published communication channels from the legacy footer.
footer = re.search(r"<footer\b.*?</footer>", legacy, re.S | re.I)
CONTACTS = []
if footer:
    seen = set()
    for href, label in re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', footer.group(0), re.S | re.I):
        if href.startswith(("mailto:", "https://t.me/", "https://wa.me/", "https://api.whatsapp.com/")) and href not in seen:
            seen.add(href)
            clean = re.sub(r"<[^>]+>", " ", label)
            clean = re.sub(r"\s+", " ", clean).strip() or "Связаться"
            CONTACTS.append((href, clean))
CONTACTS = CONTACTS[:4]

PRODUCTS = {
"sales":("Sales","Клиентский слой","Цифровой вход в продукт и продажу",
"Сайт, Telegram, QR или Zalo превращаются в управляемый путь: показать предложение, помочь выбрать и получить структурированную заявку.",
["Landing / conversion page","Telegram Bot","Telegram Mini App","Zalo Mini App","Каталог и pricing","Клиентский кабинет","Мультиязычный слой"],
["Туризм","Аренда","Клиники","Beauty","Сервисный бизнес"],"Запуск одного клиентского сценария",
["UNIQ SMART RENT","AVE Dental","G-Beauty","TRUE SURF"],["Booking","Operations","AI Operator","PayBridge"]),
"booking":("Booking","Бронирование и расписание","Бронирование без ручной сборки заказа в чате",
"Клиент выбирает услугу, дату и параметры сам. Бизнес получает полный заказ, а не цепочку сообщений, которую ещё нужно вручную переносить.",
["Booking Engine","Availability / Schedule","Каталог","Pricing","Подтверждения","Напоминания"],
["Туризм","Аренда","Клиники","Beauty","Activities","Education"],"Booking Start — один законченный booking-flow",
["MAX TOUR","AVE Dental","PET NIKA","TRUE SURF"],["Schedule","PayBridge","Operations","AI Operator"]),
"operations":("Operations","Внутренний контур","Клиенты, заказы и управление — в одном рабочем контуре",
"CRM, back-office, статусы, аналитика и действия команды связываются вокруг реального процесса, а не вокруг очередного отдельного сервиса.",
["CRM / lead pipeline","Admin / Back-office","Customer profile","Owner dashboard","Analytics / KPI","Notifications","Repeat-sales automation"],
["SME","Туризм","Клиники","Rental","E-commerce","Multi-location"],"CRM Core или Back-office Core",
["MAX TOUR","PET NIKA","РИЦ"],["Automation","Analytics","AI Operator","Integrations"]),
"ai-operator":("AI Operator","AI в рабочем процессе","AI, который работает с вашим продуктом и вашими данными",
"Отвечает в заданном контуре, уточняет запрос, подбирает предложение и передаёт контекст дальше — в заявку, бронь или CRM.",
["AI Consultant","AI Search","Recommendation","Lead qualification","Knowledge layer","Workflow automation"],
["Туризм","Клиники","Каталоги","E-commerce","Сервисный бизнес"],"Один AI-сценарий на утверждённой базе знаний",
["MAX TOUR concepts","AVE concepts","ZL Web Agent"],["Sales","Booking","Operations","Analytics"]),
"paybridge":("PayBridge","Payments & middleware","Платёжный слой между клиентским действием и бизнес-системой",
"Связывает checkout, POS или приложение с платёжным провайдером и возвращает подтверждённый статус в CRM, ERP или back-office.",
["Payment integration","POS middleware","Webhooks","Status handling","Reconciliation","API layer"],
["POS vendors","Restaurants","Retail","E-commerce","Сети","Интеграторы"],"Технический pilot на одном checkout-flow",
["MAX TOUR payment flow","VIIVERSION middleware architecture"],["Multi-location rollout","Analytics","Loyalty","Managed support"])
}

INDUSTRIES = {
"tourism":("Туризм","Продажа тура не должна зависеть от того, когда менеджер открыл мессенджер.",
"Каталог, подбор, бронирование, оплата и работа команды собираются в один цифровой контур — от первого интереса туриста до подтверждённого заказа.",
["долгая консультация в чате","ручное уточнение дат и состава","разрозненные брони","нет единой картины по каналам"],"Booking Start",
["sales","booking","operations","ai-operator","paybridge"],["MAX TOUR","Русский Информационный Центр"]),
"rental":("Аренда","Каталог, доступность, цена и заявка должны работать как одна система.",
"Клиент видит актуальный выбор и условия, бизнес получает структурированный запрос и может подключить бронирование, депозит, CRM и историю объекта.",
["цены считаются вручную","доступность проверяется в переписке","заявки не связаны с парком","депозиты и статусы живут отдельно"],"Catalog + Quote",
["sales","booking","operations","paybridge"],["UNIQ SMART RENT"]),
"clinics":("Клиники","Запись — только начало клиентского процесса.",
"Клиентский интерфейс, запись, напоминания, история обращения и повторные действия связываются вокруг пациента и работы клиники.",
["лид теряется до записи","расписание согласуется вручную","повторный визит не автоматизирован","данные разнесены по системам"],"Mini App + Booking",
["sales","booking","operations","ai-operator"],["AVE Dental","PET NIKA"]),
"beauty":("Beauty / SPA","Из QR и соцсетей — сразу в понятный сценарий записи.",
"Услуга, мастер, слот, подтверждение и повторный визит без лишних переходов между страницами и чатами.",
["лиды из соцсетей теряются","запись вручную","нет напоминаний","повторные продажи зависят от менеджера"],"QR → Mini App Pilot",
["sales","booking","operations","ai-operator"],["G-Beauty"]),
"hospitality":("Hospitality","Прямой цифровой сервис до и после заселения.",
"Бронирование, вопросы гостя, дополнительные услуги и follow-up можно собрать вокруг одного клиентского пути.",
["зависимость от OTA","повторяющиеся вопросы","upsell вручную","разрозненные данные гостя"],"Booking + AI Concierge",
["sales","booking","ai-operator","operations","paybridge"],["Reusable tourism stack"]),
"restaurants":("Restaurants / Cafes","Платёж и возвратный клиент — часть одного потока.",
"PayBridge связывает checkout и статус оплаты с внутренними системами; дальше к этому же контуру подключаются loyalty и analytics.",
["фрагментированный checkout","ручная сверка","данные оплаты не возвращаются в операции","loyalty живёт отдельно"],"Fast Checkout Pilot",
["paybridge","operations"],["Payment middleware"]),
"retail":("Retail","Нормализовать события между POS, платежами и back-office.",
"Интеграционный слой снижает количество ручных сверок и даёт основу для аналитики и multi-location управления.",
["несколько POS/провайдеров","ручные сверки","разный формат событий","нет центральной картины"],"Payment / Integration Pilot",
["paybridge","operations"],["Payment middleware","Integration stack"]),
"real-estate":("Real Estate","Объекты, лиды и сделки не должны жить в разных чатах и таблицах.",
"Сначала моделируем текущий путь сделки, затем собираем object database, CRM, matching и owner-service вокруг него.",
["объекты дублируются","история лида теряется","подбор вручную","нет единой сделки"],"Sales Core Discovery",
["sales","operations","ai-operator"],["MyVietHome Pro architecture"]),
"education":("Education","Расписание, регистрация, оплата и история ученика — один процесс.",
"Модульный контур для курсов, школ и программ: от слота до напоминаний и клиентского кабинета.",
["расписание вручную","оплаты отдельно","напоминания отдельно","нет целостной истории"],"Schedule + Booking",
["booking","operations","paybridge"],["Reusable service stack"]),
"events":("Events","Регистрация и event-operations без хрупкой ручной сборки.",
"Участники, команды, статусы оплаты и очередь организатора собираются в простой операционный контур.",
["регистрация в формах и чатах","платёж проверяется вручную","команды ведутся отдельно","система падает в день события"],"Event Registration Mini App",
["sales","booking","operations","paybridge"],["Mini App / back-office stack"]),
"ecommerce":("E-commerce","Checkout, сообщения и CRM должны обмениваться событиями без ручных переносов.",
"Соединяем заказ, оплату, уведомления и CRM в надёжный интеграционный поток.",
["checkout отдельно от CRM","статусы расходятся","follow-up вручную","нет наблюдаемости интеграций"],"Commerce Integration Sprint",
["paybridge","operations","ai-operator"],["Integration stack"]),
"services":("Service Business","Один понятный путь от обращения до выполненной услуги.",
"Для небольшого бизнеса можно начать с Booking или CRM Lite, а затем подключить автоматизацию, оплату и AI.",
["всё в мессенджере","статусы держат в голове","клиентам забывают ответить","повторные продажи случайны"],"Booking Lite",
["sales","booking","operations","ai-operator"],["Reusable service stack"])
}

SOLUTIONS = {
"online-sales":("Online Sales System","Путь от первого интереса до структурированной продажи.",
"Клиентский интерфейс, каталог, подбор, бронирование или заявка, оплата и передача в CRM — как один сценарий.",
["Sales","Catalog / Pricing","Booking","PayBridge","Operations"],["Туризм","Rental","Clinics","Service business"],"Начать с одного клиентского пути, не со всей системы."),
"booking-automation":("Booking Automation","Убрать согласование дат, параметров и подтверждений из ручной переписки.",
"Booking Engine, schedule и reminders работают как единый процесс и при необходимости подключаются к оплате и CRM.",
["Booking","Schedule","Availability","Notifications","Operations"],["Туризм","Clinics","Beauty","Activities","Education"],"Один рабочий booking-flow."),
"ai-sales":("AI Sales Operator","Консультация и подбор без неконтролируемого «чатбота обо всём».",
"AI работает на утверждённой базе знаний, знает допустимые действия и передаёт контекст в следующий бизнес-шаг.",
["AI Operator","Knowledge layer","Catalog","Lead handoff","CRM"],["Туризм","Catalog businesses","Clinics","E-commerce"],"Один канал + одна измеримая задача."),
"fast-checkout":("Fast Checkout","Связать checkout, оплату и подтверждённый статус без ручной сверки.",
"Интеграционный слой между POS / приложением и платёжным провайдером с возвратом события в back-office.",
["PayBridge","Webhooks","Status handling","Reconciliation","API"],["Restaurants","Retail","E-commerce","POS vendors"],"Pilot с одним POS / checkout-flow."),
"private-operations":("Closed Operations System","Закрытая система под процесс, который не помещается в готовый SaaS.",
"Роли, данные, workflow, approvals, audit, интеграции и dashboards проектируются вокруг реальной внутренней операции.",
["RBAC","Workflow","Approvals","Data","API / ETL","Audit","Dashboards"],["Enterprise","Logistics","Manufacturing","Telecom","Multi-location"],"Paid Discovery → PoC → Implementation.")
}

CASES = {
"max-tour":("MAX TOUR","Туризм","Full-stack demo: клиентский путь, заказы, роли, admin и owner analytics.",["Booking","Operations","AI"],"https://max-tour.viiversion.com/"),
"rusinfocenter":("Русский Информационный Центр","Туризм","Цифровой клиентский путь и архитектура будущей единой системы продаж.",["Sales","Booking","Integrations"],"https://rusinfocenter.viiversion.com/"),
"uniq-smart-rent":("UNIQ SMART RENT","Rental","Каталог, pricing и request lifecycle для аренды транспорта.",["Sales","Booking","Operations"],"https://uniq-smart-rent.mirozdanie6v.workers.dev/"),
"pet-nika":("PET NIKA","Veterinary","Клиентский кабинет, питомцы, обращения, admin и аналитический слой.",["Sales","Booking","Operations"],"https://pet-nika.viiversion.com/"),
"ave-dental":("AVE Dental","Dental","Мультиязычный Mini App и booking-flow для клиники.",["Sales","Booking"],"https://ave-dental-miniapp.vercel.app/"),
"g-beauty":("G-Beauty","Beauty","Landing + Mini App + booking + demo admin для локального beauty-бизнеса.",["Sales","Booking","Operations"],""),
"true-surf":("TRUE SURF","Activities","Booking / client passport / repeat-flow в формате Mini App.",["Sales","Booking"],"https://truesurf-app.viiversion.com/")
}

LABS = [
("Proposal Studio","Research → diagnosis → solution → commercial proposal → QA.","/proposal-studio/"),
("Mini App Factory","White-label production line для серийной сборки клиентских Mini Apps.","#contact"),
("ZL Web Agent","Evidence-based read-only аудит WordPress и план безопасных изменений.","#contact"),
("Event Video Human Editor","Semantic analysis больших массивов event-video до ручного монтажа.","#contact")
]

NAV=[("Продукты","/products/"),("Отрасли","/industries/"),("Решения","/solutions/"),("Кейсы","/cases/"),("Enterprise","/enterprise/"),("Labs","/labs/"),("О нас","/about/")]

CSS=r'''
:root{--ink:#081423;--muted:#5c6b7e;--line:#dfe6ee;--soft:#f6f8fb;--blue:#175cff;--navy:#071524;--max:1180px;--r:20px;--shadow:0 18px 55px rgba(15,35,68,.08)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.5;background:#fff}a{text-decoration:none;color:inherit}.wrap{width:min(var(--max),calc(100% - 40px));margin:auto}
.site-header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.92);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.header-row{height:72px;display:flex;align-items:center;gap:26px}.brand{margin-right:auto}.vii-logo{height:34px!important;width:auto!important;max-width:190px!important;object-fit:contain}.brand-word{font-weight:900;letter-spacing:.08em;font-size:21px}.nav{display:flex;gap:21px;font-size:14px;font-weight:650}.nav a:hover,.link{color:var(--blue)}.header-cta,.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:11px;padding:12px 17px;font-size:14px;font-weight:780;border:1px solid transparent}.header-cta,.btn-primary{background:var(--ink);color:#fff}.header-cta:hover,.btn-primary:hover{background:var(--blue)}.btn-secondary{border-color:#cbd6e4;background:#fff}.mobile-toggle{display:none;border:0;background:none;font-size:24px}
.hero{padding:82px 0 64px;background:radial-gradient(circle at 80% 10%,rgba(23,92,255,.22),transparent 34%),linear-gradient(135deg,#06111f,#0c2139 70%,#102c4d);color:#fff}.hero-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:58px;align-items:center}.eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:850;color:#718096}.hero .eyebrow{color:#8fb2ff}.hero h1,.page-hero h1{font-size:clamp(44px,6.3vw,80px);line-height:.96;letter-spacing:-.055em;margin:15px 0 24px}.hero p{font-size:20px;color:#c7d2df;max-width:760px}.hero-actions,.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.hero .btn-secondary{background:transparent;color:#fff;border-color:rgba(255,255,255,.3)}.hero-note{display:flex;gap:28px;margin-top:40px;padding-top:26px;border-top:1px solid rgba(255,255,255,.14);color:#afbed1;font-size:12px}.hero-note b{display:block;color:#fff;font-size:17px;margin-bottom:3px}
.matrix-visual{padding:22px;border-radius:26px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);box-shadow:0 30px 90px rgba(0,0,0,.22)}.matrix-head{font-size:13px;color:#b9c9dc;margin-bottom:16px}.mini-matrix{display:grid;grid-template-columns:1.15fr repeat(5,.72fr);gap:6px;font-size:10px}.mini-matrix>div{min-height:43px;border-radius:9px;background:rgba(255,255,255,.055);display:flex;align-items:center;justify-content:center;padding:5px;text-align:center}.mini-matrix .top{background:transparent;color:#8fa8c8;min-height:26px}.mini-matrix .label{justify-content:flex-start;color:#dce7f3;padding-left:9px}.mini-matrix .on{background:linear-gradient(135deg,rgba(23,92,255,.78),rgba(111,76,246,.62));font-weight:850}.matrix-caption{font-size:11px;color:#90a5c0;margin-top:14px}
.section{padding:74px 0;border-bottom:1px solid var(--line)}.section.soft{background:var(--soft)}.section.dark{background:var(--navy);color:#fff;border-bottom:0}.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;margin-bottom:28px}.section-head h2{font-size:clamp(30px,4vw,48px);line-height:1.02;letter-spacing:-.04em;margin:8px 0 0}.section-head p{max-width:560px;color:var(--muted);margin:0}.dark .section-head p{color:#adbdcf}.link{font-size:14px;font-weight:780}
.grid3,.grid4,.grid5,.case-grid,.lab-grid{display:grid;gap:15px}.grid3{grid-template-columns:repeat(3,1fr)}.grid4{grid-template-columns:repeat(4,1fr)}.grid5{grid-template-columns:repeat(5,1fr)}.case-grid{grid-template-columns:repeat(3,1fr)}.lab-grid{grid-template-columns:repeat(2,1fr)}
.card{border:1px solid var(--line);border-radius:var(--r);padding:23px;background:#fff}.card:hover{border-color:#b8c8dc;box-shadow:var(--shadow)}.card .kicker{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#7d8b9c;font-weight:850}.card h3{font-size:22px;line-height:1.12;margin:9px 0}.card p{font-size:14px;color:var(--muted)}.product-card{min-height:310px;display:flex;flex-direction:column}.product-mark{width:42px;height:42px;border-radius:12px;background:#edf3ff;color:var(--blue);display:flex;align-items:center;justify-content:center;font-weight:900;margin-bottom:20px}.product-card .link{margin-top:auto;padding-top:15px}.path-card{position:relative}.path-card h3{font-size:25px}.path-card:after{content:"→";position:absolute;right:20px;bottom:17px;color:var(--blue);font-weight:900}
.growth{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.growth-step{padding:20px;border:1px solid var(--line);border-radius:17px;background:#fff;position:relative}.growth-step:not(:last-child):after{content:"→";position:absolute;right:-12px;top:50%;z-index:2;background:var(--soft);width:24px;text-align:center;color:#8290a3}.growth-step b{display:block;margin:8px 0 5px}.growth-step small{color:var(--muted)}
.matrix-section{display:grid;grid-template-columns:250px 1fr;gap:26px}.matrix-tabs{display:flex;flex-direction:column;gap:8px}.matrix-tabs button{border:1px solid var(--line);background:#fff;border-radius:11px;padding:12px;text-align:left;font-weight:760;cursor:pointer}.matrix-tabs button.active{background:var(--ink);color:#fff;border-color:var(--ink)}.matrix-results{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}.matrix-result{border:1px solid var(--line);border-radius:15px;padding:17px;background:#fff}.matrix-result.hidden{display:none}.matrix-result b{display:block}.matrix-result span{font-size:12px;color:var(--muted)}
.badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:13px}.badge{font-size:11px;font-weight:720;background:#eef2f7;color:#526177;border-radius:999px;padding:5px 8px}.case-card{display:flex;flex-direction:column;min-height:245px}.case-top{display:flex;justify-content:space-between;gap:15px}.case-code{font-weight:900;color:#a0acba;letter-spacing:.08em}.case-card .actions{margin-top:auto}.case-card .btn{padding:9px 11px;font-size:12px}
.partner-strip{display:grid;grid-template-columns:1fr 1fr;gap:18px}.partner-box{border-radius:23px;padding:28px;background:#0d2138;color:#fff}.partner-box.alt{background:#edf3ff;color:var(--ink)}.partner-box p{color:#b9c8da}.partner-box.alt p{color:var(--muted)}
.page-hero{padding:70px 0 50px;background:linear-gradient(180deg,#f6f8fb,#fff)}.page-hero h1{font-size:clamp(42px,6vw,70px);color:var(--ink)}.page-hero p{font-size:20px;color:var(--muted);max-width:840px}.breadcrumb{font-size:12px;color:#8391a3;margin-bottom:18px}.breadcrumb a{color:var(--blue)}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:36px}.list-clean{list-style:none;padding:0;margin:0}.list-clean li{padding:13px 0;border-bottom:1px solid var(--line)}.quote{font-size:26px;line-height:1.3;letter-spacing:-.02em;border-left:4px solid var(--blue);padding-left:20px}.stat-panel{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}.stat{padding:19px;border:1px solid var(--line);border-radius:15px}.stat strong{display:block;font-size:25px}.stat span{font-size:12px;color:var(--muted)}
.contact-bar{padding:54px 0;background:#eef4ff}.contact-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:26px;align-items:center}.contact-grid h2{font-size:39px;line-height:1;letter-spacing:-.04em;margin:0 0 10px}.contact-grid p{color:var(--muted);margin:0}.contact-links{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap}.footer{padding:32px 0;background:#06111f;color:#aab9ca}.footer-row{display:flex;justify-content:space-between;gap:25px}.footer-links{display:flex;gap:16px;flex-wrap:wrap;font-size:12px}
@media(max-width:1050px){.nav{display:none}.mobile-toggle{display:block}.nav.open{display:flex;position:absolute;left:20px;right:20px;top:66px;background:#fff;border:1px solid var(--line);border-radius:15px;padding:18px;flex-direction:column;align-items:flex-start;box-shadow:var(--shadow)}.hero-grid{grid-template-columns:1fr}.grid5{grid-template-columns:repeat(2,1fr)}.grid4{grid-template-columns:repeat(3,1fr)}.matrix-section{grid-template-columns:1fr}.matrix-tabs{flex-direction:row;flex-wrap:wrap}.matrix-results{grid-template-columns:repeat(2,1fr)}}
@media(max-width:720px){.wrap{width:min(var(--max),calc(100% - 28px))}.header-row{height:62px}.vii-logo{height:29px!important}.header-cta{display:none}.hero{padding:55px 0 44px}.hero h1,.page-hero h1{font-size:42px}.hero p,.page-hero p{font-size:17px}.hero-note{flex-wrap:wrap;gap:16px}.mini-matrix{font-size:8px}.section{padding:52px 0}.section-head{display:block}.section-head p{margin-top:12px}.grid3,.grid4,.grid5,.case-grid,.lab-grid,.growth,.two-col,.partner-strip,.contact-grid,.matrix-results{grid-template-columns:1fr}.growth-step:not(:last-child):after{content:"↓";right:auto;left:50%;top:auto;bottom:-18px;background:#fff}.matrix-tabs{overflow:auto;flex-wrap:nowrap;padding-bottom:4px}.matrix-tabs button{white-space:nowrap}.product-card{min-height:0}.footer-row{display:block}.footer-links{margin-top:18px}.contact-links{justify-content:flex-start}.contact-grid h2{font-size:33px}}
'''
JS='''document.addEventListener("DOMContentLoaded",()=>{const t=document.querySelector(".mobile-toggle"),n=document.querySelector(".nav");if(t&&n)t.addEventListener("click",()=>n.classList.toggle("open"));const b=[...document.querySelectorAll("[data-matrix-product]")],r=[...document.querySelectorAll("[data-products]")];if(b.length&&r.length){const a=s=>{b.forEach(x=>x.classList.toggle("active",x.dataset.matrixProduct===s));r.forEach(x=>x.classList.toggle("hidden",s!=="all"&&!(x.dataset.products||"").split(",").includes(s)))};b.forEach(x=>x.addEventListener("click",()=>a(x.dataset.matrixProduct)));a("all")}});'''

def purl(s): return f"/products/{s}/"
def iurl(s): return f"/industries/{s}/"
def surl(s): return f"/solutions/{s}/"
def curl(s): return f"/cases/{s}/"

def header():
    nav="".join(f'<a href="{u}">{escape(n)}</a>' for n,u in NAV)
    return f'<header class="site-header"><div class="wrap header-row"><a class="brand" href="/">{LOGO}</a><nav class="nav">{nav}</nav><a class="header-cta" href="#contact">Обсудить задачу →</a><button class="mobile-toggle" aria-label="Меню">☰</button></div></header>'
def contact():
    if CONTACTS:
        buttons="".join(f'<a class="btn btn-primary" href="{escape(u)}" rel="noopener">{escape(n)}</a>' for u,n in CONTACTS)
        note="Выберите существующий канал связи и пришлите один проблемный процесс — этого достаточно, чтобы начать."
    else:
        buttons='<a class="btn btn-primary" href="/about/">О команде →</a>'
        note="Покажите один проблемный процесс. На первой встрече определим минимальный контур, который имеет смысл проверять."
    return f'<section class="contact-bar" id="contact"><div class="wrap contact-grid"><div><div class="eyebrow">Следующий шаг</div><h2>Начнём не с «большой системы», а с конкретного процесса.</h2><p>{note}</p></div><div class="contact-links">{buttons}</div></div></section>'
def footer():
    links="".join(f'<a href="{u}">{escape(n)}</a>' for n,u in NAV)
    return f'<footer class="footer"><div class="wrap footer-row"><div><div class="brand-word">VIIVERSION</div><div style="font-size:11px">Digital Business Systems</div></div><div class="footer-links">{links}<a href="/proposal-studio/">Proposal Studio</a></div></div></footer>'
def page(title,desc,body,canonical):
    return f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)}</title><meta name="description" content="{escape(desc)}"><link rel="canonical" href="https://viiversion.com{canonical}"><meta property="og:title" content="{escape(title)}"><meta property="og:description" content="{escape(desc)}"><meta property="og:type" content="website"><link rel="stylesheet" href="/assets/viiversion.css"></head><body>{header()}<main>{body}</main>{contact()}{footer()}<script src="/assets/viiversion.js" defer></script></body></html>'
def hero(kicker,title,lead,parent=None,parent_url=None):
    crumb='<div class="breadcrumb"><a href="/">VIIVERSION</a>'
    if parent: crumb+=f' / <a href="{parent_url}">{escape(parent)}</a>'
    crumb+=f' / {escape(title.split(" — ")[0])}</div>'
    return f'<section class="page-hero"><div class="wrap">{crumb}<div class="eyebrow">{escape(kicker)}</div><h1>{escape(title)}</h1><p>{escape(lead)}</p></div></section>'
def card(inner,extra=""): return f'<article class="card {extra}">{inner}</article>'
def badges(items): return '<div class="badges">'+"".join(f'<span class="badge">{escape(x)}</span>' for x in items)+'</div>'

# HOME
prod=[]
for slug,p in PRODUCTS.items():
    prod.append(card(f'<div class="product-mark">{escape(p[0][0])}</div><div class="kicker">{escape(p[1])}</div><h3>{escape(p[0])}</h3><p>{escape(p[3])}</p><a class="link" href="{purl(slug)}">Разобрать продукт →</a>',"product-card"))
inds=[]
for slug,i in list(INDUSTRIES.items())[:8]:
    inds.append(card(f'<div class="kicker">{escape(i[4])}</div><h3>{escape(i[0])}</h3><p>{escape(i[1])}</p><a class="link" href="{iurl(slug)}">Сценарий отрасли →</a>'))
sols=[]
for slug,s in SOLUTIONS.items():
    sols.append(card(f'<div class="kicker">Solution</div><h3>{escape(s[0])}</h3><p>{escape(s[1])}</p>{badges(s[3][:4])}<a class="link" href="{surl(slug)}">Как устроено →</a>'))
cases=[]
for slug,c in CASES.items():
    demo=f'<a class="btn btn-secondary" href="{escape(c[4])}" target="_blank" rel="noopener">Demo</a>' if c[4] else ""
    cases.append(card(f'<div class="case-top"><div><div class="kicker">{escape(c[1])}</div><h3>{escape(c[0])}</h3></div><div class="case-code">CASE</div></div><p>{escape(c[2])}</p>{badges(c[3])}<div class="actions"><a class="btn btn-primary" href="{curl(slug)}">Разобрать</a>{demo}</div>',"case-card"))
matrix=[]
for slug,i in INDUSTRIES.items():
    matrix.append(f'<a class="matrix-result" data-products="{escape(",".join(i[5]))}" href="{iurl(slug)}"><b>{escape(i[0])}</b><span>{escape(i[4])}</span></a>')

home=f'''
<section class="hero"><div class="wrap hero-grid"><div><div class="eyebrow">Modular Business Systems</div><h1>От отдельного процесса — к работающей цифровой системе.</h1><p>VIIVERSION собирает клиентские интерфейсы, бронирование, CRM, AI, платежи и интеграции вокруг конкретной бизнес-задачи. Один модуль, отраслевая конфигурация или закрытый внутренний контур — без обязательного «внедрения всего сразу».</p><div class="hero-actions"><a class="btn btn-primary" href="/products/">Посмотреть продукты →</a><a class="btn btn-secondary" href="/solutions/">Найти решение по задаче</a></div><div class="hero-note"><div><b>36+</b>модулей и инженерных компонентов</div><div><b>25+</b>отраслевых сценариев</div><div><b>1 → N</b>один входной продукт может расширяться</div></div></div>
<div class="matrix-visual"><div class="matrix-head">Одна технологическая база. Разные конфигурации под отрасль.</div><div class="mini-matrix"><div class="top"></div><div class="top">Sales</div><div class="top">Booking</div><div class="top">Ops</div><div class="top">AI</div><div class="top">Pay</div><div class="label">Tourism</div><div class="on">●</div><div class="on">●</div><div class="on">●</div><div class="on">●</div><div class="on">●</div><div class="label">Rental</div><div class="on">●</div><div class="on">●</div><div class="on">●</div><div>—</div><div class="on">●</div><div class="label">Clinics</div><div class="on">●</div><div class="on">●</div><div class="on">●</div><div class="on">●</div><div>—</div><div class="label">Retail</div><div>—</div><div>—</div><div class="on">●</div><div>—</div><div class="on">●</div><div class="label">Enterprise</div><div>—</div><div>—</div><div class="on">●</div><div class="on">●</div><div class="on">●</div></div><div class="matrix-caption">Матрица показывает, какие ядра можно использовать в конкретном процессе; это не фиксированные пакеты.</div></div></div></section>

<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Три входа</div><h2>Не нужно знать название технологии.</h2></div><p>К одной системе можно прийти по продукту, отрасли или конкретному разрыву в процессе.</p></div><div class="grid3"><a class="card path-card" href="/products/"><div class="kicker">01 / Products</div><h3>Знаю, что нужно</h3><p>Booking, AI Operator, Operations, клиентский интерфейс или платежный слой.</p></a><a class="card path-card" href="/industries/"><div class="kicker">02 / Industries</div><h3>Ищу решение для отрасли</h3><p>Смотреть на конфигурацию вокруг реального процесса, а не на список функций.</p></a><a class="card path-card" href="/solutions/"><div class="kicker">03 / Problem</div><h3>Есть конкретный сбой</h3><p>Ручная бронь, потерянные лиды, разрыв между системами, checkout или повторяющиеся консультации.</p></a></div></div></section>

<section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Products</div><h2>Пять коммерческих ядер.</h2></div><p>Каждое можно внедрять отдельно. Следующий слой подключается только когда он нужен процессу.</p></div><div class="grid5">{''.join(prod)}</div></div></section>

<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Product × Industry</div><h2>Один продукт — разные отраслевые сценарии.</h2></div><p>Технологическое ядро переупаковывается вокруг buyer, процесса и операционной логики конкретного рынка.</p></div><div class="matrix-section"><div class="matrix-tabs"><button class="active" data-matrix-product="all">Все отрасли</button>{''.join(f'<button data-matrix-product="{slug}">{escape(p[0])}</button>' for slug,p in PRODUCTS.items())}</div><div class="matrix-results">{''.join(matrix)}</div></div></div></section>

<section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Модульная модель</div><h2>Масштаб решения определяется задачей, а не прайс-пакетом.</h2></div><p>Первый модуль должен давать самостоятельный результат. Рост идёт от доказанного процесса.</p></div><div class="growth"><div class="growth-step"><div class="eyebrow">01 / Start</div><b>Один процесс</b><small>Booking, AI-консультация или checkout.</small></div><div class="growth-step"><div class="eyebrow">02 / Connect</div><b>Связка модулей</b><small>Booking + CRM, Sales + AI, Checkout + PayBridge.</small></div><div class="growth-step"><div class="eyebrow">03 / Vertical</div><b>Отраслевой контур</b><small>Конфигурация вокруг специфики рынка.</small></div><div class="growth-step"><div class="eyebrow">04 / Private</div><b>Закрытая система</b><small>Роли, data, workflow, integrations и audit.</small></div></div></div></section>

<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Industries</div><h2>Начинаем с процесса отрасли.</h2></div><a class="link" href="/industries/">Все отрасли →</a></div><div class="grid4">{''.join(inds)}</div></div></section>
<section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Solutions</div><h2>Конфигурации для повторяющихся задач.</h2></div><a class="link" href="/solutions/">Все решения →</a></div><div class="grid3">{''.join(sols)}</div></div></section>

<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Entry offers</div><h2>Большая продажа не должна быть первым шагом.</h2></div><p>Входной продукт — pilot, sprint, audit или один законченный flow с проверяемым результатом.</p></div><div class="grid5"><article class="card"><div class="kicker">Booking</div><h3>Booking Start</h3><p>Один законченный сценарий выбора и бронирования.</p></article><article class="card"><div class="kicker">Mini App</div><h3>Mini App Pilot</h3><p>Один клиентский путь внутри Telegram или Zalo.</p></article><article class="card"><div class="kicker">AI</div><h3>AI Operator Pilot</h3><p>Одна задача и одна утверждённая база знаний.</p></article><article class="card"><div class="kicker">Integrations</div><h3>Integration Sprint</h3><p>Один надёжный bridge между двумя системами.</p></article><article class="card"><div class="kicker">Enterprise</div><h3>Discovery + PoC</h3><p>Сначала моделируем процесс и проверяем архитектуру.</p></article></div></div></section>

<section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Cases</div><h2>Доказательства продуктовых ядер, а не галерея дизайна.</h2></div><a class="link" href="/cases/">Все кейсы →</a></div><div class="case-grid">{''.join(cases)}</div></div></section>

<section class="section dark"><div class="wrap"><div class="section-head"><div><div class="eyebrow" style="color:#88aaff">B2B2B & Enterprise</div><h2>Не все продукты продаются конечному бизнесу напрямую.</h2></div><p>Отдельные линии рассчитаны на POS-вендоров, агентства, интеграторов, software teams и enterprise-заказчиков.</p></div><div class="partner-strip"><div class="partner-box"><div class="kicker">Partners</div><h3>White-label и партнёрская дистрибуция</h3><p>Mini App Factory, PayBridge и delivery-capacity могут поставляться через партнёра и масштабироваться на его клиентскую базу.</p><a class="btn btn-secondary" href="/labs/">Продукты для партнёров →</a></div><div class="partner-box alt"><div class="kicker">Enterprise</div><h3>Systems & Engineering</h3><p>API, ETL, database migration, Oracle / PL/SQL, RBAC workflow, Revenue Assurance и L2/L3 support — отдельный технический buyer journey.</p><a class="btn btn-primary" href="/enterprise/">Enterprise capabilities →</a></div></div></div></section>

<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">VIIVERSION Labs</div><h2>Собственные продукты масштабируются отдельно от client work.</h2></div><a class="link" href="/labs/">Открыть Labs →</a></div><div class="lab-grid">{''.join(card(f'<h3>{escape(n)}</h3><p>{escape(d)}</p><a class="link" href="{u}">Подробнее →</a>') for n,d,u in LABS)}</div></div></section>
'''

pages={}
pages["index.html"]=page("VIIVERSION — модульные цифровые системы для бизнеса","Клиентские интерфейсы, booking, CRM/operations, AI, payments, integrations и закрытые внутренние системы.",home,"/")

p_cards=[]
for slug,p in PRODUCTS.items():
    p_cards.append(card(f'<div class="kicker">{escape(p[1])}</div><h3>{escape(p[0])}</h3><p>{escape(p[2])}</p>{badges(p[5][:4])}<a class="link" href="{purl(slug)}">Открыть продукт →</a>',"product-card"))
body=hero("Products","Продуктовые ядра VIIVERSION","Пять коммерческих ядер для клиентского пути, бронирования, операций, AI и платежной инфраструктуры.")+f'<section class="section"><div class="wrap"><div class="grid5">{"".join(p_cards)}</div></div></section>'
pages["products/index.html"]=page("Продукты VIIVERSION","Модульные цифровые продукты VIIVERSION.",body,"/products/")
for slug,p in PRODUCTS.items():
    related=[(s,i) for s,i in INDUSTRIES.items() if slug in i[5]]
    body=hero(p[1],f'VIIVERSION {p[0]} — {p[2]}',p[3],"Products","/products/")
    body+=f'<section class="section"><div class="wrap two-col"><div><div class="eyebrow">Что покупает клиент</div><h2>{escape(p[2])}</h2><p>{escape(p[3])}</p><div class="actions"><a class="btn btn-primary" href="#contact">Обсудить стартовый сценарий →</a></div></div><div><div class="eyebrow">Входной формат</div><p class="quote">{escape(p[6])}</p>{badges(p[5])}</div></div></section>'
    body+=f'<section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Состав</div><h2>Компоненты {escape(p[0])}.</h2></div><p>Конфигурация определяется процессом; не все компоненты нужны в каждом внедрении.</p></div><div class="grid4">{"".join(card(f"<h3>{escape(x)}</h3><p>Подключается отдельно или как часть общего flow.</p>") for x in p[4])}</div></div></section>'
    body+=f'<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Industry fit</div><h2>Где используется это ядро.</h2></div></div><div class="grid4">{"".join(card(f"<div class=kicker>{escape(i[4])}</div><h3>{escape(i[0])}</h3><p>{escape(i[1])}</p><a class=link href={iurl(s)}>Отраслевой сценарий →</a>") for s,i in related)}</div></div></section>'
    body+=f'<section class="section soft"><div class="wrap two-col"><div><div class="eyebrow">Proof</div><h2>Референсы</h2><ul class="list-clean">{"".join(f"<li>{escape(x)}</li>" for x in p[7])}</ul></div><div><div class="eyebrow">Expansion</div><h2>Следующий слой</h2><ul class="list-clean">{"".join(f"<li>{escape(x)}</li>" for x in p[8])}</ul></div></div></section>'
    pages[f"products/{slug}/index.html"]=page(f'VIIVERSION {p[0]}',p[3],body,purl(slug))

ind_cards=[]
for slug,i in INDUSTRIES.items():
    ind_cards.append(card(f'<div class="kicker">{escape(i[4])}</div><h3>{escape(i[0])}</h3><p>{escape(i[1])}</p>{badges([PRODUCTS[x][0] for x in i[5]][:4])}<a class="link" href="{iurl(slug)}">Открыть сценарий →</a>'))
body=hero("Industries","Отраслевые конфигурации","Одна технологическая база превращается в разные продукты, когда меняется процесс, buyer и операционная логика отрасли.")+f'<section class="section"><div class="wrap"><div class="grid4">{"".join(ind_cards)}</div></div></section>'
pages["industries/index.html"]=page("Отрасли — VIIVERSION","Отраслевые конфигурации продуктов VIIVERSION.",body,"/industries/")
for slug,i in INDUSTRIES.items():
    pc=[]
    for ps in i[5]:
        p=PRODUCTS[ps];pc.append(card(f'<div class="kicker">{escape(p[1])}</div><h3>{escape(p[0])}</h3><p>{escape(p[2])}</p><a class="link" href="{purl(ps)}">Продукт →</a>',"product-card"))
    body=hero("Industry",f'{i[0]} — цифровой контур вокруг реального процесса',i[2],"Industries","/industries/")
    body+=f'<section class="section"><div class="wrap two-col"><div><div class="eyebrow">Типичные разрывы</div><h2>{escape(i[1])}</h2><ul class="list-clean">{"".join(f"<li>{escape(x)}</li>" for x in i[3])}</ul></div><div><div class="eyebrow">Первый коммерческий шаг</div><p class="quote">{escape(i[4])}</p><p>Первый этап проверяет один законченный процесс; расширение идёт после результата.</p></div></div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Recommended stack</div><h2>Какие ядра обычно участвуют.</h2></div></div><div class="grid5">{"".join(pc)}</div></div></section><section class="section"><div class="wrap"><div class="eyebrow">Proof / reference</div><h2>Связанные кейсы и архитектуры</h2>{badges(i[6])}</div></section>'
    pages[f"industries/{slug}/index.html"]=page(f'{i[0]} — VIIVERSION',i[2],body,iurl(slug))

sc=[]
for slug,s in SOLUTIONS.items():
    sc.append(card(f'<div class="kicker">Solution</div><h3>{escape(s[0])}</h3><p>{escape(s[1])}</p>{badges(s[3])}<a class="link" href="{surl(slug)}">Открыть решение →</a>'))
body=hero("Solutions","Решения вокруг конкретной бизнес-задачи","Solution — это рабочая конфигурация нескольких ядер под повторяющийся процесс, а не новый независимый продукт.")+f'<section class="section"><div class="wrap"><div class="grid3">{"".join(sc)}</div></div></section>'
pages["solutions/index.html"]=page("Решения — VIIVERSION","Готовые конфигурации продуктов VIIVERSION.",body,"/solutions/")
for slug,s in SOLUTIONS.items():
    body=hero("Solution",f'{s[0]} — {s[1]}',s[2],"Solutions","/solutions/")
    body+=f'<section class="section"><div class="wrap two-col"><div><div class="eyebrow">Архитектура</div><h2>Из чего собирается решение.</h2><ul class="list-clean">{"".join(f"<li>{escape(x)}</li>" for x in s[3])}</ul></div><div><div class="eyebrow">Где подходит</div><h2>Типовые рынки</h2>{badges(s[4])}<p class="quote">{escape(s[5])}</p></div></div></section>'
    pages[f"solutions/{slug}/index.html"]=page(f'{s[0]} — VIIVERSION',s[2],body,surl(slug))

cc=[]
for slug,c in CASES.items():
    demo=f'<a class="btn btn-secondary" href="{escape(c[4])}" target="_blank" rel="noopener">Demo</a>' if c[4] else ""
    cc.append(card(f'<div class="case-top"><div><div class="kicker">{escape(c[1])}</div><h3>{escape(c[0])}</h3></div><div class="case-code">CASE</div></div><p>{escape(c[2])}</p>{badges(c[3])}<div class="actions"><a class="btn btn-primary" href="{curl(slug)}">Разобрать</a>{demo}</div>',"case-card"))
body=hero("Cases","Кейсы как доказательство продуктовых ядер","Показываем не только интерфейс, а какой процесс моделировался, какие модули использованы и что реально работает в demo.")+f'<section class="section"><div class="wrap"><div class="case-grid">{"".join(cc)}</div></div></section>'
pages["cases/index.html"]=page("Кейсы — VIIVERSION","Кейсы и рабочие демонстрации VIIVERSION.",body,"/cases/")
for slug,c in CASES.items():
    demo=f'<a class="btn btn-primary" href="{escape(c[4])}" target="_blank" rel="noopener">Открыть demo →</a>' if c[4] else '<a class="btn btn-primary" href="#contact">Запросить показ →</a>'
    body=hero(c[1],f'{c[0]} — продуктовые ядра в реальном сценарии',c[2],"Cases","/cases/")
    body+=f'<section class="section"><div class="wrap two-col"><div><div class="eyebrow">Что демонстрирует кейс</div><h2>Связанный процесс, а не отдельный экран.</h2><p>{escape(c[2])}</p>{demo}</div><div><div class="eyebrow">Products used</div>{badges(c[3])}<p style="margin-top:22px;color:var(--muted)">Статус отдельных интеграций может отличаться от production. Demo используется как доказательство UX, архитектуры и reusable-компонентов.</p></div></div></section>'
    pages[f"cases/{slug}/index.html"]=page(f'{c[0]} — VIIVERSION',c[2],body,curl(slug))

enterprise=hero("Enterprise","Когда готового продукта недостаточно","Закрытые внутренние системы и инженерные контуры вокруг ролей, данных, integrations и реального workflow.")+'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">Private systems</div><h2>Сначала моделируем процесс. Потом выбираем, что действительно нужно строить.</h2><p class="quote">Paid Discovery → Architecture → PoC → Implementation → Managed Support</p></div><div><ul class="list-clean"><li><b>RBAC / closed workflows</b> — роли, approvals, audit.</li><li><b>API / Webhooks</b> — надёжные мосты между системами.</li><li><b>ETL / Data pipelines</b> — сбор и синхронизация данных.</li><li><b>Database migration</b> — Oracle / PostgreSQL / legacy cleanup.</li><li><b>Oracle / PL/SQL</b> — сложные production-системы.</li><li><b>RA / reconciliation</b> — telecom Revenue Assurance / FM.</li><li><b>L2/L3 support</b> — managed engineering.</li></ul></div></div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Technical buyer journey</div><h2>Enterprise продаётся иначе, чем Booking или Mini App.</h2></div><p>Первый продукт — диагностика, технический sprint или PoC с проверяемым результатом.</p></div><div class="growth"><div class="growth-step"><b>1. Discovery</b><small>Роли, data, ограничения, current state.</small></div><div class="growth-step"><b>2. PoC</b><small>Проверяем критичный технический участок.</small></div><div class="growth-step"><b>3. Implementation</b><small>Строим согласованный контур.</small></div><div class="growth-step"><b>4. Support</b><small>Эксплуатация и развитие.</small></div></div></div></section>'''
pages["enterprise/index.html"]=page("Enterprise — VIIVERSION","Закрытые системы, integrations, data engineering, Oracle/PLSQL и managed support.",enterprise,"/enterprise/")

labs=hero("Labs","Собственные продукты VIIVERSION","Labs отделяет масштабируемые продукты от заказной разработки: у них другой рынок, канал дистрибуции и модель монетизации.")+f'<section class="section"><div class="wrap"><div class="lab-grid">{"".join(card(f"<div class=kicker>VIIVERSION Labs</div><h3>{escape(n)}</h3><p>{escape(d)}</p><a class=link href={u}>Открыть →</a>") for n,d,u in LABS)}</div></div></section><section class="section soft"><div class="wrap two-col"><div><div class="eyebrow">Distribution</div><h2>Не все продукты должны продаваться через direct B2B.</h2></div><div><ul class="list-clean"><li>ChatGPT ecosystem / apps</li><li>Product Hunt и product communities</li><li>Agency white-label partnerships</li><li>Freelance / technical marketplaces</li><li>Direct technical sales</li></ul></div></div></section>'
pages["labs/index.html"]=page("VIIVERSION Labs","Собственные продукты и платформы VIIVERSION.",labs,"/labs/")

about=hero("About","Инженерная архитектура и продуктовый дизайн — в одном контуре","VIIVERSION строит системы от клиентского интерфейса до data и integrations — без разрыва между «показать» и «работает».")+'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">Team</div><h2>Две компетенции в одной команде.</h2><p class="quote">Architecture / DB / integrations / development + product / UX / copy / research.</p></div><div><div class="stat-panel"><div class="stat"><strong>20+ лет</strong><span>IT / telecom expertise</span></div><div class="stat"><strong>16+ лет</strong><span>digital и visual communications</span></div><div class="stat"><strong>BSS / Data</strong><span>Oracle, PL/SQL, ETL, Linux, API</span></div><div class="stat"><strong>Product</strong><span>UX/UI, prototyping, research, content</span></div></div></div></div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Method</div><h2>До разработки нас интересует устройство процесса.</h2></div><p>Точка входа клиента, handoff между сотрудниками, источник данных, узкое место и минимальный результат, который можно проверить.</p></div></div></section>'''
pages["about/index.html"]=page("О VIIVERSION","Команда VIIVERSION: product, UX, architecture, data и integrations.",about,"/about/")

assets=PUBLIC/"assets";assets.mkdir(parents=True,exist_ok=True)
(assets/"viiversion.css").write_text(CSS,encoding="utf-8")
(assets/"viiversion.js").write_text(JS,encoding="utf-8")
for rel,html in pages.items():
    path=PUBLIC/rel;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(html,encoding="utf-8")

urls={"/"}
for rel in pages:
    if rel=="index.html": continue
    parent=Path(rel).parent.as_posix().strip(".")
    urls.add("/"+parent.strip("/")+"/")
xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for u in sorted(urls): xml+=f'  <url><loc>https://viiversion.com{u}</loc></url>\n'
xml+='</urlset>\n'
(PUBLIC/"sitemap.xml").write_text(xml,encoding="utf-8")
(PUBLIC/"robots.txt").write_text("User-agent: *\nAllow: /\nSitemap: https://viiversion.com/sitemap.xml\n",encoding="utf-8")

required=["index.html","products/index.html","products/booking/index.html","products/paybridge/index.html","industries/index.html","industries/tourism/index.html","solutions/index.html","cases/index.html","enterprise/index.html","labs/index.html","about/index.html","assets/viiversion.css","assets/viiversion.js"]
for rel in required:
    p=PUBLIC/rel
    if not p.exists() or p.stat().st_size<100: raise SystemExit("Product site QA failed: "+rel)
home=(PUBLIC/"index.html").read_text(encoding="utf-8")
for marker in ("Product × Industry","Booking Start","B2B2B & Enterprise","VIIVERSION Labs"):
    if marker not in home: raise SystemExit("Product site QA failed: "+marker)
print(f"PASS: VIIVERSION product site generated: {len(pages)} pages + assets + sitemap.")
