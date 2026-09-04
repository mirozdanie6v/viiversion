from pathlib import Path

ROOT = Path('public')

STYLE = r'''<style id="viiversion-final-runtime-style">
:root{
  --viiv-violet:#6559ee;
  --viiv-green-1:#13e5c7;
  --viiv-green-2:#00c5ad;
  --viiv-green-3:#087c68;
}

/* ---------- Hero: preserve native DOM, show static visual ---------- */
.viiv-visualized-panel{
  position:relative!important;
  min-height:540px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
  overflow:visible!important;
  opacity:1!important;
  transform:none!important;
}
.viiv-visualized-panel>.panel-top,
.viiv-visualized-panel>.system-preview{
  display:none!important;
}
.viiv-system-visual{
  position:relative;
  width:108%;
  min-height:540px;
  margin-left:-4%;
  display:grid;
  place-items:center;
  overflow:visible;
  isolation:isolate;
}
.viiv-system-visual::before{
  content:'';
  position:absolute;
  width:76%;
  aspect-ratio:1;
  border-radius:50%;
  background:radial-gradient(circle at 50% 48%,rgba(108,89,242,.12),rgba(84,177,231,.055) 38%,transparent 70%);
  z-index:-1;
}
.viiv-static-art{width:min(100%,590px);height:auto;display:block;overflow:visible}
.viiv-hero-heading{letter-spacing:-.055em!important;line-height:1.02!important;max-width:760px!important;text-wrap:balance;overflow:visible!important;padding-block:.08em}
.viiv-hero-heading .viiv-gradient-line{display:inline-block;background:linear-gradient(90deg,#5f5cf6 0%,#6d4fe6 48%,#7b57ef 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important}
.viiv-hero-benefits{display:flex;flex-wrap:wrap;gap:22px 34px;margin-top:28px;align-items:center}
.viiv-hero-benefit{display:inline-flex;align-items:center;gap:12px;color:#17181c;font-size:15px;line-height:1.18;font-weight:600}
.viiv-hero-benefit-icon{width:46px;height:46px;flex:0 0 46px;border-radius:999px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(107,88,246,.08),rgba(117,215,247,.16));border:1px solid rgba(96,86,230,.18);color:#6259e8;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
.viiv-hero-benefit-icon svg{width:21px;height:21px}

/* ---------- About ---------- */
#who .section-head{display:block!important;width:100%!important;max-width:none!important}
#who .section-head>div{width:100%!important;max-width:none!important}
#whoH{width:100%!important;max-width:none!important;margin:0!important;color:#111217!important;text-wrap:balance}
.viiv-about-brand-live{display:inline!important;font-size:1.08em!important;font-weight:850!important;letter-spacing:-.055em!important;background:linear-gradient(90deg,#5f5cf6 0%,#6d4fe6 58%,#7b57ef 100%);-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent!important}
#whoP{display:block!important;width:100%!important;max-width:none!important;margin:30px 0 0!important;padding:0!important}
#whoProofs{margin-top:42px!important}
#whoProofs .who-proof{min-width:0!important;border:1px solid rgba(30,31,41,.11)!important;border-radius:24px!important;background:rgba(255,255,255,.20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.74)!important;padding-top:28px!important;opacity:1!important;transform:none!important}
#whoProofs .who-proof::before{content:'';display:block;width:42px;height:3px;border-radius:999px;margin:0 0 18px;background:linear-gradient(90deg,var(--viiv-green-1),var(--viiv-green-2),var(--viiv-green-3));opacity:.96}
#whoProofs .who-proof>b,.viiv-about-card-title-live{display:block;color:#111217!important;-webkit-text-fill-color:#111217!important;background:none!important;font-weight:800!important;letter-spacing:-.035em!important;line-height:1.08!important;word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important}
.viiv-about-tags-live{display:flex!important;flex-wrap:wrap!important;gap:8px!important;margin-top:18px!important}
.viiv-about-tag-live,.viiv-project-tag-live{display:inline-flex!important;align-items:center!important;min-height:30px!important;padding:6px 11px!important;border-radius:999px!important;background:rgba(255,255,255,.50)!important;color:#303139!important;font-size:12px!important;line-height:1!important;font-weight:700!important;letter-spacing:.01em!important;white-space:nowrap!important;word-break:keep-all!important;overflow-wrap:normal!important}
.viiv-about-tag-live{border:1px solid rgba(17,18,23,.12)!important}
.viiv-project-tag-live{border:1.5px solid rgba(101,89,238,.48)!important;background:rgba(101,89,238,.045)!important;color:#4d45b8!important}
.viiv-about-menu-link{cursor:pointer}

/* ---------- Mobile: one real typography scale, with selectors strong enough to win ---------- */
@media(max-width:720px){
  :root{
    --vv-mobile-hero:clamp(38px,10.4vw,42px);
    --vv-mobile-section:clamp(28px,7.8vw,32px);
    --vv-mobile-card:clamp(20px,5.7vw,22px);
    --vv-mobile-lead:clamp(17px,4.6vw,18px);
    --vv-mobile-body:clamp(15px,4.05vw,16px);
    --vv-mobile-tag:clamp(12px,3.2vw,13px);
  }
  body{font-size:var(--vv-mobile-body)!important;line-height:1.55!important;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
  h1,h2,h3,h4,h5,h6,#whoProofs .who-proof>b{word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important;text-wrap:pretty}

  .hero{padding-top:20px!important}
  .hero-grid.viiv-mobile-hero-layout{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:0!important}
  .viiv-mobile-art-col{order:-10!important;width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;padding:0!important}
  .viiv-mobile-copy-col{order:10!important;width:100%!important;max-width:100%!important;min-width:0!important}
  .viiv-visualized-panel{min-height:220px!important}
  .viiv-system-visual{width:100%!important;min-height:220px!important;margin:-10px auto 2px!important;padding:0!important;place-items:center!important}
  .viiv-system-visual::before{width:68%!important;opacity:.78}
  .viiv-static-art{width:min(78vw,300px)!important;max-width:300px!important;margin:0 auto!important}

  .hero h1.viiv-hero-heading,.hero h1{
    font-size:var(--vv-mobile-hero)!important;
    line-height:1.08!important;
    letter-spacing:-.035em!important;
    max-width:100%!important;
    margin:18px 0 18px!important;
  }
  .hero h1.viiv-hero-heading[data-viiv-lang="vi"]{font-size:clamp(36px,9.6vw,40px)!important;line-height:1.12!important;letter-spacing:-.02em!important}
  .hero .kicker{font-size:12px!important;line-height:1.25!important;letter-spacing:.10em!important}
  .hero p[data-k="heroP"],.hero>p,.hero-grid>div>p{
    font-size:var(--vv-mobile-lead)!important;
    line-height:1.5!important;
    letter-spacing:0!important;
    max-width:100%!important;
  }
  .hero-actions{margin-top:22px!important}
  .viiv-hero-benefits{display:grid!important;grid-template-columns:1fr!important;gap:11px!important;width:100%!important;margin-top:20px!important}
  .viiv-hero-benefit{width:100%!important;min-width:0!important;font-size:14px!important}
  .viiv-hero-benefit-icon{width:38px;height:38px;flex-basis:38px}

  .section{padding-block:56px!important}
  .section-head{gap:12px!important}
  .section-head h2,#whoH,#beforeH,#flowH,#capH,#effectH,#protoH,#processH,#ctaH{
    font-size:var(--vv-mobile-section)!important;
    line-height:1.13!important;
    letter-spacing:-.03em!important;
    max-width:100%!important;
    text-wrap:pretty!important;
  }
  .section-head>p,#whoP,#beforeP,#flowP,#capP,#effectP,#protoP,#processP,.cta-box p{
    font-size:var(--vv-mobile-lead)!important;
    line-height:1.5!important;
    letter-spacing:0!important;
    max-width:100%!important;
  }

  #whoProofs .who-proof>b,
  .cap-card h3,.effect h3,.prototype-body h3,.case-body h3,.process-item h3,.before-step h3,.flow-detail h3,.competitive h3,#competitiveTitle{
    font-size:var(--vv-mobile-card)!important;
    line-height:1.18!important;
    letter-spacing:-.022em!important;
    max-width:100%!important;
  }
  #whoProofs .who-proof p,.cap-card p,.effect p,.prototype-body p,.case-body p,.process-item p,.before-step p,.flow-detail p,.competitive p,
  main p,section p,article p,li{
    font-size:var(--vv-mobile-body)!important;
    line-height:1.55!important;
    letter-spacing:0!important;
  }
  .viiv-about-tag-live,.viiv-project-tag-live,[class*="tag"],[class*="badge"],[class*="chip"]{
    font-size:var(--vv-mobile-tag)!important;
    line-height:1.15!important;
    letter-spacing:0!important;
    white-space:nowrap!important;
    word-break:keep-all!important;
    overflow-wrap:normal!important;
  }
  #whoProofs{grid-template-columns:1fr!important;gap:14px!important;margin-top:28px!important}
  #whoProofs .who-proof{width:100%!important;max-width:100%!important;min-height:0!important;height:auto!important;border-radius:20px!important;padding:22px 20px!important}
  #whoP{margin-top:20px!important}
  .viiv-about-tags-live{gap:7px!important;margin-top:16px!important}
  button,a[role="button"],.btn{font-size:15px!important;line-height:1.2!important;letter-spacing:-.01em!important}
}
@media(max-width:390px){
  :root{--vv-mobile-hero:38px;--vv-mobile-section:28px;--vv-mobile-card:20px;--vv-mobile-lead:17px;--vv-mobile-body:15px;--vv-mobile-tag:12px}
  .viiv-visualized-panel,.viiv-system-visual{min-height:205px!important}
  .viiv-static-art{width:min(80vw,275px)!important;max-width:275px!important}
}
@media(orientation:landscape) and (max-width:950px) and (max-height:520px){
  .hero h1.viiv-hero-heading,.hero h1{font-size:36px!important;line-height:1.08!important}
  .section-head h2,#whoH,#beforeH,#flowH,#capH,#effectH,#protoH,#processH,#ctaH{font-size:27px!important}
  .viiv-visualized-panel,.viiv-system-visual{min-height:190px!important}
  .viiv-static-art{width:min(44vw,270px)!important}
}
</style>'''

