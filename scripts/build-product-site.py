from pathlib import Path
from html import escape
from urllib.parse import quote
import json
import re
import sys
import shutil

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
HOME = PUBLIC / "index.html"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from site_content import LANGS, BRAND, CASES, TEAM, NAV
from product_catalog import (
    FAMILIES, SELLABLE_PRODUCTS, ADDONS, INDUSTRY_CONFIGS, TARGET_LANDINGS,
    SOFTWARE_PRODUCTS, PARTNER_PRODUCTS, LEGACY_REDIRECTS
)

if not HOME.exists():
    raise SystemExit("legacy public/index.html is required")

legacy = HOME.read_text(encoding="utf-8")
m = re.search(r'<img class="vii-logo"[^>]*>', legacy)
LOGO = m.group(0) if m else '<span class="brand-word">VIIVERSION</span>'

# Preserve already-published contact channels, but do not depend on their wording.
footer_match = re.search(r"<footer\b.*?</footer>", legacy, re.S | re.I)
CONTACTS = []
if footer_match:
    seen = set()
    for href, label in re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', footer_match.group(0), re.S | re.I):
        if href.startswith(("mailto:", "https://t.me/", "https://wa.me/", "https://api.whatsapp.com/")) and href not in seen:
            seen.add(href)
            clean = re.sub(r"<[^>]+>", " ", label)
            clean = re.sub(r"\s+", " ", clean).strip() or "Contact"
            CONTACTS.append((href, clean))
CONTACTS = CONTACTS[:4]

BASE = "https://viiversion.com"

COPY = {
    "ru": {
        "solutions": "Решения",
        "products": "Продукты",
        "cases": "Кейсы",
        "enterprise": "Крупные системы",
        "labs": "Готовые продукты",
        "about": "О нас",
        "contact": "Обсудить задачу",
        "view_demo": "Открыть демо",
        "view_case": "Разобрать кейс",
        "learn_more": "Подробнее",
        "price": "Ориентир по стоимости",
        "timeline": "Ориентир по сроку",
        "scope": "Что входит в первый этап",
        "before": "Как процесс выглядит сейчас",
        "after": "Как он может работать",
        "modules": "Что можно подключить",
        "proof": "Что можно посмотреть",
        "other_markets": "Также адаптируем под",
        "all_cases": "Все кейсы",
        "all_products": "Все продукты",
        "all_solutions": "Все решения",
        "all_industries": "Отрасли",
        "problem_booking": "Бронирование ведётся вручную",
        "problem_leads": "Заявки теряются между чатами и таблицами",
        "problem_ai": "Менеджеры отвечают на одни и те же вопросы",
        "problem_pay": "Оплата и заказ живут в разных системах",
        "problem_ops": "Руководителю не видно, что происходит в операциях",
        "problem_custom": "Готовые SaaS не подходят под ваш процесс",
        "problem_booking_desc": "Переносим выбор даты, параметров и подтверждение в Booking.",
        "problem_leads_desc": "Собираем клиентский путь и CRM вокруг одного процесса.",
        "problem_ai_desc": "AI консультирует по утверждённой базе и передаёт контекст дальше.",
        "problem_pay_desc": "Соединяем checkout, provider status и back-office.",
        "problem_ops_desc": "CRM, back-office и аналитика работают в одном контуре.",
        "problem_custom_desc": "Проектируем закрытую систему вокруг ролей, данных и workflow.",
        "partners_head": "White-label и партнёрская разработка",
        "partners_body": "Mini App Factory, PayBridge и отдельные delivery-компоненты можно использовать через агентство, интегратора или software-партнёра.",
        "enterprise_head": "Сложные внутренние системы",
        "enterprise_body": "API, ETL, базы данных, Oracle / PL/SQL, роли, approvals, audit и managed support — отдельное инженерное направление.",
        "team_lead": "Архитектура, интеграции и разработка соединены с продуктовой логикой, UX и исследованием пользовательского пути.",
        "form_name": "Имя",
        "form_contact": "Как с вами связаться",
        "form_company": "Компания / сайт",
        "form_task": "Что хотите улучшить?",
        "form_submit": "Продолжить отправку",
        "form_note": "После нажатия мы зафиксируем источник и страницу обращения, скопируем текст заявки и откроем наш основной канал связи. Имя, контакт и текст заявки в аналитику не передаются.",
        "form_done": "Заявка подготовлена и скопирована. Осталось отправить её в открывшемся канале связи.",
        "context": "Контекст",
        "lang_switch": "EN",
        "home": "Главная",
        "offer": "Стартовый формат",
        "status": "Статус",
        "how_works": "Как устроен первый этап",
        "not_fixed": "Итоговый scope подтверждаем после короткого разбора текущего процесса.",
        "similar": "Нужно похожее решение?",
        "team": "Команда",
        "product_use": "Что показывает этот кейс",
        "case_disclaimer": "Статус указан явно: working demo, public prototype или client concept. Мы не выдаём прототип за production-внедрение.",
        "solutions_problem": "По задаче",
        "solutions_industry": "По отрасли",
        "target_cta": "Получить оценку этого сценария",
    },
    "en": {
        "solutions": "Solutions",
        "products": "Products",
        "cases": "Cases",
        "enterprise": "Enterprise",
        "labs": "Labs",
        "about": "Company",
        "contact": "Discuss a problem",
        "view_demo": "Open demo",
        "view_case": "View case",
        "learn_more": "Learn more",
        "price": "Price guide",
        "timeline": "Timeline guide",
        "scope": "What the first step includes",
        "before": "How the process works today",
        "after": "How it can work",
        "modules": "What can be connected",
        "proof": "What you can inspect",
        "other_markets": "Also adaptable to",
        "all_cases": "All cases",
        "all_products": "All products",
        "all_solutions": "All solutions",
        "all_industries": "Industries",
        "problem_booking": "Booking is handled manually",
        "problem_leads": "Leads are lost across chats and spreadsheets",
        "problem_ai": "Staff answer the same questions repeatedly",
        "problem_pay": "Payment and order status live in separate systems",
        "problem_ops": "Management lacks a clear operating view",
        "problem_custom": "Off-the-shelf SaaS does not fit the workflow",
        "problem_booking_desc": "Move date, parameters and confirmation into Booking.",
        "problem_leads_desc": "Build the customer flow and CRM around one process.",
        "problem_ai_desc": "AI answers from approved knowledge and passes context onward.",
        "problem_pay_desc": "Connect checkout, provider status and back office.",
        "problem_ops_desc": "CRM, back office and analytics work in one operating flow.",
        "problem_custom_desc": "Design a private system around roles, data and workflow.",
        "partners_head": "White-label and partner delivery",
        "partners_body": "Mini App Factory, PayBridge and delivery components can be supplied through agencies, integrators and software partners.",
        "enterprise_head": "Complex internal systems",
        "enterprise_body": "API, ETL, databases, Oracle / PL/SQL, roles, approvals, audit and managed support form a separate engineering lane.",
        "team_lead": "Architecture, integrations and development are combined with product logic, UX and customer-journey research.",
        "form_name": "Name",
        "form_contact": "How should we contact you?",
        "form_company": "Company / website",
        "form_task": "What do you want to improve?",
        "form_submit": "Continue to send",
        "form_note": "We record the source page and campaign, copy the enquiry text and open our primary contact channel. Name, contact details and enquiry text are not sent to analytics.",
        "form_done": "The enquiry is prepared and copied. Send it in the contact channel that just opened.",
        "context": "Context",
        "lang_switch": "RU",
        "home": "Home",
        "offer": "Starting format",
        "status": "Status",
        "how_works": "How the first step works",
        "not_fixed": "Final scope is confirmed after a short review of the current process.",
        "similar": "Need a similar solution?",
        "team": "Team",
        "product_use": "What this case demonstrates",
        "case_disclaimer": "Status is explicit: working demo, public prototype or client concept. We do not present prototypes as production deployments.",
        "solutions_problem": "By problem",
        "solutions_industry": "By industry",
        "target_cta": "Get a scope for this scenario",
    },
}

