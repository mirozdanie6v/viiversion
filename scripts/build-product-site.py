from pathlib import Path
from html import escape
from urllib.parse import quote
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
HOME = PUBLIC / "index.html"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from site_content import (
    LANGS, BRAND, PRODUCTS, OFFERS, INDUSTRIES, INDUSTRY_CATALOG,
    TARGET_LANDINGS, CASES, LABS, TEAM, NAV
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
        "enterprise": "Enterprise",
        "labs": "Labs",
        "about": "Компания",
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
        "form_submit": "Подготовить обращение",
        "form_note": "Форма не отправляет данные в неизвестный сервис. Она собирает контекст страницы и готовит структурированное сообщение для одного из наших опубликованных каналов связи.",
        "form_done": "Сообщение подготовлено. Оно скопировано в буфер обмена; выбранный канал связи откроется автоматически.",
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
        "form_submit": "Prepare enquiry",
        "form_note": "The form does not send data to an unknown third party. It captures page context and prepares a structured message for one of our published contact channels.",
        "form_done": "Message prepared and copied to clipboard. The selected contact channel will open automatically.",
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
@media(max-width:1050px){.nav{display:none}.mobile-toggle{display:block}.nav.open{display:flex;position:absolute;left:20px;right:20px;top:66px;background:#fff;border:1px solid var(--line);border-radius:15px;padding:18px;flex-direction:column;align-items:flex-start;box-shadow:var(--shadow)}.hero-grid{grid-template-columns:1fr}.grid5{grid-template-columns:repeat(2,1fr)}.grid4{grid-template-columns:repeat(2,1fr)}.offer-grid{grid-template-columns:repeat(2,1fr)}.matrix-wrap{grid-template-columns:1fr}.matrix-tabs{flex-direction:row;overflow:auto}.matrix-results{grid-template-columns:repeat(2,1fr)}.industry-flow{grid-template-columns:repeat(3,1fr)}}
@media(max-width:720px){.wrap{width:min(var(--max),calc(100% - 28px))}.header-row{height:62px}.vii-logo{height:29px!important}.header-cta{display:none}.hero{padding:52px 0 44px}.hero h1,.page-hero h1{font-size:41px}.hero p,.page-hero p{font-size:17px}.section{padding:50px 0}.section-head{display:block}.section-head p{margin-top:12px}.grid2,.grid3,.grid4,.grid5,.case-grid,.offer-grid,.team-grid,.two-col,.compare,.module-grid,.special-grid,.contact-layout,.matrix-results,.industry-flow,.form-grid{grid-template-columns:1fr}.matrix-tabs{padding-bottom:4px}.matrix-tabs button{white-space:nowrap}.product-card,.case-card,.offer-card{min-height:0}.industry-step:not(:last-child):after{content:"↓";right:auto;left:50%;top:auto;bottom:-16px}.scope-meta{grid-template-columns:1fr}.form-full{grid-column:auto}.footer-row{display:block}.footer-links{margin-top:18px}}
'''

JS = r'''
document.addEventListener("DOMContentLoaded",()=>{
  const toggle=document.querySelector(".mobile-toggle"), nav=document.querySelector(".nav");
  if(toggle&&nav) toggle.addEventListener("click",()=>nav.classList.toggle("open"));

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
  const campaign={
    source:qs.get("utm_source")||"",
    medium:qs.get("utm_medium")||"",
    campaign:qs.get("utm_campaign")||"",
    content:qs.get("utm_content")||"",
    term:qs.get("utm_term")||"",
    referrer:document.referrer||"",
    path:location.pathname
  };
  sessionStorage.setItem("viiversion_campaign",JSON.stringify(campaign));

  document.querySelectorAll("[data-interest]").forEach(el=>{
    el.addEventListener("click",()=>{
      sessionStorage.setItem("viiversion_interest",el.dataset.interest||"");
      sessionStorage.setItem("viiversion_cta",el.dataset.cta||el.textContent.trim());
      window.dataLayer=window.dataLayer||[];
      window.dataLayer.push({event:"cta_click",interest:el.dataset.interest||"",cta:el.dataset.cta||el.textContent.trim(),path:location.pathname});
    });
  });

  const form=document.querySelector(".lead-form");
  if(form){
    const interest=form.querySelector('[name="interest"]');
    const context=form.querySelector('[name="page_context"]');
    const storedInterest=sessionStorage.getItem("viiversion_interest")||qs.get("interest")||form.dataset.defaultInterest||"";
    if(interest) interest.value=storedInterest;
    if(context) context.value=JSON.stringify(campaign);

    form.addEventListener("submit",async e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      const camp=JSON.parse(sessionStorage.getItem("viiversion_campaign")||"{}");
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
      try{await navigator.clipboard.writeText(message)}catch(_){}
      localStorage.setItem("viiversion_last_enquiry",JSON.stringify({...data,...camp,createdAt:new Date().toISOString()}));
      window.dataLayer=window.dataLayer||[];
      window.dataLayer.push({event:"lead_prepare",interest:data.interest||"",path:location.pathname,utm_source:camp.source||""});
      window.dispatchEvent(new CustomEvent("viiversion:lead",{detail:{...data,...camp}}));

      const status=form.querySelector(".form-status");
      if(status){status.hidden=false}

      const target=form.dataset.contact||"";
      if(target.startsWith("mailto:")){
        const subject=encodeURIComponent("VIIVERSION — "+(data.interest||"new enquiry"));
        location.href=target+"?subject="+subject+"&body="+encodeURIComponent(message);
      }else if(target.includes("wa.me/")||target.includes("whatsapp.com")){
        const joiner=target.includes("?")?"&":"?";
        window.open(target+joiner+"text="+encodeURIComponent(message),"_blank","noopener");
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

def header(lang):
    nav = "".join(f'<a href="{nav_path(lang,u)}">{escape(n)}</a>' for n,u in NAV[lang])
    c = COPY[lang]
    return f'''<header class="site-header"><div class="wrap header-row">
      <a class="brand" href="{loc(lang)}">{LOGO}</a>
      <nav class="nav">{nav}</nav>
      <div class="header-actions">
        <a class="lang-link" href="{alternate(lang)}">{c["lang_switch"]}</a>
        <a class="header-cta" href="#contact" data-interest="general" data-cta="header">{c["contact"]} →</a>
        <button class="mobile-toggle" aria-label="Menu">☰</button>
      </div>
    </div></header>'''

def footer(lang):
    links = "".join(f'<a href="{nav_path(lang,u)}">{escape(n)}</a>' for n,u in NAV[lang])
    labs_url = loc(lang, "/labs/")
    return f'''<footer class="footer"><div class="wrap footer-row">
      <div><div class="brand-word">VIIVERSION</div><div style="font-size:11px">Digital Business Systems</div></div>
      <div class="footer-links">{links}<a href="{labs_url}">Labs</a><a href="/proposal-studio/">Proposal Studio</a></div>
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
        <input type="hidden" name="interest"><input type="hidden" name="page_context">
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
    </head><body>{header(lang)}<main>{body}</main>{contact(lang,interest)}{footer(lang)}
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
    return f'''<article class="card case-card">
      <div class="case-top"><div><div class="kicker">{escape(c["industry"])}</div><h3>{escape(c["name"])}</h3></div><span class="status {c["status"]}">{escape(c["status_label"])}</span></div>
      <p>{escape(c["summary"])}</p>{badges(c["shows"])}
      <div class="actions"><a class="btn btn-primary" href="{loc(lang,'/cases/'+slug+'/')}">{COPY[lang]["view_case"]}</a><a class="btn btn-secondary" href="{escape(c["demo"])}" target="_blank" rel="noopener">{COPY[lang]["view_demo"]}</a></div>
    </article>'''

def product_card(lang, slug):
    p = PRODUCTS[slug][lang]
    return f'''<article class="card product-card">
      <div class="product-mark">{escape(p["name"][0])}</div>
      <div class="kicker">{escape(p["label"])}</div><h3>{escape(p["name"])}</h3><p>{escape(p["headline"])}</p>
      <a class="text-link" href="{loc(lang,'/products/'+slug+'/')}">{COPY[lang]["learn_more"]} →</a>
    </article>'''

def offer_card(lang, slug):
    o = OFFERS[slug][lang]
    return f'''<article class="card offer-card">
      <div class="kicker">{COPY[lang]["offer"]}</div><h3>{escape(o["name"])}</h3><p>{escape(o["headline"])}</p>
      <div class="offer-meta"><div><small>{COPY[lang]["price"]}</small><b>{escape(o["price"])}</b></div><div><small>{COPY[lang]["timeline"]}</small><b>{escape(o["timeline"])}</b></div></div>
      <a class="text-link" href="{loc(lang,'/offers/'+slug+'/')}">{COPY[lang]["learn_more"]} →</a>
    </article>'''

def home(lang):
    b = BRAND[lang]; c = COPY[lang]
    products = "".join(product_card(lang,s) for s in PRODUCTS)
    top_cases = "".join(case_card(lang,s) for s in ("max-tour","uniq-smart-rent","pet-nika"))
    offers = "".join(offer_card(lang,s) for s in ("booking-start","mini-app-pilot","ai-operator-pilot","integration-sprint"))
    problems = [
        (c["problem_booking"],c["problem_booking_desc"],"booking"),
        (c["problem_leads"],c["problem_leads_desc"],"online-sales"),
        (c["problem_ai"],c["problem_ai_desc"],"ai-operator"),
        (c["problem_pay"],c["problem_pay_desc"],"paybridge"),
        (c["problem_ops"],c["problem_ops_desc"],"operations"),
        (c["problem_custom"],c["problem_custom_desc"],"enterprise"),
    ]
    prob_html=""
    for title,desc,slug in problems:
        url = loc(lang,"/enterprise/") if slug=="enterprise" else loc(lang,"/products/"+slug+"/")
        prob_html += f'<article class="problem-card"><h3>{escape(title)}</h3><p>{escape(desc)}</p><a href="{url}">{c["learn_more"]} →</a></article>'
    matrix_cards = []
    mapping = {
        "tourism":["online-sales","booking","operations","ai-operator","paybridge"],
        "rental":["online-sales","booking","operations","paybridge"],
        "clinics":["online-sales","booking","operations","ai-operator"],
    }
    for ind,prods in mapping.items():
        label=INDUSTRIES[ind][lang]["name"]
        matrix_cards.append(f'<a class="matrix-result" data-products="{",".join(prods)}" href="{loc(lang,"/industries/"+ind+"/")}"><b>{escape(label)}</b><span>{escape(INDUSTRIES[ind][lang]["entry"])}</span></a>')
    for label in INDUSTRY_CATALOG[lang][3:]:
        matrix_cards.append(f'<div class="matrix-result" data-products="online-sales,booking,operations,ai-operator,paybridge"><b>{escape(label)}</b><span>{c["contact"]}</span></div>')
    tabs = '<button class="active" data-matrix-product="all">'+c["all_industries"]+'</button>' + "".join(f'<button data-matrix-product="{s}">{escape(PRODUCTS[s][lang]["name"])}</button>' for s in PRODUCTS)
    team = "".join(f'<article class="card"><div class="kicker">{c["team"]}</div><h3>{escape(n)}</h3><p><b>{escape(role)}</b></p><p>{escape(desc)}</p></article>' for n,role,desc in TEAM[lang])
    return f'''
    <section class="hero"><div class="wrap hero-grid"><div>
      <div class="eyebrow">{escape(b["tagline"])}</div><h1>{escape(b["hero_title"])}</h1><p>{escape(b["hero_lead"])}</p>
      <div class="hero-actions"><a class="btn btn-primary" href="{loc(lang,'/solutions/')}" data-interest="solution" data-cta="hero-primary">{escape(b["hero_primary"])} →</a><a class="btn btn-secondary" href="#proof">{escape(b["hero_secondary"])}</a></div>
      <div class="hero-proof"><span>Booking</span><span>CRM / Operations</span><span>AI Operator</span><span>Payments</span><span>Integrations</span></div>
    </div><div class="process-map"><h3>{'Как может расти система' if lang=='ru' else 'How the system can grow'}</h3><div class="process-flow">
      <div class="process-node"><b>{'Один проблемный процесс' if lang=='ru' else 'One broken process'}</b><span>Start</span></div><div class="process-arrow">↓</div>
      <div class="process-node"><b>{'Рабочий модуль' if lang=='ru' else 'Working module'}</b><span>Booking / AI / Integration</span></div><div class="process-arrow">↓</div>
      <div class="process-node"><b>{'Связка с текущими системами' if lang=='ru' else 'Connect to current systems'}</b><span>CRM / Payments / Data</span></div><div class="process-arrow">↓</div>
      <div class="process-node"><b>{'Единый операционный контур' if lang=='ru' else 'Connected operating system'}</b><span>Scale</span></div>
    </div></div></div></section>

    <section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["solutions"]}</div><h2>{escape(b["problem_title"])}</h2></div><p>{escape(b["problem_lead"])}</p></div><div class="grid3">{prob_html}</div></div></section>

    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["products"]}</div><h2>{escape(b["products_title"])}</h2></div><p>{escape(b["products_lead"])}</p></div><div class="grid5">{products}</div></div></section>

    <section class="section" id="proof"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["proof"]}</div><h2>{escape(b["proof_title"])}</h2></div><p>{escape(b["proof_lead"])}</p></div><div class="case-grid">{top_cases}</div><div style="margin-top:18px"><a class="text-link" href="{loc(lang,'/cases/')}">{c["all_cases"]} →</a></div></div></section>

    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["offer"]}</div><h2>{escape(b["start_title"])}</h2></div><p>{escape(b["start_lead"])}</p></div><div class="offer-grid">{offers}</div></div></section>

    <section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Product × Industry</div><h2>{escape(b["matrix_title"])}</h2></div><p>{escape(b["matrix_lead"])}</p></div><div class="matrix-wrap"><div class="matrix-tabs">{tabs}</div><div class="matrix-results">{''.join(matrix_cards)}</div></div></div></section>

    <section class="section dark"><div class="wrap"><div class="section-head"><div><div class="eyebrow" style="color:#8fb5ff">{escape(b["special_title"])}</div><h2>{escape(b["special_title"])}</h2></div></div><div class="special-grid">
      <article class="special-box"><div class="kicker">Partners</div><h3>{c["partners_head"]}</h3><p>{c["partners_body"]}</p><a class="btn btn-secondary" href="{loc(lang,'/labs/')}">{c["learn_more"]} →</a></article>
      <article class="special-box alt"><div class="kicker">Enterprise</div><h3>{c["enterprise_head"]}</h3><p>{c["enterprise_body"]}</p><a class="btn btn-primary" href="{loc(lang,'/enterprise/')}">{c["learn_more"]} →</a></article>
    </div></div></section>

    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["about"]}</div><h2>{escape(b["team_title"])}</h2></div><p>{c["team_lead"]}</p></div><div class="team-grid">{team}</div></div></section>
    '''

def products_index(lang):
    c=COPY[lang]
    cards="".join(product_card(lang,s) for s in PRODUCTS)
    return hero(lang,c["products"],c["all_products"],"Booking, Online Sales, Operations, AI Operator and PayBridge." if lang=="en" else "Booking, Online Sales, Operations, AI Operator и PayBridge — самостоятельные продукты, которые можно соединять между собой.","/products/")+f'<section class="section"><div class="wrap"><div class="grid5">{cards}</div></div></section>'

def product_page(lang,slug):
    c=COPY[lang]; p=PRODUCTS[slug][lang]
    before="".join(f"<li>{escape(x)}</li>" for x in p["before"])
    after="".join(f"<li>{escape(x)}</li>" for x in p["after"])
    modules="".join(f'<article class="module"><h3>{escape(n)}</h3><p>{escape(d)}</p></article>' for n,d in p["modules"])
    proof="".join(case_card(lang,s) for s in p["proof"][:3] if s in CASES)
    offer=OFFERS[p["offer"]][lang]
    body=hero(lang,p["label"],f'{p["name"]} — {p["headline"]}',p["summary"],"/products/"+slug+"/",(c["products"],"/products/"))
    body+=f'''<section class="section"><div class="wrap"><div class="compare">
      <div class="compare-box"><div class="eyebrow">{c["before"]}</div><h3>{c["before"]}</h3><ul>{before}</ul></div>
      <div class="compare-box after"><div class="eyebrow">{c["after"]}</div><h3>{c["after"]}</h3><ul>{after}</ul></div>
    </div></div></section>
    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["modules"]}</div><h2>{c["modules"]}</h2></div><p>{'Не все компоненты нужны в каждом внедрении.' if lang=='ru' else 'Not every component is required in every implementation.'}</p></div><div class="module-grid">{modules}</div></div></section>
    <section class="section"><div class="wrap two-col"><div><div class="eyebrow">{c["offer"]}</div><h2>{escape(offer["name"])}</h2><p class="quote">{escape(offer["headline"])}</p><a class="btn btn-primary" href="{loc(lang,'/offers/'+p["offer"]+'/')}">{escape(p["cta"])} →</a></div>
      <div class="scope-box"><div class="scope-meta"><div><small>{c["price"]}</small><strong>{escape(p["price"])}</strong></div><div><small>{c["timeline"]}</small><strong>{escape(p["timeline"])}</strong></div></div><p>{c["not_fixed"]}</p></div></div></section>
    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["proof"]}</div><h2>{c["proof"]}</h2></div></div><div class="case-grid">{proof}</div></div></section>'''
    return body

def offers_index(lang):
    cards="".join(offer_card(lang,s) for s in OFFERS)
    title="Стартовые форматы" if lang=="ru" else "Starting offers"
    lead="Небольшие, понятные первые этапы с конкретным scope, сроком и ориентиром по стоимости." if lang=="ru" else "Small, concrete first steps with a defined scope, timeline and price guide."
    return hero(lang,COPY[lang]["offer"],title,lead,"/offers/")+f'<section class="section"><div class="wrap"><div class="offer-grid">{cards}</div></div></section>'

def offer_page(lang,slug):
    c=COPY[lang]; o=OFFERS[slug][lang]; pslug=OFFERS[slug]["product"]; p=PRODUCTS[pslug][lang]
    scope="".join(f"<li>{escape(x)}</li>" for x in o["scope"])
    return hero(lang,c["offer"],f'{o["name"]} — {o["headline"]}',p["summary"],"/offers/"+slug+"/",(c["products"],"/products/"))+f'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">{c["scope"]}</div><h2>{c["how_works"]}</h2><ul class="list-clean">{scope}</ul></div><div class="scope-box"><div class="scope-meta"><div><small>{c["price"]}</small><strong>{escape(o["price"])}</strong></div><div><small>{c["timeline"]}</small><strong>{escape(o["timeline"])}</strong></div></div><p><b>{c["proof"]}:</b> {escape(o["proof"])}</p><p>{c["not_fixed"]}</p><a class="btn btn-primary" href="#contact" data-interest="{escape(o["name"])}" data-cta="offer">{escape(o["cta"])} →</a></div></div></section>'''

def solutions_index(lang):
    c=COPY[lang]
    targets=[]
    for slug,d in TARGET_LANDINGS.items():
        t=d[lang]
        targets.append(f'<article class="card"><div class="kicker">{escape(t["title"])}</div><h3>{escape(t["headline"])}</h3><p>{escape(t["lead"])}</p><a class="text-link" href="{loc(lang,"/solutions/"+slug+"/")}">{c["learn_more"]} →</a></article>')
    inds="".join(f'<a class="card" href="{loc(lang,"/industries/"+slug+"/")}"><div class="kicker">{c["solutions_industry"]}</div><h3>{escape(d[lang]["name"])}</h3><p>{escape(d[lang]["headline"])}</p></a>' for slug,d in INDUSTRIES.items())
    title="Решения по задаче и отрасли" if lang=="ru" else "Solutions by problem and industry"
    lead="Конкретные посадочные страницы для одного понятного сценария — без необходимости разбираться во всей архитектуре VIIVERSION." if lang=="ru" else "Focused landing pages for one clear workflow without needing to understand the whole VIIVERSION architecture."
    return hero(lang,c["solutions"],title,lead,"/solutions/")+f'<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["solutions_problem"]}</div><h2>{c["solutions_problem"]}</h2></div></div><div class="grid3">{"".join(targets)}</div></div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["solutions_industry"]}</div><h2>{c["solutions_industry"]}</h2></div></div><div class="grid3">{inds}</div></div></section>'

def target_page(lang,slug):
    c=COPY[lang]; d=TARGET_LANDINGS[slug]; t=d[lang]; p=PRODUCTS[d["product"]][lang]; o=OFFERS[d["offer"]][lang]
    specific="".join(f"<li>{escape(x)}</li>" for x in t["specific"])
    proof="".join(case_card(lang,s) for s in p["proof"][:2] if s in CASES)
    body=hero(lang,c["solutions_problem"],f'{t["title"]} — {t["headline"]}',t["lead"],"/solutions/"+slug+"/",(c["solutions"],"/solutions/"))
    body+=f'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">{c["after"]}</div><h2>{escape(t["headline"])}</h2><ul class="list-clean">{specific}</ul></div><div class="scope-box"><div class="eyebrow">{c["offer"]}</div><h3>{escape(o["name"])}</h3><div class="scope-meta"><div><small>{c["price"]}</small><strong>{escape(o["price"])}</strong></div><div><small>{c["timeline"]}</small><strong>{escape(o["timeline"])}</strong></div></div><a class="btn btn-primary" href="#contact" data-interest="{escape(t["title"])}" data-cta="target-landing">{c["target_cta"]} →</a></div></div></section>
    <section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["proof"]}</div><h2>{c["proof"]}</h2></div></div><div class="case-grid">{proof}</div></div></section>'''
    return body

def industries_index(lang):
    c=COPY[lang]
    deep="".join(f'<a class="card" href="{loc(lang,"/industries/"+slug+"/")}"><div class="kicker">{c["solutions_industry"]}</div><h3>{escape(d[lang]["name"])}</h3><p>{escape(d[lang]["headline"])}</p><span class="text-link">{c["learn_more"]} →</span></a>' for slug,d in INDUSTRIES.items())
    others=badges(INDUSTRY_CATALOG[lang][3:])
    title="Отраслевые сценарии" if lang=="ru" else "Industry scenarios"
    lead="Глубокие страницы публикуем там, где уже есть конкретный процесс и убедительный proof. Остальные отрасли адаптируем по тому же принципу после короткого разбора." if lang=="ru" else "We publish deep industry pages where we already have a specific workflow and credible proof. Other industries are adapted using the same method after a short review."
    return hero(lang,c["all_industries"],title,lead,"/industries/")+f'<section class="section"><div class="wrap"><div class="grid3">{deep}</div></div></section><section class="section soft"><div class="wrap"><div class="eyebrow">{c["other_markets"]}</div><h2>{c["other_markets"]}</h2>{others}</div></section>'

def industry_page(lang,slug):
    c=COPY[lang]; d=INDUSTRIES[slug][lang]
    probs="".join(f"<li>{escape(x)}</li>" for x in d["problems"])
    flow="".join(f'<div class="industry-step">{escape(x)}</div>' for x in d["path"])
    proof="".join(case_card(lang,s) for s in d["proof"])
    return hero(lang,c["solutions_industry"],f'{d["name"]} — {d["headline"]}',d["lead"],"/industries/"+slug+"/",(c["all_industries"],"/industries/"))+f'''<section class="section"><div class="wrap two-col"><div><div class="eyebrow">{c["before"]}</div><h2>{c["before"]}</h2><ul class="list-clean">{probs}</ul></div><div class="scope-box"><div class="eyebrow">{c["offer"]}</div><h3>{escape(d["entry"])}</h3><p>{'Начинаем с одного процесса, который можно показать и проверить.' if lang=='ru' else 'Start with one workflow that can be demonstrated and verified.'}</p><a class="btn btn-primary" href="{loc(lang,'/offers/'+d["entry_slug"]+'/')}">{c["learn_more"]} →</a></div></div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["after"]}</div><h2>{'Рекомендуемый путь' if lang=='ru' else 'Recommended flow'}</h2></div></div><div class="industry-flow">{flow}</div></div></section><section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["proof"]}</div><h2>{c["proof"]}</h2></div></div><div class="case-grid">{proof}</div></div></section>'''

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
    lead="Когда готовый SaaS не соответствует процессу, сначала фиксируем роли, данные, ограничения и интеграции, затем проверяем критичный участок через PoC." if lang=="ru" else "When off-the-shelf SaaS does not fit the workflow, we map roles, data, constraints and integrations first, then validate the critical part with a PoC."
    items=[
        ("RBAC / workflows","Роли, approvals и audit." if lang=="ru" else "Roles, approvals and audit."),
        ("API / Webhooks","Надёжные мосты между системами." if lang=="ru" else "Reliable bridges between systems."),
        ("ETL / Data","Сбор, преобразование и синхронизация данных." if lang=="ru" else "Collect, transform and synchronise data."),
        ("Database migration","Oracle / PostgreSQL / legacy cleanup."),
        ("Oracle / PL/SQL","Производительность, процедуры и production support." if lang=="ru" else "Performance, procedures and production support."),
        ("RA / reconciliation","Telecom Revenue Assurance / FM."),
        ("L2/L3 support","Managed engineering and troubleshooting."),
    ]
    mods="".join(f'<article class="module"><h3>{escape(n)}</h3><p>{escape(d)}</p></article>' for n,d in items)
    steps=["Discovery","Architecture / PoC","Implementation","Managed Support"]
    flow="".join(f'<div class="industry-step">{escape(x)}</div>' for x in steps)
    return hero(lang,"Enterprise",title,lead,"/enterprise/")+f'''<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Capabilities</div><h2>{'Что можно подключить' if lang=='ru' else 'Capabilities'}</h2></div></div><div class="module-grid">{mods}</div></div></section><section class="section soft"><div class="wrap"><div class="section-head"><div><div class="eyebrow">Delivery</div><h2>{'Сначала проверяем критичный участок' if lang=='ru' else 'Validate the critical part first'}</h2></div><p>{'Полная система не продаётся как фиксированный пакет.' if lang=='ru' else 'A full private system is not sold as a fixed package.'}</p></div><div class="industry-flow">{flow}</div><div class="actions"><a class="btn btn-primary" href="#contact" data-interest="Enterprise Discovery" data-cta="enterprise">{'Запросить технический разбор' if lang=='ru' else 'Request a technical review'} →</a></div></div></section>'''

def labs_page(lang):
    cards=[]
    for slug,item in LABS.items():
        d=item[lang]; href=d["url"] or "#contact"; interest="" if d["url"] else f' data-interest="{escape(d["name"])}" data-cta="labs"'
        cards.append(f'<article class="card"><div class="kicker">{escape(d["status"])}</div><h3>{escape(d["name"])}</h3><p>{escape(d["summary"])}</p><a class="text-link" href="{href}"{interest}>{COPY[lang]["learn_more"]} →</a></article>')
    title="Собственные продукты VIIVERSION" if lang=="ru" else "VIIVERSION products"
    lead="Отделяем продукты с собственной моделью распространения от заказной разработки." if lang=="ru" else "Products with their own distribution model are separated from client development work."
    return hero(lang,"Labs",title,lead,"/labs/")+f'<section class="section"><div class="wrap"><div class="grid2">{"".join(cards)}</div></div></section>'

def about_page(lang):
    c=COPY[lang]
    team="".join(f'<article class="card"><div class="kicker">{c["team"]}</div><h3>{escape(n)}</h3><p><b>{escape(role)}</b></p><p>{escape(desc)}</p></article>' for n,role,desc in TEAM[lang])
    title="VIIVERSION — инженерная продуктовая компания" if lang=="ru" else "VIIVERSION — an engineering product company"
    lead="Строим цифровые системы для бизнеса и одновременно развиваем собственные программные продукты." if lang=="ru" else "We build digital systems for businesses and develop our own software products."
    method="До разработки разбираем путь клиента, действия команды, источники данных и конкретное место, где процесс ломается." if lang=="ru" else "Before development we map the customer journey, team actions, data sources and the exact point where the workflow breaks."
    return hero(lang,c["about"],title,lead,"/about/")+f'<section class="section"><div class="wrap"><div class="section-head"><div><div class="eyebrow">{c["team"]}</div><h2>{BRAND[lang]["team_title"]}</h2></div><p>{c["team_lead"]}</p></div><div class="team-grid">{team}</div></div></section><section class="section soft"><div class="wrap"><div class="eyebrow">Method</div><h2>{'Сначала процесс, затем технология' if lang=='ru' else 'Process first, technology second'}</h2><p class="quote">{escape(method)}</p></div></section>'

def write(rel, html):
    path=PUBLIC/rel
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(html,encoding="utf-8")

# Build all pages.
pages = {}

for lang in LANGS:
    base_dir="" if lang=="ru" else "en/"
    pages[base_dir+"index.html"] = page(lang, "VIIVERSION — "+BRAND[lang]["tagline"], BRAND[lang]["hero_lead"], home(lang), "/", interest="general")
    pages[base_dir+"products/index.html"] = page(lang, ("Продукты VIIVERSION" if lang=="ru" else "VIIVERSION products"), BRAND[lang]["products_lead"], products_index(lang), "/products/")
    for slug in PRODUCTS:
        p=PRODUCTS[slug][lang]
        pages[base_dir+f"products/{slug}/index.html"] = page(lang, f'VIIVERSION {p["name"]}', p["summary"], product_page(lang,slug), f"/products/{slug}/", page_type="Product", interest=p["name"])

    pages[base_dir+"offers/index.html"] = page(lang, ("Стартовые форматы — VIIVERSION" if lang=="ru" else "Starting offers — VIIVERSION"), BRAND[lang]["start_lead"], offers_index(lang), "/offers/")
    for slug in OFFERS:
        o=OFFERS[slug][lang]
        pages[base_dir+f"offers/{slug}/index.html"] = page(lang, f'{o["name"]} — VIIVERSION', o["headline"], offer_page(lang,slug), f"/offers/{slug}/", page_type="Service", interest=o["name"])

    pages[base_dir+"solutions/index.html"] = page(lang, ("Решения — VIIVERSION" if lang=="ru" else "Solutions — VIIVERSION"), ("Решения по конкретной задаче и отрасли." if lang=="ru" else "Solutions for specific problems and industries."), solutions_index(lang), "/solutions/")
    for slug in TARGET_LANDINGS:
        t=TARGET_LANDINGS[slug][lang]
        pages[base_dir+f"solutions/{slug}/index.html"] = page(lang, f'{t["title"]} — VIIVERSION', t["lead"], target_page(lang,slug), f"/solutions/{slug}/", page_type="Service", interest=t["title"])

    pages[base_dir+"industries/index.html"] = page(lang, ("Отрасли — VIIVERSION" if lang=="ru" else "Industries — VIIVERSION"), ("Глубокие отраслевые сценарии VIIVERSION." if lang=="ru" else "Deep industry scenarios from VIIVERSION."), industries_index(lang), "/industries/")
    for slug in INDUSTRIES:
        d=INDUSTRIES[slug][lang]
        pages[base_dir+f"industries/{slug}/index.html"] = page(lang, f'{d["name"]} — VIIVERSION', d["lead"], industry_page(lang,slug), f"/industries/{slug}/", page_type="Service", interest=d["name"])

    pages[base_dir+"cases/index.html"] = page(lang, ("Кейсы — VIIVERSION" if lang=="ru" else "Cases — VIIVERSION"), ("Рабочие демо, публичные прототипы и клиентские концепты." if lang=="ru" else "Working demos, public prototypes and client concepts."), cases_index(lang), "/cases/")
    for slug in CASES:
        d=CASES[slug][lang]
        pages[base_dir+f"cases/{slug}/index.html"] = page(lang, f'{d["name"]} — VIIVERSION', d["summary"], case_page(lang,slug), f"/cases/{slug}/", interest=d["name"])

    pages[base_dir+"enterprise/index.html"] = page(lang, ("Enterprise — VIIVERSION"), ("Закрытые внутренние системы, data и integrations." if lang=="ru" else "Private internal systems, data and integrations."), enterprise_page(lang), "/enterprise/", page_type="Service", interest="Enterprise")
    pages[base_dir+"labs/index.html"] = page(lang, "VIIVERSION Labs", ("Собственные продукты VIIVERSION." if lang=="ru" else "Products developed by VIIVERSION."), labs_page(lang), "/labs/")
    pages[base_dir+"about/index.html"] = page(lang, ("О VIIVERSION" if lang=="ru" else "About VIIVERSION"), ("Команда, компетенции и метод работы." if lang=="ru" else "Team, capabilities and delivery method."), about_page(lang), "/about/")
    pages[base_dir+"contact/index.html"] = page(lang, ("Контакты — VIIVERSION" if lang=="ru" else "Contact — VIIVERSION"), BRAND[lang]["final_lead"], hero(lang,COPY[lang]["contact"],BRAND[lang]["final_title"],BRAND[lang]["final_lead"],"/contact/"), "/contact/", interest="general")

assets=PUBLIC/"assets"
assets.mkdir(parents=True,exist_ok=True)
(assets/"viiversion.css").write_text(CSS,encoding="utf-8")
(assets/"viiversion.js").write_text(JS,encoding="utf-8")
for rel,html in pages.items():
    write(rel,html)

# Sitemap includes generated product pages plus Proposal Studio pages generated later in the build.
urls=set()
for rel in pages:
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
    "products/booking/index.html","en/products/booking/index.html",
    "offers/booking-start/index.html","solutions/tourism/booking/index.html",
    "industries/tourism/index.html","industries/rental/index.html","industries/clinics/index.html",
    "cases/index.html","enterprise/index.html","labs/index.html","about/index.html",
    "assets/viiversion.css","assets/viiversion.js","sitemap.xml"
]
for rel in required:
    p=PUBLIC/rel
    if not p.exists() or p.stat().st_size<150:
        raise SystemExit("Product site QA failed: "+rel)

home_text=(PUBLIC/"index.html").read_text(encoding="utf-8")
for bad in ("коммерческих ядер","buyer journey","Entry offers","client work","Большая продажа"):
    if bad in home_text:
        raise SystemExit("Client-facing jargon leaked into home: "+bad)
for marker in ("Автоматизируем продажи и операции","Рабочие демо и прототипы","Начните с одной небольшой задачи","Product × Industry"):
    if marker not in home_text:
        raise SystemExit("Product site QA missing: "+marker)

print(f"PASS: VIIVERSION commercial site generated: {len(pages)} bilingual pages + assets + sitemap.")