SCRIPT = r'''<script id="viiversion-final-runtime-script">
(()=>{
  const valid=new Set(['ru','en','vi']);
  const HERO={
    ru:{kicker:'VIIVERSION · ЦИФРОВЫЕ ПРОДУКТЫ ДЛЯ БИЗНЕСА',lead:'Проектируем цифровую систему',accent:'вашего бизнеса',subtitle:'Разбираемся, как устроен ваш бизнес, находим слабые места и точки роста, а затем проектируем конкретные цифровые решения под ваши процессы и задачи.',benefits:['Быстрый старт','Измеримый результат','Долгосрочное партнёрство']},
    en:{kicker:'VIIVERSION · DIGITAL PRODUCTS FOR BUSINESS',lead:'We design the digital system',accent:'for your business',subtitle:'We study how your business works, identify weak points and growth opportunities, then design specific digital solutions around your processes and goals.',benefits:['Fast start','Measurable results','Long-term partnership']},
    vi:{kicker:'VIIVERSION · SẢN PHẨM SỐ CHO DOANH NGHIỆP',lead:'Thiết kế hệ thống số cho',accent:'doanh nghiệp của bạn',subtitle:'Chúng tôi tìm hiểu cách doanh nghiệp của bạn vận hành, xác định điểm yếu và cơ hội tăng trưởng, sau đó thiết kế các giải pháp số cụ thể phù hợp với quy trình và mục tiêu của bạn.',benefits:['Khởi động nhanh','Kết quả đo lường được','Hợp tác dài hạn']}
  };
  const ABOUT={
    ru:{menu:'О нас',kicker:'КТО МЫ',rest:'команда разработчиков с опытом в сложных IT-системах, цифровых продуктах и визуальных коммуникациях.',copy:'Мы создаём интеграционные связки между отдельными системами бизнеса, цифровые контуры между офлайн- и онлайн-процессами, автоматизируем ручные и повторяющиеся операции, разрабатываем внутренние инструменты, клиентские приложения и интерфейсы для команды.',cards:[
      ['20+ лет в IT и telecom','Разработка и внедрение сложных систем для крупных российских и международных компаний, включая телеком-операторов и enterprise-проекты.',['MegaFon','Tele2 Kazakhstan','Saudi Telecom Company','UCELL'],['Telecom BSS','Revenue Assurance','Fraud Management','Oracle','PL/SQL','PostgreSQL','ETL','CDR Processing','ASN.1','Unix/Linux','Bash','REST API','JSON/XML','curl','Postman','SQL','Data Reconciliation','L2/L3 Support','System Integration','Jira','Confluence']],
      ['16+ лет в digital и визуальных коммуникациях','Дизайн, видео, motion, интерфейсы, контент и визуальная подача цифровых продуктов — от идеи до готового пользовательского опыта.',[],['Product Analytics','Information Architecture','Technical Scenarios','Product Design','UX/UI','User Flows','Motion Design','Graphic Design','Video','Content Design']],
      ['Техническая и визуальная экспертиза в одной команде','Разработка, архитектура, UX/UI и визуальная коммуникация соединены в одном процессе — от бизнес-задачи до готового цифрового продукта.',[],['Web Development','Telegram Mini Apps','Bots','CRM','AI Integration','Automation','API Integrations','Admin Panels','Dashboards','Data & Analytics','Payment Integrations','Cloud Deployment','Prototyping']]
    ]},
    en:{menu:'About',kicker:'WHO WE ARE',rest:'a development team with experience in complex IT systems, digital products and visual communications.',copy:'We build integration layers between business systems, connect offline and online processes, automate manual and repetitive operations, and develop internal tools, customer applications and interfaces for teams.',cards:[
      ['20+ years in IT & telecom','Development and implementation of complex systems for major Russian and international companies, including telecom operators and enterprise projects.',['MegaFon','Tele2 Kazakhstan','Saudi Telecom Company','UCELL'],['Telecom BSS','Revenue Assurance','Fraud Management','Oracle','PL/SQL','PostgreSQL','ETL','CDR Processing','ASN.1','Unix/Linux','Bash','REST API','JSON/XML','curl','Postman','SQL','Data Reconciliation','L2/L3 Support','System Integration','Jira','Confluence']],
      ['16+ years in digital & visual communications','Design, video, motion, interfaces, content and visual presentation of digital products — from idea to a complete user experience.',[],['Product Analytics','Information Architecture','Technical Scenarios','Product Design','UX/UI','User Flows','Motion Design','Graphic Design','Video','Content Design']],
      ['Technical and visual expertise in one team','Development, architecture, UX/UI and visual communication are combined in one process — from a business task to a finished digital product.',[],['Web Development','Telegram Mini Apps','Bots','CRM','AI Integration','Automation','API Integrations','Admin Panels','Dashboards','Data & Analytics','Payment Integrations','Cloud Deployment','Prototyping']]
    ]},
    vi:{menu:'Giới thiệu',kicker:'CHÚNG TÔI LÀ AI',rest:'đội ngũ phát triển có kinh nghiệm với các hệ thống IT phức tạp, sản phẩm số và truyền thông thị giác.',copy:'Chúng tôi xây dựng các lớp tích hợp giữa các hệ thống của doanh nghiệp, kết nối quy trình offline và online, tự động hóa các thao tác thủ công và lặp lại, đồng thời phát triển công cụ nội bộ, ứng dụng khách hàng và giao diện cho đội ngũ.',cards:[
      ['Hơn 20 năm trong IT & telecom','Phát triển và triển khai các hệ thống phức tạp cho các công ty lớn tại Nga và quốc tế, bao gồm nhà mạng viễn thông và các dự án enterprise.',['MegaFon','Tele2 Kazakhstan','Saudi Telecom Company','UCELL'],['Telecom BSS','Revenue Assurance','Fraud Management','Oracle','PL/SQL','PostgreSQL','ETL','CDR Processing','ASN.1','Unix/Linux','Bash','REST API','JSON/XML','curl','Postman','SQL','Data Reconciliation','L2/L3 Support','System Integration','Jira','Confluence']],
      ['Hơn 16 năm trong digital & truyền thông thị giác','Thiết kế, video, motion, giao diện, nội dung và trình bày trực quan cho sản phẩm số — từ ý tưởng đến trải nghiệm người dùng hoàn chỉnh.',[],['Product Analytics','Information Architecture','Technical Scenarios','Product Design','UX/UI','User Flows','Motion Design','Graphic Design','Video','Content Design']],
      ['Chuyên môn kỹ thuật và thị giác trong một đội ngũ','Phát triển, kiến trúc, UX/UI và truyền thông thị giác được kết nối trong một quy trình — từ bài toán kinh doanh đến sản phẩm số hoàn chỉnh.',[],['Web Development','Telegram Mini Apps','Bots','CRM','AI Integration','Automation','API Integrations','Admin Panels','Dashboards','Data & Analytics','Payment Integrations','Cloud Deployment','Prototyping']]
    ]}
  };
  const icons=[
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4.8 13h6.4L11 22l8.2-11h-6.4L13 2Z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>'
  ];
  const cube=`<div class="viiv-system-visual" aria-label="VIIVERSION digital system"><svg class="viiv-static-art" viewBox="0 0 620 560" role="img" aria-hidden="true"><defs><linearGradient id="vvTopFinal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fafaff" stop-opacity=".92"/><stop offset=".55" stop-color="#cbc9ee" stop-opacity=".72"/><stop offset="1" stop-color="#7d75d5" stop-opacity=".52"/></linearGradient><linearGradient id="vvFrontFinal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#aaa5eb" stop-opacity=".88"/><stop offset=".48" stop-color="#7770c9" stop-opacity=".88"/><stop offset="1" stop-color="#3c3e66" stop-opacity=".96"/></linearGradient><linearGradient id="vvSideFinal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8d8f4" stop-opacity=".84"/><stop offset=".45" stop-color="#9ea7dc" stop-opacity=".72"/><stop offset="1" stop-color="#4b526f" stop-opacity=".96"/></linearGradient><linearGradient id="vvRingFinal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6557ec" stop-opacity=".85"/><stop offset=".52" stop-color="#8074ff" stop-opacity=".74"/><stop offset="1" stop-color="#80d0eb" stop-opacity=".76"/></linearGradient><radialGradient id="vvOrbFinal" cx="30%" cy="24%" r="76%"><stop offset="0" stop-color="#fff"/><stop offset=".23" stop-color="#cec9ff"/><stop offset=".55" stop-color="#7160ef"/><stop offset="1" stop-color="#332f64"/></radialGradient><radialGradient id="vvCoreFinal" cx="36%" cy="31%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".92"/><stop offset=".24" stop-color="#d8d2ff" stop-opacity=".82"/><stop offset=".56" stop-color="#7260ed" stop-opacity=".64"/><stop offset="1" stop-color="#4b438f" stop-opacity=".22"/></radialGradient></defs><ellipse cx="320" cy="492" rx="184" ry="27" fill="#6b5cf2" opacity=".06"/><ellipse cx="315" cy="284" rx="260" ry="92" transform="rotate(-12 315 284)" fill="none" stroke="url(#vvRingFinal)" stroke-width="14" stroke-opacity=".58"/><ellipse cx="315" cy="286" rx="215" ry="143" transform="rotate(39 315 286)" fill="none" stroke="#8074ff" stroke-width="7" stroke-opacity=".18"/><ellipse cx="315" cy="286" rx="164" ry="224" transform="rotate(72 315 286)" fill="none" stroke="#79cae8" stroke-width="5" stroke-opacity=".13"/><path d="M205 185 L336 118 Q351 110 366 119 L476 184 Q490 193 477 205 L349 272 Q334 280 319 272 L204 204 Q190 196 205 185Z" fill="url(#vvTopFinal)" stroke="#fff" stroke-opacity=".72" stroke-width="2"/><path d="M199 199 Q199 186 211 193 L332 264 Q342 270 342 285 L342 431 Q342 448 328 439 L211 370 Q199 362 199 347Z" fill="url(#vvFrontFinal)" stroke="#d9d8ff" stroke-opacity=".38" stroke-width="2"/><path d="M342 279 Q342 267 353 261 L472 199 Q484 192 484 206 L484 350 Q484 363 473 370 L354 439 Q342 446 342 431Z" fill="url(#vvSideFinal)" stroke="#fff" stroke-opacity=".42" stroke-width="2"/><circle cx="414" cy="329" r="61" fill="url(#vvCoreFinal)" opacity=".70"/><path d="M389 302 L414 349 L439 302" fill="none" stroke="#f7f5ff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round" opacity=".90"/><g opacity=".92"><rect x="105" y="122" width="126" height="84" rx="22" fill="#fff" fill-opacity=".68" stroke="#fff" stroke-opacity=".82" transform="rotate(-13 168 164)"/><rect x="132" y="149" width="56" height="7" rx="4" fill="#6b5cf2" transform="rotate(-13 160 152)"/></g><g opacity=".88"><rect x="451" y="390" width="124" height="82" rx="22" fill="#fff" fill-opacity=".66" stroke="#fff" stroke-opacity=".82" transform="rotate(12 513 431)"/><rect x="478" y="414" width="54" height="7" rx="4" fill="#6b5cf2" transform="rotate(12 505 418)"/></g><circle cx="114" cy="258" r="18" fill="url(#vvOrbFinal)"/><circle cx="526" cy="154" r="11" fill="url(#vvOrbFinal)"/><circle cx="550" cy="377" r="22" fill="url(#vvOrbFinal)"/><circle cx="155" cy="421" r="10" fill="url(#vvOrbFinal)"/></svg></div>`;

  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getLang=()=>{
    let s=null;try{s=localStorage.getItem('bl-lang')}catch(_){ }
    if(valid.has(s))return s;
    const d=(document.documentElement.lang||'').toLowerCase().slice(0,2);
    return valid.has(d)?d:'ru';
  };

  const patchNativeTranslations=()=>{
    const T=window.SITE_I18N;
    if(!T)return;
    for(const lang of valid){
      if(!T[lang])continue;
      const h=HERO[lang],a=ABOUT[lang];
      T[lang].heroK=h.kicker;T[lang].heroH=h.lead+' '+h.accent;T[lang].heroP=h.subtitle;
      T[lang].whoEy=a.kicker;T[lang].whoH='VIIVERSION — '+a.rest;T[lang].whoP=a.copy;
      T[lang].whoProofs=a.cards.map(x=>[x[0],x[1]]);
      const nav=Array.isArray(T[lang].nav)?T[lang].nav.slice(0,4):[];
      nav[4]=a.menu;T[lang].nav=nav;
    }
  };

  const ensureVisual=()=>{
    const panel=document.querySelector('.hero-panel');
    if(!panel)return;
    panel.classList.add('viiv-visualized-panel','viiv-mobile-art-col');
    if(!panel.querySelector('.viiv-system-visual'))panel.insertAdjacentHTML('beforeend',cube);
    const grid=panel.parentElement;
    if(grid&&grid.classList.contains('hero-grid')){
      grid.classList.add('viiv-mobile-hero-layout');
      const copy=[...grid.children].find(x=>x!==panel);
      if(copy)copy.classList.add('viiv-mobile-copy-col');
    }
  };

  const renderHero=lang=>{
    const c=HERO[lang]||HERO.ru;
    const kicker=document.querySelector('[data-k="heroK"]');
    const heading=document.querySelector('[data-k="heroH"]');
    const subtitle=document.querySelector('[data-k="heroP"]');
    if(kicker)kicker.textContent=c.kicker;
    if(heading){heading.classList.add('viiv-hero-heading');heading.dataset.viivLang=lang;heading.innerHTML='<span>'+esc(c.lead)+'</span><br><span class="viiv-gradient-line">'+esc(c.accent)+'</span>'}
    if(subtitle)subtitle.textContent=c.subtitle;
    let box=document.querySelector('.viiv-hero-benefits');
    if(!box){const actions=document.querySelector('.hero-actions');if(actions){box=document.createElement('div');box.className='viiv-hero-benefits';actions.insertAdjacentElement('afterend',box)}}
    if(box)box.innerHTML=c.benefits.map((x,i)=>'<div class="viiv-hero-benefit"><span class="viiv-hero-benefit-icon" aria-hidden="true">'+icons[i]+'</span><span>'+esc(x)+'</span></div>').join('');
  };

  const renderAbout=lang=>{
    const c=ABOUT[lang]||ABOUT.ru;
    const ey=document.getElementById('whoEy'),h=document.getElementById('whoH'),p=document.getElementById('whoP'),grid=document.getElementById('whoProofs');
    if(ey)ey.textContent=c.kicker;
    if(h)h.innerHTML='<span class="viiv-about-brand-live">VIIVERSION —</span> <span>'+esc(c.rest)+'</span>';
    if(p)p.textContent=c.copy;
    if(grid){grid.innerHTML=c.cards.map(card=>{
      const projects=(card[2]||[]).map(x=>'<span class="viiv-project-tag-live">'+esc(x)+'</span>').join('');
      const skills=(card[3]||[]).map(x=>'<span class="viiv-about-tag-live">'+esc(x)+'</span>').join('');
      return '<article class="who-proof reveal in"><b class="viiv-about-card-title-live">'+esc(card[0])+'</b><p>'+esc(card[1])+'</p><div class="viiv-about-tags-live">'+projects+skills+'</div></article>';
    }).join('')}
    const nav=document.querySelector('.navlinks');
    if(nav){let a=nav.querySelector('.viiv-about-menu-link');if(!a){a=document.createElement('a');a.className='viiv-about-menu-link';a.href='#who';nav.appendChild(a)}a.textContent=c.menu;a.setAttribute('aria-label',c.menu)}
  };

  const renderCustom=lang=>{if(!valid.has(lang))lang=getLang();ensureVisual();renderHero(lang);renderAbout(lang)};

  const start=()=>{
    patchNativeTranslations();
    try{localStorage.removeItem('viiversion-lang');localStorage.removeItem('viiversion-hero-lang')}catch(_){ }
    const lang=getLang();
    renderCustom(lang);
    setTimeout(()=>renderCustom(getLang()),80);
  };

  document.addEventListener('click',e=>{
    const b=e.target&&e.target.closest?e.target.closest('.langs button[data-lang]'):null;
    if(!b)return;
    const lang=b.dataset.lang;
    if(!valid.has(lang))return;
    setTimeout(()=>renderCustom(lang),0);
    setTimeout(()=>renderCustom(lang),120);
  },false);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''

PAIRS = [
    ('<style id="viiversion-home-hero-style">', True),
    ('<style id="viiversion-home-visual-style">', True),
    ('<style id="viiversion-about-live-style">', True),
    ('<style id="viiversion-about-tags-v2-style">', True),
]
SINGLE_STYLES = ['<style id="viiversion-mobile-typography-style">']


def strip_pair(text: str, marker: str) -> str:
    while marker in text:
        start = text.index(marker)
        style_end = text.find('</style>', start)
        if style_end == -1:
            break
        script_start = text.find('<script', style_end)
        if script_start == -1:
            text = text[:start] + text[style_end + len('</style>'):]
            continue
        script_end = text.find('</script>', script_start)
        if script_end == -1:
            break
        text = text[:start] + text[script_end + len('</script>'):]
    return text


def strip_style(text: str, marker: str) -> str:
    while marker in text:
        start = text.index(marker)
        end = text.find('</style>', start)
        if end == -1:
            break
        text = text[:start] + text[end + len('</style>'):]
    return text


for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    for marker, _ in PAIRS:
        text = strip_pair(text, marker)
    for marker in SINGLE_STYLES:
        text = strip_style(text, marker)
    # Remove a previous consolidated patch if this script is run twice.
    text = strip_pair(text, '<style id="viiversion-final-runtime-style">')
    patch = STYLE + '\n' + SCRIPT
    if '</body>' in text:
        text = text.replace('</body>', patch + '\n</body>', 1)
    else:
        text += '\n' + patch + '\n'
    path.write_text(text, encoding='utf-8')