CSS = r'''
:root{--ink:#071524;--muted:#5a6878;--line:#dfe6ee;--soft:#f5f7fa;--soft2:#eef3f8;--blue:#145dff;--navy:#06111f;--green:#0c8f68;--orange:#b76a12;--max:1180px;--r:20px;--shadow:0 18px 55px rgba(15,35,68,.08)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.5;background:#fff}a{text-decoration:none;color:inherit}button,input,textarea{font:inherit}.wrap{width:min(var(--max),calc(100% - 40px));margin:auto}
.site-header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.93);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.header-row{height:72px;display:flex;align-items:center;gap:24px}.brand{margin-right:auto}.vii-logo{height:34px!important;width:auto!important;max-width:190px!important;object-fit:contain}.brand-word{font-weight:900;letter-spacing:.08em;font-size:21px}.nav{display:flex;gap:20px;font-size:14px;font-weight:680}.nav a:hover,.text-link{color:var(--blue)}.header-actions{display:flex;align-items:center;gap:9px}.lang-link{font-size:12px;font-weight:850;border:1px solid var(--line);border-radius:9px;padding:8px 9px}.header-cta,.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:11px;padding:12px 17px;font-size:14px;font-weight:800;border:1px solid transparent;cursor:pointer}.header-cta,.btn-primary{background:var(--ink);color:#fff}.header-cta:hover,.btn-primary:hover{background:var(--blue)}.btn-secondary{border-color:#cbd6e4;background:#fff}.mobile-toggle{display:none;border:0;background:none;font-size:24px}
.hero{padding:82px 0 68px;background:radial-gradient(circle at 82% 10%,rgba(20,93,255,.20),transparent 34%),linear-gradient(135deg,#06111f,#0d2138 68%,#103154);color:#fff}.hero-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:62px;align-items:center}.eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:850;color:#6f7d8e}.hero .eyebrow{color:#8fb5ff}.hero h1,.page-hero h1{font-size:clamp(42px,6vw,76px);line-height:.98;letter-spacing:-.052em;margin:15px 0 23px}.hero p{font-size:20px;color:#c8d4e2;max-width:770px}.hero-actions,.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.hero .btn-secondary{background:transparent;color:#fff;border-color:rgba(255,255,255,.32)}.hero-proof{margin-top:34px;display:flex;gap:10px;flex-wrap:wrap}.hero-proof span{font-size:12px;border:1px solid rgba(255,255,255,.18);padding:8px 10px;border-radius:999px;color:#d3deea}
.process-map{border-radius:26px;padding:24px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.14);box-shadow:0 32px 90px rgba(0,0,0,.22)}.process-map h3{margin:0 0 18px;font-size:15px;color:#cfe0f2}.process-flow{display:grid;gap:9px}.process-node{padding:13px 15px;border-radius:12px;background:rgba(255,255,255,.07);display:flex;justify-content:space-between;align-items:center}.process-node b{font-size:14px}.process-node span{color:#8fb5ff;font-size:12px}.process-arrow{text-align:center;color:#6f8caf}
.section{padding:72px 0;border-bottom:1px solid var(--line)}.section.soft{background:var(--soft)}.section.dark{background:var(--navy);color:#fff;border-bottom:0}.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;margin-bottom:28px}.section-head h2,.section h2{font-size:clamp(30px,4vw,47px);line-height:1.04;letter-spacing:-.04em;margin:8px 0 0}.section-head p{max-width:590px;color:var(--muted);margin:0}.dark .section-head p,.dark p{color:#b7c6d8}.text-link{font-size:14px;font-weight:800}
.grid2,.grid3,.grid4,.grid5,.case-grid,.offer-grid,.team-grid{display:grid;gap:15px}.grid2{grid-template-columns:repeat(2,1fr)}.grid3{grid-template-columns:repeat(3,1fr)}.grid4{grid-template-columns:repeat(4,1fr)}.grid5{grid-template-columns:repeat(5,1fr)}.case-grid{grid-template-columns:repeat(3,1fr)}.offer-grid{grid-template-columns:repeat(4,1fr)}.team-grid{grid-template-columns:repeat(2,1fr)}
.card{border:1px solid var(--line);border-radius:var(--r);padding:23px;background:#fff}.card:hover{border-color:#b8c8dc;box-shadow:var(--shadow)}.card .kicker{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#7c8b9d;font-weight:850}.card h3{font-size:22px;line-height:1.13;margin:9px 0}.card p{font-size:14px;color:var(--muted)}.product-card{min-height:300px;display:flex;flex-direction:column}.product-mark{width:42px;height:42px;border-radius:12px;background:#edf3ff;color:var(--blue);display:flex;align-items:center;justify-content:center;font-weight:900;margin-bottom:20px}.product-card .text-link,.case-card .actions{margin-top:auto}
.industry-browser{border:1px solid var(--line);border-radius:24px;background:#fff;overflow:hidden}.industry-tabs{display:flex;gap:7px;overflow:auto;padding:14px;border-bottom:1px solid var(--line);background:var(--soft)}.industry-tabs button{white-space:nowrap;border:1px solid #ccd7e4;background:#fff;border-radius:999px;padding:10px 15px;font-weight:800;cursor:pointer;color:#44546a}.industry-tabs button.active{background:var(--ink);color:#fff;border-color:var(--ink)}.industry-panel{padding:26px}.industry-panel-head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:20px}.industry-panel-head h3{font-size:30px;letter-spacing:-.03em;margin:0 0 5px}.industry-panel-head p{margin:0;color:var(--muted)}.module-buy-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.module-buy-card{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:16px;padding:18px;background:#fff}.module-buy-card h4{font-size:18px;margin:0 0 7px}.module-buy-card p{font-size:13px;color:var(--muted);margin:0 0 14px}.module-buy-meta{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:auto}.module-buy-meta div{background:var(--soft);border-radius:9px;padding:9px}.module-buy-meta small{display:block;font-size:9px;color:#7a8797;text-transform:uppercase;letter-spacing:.06em}.module-buy-meta b{font-size:12px}.module-buy-card .text-link{margin-top:13px}.trust-team{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.team-person{display:grid;grid-template-columns:150px 1fr;gap:20px;align-items:center;border:1px solid var(--line);border-radius:22px;padding:18px;background:#fff}.team-photo{width:150px;height:150px;border-radius:16px;object-fit:cover;display:block}.team-person h3{font-size:24px;margin:3px 0 7px}.team-person .role{font-weight:800;font-size:13px}.team-person p{font-size:13px;color:var(--muted);margin:8px 0 0}.trust-box{margin-top:18px;border-radius:20px;background:#edf4ff;border:1px solid #d3e0fb;padding:22px}.trust-box h3{margin:0 0 14px;font-size:22px}.trust-list{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.trust-item{padding:13px 14px;border-radius:12px;background:#fff;font-size:13px;font-weight:700}.buy-steps{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.buy-step{border:1px solid var(--line);border-radius:15px;padding:16px;background:#fff}.buy-step b{display:block;margin-bottom:6px}.buy-step span{font-size:12px;color:var(--muted)}.hero-safety{border-radius:26px;padding:25px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15)}.hero-safety h3{font-size:19px;margin:0 0 16px}.hero-safety ul{list-style:none;margin:0;padding:0}.hero-safety li{padding:12px 0;border-top:1px solid rgba(255,255,255,.12);font-size:14px;color:#d3dfec}.hero-safety li:before{content:"✓";display:inline-block;margin-right:9px;color:#78d9b7;font-weight:900}.module-steps{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.module-step{border:1px solid var(--line);border-radius:14px;padding:15px;background:#fff}.module-step .num{display:block;color:var(--blue);font-size:11px;font-weight:900;margin-bottom:7px}
.problem-card{padding:22px;border-radius:17px;border:1px solid var(--line);background:#fff}.problem-card h3{font-size:18px;margin:0 0 8px}.problem-card p{margin:0;color:var(--muted);font-size:14px}.problem-card a{display:block;margin-top:12px;color:var(--blue);font-size:13px;font-weight:800}
.status{display:inline-flex;border-radius:999px;padding:5px 8px;font-size:10px;letter-spacing:.08em;font-weight:900;background:#eef2f7;color:#596a7c}.status.working-demo{background:#e7f7f1;color:#087355}.status.prototype{background:#edf3ff;color:#225fcc}.status.concept{background:#fff3e3;color:#985c0c}
.badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:13px}.badge{font-size:11px;font-weight:720;background:#eef2f7;color:#526177;border-radius:999px;padding:5px 8px}.case-card{display:flex;flex-direction:column;min-height:265px}.case-top{display:flex;justify-content:space-between;gap:15px}.case-card .actions{display:flex}
.offer-card{display:flex;flex-direction:column;min-height:310px}.offer-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}.offer-meta div{padding:10px;border-radius:10px;background:var(--soft)}.offer-meta small{display:block;color:#768596;font-size:10px;text-transform:uppercase;letter-spacing:.07em}.offer-meta b{font-size:13px}
.matrix-wrap{display:grid;grid-template-columns:240px 1fr;gap:24px}.matrix-tabs{display:flex;flex-direction:column;gap:8px}.matrix-tabs button{border:1px solid var(--line);background:#fff;border-radius:11px;padding:12px;text-align:left;font-weight:760;cursor:pointer}.matrix-tabs button.active{background:var(--ink);color:#fff;border-color:var(--ink)}.matrix-results{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}.matrix-result{border:1px solid var(--line);border-radius:15px;padding:17px;background:#fff}.matrix-result.hidden{display:none}.matrix-result b{display:block}.matrix-result span{font-size:12px;color:var(--muted)}
.page-hero{padding:66px 0 48px;background:linear-gradient(180deg,#f5f7fa,#fff)}.page-hero h1{font-size:clamp(40px,5.7vw,67px);color:var(--ink)}.page-hero p{font-size:19px;color:var(--muted);max-width:850px}.breadcrumb{font-size:12px;color:#8290a2;margin-bottom:18px}.breadcrumb a{color:var(--blue)}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:36px}.list-clean{list-style:none;padding:0;margin:0}.list-clean li{padding:13px 0;border-bottom:1px solid var(--line)}.quote{font-size:25px;line-height:1.32;letter-spacing:-.02em;border-left:4px solid var(--blue);padding-left:20px}.compare{display:grid;grid-template-columns:1fr 1fr;gap:18px}.compare-box{border-radius:19px;padding:24px;border:1px solid var(--line);background:#fff}.compare-box.after{background:#f1f6ff;border-color:#cad9fb}.compare-box h3{margin-top:0}.compare-box li{margin-bottom:9px;color:var(--muted)}
.module-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.module{border:1px solid var(--line);border-radius:16px;padding:19px;background:#fff}.module h3{font-size:17px;margin:0 0 8px}.module p{font-size:13px;color:var(--muted);margin:0}
.scope-box{border-radius:22px;padding:26px;background:#f0f4fa;border:1px solid #d7e0eb}.scope-meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}.scope-meta div{background:#fff;border-radius:13px;padding:15px}.scope-meta small{display:block;color:#778598;text-transform:uppercase;letter-spacing:.08em;font-size:10px}.scope-meta strong{display:block;margin-top:4px;font-size:16px}.scope-list{padding-left:20px}.scope-list li{margin-bottom:8px}
.industry-flow{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.industry-step{border:1px solid var(--line);border-radius:14px;padding:15px;background:#fff;font-size:13px;font-weight:750;position:relative}.industry-step:not(:last-child):after{content:"→";position:absolute;right:-9px;top:50%;z-index:2;color:#75869a}
.special-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.special-box{border-radius:24px;padding:29px;background:#0d2138;color:#fff}.special-box.alt{background:#edf3ff;color:var(--ink)}.special-box p{color:#bbcadb}.special-box.alt p{color:var(--muted)}
.contact-bar{padding:62px 0;background:#eef4ff}.contact-layout{display:grid;grid-template-columns:.92fr 1.08fr;gap:38px}.contact-layout h2{font-size:38px;line-height:1.04;letter-spacing:-.04em;margin:8px 0 12px}.contact-layout p{color:var(--muted)}.lead-form{background:#fff;border:1px solid #d8e1ec;border-radius:22px;padding:22px;box-shadow:var(--shadow)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.lead-form label{display:block;font-size:11px;color:#667588;font-weight:750;margin-bottom:5px}.lead-form input,.lead-form textarea{width:100%;border:1px solid #ccd7e4;border-radius:10px;padding:11px 12px;background:#fff;color:var(--ink)}.lead-form textarea{min-height:112px;resize:vertical}.form-full{grid-column:1/-1}.form-actions{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:13px}.form-note,.form-status{font-size:11px;color:#718095;margin-top:11px}.contact-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.footer{padding:32px 0;background:#06111f;color:#aab9ca}.footer-row{display:flex;justify-content:space-between;gap:25px}.footer-links{display:flex;gap:16px;flex-wrap:wrap;font-size:12px}
@media(max-width:1050px){.module-buy-grid{grid-template-columns:repeat(2,1fr)}.trust-team{grid-template-columns:1fr}.buy-steps,.module-steps{grid-template-columns:repeat(3,1fr)}.nav{display:none}.mobile-toggle{display:block}.nav.open{display:flex;position:absolute;left:20px;right:20px;top:66px;background:#fff;border:1px solid var(--line);border-radius:15px;padding:18px;flex-direction:column;align-items:flex-start;box-shadow:var(--shadow)}.hero-grid{grid-template-columns:1fr}.grid5{grid-template-columns:repeat(2,1fr)}.grid4{grid-template-columns:repeat(2,1fr)}.offer-grid{grid-template-columns:repeat(2,1fr)}.matrix-wrap{grid-template-columns:1fr}.matrix-tabs{flex-direction:row;overflow:auto}.matrix-results{grid-template-columns:repeat(2,1fr)}.industry-flow{grid-template-columns:repeat(3,1fr)}}
@media(max-width:720px){.wrap{width:min(var(--max),calc(100% - 28px))}.header-row{height:62px}.vii-logo{height:29px!important}.header-cta{display:none}.hero{padding:52px 0 44px}.hero h1,.page-hero h1{font-size:41px}.hero p,.page-hero p{font-size:17px}.section{padding:50px 0}.section-head{display:block}.section-head p{margin-top:12px}.grid2,.grid3,.grid4,.grid5,.case-grid,.offer-grid,.team-grid,.two-col,.compare,.module-grid,.special-grid,.contact-layout,.matrix-results,.industry-flow,.form-grid,.module-buy-grid,.trust-list,.buy-steps,.module-steps{grid-template-columns:1fr}.industry-panel{padding:18px}.industry-panel-head{display:block}.team-person{grid-template-columns:92px 1fr}.team-photo{width:92px;height:92px}.matrix-tabs{padding-bottom:4px}.matrix-tabs button{white-space:nowrap}.product-card,.case-card,.offer-card{min-height:0}.industry-step:not(:last-child):after{content:"↓";right:auto;left:50%;top:auto;bottom:-16px}.scope-meta{grid-template-columns:1fr}.form-full{grid-column:auto}.footer-row{display:block}.footer-links{margin-top:18px}}
'''

JS = r'''
document.addEventListener("DOMContentLoaded",()=>{
  const ANALYTICS_ENDPOINT="https://dashboard.viiversion.com/api/collect";
  const PROJECT="VIIVERSION";
  const toggle=document.querySelector(".mobile-toggle"), nav=document.querySelector(".nav");
  if(toggle&&nav) toggle.addEventListener("click",()=>nav.classList.toggle("open"));

  const industryTabs=[...document.querySelectorAll("[data-industry-tab]")];
  const industryPanels=[...document.querySelectorAll("[data-industry-panel]")];
  if(industryTabs.length&&industryPanels.length){
    const showIndustry=(slug)=>{
      industryTabs.forEach(x=>{
        const active=x.dataset.industryTab===slug;
        x.classList.toggle("active",active);
        x.setAttribute("aria-selected",active?"true":"false");
      });
      industryPanels.forEach(x=>x.hidden=x.dataset.industryPanel!==slug);
    };
    industryTabs.forEach(x=>x.addEventListener("click",()=>showIndustry(x.dataset.industryTab)));
    showIndustry(industryTabs[0].dataset.industryTab);
  }

  const tabs=[...document.querySelectorAll("[data-matrix-product]")];
  const results=[...document.querySelectorAll("[data-products]")];
  if(tabs.length&&results.length){
    const apply=(slug)=>{
      tabs.forEach(x=>x.classList.toggle("active",x.dataset.matrixProduct===slug));
      results.forEach(x=>x.classList.toggle("hidden",slug!=="all"&&!(x.dataset.products||"").split(",").includes(slug)));
    };
    tabs.forEach(x=>x.addEventListener("click",()=>apply(x.dataset.matrixProduct)));
    apply("all");
  }

  const qs=new URLSearchParams(location.search);
  const currentTouch={
    source:qs.get("utm_source")||"",
    medium:qs.get("utm_medium")||"",
    campaign:qs.get("utm_campaign")||"",
    content:qs.get("utm_content")||"",
    term:qs.get("utm_term")||"",
    vvCampaign:qs.get("vv_campaign")||"",
    referrer:document.referrer||"",
    path:location.pathname
  };
  let campaign=currentTouch;
  try{
    const saved=JSON.parse(sessionStorage.getItem("viiversion_campaign")||"null");
    const hasCampaign=Boolean(currentTouch.source||currentTouch.medium||currentTouch.campaign||currentTouch.vvCampaign);
    if(saved){
      campaign={...saved,lastPath:location.pathname,lastReferrer:document.referrer||saved.lastReferrer||""};
      if(hasCampaign) campaign.lastTouch=currentTouch;
    }else{
      campaign={...currentTouch,landingPage:location.pathname,firstReferrer:document.referrer||"",firstTouch:currentTouch};
    }
    sessionStorage.setItem("viiversion_campaign",JSON.stringify(campaign));
  }catch(_){}

  const analytics=(logicalType,detail={})=>{
    const storage=(name)=>{try{return window[name]}catch(_){return null}};
    const getId=(store,key)=>{
      try{
        let value=store&&store.getItem(key);
        if(!value){
          value=(crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2));
          if(store)store.setItem(key,value);
        }
        return value;
      }catch(_){return Date.now()+"-"+Math.random().toString(16).slice(2)}
    };
    const visitorId=getId(storage("localStorage"),"vv_analytics_visitor");
    const sessionId=getId(storage("sessionStorage"),"vv_analytics_session");
    const virtualPath="/__conversion/"+String(logicalType||"event").replace(/_/g,"-");
    const params=new URLSearchParams();
    params.set("source_path",location.pathname.slice(0,500));
    if(detail.interest)params.set("interest",String(detail.interest).slice(0,160));
    if(detail.cta)params.set("cta",String(detail.cta).slice(0,160));
    if(campaign.source)params.set("utm_source",campaign.source.slice(0,160));
    if(campaign.medium)params.set("utm_medium",campaign.medium.slice(0,160));
    if(campaign.campaign)params.set("utm_campaign",campaign.campaign.slice(0,200));
    const query=params.toString()?"?"+params.toString():"";
    const payload={
      eventType:"pageview",
      project:PROJECT,
      hostname:location.hostname,
      path:virtualPath,
      pageUrl:(location.origin+virtualPath+query).slice(0,4000),
      queryString:query.slice(0,2000),
      title:("Conversion: "+logicalType+" | "+(detail.interest||document.title)).slice(0,200),
      visitorId,
      sessionId,
      referrer:(location.origin+location.pathname).slice(0,500),
      utmSource:campaign.source,
      utmMedium:campaign.medium,
      utmCampaign:campaign.campaign,
      utmContent:campaign.content,
      vvCampaign:campaign.vvCampaign,
      occurredAt:new Date().toISOString()
    };
    const body=JSON.stringify(payload);
    try{
      if(navigator.sendBeacon){
        const ok=navigator.sendBeacon(ANALYTICS_ENDPOINT,new Blob([body],{type:"text/plain;charset=UTF-8"}));
        if(ok)return;
      }
    }catch(_){}
    try{
      fetch(ANALYTICS_ENDPOINT,{method:"POST",mode:"no-cors",credentials:"omit",keepalive:true,headers:{"content-type":"text/plain;charset=UTF-8"},body}).catch(()=>{});
    }catch(_){}
  };

  document.querySelectorAll("[data-interest]").forEach(el=>{
    el.addEventListener("click",()=>{
      const selected=el.dataset.interest||"";
      try{
        sessionStorage.setItem("viiversion_interest",selected);
        sessionStorage.setItem("viiversion_cta",el.dataset.cta||el.textContent.trim());
      }catch(_){}
      const liveInterest=document.querySelector('.lead-form [name="interest"]');
      if(liveInterest) liveInterest.value=selected;
      analytics("cta_click",{interest:selected,cta:(el.dataset.cta||el.textContent.trim()).slice(0,160)});
    });
  });

  const form=document.querySelector(".lead-form");
  if(form){
    const interest=form.querySelector('[name="interest"]');
    const context=form.querySelector('[name="page_context"]');
    let storedInterest="";
    try{storedInterest=sessionStorage.getItem("viiversion_interest")||""}catch(_){}
    storedInterest=storedInterest||qs.get("interest")||form.dataset.defaultInterest||"";
    if(interest) interest.value=storedInterest;
    if(context) context.value=JSON.stringify(campaign);

    form.addEventListener("submit",async e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      let camp=campaign;
      try{camp=JSON.parse(sessionStorage.getItem("viiversion_campaign")||"{}")}catch(_){}
      const lines=[
        "VIIVERSION enquiry",
        "",
        "Name: "+(data.name||""),
        "Contact: "+(data.contact||""),
        "Company / URL: "+(data.company||""),
        "Interest: "+(data.interest||""),
        "Task: "+(data.task||""),
        "",
        "Page: "+location.href,
        "Source: "+(camp.source||"direct"),
        "Medium: "+(camp.medium||""),
        "Campaign: "+(camp.campaign||""),
        "Referrer: "+(camp.referrer||"")
      ];
      const message=lines.join("\n");

      const submitButton=form.querySelector('button[type="submit"]');
      if(submitButton)submitButton.disabled=true;
      let stored=false, leadId="";
      try{
        const leadResponse=await fetch("/api/leads",{
          method:"POST",
          headers:{"content-type":"application/json"},
          body:JSON.stringify({
            name:data.name||"",
            contact:data.contact||"",
            company:data.company||"",
            interest:data.interest||"",
            task:data.task||"",
            website:data.website||"",
            page:location.href,
            pageContext:JSON.stringify(camp),
            source:(camp.firstTouch&&camp.firstTouch.source)||camp.source||"",
            medium:(camp.firstTouch&&camp.firstTouch.medium)||camp.medium||"",
            campaign:(camp.firstTouch&&camp.firstTouch.campaign)||camp.campaign||"",
            referrer:camp.firstReferrer||camp.referrer||"",
            locale:document.documentElement.lang||""
          })
        });
        const leadResult=await leadResponse.json().catch(()=>({}));
        stored=leadResponse.ok&&leadResult.ok;
        leadId=leadResult.id||"";
      }catch(_){}
      if(submitButton)submitButton.disabled=false;

      analytics("lead_submit",{
        interest:String(data.interest||"").slice(0,160),
        hasContact:Boolean(data.contact),
        hasCompany:Boolean(data.company),
        taskLength:String(data.task||"").length,
        stored,
        cta:(sessionStorage.getItem("viiversion_cta")||"form").slice(0,160)
      });

      try{await navigator.clipboard.writeText(message)}catch(_){}
      try{localStorage.setItem("viiversion_last_enquiry",JSON.stringify({interest:data.interest||"",source:(camp.firstTouch&&camp.firstTouch.source)||camp.source||"",campaign:(camp.firstTouch&&camp.firstTouch.campaign)||camp.campaign||"",leadId,stored,createdAt:new Date().toISOString()}))}catch(_){}

      const status=form.querySelector(".form-status");
      if(status){
        status.hidden=false;
        if(!stored)status.textContent=document.documentElement.lang==="ru"
          ?"Не удалось сохранить заявку автоматически. Текст скопирован — отправьте его в открывшемся канале связи."
          :"Automatic saving failed. The message was copied — please send it in the contact channel that opened.";
      }

      const target=form.dataset.contact||"";
      if(target.startsWith("mailto:")){
        const subject=encodeURIComponent("VIIVERSION — "+(data.interest||"new enquiry"));
        location.href=target+"?subject="+subject+"&body="+encodeURIComponent(message);
      }else if(target.includes("wa.me/")||target.includes("whatsapp.com")){
        const joiner=target.includes("?")?"&":"?";
        window.open(target+joiner+"text="+encodeURIComponent(message),"_blank","noopener");
      }else if(target.includes("t.me/")){
        window.open(target,"_blank","noopener");
      }else if(target){
        window.open(target,"_blank","noopener");
      }
    });
  }
});
'''

def prefix(lang):
    return "" if lang == "ru" else "/en"

def loc(lang, path="/"):
    path = "/" + path.strip("/") + ("/" if path.strip("/") else "")
    return prefix(lang) + path

def alternate(lang, path="/"):
    return loc("en" if lang == "ru" else "ru", path)

def contact_target():
    if not CONTACTS:
        return ""
    return CONTACTS[0][0]

def nav_path(lang, raw):
    if lang == "ru":
        return raw
    if raw == "/":
        return "/en/"
    return "/en" + raw

def header(lang, path="/"):
    nav = "".join(f'<a href="{nav_path(lang,u)}">{escape(n)}</a>' for n,u in NAV[lang])
    c = COPY[lang]
    return f'''<header class="site-header"><div class="wrap header-row">
      <a class="brand" href="{loc(lang)}">{LOGO}</a>
      <nav class="nav">{nav}</nav>
      <div class="header-actions">
        <a class="lang-link" href="{alternate(lang,path)}">{c["lang_switch"]}</a>
        <a class="header-cta" href="#contact" data-interest="general" data-cta="header">{c["contact"]} →</a>
        <button class="mobile-toggle" aria-label="Menu">☰</button>
      </div>
    </div></header>'''

def footer(lang):
    links = "".join(f'<a href="{nav_path(lang,u)}">{escape(n)}</a>' for n,u in NAV[lang])
    software_url = loc(lang, "/software/")
    partners_url = loc(lang, "/partners/")
    return f'''<footer class="footer"><div class="wrap footer-row">
      <div><div class="brand-word">VIIVERSION</div><div style="font-size:11px">{("Цифровые решения для бизнеса" if lang=="ru" else "Digital Business Systems")}</div></div>
      <div class="footer-links">{links}<a href="{software_url}">{("Готовые продукты" if lang=="ru" else "Software")}</a><a href="{partners_url}">{("Партнёрам" if lang=="ru" else "Partners")}</a><a href="/proposal-studio/">Proposal Studio</a></div>
    </div></footer>'''

def contact(lang, default_interest=""):
    c = COPY[lang]
    channels = "".join(f'<a class="btn btn-secondary" href="{escape(u)}" rel="noopener">{escape(n)}</a>' for u,n in CONTACTS)
    target = escape(contact_target())
    return f'''<section class="contact-bar" id="contact"><div class="wrap contact-layout">
      <div>
        <div class="eyebrow">{c["contact"]}</div>
        <h2>{BRAND[lang]["final_title"]}</h2>
        <p>{BRAND[lang]["final_lead"]}</p>
        <div class="contact-links">{channels}</div>
      </div>
      <form class="lead-form" data-contact="{target}" data-default-interest="{escape(default_interest)}">
        <div class="form-grid">
          <div><label>{c["form_name"]}</label><input name="name" autocomplete="name"></div>
          <div><label>{c["form_contact"]}</label><input name="contact" required autocomplete="email"></div>
          <div class="form-full"><label>{c["form_company"]}</label><input name="company" autocomplete="url"></div>
          <div class="form-full"><label>{c["form_task"]}</label><textarea name="task" required></textarea></div>
        </div>
        <input type="hidden" name="interest"><input type="hidden" name="page_context"><input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
        <div class="form-actions"><button class="btn btn-primary" type="submit">{c["form_submit"]} →</button></div>
        <div class="form-note">{c["form_note"]}</div>
        <div class="form-status" hidden>{c["form_done"]}</div>
      </form>
    </div></section>'''

def structured_data(lang, title, path, page_type="WebPage"):
    data = {
        "@context": "https://schema.org",
        "@type": page_type,
        "name": title,
        "url": BASE + loc(lang, path),
        "inLanguage": "ru" if lang == "ru" else "en",
        "isPartOf": {"@type": "WebSite", "name": "VIIVERSION", "url": BASE + "/"},
        "publisher": {"@type": "Organization", "name": "VIIVERSION", "url": BASE + "/"},
    }
    return '<script type="application/ld+json">'+json.dumps(data, ensure_ascii=False)+'</script>'

def page(lang, title, desc, body, path="/", page_type="WebPage", interest=""):
    canonical = BASE + loc(lang, path)
    alt = BASE + alternate(lang, path)
    html_lang = "ru" if lang == "ru" else "en"
    return f'''<!doctype html><html lang="{html_lang}"><head>
      <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>{escape(title)}</title><meta name="description" content="{escape(desc)}">
      <link rel="canonical" href="{canonical}">
      <link rel="alternate" hreflang="{html_lang}" href="{canonical}">
      <link rel="alternate" hreflang="{'en' if lang == 'ru' else 'ru'}" href="{alt}">
      <link rel="alternate" hreflang="x-default" href="{BASE + path}">
      <meta property="og:title" content="{escape(title)}"><meta property="og:description" content="{escape(desc)}">
      <meta property="og:type" content="website"><meta property="og:url" content="{canonical}">
      <meta property="og:site_name" content="VIIVERSION">
      <meta name="twitter:card" content="summary_large_image">
      <link rel="stylesheet" href="/assets/viiversion.css">
      {structured_data(lang,title,path,page_type)}
    </head><body>{header(lang,path)}<main>{body}</main>{contact(lang,interest)}{footer(lang)}
    <script src="/assets/viiversion.js" defer></script></body></html>'''

def breadcrumb(lang, items):
    c = COPY[lang]
    parts = [f'<a href="{loc(lang)}">{c["home"]}</a>']
    for name, path in items[:-1]:
        parts.append(f'<a href="{loc(lang,path)}">{escape(name)}</a>')
    parts.append(escape(items[-1][0]))
    return '<div class="breadcrumb">' + " / ".join(parts) + "</div>"

def hero(lang, eyebrow, title, lead, path, parent=None):
    items = []
    if parent:
        items.append(parent)
    items.append((title.split(" — ")[0], path))
    return f'''<section class="page-hero"><div class="wrap">
      {breadcrumb(lang,items)}
      <div class="eyebrow">{escape(eyebrow)}</div>
      <h1>{escape(title)}</h1>
      <p>{escape(lead)}</p>
    </div></section>'''

def badges(items):
    return '<div class="badges">' + "".join(f'<span class="badge">{escape(x)}</span>' for x in items) + "</div>"

def case_card(lang, slug):
    c = CASES[slug][lang]
    img=f"/assets/cases/{slug}.webp"
    return f'''<article class="card case-card">
      <div class="case-media"><img src="{img}" alt="{escape(c["name"])}" loading="lazy" onerror="this.parentElement.hidden=true"></div>
      <div class="case-top"><div><div class="kicker">{escape(c["industry"])}</div><h3>{escape(c["name"])}</h3></div><span class="status {c["status"]}">{escape(c["status_label"])}</span></div>
      <p>{escape(c["summary"])}</p>{badges(c["shows"])}
      <div class="actions"><a class="btn btn-primary" href="{loc(lang,'/cases/'+slug+'/')}">{COPY[lang]["view_case"]}</a><a class="btn btn-secondary" href="{escape(c["demo"])}" target="_blank" rel="noopener">{COPY[lang]["view_demo"]}</a></div>
    </article>'''

def product_card(lang, slug):
    p = SELLABLE_PRODUCTS[slug][lang]
    family = FAMILIES[SELLABLE_PRODUCTS[slug]["family"]][lang]
    start = SELLABLE_PRODUCTS[slug]["packages"]["start"][lang]
    return f'''<article class="card product-card">
      <div class="product-mark">{escape(p["name"][0])}</div>
      <div class="kicker">{escape(family["name"])}</div><h3>{escape(p["name"])}</h3><p>{escape(p["short"])}</p>
      <div class="module-buy-meta"><div><small>{COPY[lang]["price"]}</small><b>{escape(start["price"])}</b></div><div><small>{COPY[lang]["timeline"]}</small><b>{escape(start["timeline"])}</b></div></div>
      <a class="text-link" href="{loc(lang,'/products/'+slug+'/')}">{'Что входит и как начать' if lang=='ru' else 'What is included and how to start'} →</a>
    </article>'''

def offer_card(lang, slug):
    o = OFFERS[slug][lang]
    return f'''<article class="card offer-card">
      <div class="kicker">{COPY[lang]["offer"]}</div><h3>{escape(o["name"])}</h3><p>{escape(o["headline"])}</p>
      <div class="offer-meta"><div><small>{COPY[lang]["price"]}</small><b>{escape(o["price"])}</b></div><div><small>{COPY[lang]["timeline"]}</small><b>{escape(o["timeline"])}</b></div></div>
      <a class="text-link" href="{loc(lang,'/offers/'+slug+'/')}">{COPY[lang]["learn_more"]} →</a>
    </article>'''

def module_buy_card(lang, slug):
    p = SELLABLE_PRODUCTS[slug][lang]
    start = SELLABLE_PRODUCTS[slug]["packages"]["start"][lang]
    c = COPY[lang]
    return f'''<article class="module-buy-card">
      <h4>{escape(p["name"])}</h4>
      <p>{escape(p["short"])}</p>
      <div class="module-buy-meta"><div><small>{c["price"]}</small><b>{escape(start["price"])}</b></div><div><small>{c["timeline"]}</small><b>{escape(start["timeline"])}</b></div></div>
      <a class="text-link" href="{loc(lang,'/products/'+slug+'/')}">{'Что входит и как начать' if lang=='ru' else 'What is included and how to start'} →</a>
    </article>'''

def industry_browser(lang):
    tabs=[]
    panels=[]
    for idx,(slug,item) in enumerate(INDUSTRY_CONFIGS.items()):
        info=item[lang]
        tabs.append(f'<button type="button" role="tab" aria-selected="{"true" if idx==0 else "false"}" class="{"active" if idx==0 else ""}" data-industry-tab="{slug}">{escape(info["name"])}</button>')
        primary="".join(module_buy_card(lang,p) for p in item["primary"])
        later="".join(module_buy_card(lang,p) for p in item.get("later",[]))
        addon_names=[ADDONS[a][lang] for a in item.get("addons",[]) if a in ADDONS]
        addon_html=badges(addon_names) if addon_names else ""
        primary_title="Обычно начинают с" if lang=="ru" else "Usually start with"
        later_title="Можно добавить позже" if lang=="ru" else "Can be added later"
        panels.append(f'''<div class="industry-panel" data-industry-panel="{slug}" {"hidden" if idx else ""}>
          <div class="industry-panel-head"><div><h3>{escape(info["name"])}</h3><p>{escape(info["lead"])}</p></div><a class="text-link" href="{loc(lang,'/industries/'+slug+'/')}">{'Вся конфигурация' if lang=='ru' else 'Full industry view'} →</a></div>
          <div class="eyebrow" style="margin-bottom:10px">{primary_title}</div><div class="module-buy-grid">{primary}</div>
          {f'<div class="eyebrow" style="margin:24px 0 10px">{later_title}</div><div class="module-buy-grid">{later}</div>' if later else ''}
          {f'<div style="margin-top:20px"><div class="eyebrow">{later_title}</div>{addon_html}</div>' if addon_html else ''}
        </div>''')
    title="Что можно купить для вашего бизнеса" if lang=="ru" else "What you can buy for your business"
    lead="Выберите сферу. Сначала покажем 2–3 решения, с которых обычно есть смысл начинать; остальное можно подключить позже." if lang=="ru" else "Choose your industry. We show the 2–3 products that usually make sense first, then what can be added later."
    return f'''<section class="section" id="industries"><div class="wrap">
      <div class="section-head"><div><div class="eyebrow">{"Какой у вас бизнес?" if lang=="ru" else "What kind of business do you run?"}</div><h2>{title}</h2></div><p>{lead}</p></div>
      <div class="industry-browser"><div class="industry-tabs" role="tablist">{"".join(tabs)}</div>{"".join(panels)}</div>
    </div></section>'''

def team_trust(lang):
    c=COPY[lang]
    photos=["/assets/team/dmitrii.webp","/assets/team/olga.webp"]
    people=[]
    for idx,(name,role,desc) in enumerate(TEAM[lang]):
        people.append(f'''<article class="team-person"><img class="team-photo" src="{photos[idx]}" alt="{escape(name)}" loading="lazy"><div>
          <div class="eyebrow">{c["team"]}</div><h3>{escape(name)}</h3><div class="role">{escape(role)}</div><p>{escape(desc)}</p>
        </div></article>''')
    if lang=="ru":
        trust=["Сначала показываем, какой именно участок будем менять","До разработки фиксируем, что входит в первый этап, срок и стоимость","Не заменяем рабочие системы, если задачу можно решить интеграцией","Демо, прототипы и клиентские концепции всегда помечаем отдельно"]
        title="Почему безопасно начинать с небольшого этапа"
        lead="Вы общаетесь напрямую с людьми, которые проектируют и собирают решение — без цепочки аккаунтов и случайных подрядчиков."
    else:
        trust=["We show exactly what will change before development","Scope, timeline and price are agreed before the first build","We keep working systems when integration is enough","Demos, prototypes and client concepts are labelled separately"]
        title="Why the first step stays controlled"
        lead="You work directly with the people designing and building the solution — without a chain of account managers and unknown subcontractors."
    items="".join(f'<div class="trust-item">✓ {escape(x)}</div>' for x in trust)
    return f'''<section class="section soft" id="team"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["about"]}</div><h2>{escape(BRAND[lang]["team_title"])}</h2></div><p>{escape(lead)}</p></div><div class="trust-team">{"".join(people)}</div><div class="trust-box"><h3>{escape(title)}</h3><div class="trust-list">{items}</div></div></div></section>'''

def home(lang):
    b=BRAND[lang]; c=COPY[lang]
    top_cases="".join(case_card(lang,s) for s in ("max-tour","uniq-smart-rent","pet-nika"))
    if lang=="ru":
        safety=["Можно начать с одной задачи","Состав работ и ориентир по цене фиксируем до разработки","Не просим менять то, что уже работает","Подключение к рабочим системам — только после проверки"]
        steps=[
            ("1. Показываете текущий процесс","Сайт, переписку, таблицу или экран системы."),
            ("2. Выбираем один первый модуль","Только то, что решает конкретную задачу."),
            ("3. Фиксируем условия","Что входит, срок, цена и какие доступы нужны."),
            ("4. Собираем и показываем","Сначала проверяем сценарий на согласованной версии."),
            ("5. Подключаем","После проверки связываем с действующими системами, если это нужно."),
        ]
        proof_lead="Статус каждого примера указан отдельно: интерактивное демо, публичный прототип или клиентская концепция."
        enterprise_title="Нужна не отдельная функция, а сложная внутренняя система?"
        enterprise_text="Для интеграций, данных, Oracle / PL/SQL и закрытых рабочих процессов есть отдельное инженерное направление."
    else:
        safety=["Start with one defined task","Scope, timeline and price guide are agreed before development","Keep what already works","Connect to live systems only after review"]
        steps=[
            ("1. Show the current process","Website, messages, spreadsheet or system screen."),
            ("2. Choose one first module","Only what solves the immediate problem."),
            ("3. Agree the conditions","Scope, timeline, price and required access."),
            ("4. Build and review","Validate the workflow on the agreed version first."),
            ("5. Connect","Integrate with live systems only after review, when needed."),
        ]
        proof_lead="Every example has an explicit status: interactive demo, public prototype or client concept."
        enterprise_title="Need more than one module?"
        enterprise_text="Complex integrations, data, Oracle / PL/SQL and private internal workflows have a separate engineering path."
    safety_html="".join(f'<li>{escape(x)}</li>' for x in safety)
    steps_html="".join(f'<div class="buy-step"><b>{escape(a)}</b><span>{escape(b)}</span></div>' for a,b in steps)
    return f'''
    <section class="hero"><div class="wrap hero-grid"><div>
      <div class="eyebrow">{escape(b["tagline"])}</div><h1>{escape(b["hero_title"])}</h1><p>{escape(b["hero_lead"])}</p>
      <div class="hero-actions"><a class="btn btn-primary" href="#industries">{escape(b["hero_primary"])} ↓</a><a class="btn btn-secondary" href="#proof">{escape(b["hero_secondary"])}</a></div>
    </div><aside class="hero-safety"><h3>{"Как начинаем без лишнего риска" if lang=="ru" else "A controlled way to start"}</h3><ul>{safety_html}</ul></aside></div></section>

    {industry_browser(lang)}
    {team_trust(lang)}

    <section class="section" id="proof"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["proof"]}</div><h2>{escape(b["proof_title"])}</h2></div><p>{escape(proof_lead)}</p></div><div class="case-grid">{top_cases}</div><div style="margin-top:18px"><a class="text-link" href="{loc(lang,'/cases/')}">{c["all_cases"]} →</a></div></div></section>

    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{"Как купить" if lang=="ru" else "How to start"}</div><h2>{"Пять понятных шагов до первого результата" if lang=="ru" else "Five clear steps to the first result"}</h2></div><p>{"Никакого обязательного большого внедрения на старте." if lang=="ru" else "No mandatory large implementation at the start."}</p></div><div class="buy-steps">{steps_html}</div></div></section>

    <section class="section dark"><div class="wrap"><div class="section-head"><div><div class="eyebrow" style="color:#8fb5ff">{"Другие направления" if lang=="ru" else "Other paths"}</div><h2>{escape(enterprise_title)}</h2></div><p>{escape(enterprise_text)}</p></div><div class="actions"><a class="btn btn-secondary" href="{loc(lang,'/software/')}">{"Готовые продукты" if lang=="ru" else "Software products"} →</a><a class="btn btn-secondary" href="{loc(lang,'/partners/')}">{"Партнёрам" if lang=="ru" else "Partners"} →</a><a class="btn btn-secondary" href="{loc(lang,'/enterprise/')}">{"Для крупных систем" if lang=="ru" else "Enterprise engineering"} →</a></div></div></section>
    '''

def modules_index(lang):
    cards="".join(module_buy_card(lang,s) for s in MODULES)
    title="Что можно купить" if lang=="ru" else "What you can buy"
    lead="Каждая карточка — отдельная понятная задача с описанием результата, срока и способа старта." if lang=="ru" else "Each card is a concrete task with a result, timeline and a clear way to start."
    return hero(lang,title,title,lead,"/modules/")+f'<section class="section"><div class="wrap"><div class="module-buy-grid">{cards}</div></div></section>'

def module_page(lang,slug):
    c=COPY[lang]; m=MODULES[slug][lang]
    steps="".join(f'<div class="module-step"><span class="num">{i:02d}</span>{escape(x)}</div>' for i,x in enumerate(m["steps"],1))
    includes="".join(f'<li>{escape(x)}</li>' for x in m["includes"])
    excludes="".join(f'<li>{escape(x)}</li>' for x in m["excludes"])
    proof="".join(case_card(lang,s) for s in m["proof"][:3] if s in CASES)
    audience=", ".join(m["for"])
    if lang=="ru":
        title=f'{m["name"]} — что это, что входит и как заказать'
        buy_title="Как заказать"
        buy_text="Пришлите ссылку, скриншот или коротко опишите, как эта задача решается сейчас. Мы ответим, подходит ли готовый модуль, что потребуется изменить и какой первый этап имеет смысл."
        safe_title="Что мы не будем делать без согласования"
        included="Что входит"
        excluded="Что не входит в базовую оценку"
        how="Как это работает"
        result="Что меняется для бизнеса"
        for_label="Подходит для"
    else:
        title=f'{m["name"]} — what it is, what is included and how to start'
        buy_title="How to buy"
        buy_text="Send a link, screenshot or short description of how this task works today. We will tell you whether the module fits, what must change and what the first step should be."
        safe_title="What we will not change without agreement"
        included="Included"
        excluded="Not included in the base estimate"
        how="How it works"
        result="What changes for the business"
        for_label="Suitable for"
    body=hero(lang,"Модуль" if lang=="ru" else "Module",title,m["short"],"/modules/"+slug+"/",(("Что можно купить" if lang=="ru" else "Modules"),"/modules/"))
    body+=f'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">{result}</div><h2>{escape(m["result"])}</h2><p><b>{for_label}:</b> {escape(audience)}</p></div><div class="scope-box"><div class="scope-meta"><div><small>{c["price"]}</small><strong>{escape(m["price"])}</strong></div><div><small>{c["timeline"]}</small><strong>{escape(m["timeline"])}</strong></div></div><a class="btn btn-primary" href="#contact" data-interest="{escape(m["name"])}" data-cta="module">{escape(m["cta"])} →</a></div></div></section>
    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{how}</div><h2>{how}</h2></div></div><div class="module-steps">{steps}</div></div></section>
    <section class="section"><div class="wrap compare"><div class="compare-box after"><div class="eyebrow">{included}</div><h3>{included}</h3><ul>{includes}</ul></div><div class="compare-box"><div class="eyebrow">{safe_title}</div><h3>{excluded}</h3><ul>{excludes}</ul></div></div></section>
    <section class="section soft"><div class="wrap two-col"><div><div class="eyebrow">{buy_title}</div><h2>{buy_title}</h2><p class="quote">{escape(buy_text)}</p></div><div class="trust-box" style="margin-top:0"><h3>{"До старта фиксируем" if lang=="ru" else "Agreed before starting"}</h3><div class="trust-list"><div class="trust-item">✓ {"Что именно делаем" if lang=="ru" else "Exact scope"}</div><div class="trust-item">✓ {"Срок первого этапа" if lang=="ru" else "First-stage timeline"}</div><div class="trust-item">✓ {"Стоимость" if lang=="ru" else "Price"}</div><div class="trust-item">✓ {"Какие доступы нужны" if lang=="ru" else "Required access"}</div></div></div></div></section>
    <section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["proof"]}</div><h2>{c["proof"]}</h2></div></div><div class="case-grid">{proof}</div></div></section>'''
    return body

def products_index(lang):
    cards="".join(product_card(lang,s) for s in SELLABLE_PRODUCTS)
    title="Что можно купить" if lang=="ru" else "Products you can buy"
    lead="Каждый продукт решает отдельную задачу, имеет понятный первый пакет и при необходимости расширяется дополнительными функциями." if lang=="ru" else "Each product solves a defined problem, has a clear starter package and can expand with add-ons when needed."
    return hero(lang,"Продукты" if lang=="ru" else "Products",title,lead,"/products/")+f'<section class="section"><div class="wrap"><div class="module-buy-grid">{cards}</div></div></section>'

def product_page(lang,slug):
    c=COPY[lang]
    product=SELLABLE_PRODUCTS[slug]
    p=product[lang]
    family=FAMILIES[product["family"]][lang]
    start=product["packages"]["start"][lang]
    steps="".join(f'<div class="module-step"><span class="num">{i:02d}</span>{escape(x)}</div>' for i,x in enumerate(p["steps"],1))
    includes="".join(f'<li>{escape(x)}</li>' for x in p["includes"])
    excludes="".join(f'<li>{escape(x)}</li>' for x in p["excludes"])
    scope="".join(f'<li>{escape(x)}</li>' for x in start["scope"])
    proof="".join(case_card(lang,s) for s in p["proof"][:3] if s in CASES)
    addons=[ADDONS[a][lang] if a in ADDONS else SELLABLE_PRODUCTS[a][lang]["name"] for a in product.get("recommended_addons",[]) if a in ADDONS or a in SELLABLE_PRODUCTS]
    audience=", ".join(p["for"])
    if lang=="ru":
        title=f'{p["name"]} — что это, что входит и как заказать'
        result_title="Что меняется для бизнеса"; for_label="Подходит для"; how="Как это работает"
        included="Что входит в продукт"; excluded="Что не входит в базовую оценку"
        package_title="Первый пакет"; addons_title="Можно подключить дополнительно"
        buy_title="Как начать"; buy_text="Пришлите ссылку, скриншот или коротко опишите, как эта задача решается сейчас. Мы подтвердим, подходит ли продукт, что войдёт в первый пакет и какие доступы действительно нужны."
    else:
        title=f'{p["name"]} — what it is, what is included and how to start'
        result_title="What changes for the business"; for_label="Suitable for"; how="How it works"
        included="Included"; excluded="Not included in the base estimate"
        package_title="Starter package"; addons_title="Optional add-ons"
        buy_title="How to start"; buy_text="Send a link, screenshot or short description of how this task works today. We will confirm whether the product fits, what goes into the starter package and which access is actually required."
    body=hero(lang,family["name"],title,p["short"],"/products/"+slug+"/",(COPY[lang]["products"],"/products/"))
    body+=f'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">{result_title}</div><h2>{escape(p["result"])}</h2><p><b>{for_label}:</b> {escape(audience)}</p></div><div class="scope-box"><div class="eyebrow">{package_title}</div><h3>{escape(start["name"])}</h3><div class="scope-meta"><div><small>{c["price"]}</small><strong>{escape(start["price"])}</strong></div><div><small>{c["timeline"]}</small><strong>{escape(start["timeline"])}</strong></div></div><ul class="list-clean">{scope}</ul><a class="btn btn-primary" href="#contact" data-interest="{escape(p["name"])}" data-cta="product">{escape(p["cta"])} →</a></div></div></section>
    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{how}</div><h2>{how}</h2></div></div><div class="module-steps">{steps}</div></div></section>
    <section class="section"><div class="wrap compare"><div class="compare-box after"><div class="eyebrow">{included}</div><h3>{included}</h3><ul>{includes}</ul></div><div class="compare-box"><div class="eyebrow">{excluded}</div><h3>{excluded}</h3><ul>{excludes}</ul></div></div></section>
    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{addons_title}</div><h2>{addons_title}</h2></div></div>{badges(addons) if addons else ''}</div></section>
    <section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["proof"]}</div><h2>{c["proof"]}</h2></div></div><div class="case-grid">{proof}</div></div></section>
    <section class="section soft"><div class="wrap two-col"><div><div class="eyebrow">{buy_title}</div><h2>{buy_title}</h2><p class="quote">{escape(buy_text)}</p></div><div class="trust-box" style="margin-top:0"><h3>{"До старта фиксируем" if lang=="ru" else "Agreed before starting"}</h3><div class="trust-list"><div class="trust-item">✓ {"Состав первого пакета" if lang=="ru" else "Starter scope"}</div><div class="trust-item">✓ {"Срок" if lang=="ru" else "Timeline"}</div><div class="trust-item">✓ {"Стоимость" if lang=="ru" else "Price"}</div><div class="trust-item">✓ {"Необходимые доступы" if lang=="ru" else "Required access"}</div></div></div></div></section>'''
    return body

def offers_index(lang):
    cards="".join(offer_card(lang,s) for s in OFFERS)
    title="Стартовые форматы" if lang=="ru" else "Starting offers"
    lead="Небольшие, понятные первые этапы с конкретным составом работ, сроком и ориентиром по стоимости." if lang=="ru" else "Small, concrete first steps with a defined scope, timeline and price guide."
    return hero(lang,COPY[lang]["offer"],title,lead,"/offers/")+f'<section class="section"><div class="wrap"><div class="offer-grid">{cards}</div></div></section>'

def offer_page(lang,slug):
    c=COPY[lang]; o=OFFERS[slug][lang]; pslug=OFFERS[slug]["product"]; p=PRODUCTS[pslug][lang]
    scope="".join(f"<li>{escape(x)}</li>" for x in o["scope"])
    return hero(lang,c["offer"],f'{o["name"]} — {o["headline"]}',p["summary"],"/offers/"+slug+"/",(c["products"],"/products/"))+f'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">{c["scope"]}</div><h2>{c["how_works"]}</h2><ul class="list-clean">{scope}</ul></div><div class="scope-box"><div class="scope-meta"><div><small>{c["price"]}</small><strong>{escape(o["price"])}</strong></div><div><small>{c["timeline"]}</small><strong>{escape(o["timeline"])}</strong></div></div><p><b>{c["proof"]}:</b> {escape(o["proof"])}</p><p>{c["not_fixed"]}</p><a class="btn btn-primary" href="#contact" data-interest="{escape(o["name"])}" data-cta="offer">{escape(o["cta"])} →</a></div></div></section>'''

def solutions_index(lang):
    target_cards=[]
    for slug,item in TARGET_LANDINGS.items():
        d=item[lang]
        target_cards.append(f'<a class="card" href="{loc(lang,"/solutions/"+slug+"/")}"><div class="kicker">{"Отраслевая страница" if lang=="ru" else "Industry landing"}</div><h3>{escape(d["title"])}</h3><p>{escape(d["lead"])}</p><span class="text-link">{"Подробнее" if lang=="ru" else "Learn more"} →</span></a>')
    industry_cards=[]
    for slug,item in INDUSTRY_CONFIGS.items():
        d=item[lang]
        industry_cards.append(f'<a class="card" href="{loc(lang,"/industries/"+slug+"/")}"><div class="kicker">{"Отрасль" if lang=="ru" else "Industry"}</div><h3>{escape(d["name"])}</h3><p>{escape(d["lead"])}</p><span class="text-link">{"Посмотреть продукты" if lang=="ru" else "See products"} →</span></a>')
    title="Решения по задаче и сфере бизнеса" if lang=="ru" else "Solutions by problem and industry"
    lead="Эти страницы не создают новые продукты: они показывают один и тот же канонический продукт в конкретной отрасли." if lang=="ru" else "These pages do not create new products; they show the same canonical product in a specific industry."
    return hero(lang,"Решения" if lang=="ru" else "Solutions",title,lead,"/solutions/")+f'<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{"Конкретные сценарии" if lang=="ru" else "Specific scenarios"}</div><h2>{"Продукт × отрасль" if lang=="ru" else "Product × industry"}</h2></div></div><div class="grid3">{"".join(target_cards)}</div></div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{"По сфере бизнеса" if lang=="ru" else "By industry"}</div><h2>{"Все отрасли" if lang=="ru" else "All industries"}</h2></div></div><div class="grid3">{"".join(industry_cards)}</div></div></section>'

def target_page(lang,slug):
    c=COPY[lang]; d=TARGET_LANDINGS[slug]; t=d[lang]
    product=SELLABLE_PRODUCTS[d["product"]]; p=product[lang]; start=product["packages"]["start"][lang]
    specific="".join(f"<li>{escape(x)}</li>" for x in t["specific"])
    proof="".join(case_card(lang,s) for s in p["proof"][:2] if s in CASES)
    body=hero(lang,"Решение для отрасли" if lang=="ru" else "Industry solution",f'{t["title"]} — {t["headline"]}',t["lead"],"/solutions/"+slug+"/",(("Решения" if lang=="ru" else "Solutions"),"/solutions/"))
    body+=f'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">{"Что изменится" if lang=="ru" else "What changes"}</div><h2>{escape(t["headline"])}</h2><ul class="list-clean">{specific}</ul></div><div class="scope-box"><div class="eyebrow">{"Первый пакет" if lang=="ru" else "Starter package"}</div><h3>{escape(p["name"])}</h3><div class="scope-meta"><div><small>{c["price"]}</small><strong>{escape(start["price"])}</strong></div><div><small>{c["timeline"]}</small><strong>{escape(start["timeline"])}</strong></div></div><a class="btn btn-primary" href="{loc(lang,'/products/'+d["product"]+'/')}">{"Что входит и как начать" if lang=="ru" else "What is included and how to start"} →</a></div></div></section>
    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["proof"]}</div><h2>{c["proof"]}</h2></div></div><div class="case-grid">{proof}</div></div></section>'''
    return body

def industries_index(lang):
    cards="".join(f'<a class="card" href="{loc(lang,"/industries/"+slug+"/")}"><div class="kicker">{"Отрасль" if lang=="ru" else "Industry"}</div><h3>{escape(item[lang]["name"])}</h3><p>{escape(item[lang]["lead"])}</p><span class="text-link">{"Посмотреть продукты" if lang=="ru" else "See products"} →</span></a>' for slug,item in INDUSTRY_CONFIGS.items())
    title="Решения по типу бизнеса" if lang=="ru" else "Solutions by business type"
    lead="В каждой сфере сначала показываем 2–3 продукта, с которых обычно есть смысл начинать, а затем — что можно подключить позже." if lang=="ru" else "For each industry we show the 2–3 products that usually make sense first, followed by what can be added later."
    return hero(lang,"Отрасли" if lang=="ru" else "Industries",title,lead,"/industries/")+f'<section class="section"><div class="wrap"><div class="grid3">{cards}</div></div></section>'

def industry_page(lang,slug):
    item=INDUSTRY_CONFIGS[slug]; d=item[lang]
    primary="".join(module_buy_card(lang,p) for p in item["primary"])
    later="".join(module_buy_card(lang,p) for p in item.get("later",[]))
    addon_names=[ADDONS[a][lang] for a in item.get("addons",[]) if a in ADDONS]
    proofs=[]
    for product_slug in item["primary"] + item.get("later",[]):
        for case_slug in SELLABLE_PRODUCTS[product_slug][lang]["proof"]:
            if case_slug in CASES and case_slug not in proofs:
                proofs.append(case_slug)
    proof_html="".join(case_card(lang,s) for s in proofs[:3])
    return hero(lang,"Отрасль" if lang=="ru" else "Industry",d["name"],d["lead"],"/industries/"+slug+"/",(("Отрасли" if lang=="ru" else "Industries"),"/industries/"))+f'''<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{"Обычно начинают с" if lang=="ru" else "Usually start with"}</div><h2>{"Первые продукты" if lang=="ru" else "First products"}</h2></div></div><div class="module-buy-grid">{primary}</div></div></section>
    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{"Можно добавить позже" if lang=="ru" else "Can be added later"}</div><h2>{"Расширение" if lang=="ru" else "Expansion"}</h2></div></div><div class="module-buy-grid">{later}</div>{f'<div style="margin-top:20px">{badges(addon_names)}</div>' if addon_names else ''}</div></section>
    <section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{COPY[lang]["proof"]}</div><h2>{COPY[lang]["proof"]}</h2></div></div><div class="case-grid">{proof_html}</div></div></section>'''

def cases_index(lang):
    cards="".join(case_card(lang,s) for s in CASES)
    title="Кейсы, демо и прототипы" if lang=="ru" else "Cases, demos and prototypes"
    lead="Каждая карточка имеет явный статус. Рабочее демо, публичный прототип и клиентский концепт — не одно и то же." if lang=="ru" else "Every card has an explicit status. A working demo, public prototype and client concept are not the same thing."
    return hero(lang,COPY[lang]["cases"],title,lead,"/cases/")+f'<section class="section"><div class="wrap"><div class="case-grid">{cards}</div></div></section>'

def case_page(lang,slug):
    c=COPY[lang]; d=CASES[slug][lang]
    return hero(lang,d["status_label"],f'{d["name"]} — {d["summary"]}',d["summary"],"/cases/"+slug+"/",(c["cases"],"/cases/"))+f'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">{c["product_use"]}</div><h2>{c["product_use"]}</h2>{badges(d["shows"])}<p style="margin-top:20px">{c["case_disclaimer"]}</p></div><div class="scope-box"><div class="eyebrow">{c["status"]}</div><h3><span class="status {d["status"]}">{escape(d["status_label"])}</span></h3><p>{escape(d["summary"])}</p><a class="btn btn-primary" href="{escape(d["demo"])}" target="_blank" rel="noopener">{c["view_demo"]} →</a></div></div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["similar"]}</div><h2>{c["similar"]}</h2></div></div><a class="btn btn-primary" href="#contact" data-interest="{escape(d["name"])}" data-cta="case">{c["contact"]} →</a></div></section>'''

def enterprise_page(lang):
    c=COPY[lang]
    title="Сложные внутренние системы" if lang=="ru" else "Complex internal systems"
    lead="Если готовый сервис не подходит под ваш процесс, сначала фиксируем роли, данные, ограничения и интеграции. Затем проверяем самый критичный участок на ограниченной версии и только после этого расширяем решение." if lang=="ru" else "When off-the-shelf SaaS does not fit the workflow, we map roles, data, constraints and integrations first, then validate the critical part with a PoC."
    if lang=="ru":
        items=[
            ("Роли и права доступа", "Роли, разрешения, согласования и журнал действий."),
            ("API и webhooks", "Надёжный обмен данными между существующими системами."),
            ("ETL и данные", "Сбор, преобразование и синхронизация данных."),
            ("Перенос баз данных", "Oracle / PostgreSQL, очистка и перенос legacy-данных."),
            ("Oracle / PL/SQL", "Производительность, процедуры и поддержка рабочих систем."),
            ("Revenue Assurance", "Сверка и контроль потерь для telecom."),
            ("L2/L3 поддержка", "Диагностика сложных технических проблем и сопровождение."),
        ]
        steps=["Диагностика","Архитектура / прототип","Внедрение","Техническое сопровождение"]
        eyebrow="Инженерные возможности"; head="Что можем сделать"; delivery="Как начинаем"; check="Сначала проверяем критичный участок"; note="Не предлагаем строить большую систему, пока не понятен процесс и не проверена ключевая техническая часть."; cta="Запросить технический разбор"
    else:
        items=[
            ("RBAC / workflows","Roles, approvals and audit."),
            ("API / Webhooks","Reliable bridges between systems."),
            ("ETL / Data","Collect, transform and synchronise data."),
            ("Database migration","Oracle / PostgreSQL / legacy cleanup."),
            ("Oracle / PL/SQL","Performance, procedures and production support."),
            ("RA / reconciliation","Telecom Revenue Assurance / FM."),
            ("L2/L3 support","Managed engineering and troubleshooting."),
        ]
        steps=["Discovery","Architecture / PoC","Implementation","Managed Support"]
        eyebrow="Capabilities"; head="Capabilities"; delivery="Delivery"; check="Validate the critical part first"; note="A full private system is not sold as a fixed package."; cta="Request a technical review"
    mods="".join(f'<article class="module"><h3>{escape(n)}</h3><p>{escape(d)}</p></article>' for n,d in items)
    flow="".join(f'<div class="industry-step">{escape(x)}</div>' for x in steps)
    return hero(lang,"Для крупных систем" if lang=="ru" else "Enterprise",title,lead,"/enterprise/")+f'''<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{eyebrow}</div><h2>{head}</h2></div></div><div class="module-grid">{mods}</div></div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{delivery}</div><h2>{check}</h2></div><p>{note}</p></div><div class="industry-flow">{flow}</div><div class="actions"><a class="btn btn-primary" href="#contact" data-interest="Enterprise Discovery" data-cta="enterprise">{cta} →</a></div></div></section>'''

def software_page(lang):
    cards=[]
    for slug,item in SOFTWARE_PRODUCTS.items():
        d=item[lang]; href=d["url"] or "#contact"; interest="" if d["url"] else f' data-interest="{escape(d["name"])}" data-cta="software-product"'
        cards.append(f'<article class="card"><div class="kicker">{escape(d["status"])}</div><h3>{escape(d["name"])}</h3><p>{escape(d["summary"])}</p><a class="text-link" href="{href}"{interest}>{"Открыть" if d["url"] and lang=="ru" else ("Open" if d["url"] else ("Узнать о доступе" if lang=="ru" else "Ask about access"))} →</a></article>')
    title="Готовые продукты VIIVERSION" if lang=="ru" else "VIIVERSION software products"
    lead="Это самостоятельные программные продукты VIIVERSION, а не заказная разработка для одного клиента." if lang=="ru" else "These are standalone VIIVERSION software products, separate from custom client delivery."
    return hero(lang,"Программные продукты" if lang=="ru" else "Software products",title,lead,"/software/")+f'<section class="section"><div class="wrap"><div class="grid2">{"".join(cards)}</div></div></section>'

def partners_page(lang):
    cards=[]
    for slug,item in PARTNER_PRODUCTS.items():
        d=item[lang]
        cards.append(f'<article class="card"><div class="kicker">{escape(d["status"])}</div><h3>{escape(d["name"])}</h3><p>{escape(d["summary"])}</p><a class="text-link" href="#contact" data-interest="{escape(d["name"])}" data-cta="partner">{escape(d["cta"])} →</a></article>')
    title="Для агентств, интеграторов и платформ" if lang=="ru" else "For agencies, integrators and platforms"
    lead="Отдельный путь для white-label поставки, серийной разработки и технических интеграций через партнёра." if lang=="ru" else "A separate path for white-label delivery, repeatable production and technical integrations through partners."
    return hero(lang,"Партнёрам" if lang=="ru" else "Partners",title,lead,"/partners/")+f'<section class="section"><div class="wrap"><div class="grid2">{"".join(cards)}</div></div></section>'

def about_page(lang):
    c=COPY[lang]
    title="VIIVERSION — небольшая инженерная продуктовая команда" if lang=="ru" else "VIIVERSION — an engineering product team"
    lead="Проектируем клиентские сценарии, интерфейсы, серверную логику, данные и интеграции внутри одной команды." if lang=="ru" else "We design customer flows, interfaces, server logic, data and integrations within one team."
    method="До разработки разбираем, что делает клиент, что делает сотрудник, где хранятся данные и на каком шаге возникает ручная работа или потеря информации." if lang=="ru" else "Before development we map what the customer does, what staff do, where data lives and where manual work or information loss appears."
    return hero(lang,c["about"],title,lead,"/about/")+team_trust(lang)+f'<section class="section"><div class="wrap"><div class="eyebrow">{"Как работаем" if lang=="ru" else "Method"}</div><h2>{"Сначала конкретный процесс, затем технология" if lang=="ru" else "Process first, technology second"}</h2><p class="quote">{escape(method)}</p></div></section>'

def redirect_page(lang, target):
    target_url=loc(lang,target)
    return f'''<!doctype html><html lang="{'ru' if lang=='ru' else 'en'}"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url={target_url}"><link rel="canonical" href="{BASE+target_url}"><title>VIIVERSION</title></head><body><p><a href="{target_url}">Continue</a></p></body></html>'''

def write(rel, html):
    path=PUBLIC/rel
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(html,encoding="utf-8")

# Build all canonical commercial pages.
pages = {}
redirect_rels = set()

for lang in LANGS:
    base_dir="" if lang=="ru" else "en/"
    pages[base_dir+"index.html"] = page(lang, "VIIVERSION — "+BRAND[lang]["tagline"], BRAND[lang]["hero_lead"], home(lang), "/", interest="general")

    pages[base_dir+"products/index.html"] = page(lang, ("Что можно купить — VIIVERSION" if lang=="ru" else "VIIVERSION products"), ("Канонический каталог продуктов VIIVERSION." if lang=="ru" else "Canonical VIIVERSION product catalogue."), products_index(lang), "/products/")
    for slug in SELLABLE_PRODUCTS:
        p=SELLABLE_PRODUCTS[slug][lang]
        pages[base_dir+f"products/{slug}/index.html"] = page(lang, f'{p["name"]} — VIIVERSION', p["short"], product_page(lang,slug), f"/products/{slug}/", page_type="Product", interest=p["name"])

    pages[base_dir+"solutions/index.html"] = page(lang, ("Решения — VIIVERSION" if lang=="ru" else "Solutions — VIIVERSION"), ("Один продукт в конкретной отрасли и задаче." if lang=="ru" else "One product applied to a specific industry and problem."), solutions_index(lang), "/solutions/")
    for slug in TARGET_LANDINGS:
        t=TARGET_LANDINGS[slug][lang]
        pages[base_dir+f"solutions/{slug}/index.html"] = page(lang, f'{t["title"]} — VIIVERSION', t["lead"], target_page(lang,slug), f"/solutions/{slug}/", page_type="Service", interest=t["title"])

    pages[base_dir+"industries/index.html"] = page(lang, ("Отрасли — VIIVERSION" if lang=="ru" else "Industries — VIIVERSION"), ("Продукты VIIVERSION по типу бизнеса." if lang=="ru" else "VIIVERSION products by business type."), industries_index(lang), "/industries/")
    for slug in INDUSTRY_CONFIGS:
        d=INDUSTRY_CONFIGS[slug][lang]
        pages[base_dir+f"industries/{slug}/index.html"] = page(lang, f'{d["name"]} — VIIVERSION', d["lead"], industry_page(lang,slug), f"/industries/{slug}/", page_type="Service", interest=d["name"])

    pages[base_dir+"cases/index.html"] = page(lang, ("Примеры — VIIVERSION" if lang=="ru" else "Cases — VIIVERSION"), ("Интерактивные демо, публичные прототипы и клиентские концепции." if lang=="ru" else "Interactive demos, public prototypes and client concepts."), cases_index(lang), "/cases/")
    for slug in CASES:
        d=CASES[slug][lang]
        pages[base_dir+f"cases/{slug}/index.html"] = page(lang, f'{d["name"]} — VIIVERSION', d["summary"], case_page(lang,slug), f"/cases/{slug}/", interest=d["name"])

    pages[base_dir+"software/index.html"] = page(lang, ("Готовые продукты VIIVERSION" if lang=="ru" else "VIIVERSION software products"), ("Самостоятельные программные продукты VIIVERSION." if lang=="ru" else "Standalone software products developed by VIIVERSION."), software_page(lang), "/software/")
    pages[base_dir+"partners/index.html"] = page(lang, ("Партнёрам — VIIVERSION" if lang=="ru" else "Partners — VIIVERSION"), ("White-label и партнёрские форматы VIIVERSION." if lang=="ru" else "White-label and partner delivery from VIIVERSION."), partners_page(lang), "/partners/")
    pages[base_dir+"enterprise/index.html"] = page(lang, "Enterprise — VIIVERSION", ("Сложные внутренние системы, данные и интеграции." if lang=="ru" else "Complex internal systems, data and integrations."), enterprise_page(lang), "/enterprise/", page_type="Service", interest="Enterprise")
    pages[base_dir+"about/index.html"] = page(lang, ("О VIIVERSION" if lang=="ru" else "About VIIVERSION"), ("Команда, компетенции и метод работы." if lang=="ru" else "Team, capabilities and delivery method."), about_page(lang), "/about/")
    pages[base_dir+"contact/index.html"] = page(lang, ("Контакты — VIIVERSION" if lang=="ru" else "Contact — VIIVERSION"), BRAND[lang]["final_lead"], hero(lang,COPY[lang]["contact"],BRAND[lang]["final_title"],BRAND[lang]["final_lead"],"/contact/"), "/contact/", interest="general")

    # Keep old URLs alive without indexing duplicate commercial content.
    for old_path,target in LEGACY_REDIRECTS.items():
        rel=base_dir+old_path.strip("/")+"/index.html"
        if rel not in pages:
            pages[rel]=redirect_page(lang,target)
            redirect_rels.add(rel)

assets=PUBLIC/"assets"
assets.mkdir(parents=True,exist_ok=True)
team_src=ROOT/"site_assets"/"team"
team_dst=assets/"team"
team_dst.mkdir(parents=True,exist_ok=True)
for portrait in ("dmitrii.webp","olga.webp"):
    source=team_src/portrait
    if source.exists():
        shutil.copy2(source,team_dst/portrait)
case_src=ROOT/"site_assets"/"cases"
case_dst=assets/"cases"
case_dst.mkdir(parents=True,exist_ok=True)
if case_src.exists():
    for screenshot in case_src.glob("*.webp"):
        shutil.copy2(screenshot,case_dst/screenshot.name)
(assets/"viiversion.css").write_text(CSS,encoding="utf-8")
(assets/"viiversion.js").write_text(JS,encoding="utf-8")
for rel,html in pages.items():
    write(rel,html)

# Sitemap includes generated product pages plus Proposal Studio pages generated later in the build.
urls=set()
for rel in pages:
    if rel in redirect_rels:
        continue
    if rel.endswith("index.html"):
        parent=Path(rel).parent.as_posix()
        urls.add("/" if parent=="." else "/"+parent.strip("/")+"/")
for route in ("/proposal-studio/","/proposal-studio/support/","/proposal-studio/privacy/","/proposal-studio/terms/"):
    urls.add(route)
xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for u in sorted(urls):
    xml+=f'  <url><loc>{BASE}{u}</loc></url>\n'
xml+='</urlset>\n'
(PUBLIC/"sitemap.xml").write_text(xml,encoding="utf-8")
(PUBLIC/"robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n",encoding="utf-8")

required=[
    "index.html","en/index.html",
    "products/index.html","products/online-booking/index.html","products/telegram-mini-app/index.html",
    "products/crm/index.html","products/ai-consultant/index.html","products/payment-integration/index.html","products/system-integration/index.html",
    "solutions/tourism/online-booking/index.html","solutions/clinics/ai-consultant/index.html",
    "industries/tourism/index.html","industries/hotels/index.html","industries/shops/index.html",
    "cases/index.html","software/index.html","partners/index.html","enterprise/index.html","about/index.html",
    "assets/viiversion.css","assets/viiversion.js","assets/team/dmitrii.webp","assets/team/olga.webp","sitemap.xml"
]
for rel in required:
    p=PUBLIC/rel
    if not p.exists() or p.stat().st_size<150:
        raise SystemExit("Product site QA failed: "+rel)

home_text=(PUBLIC/"index.html").read_text(encoding="utf-8")
for bad in ("коммерческих ядер","buyer journey","Entry offers","client work","Большая продажа"):
    if bad in home_text:
        raise SystemExit("Client-facing jargon leaked into home: "+bad)
for marker in ("Цифровые решения для конкретных задач бизнеса","Что можно купить для вашего бизнеса","Вы общаетесь напрямую с теми, кто делает продукт","Пять понятных шагов до первого результата"):
    if marker not in home_text:
        raise SystemExit("Product site QA missing: "+marker)

print(f"PASS: VIIVERSION canonical product site generated: {len(pages)} pages including noindex legacy redirects + assets + sitemap.")
