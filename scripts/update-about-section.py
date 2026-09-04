from pathlib import Path

ROOT = Path('public')

REPLACEMENTS = {
    'VIIVERSION — команда разработки цифровых продуктов для бизнеса.': 'VIIVERSION — команда разработчиков с опытом в сложных IT-системах, цифровых продуктах и визуальных коммуникациях.',
    'Мы исследуем действующий путь клиента и собираем вокруг него связанную систему: лендинг, Mini App, CRM, AI, автоматизацию, интеграции и аналитику.': 'Мы создаём интеграционные связки между отдельными системами бизнеса, цифровые контуры между офлайн- и онлайн-процессами, автоматизируем ручные и повторяющиеся операции, разрабатываем внутренние инструменты, клиентские приложения и интерфейсы для команды.',
    '20+ лет': '20+ лет в IT и telecom',
    'Опыт команды в IT и телеком, включая крупные международные проекты.': 'Разработка и внедрение сложных систем для крупных российских и международных компаний, включая телеком-операторов и enterprise-проекты.',
    'Один контур': '16+ лет в digital и визуальных коммуникациях',
    'Клиентский интерфейс, CRM, AI, автоматизация и данные работают вокруг одного пути клиента.': 'Дизайн, видео, motion, интерфейсы, контент и визуальная подача цифровых продуктов — от идеи до готового пользовательского опыта.',
    'Под ваш бизнес': 'Техническая и визуальная экспертиза в одной команде',
    'Архитектура начинается с реальных процессов, каналов и цифрового следа компании.': 'Разработка, архитектура, UX/UI и визуальная коммуникация соединены в одном процессе — от бизнес-задачи до готового цифрового продукта.',
}

for path in ROOT.rglob('*'):
    if not path.is_file() or path.suffix.lower() not in {'.html', '.htm', '.js', '.mjs', '.json', '.txt'}:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    updated = text
    for old, new in REPLACEMENTS.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding='utf-8')

PATCH = r'''<style id="viiversion-about-live-style">
:root{
  --viiv-about-violet:#6559ee;
  --viiv-logo-green-1:#13e5c7;
  --viiv-logo-green-2:#00c5ad;
  --viiv-logo-green-3:#087c68;
}
.viiv-about-layout-live{display:block!important;width:100%!important;max-width:none!important;min-width:0!important}
.viiv-about-heading-wrap-live{width:100%!important;max-width:none!important;min-width:0!important}
.viiv-about-heading-live{width:100%!important;max-width:none!important;margin:0!important;font-size:clamp(27px,2.35vw,40px)!important;line-height:1.05!important;letter-spacing:-.045em!important;font-weight:800!important;color:#111217!important;text-wrap:balance}
.viiv-about-brand-live{display:inline!important;font-size:1.14em!important;line-height:inherit!important;letter-spacing:-.055em!important;font-weight:850!important;background:linear-gradient(90deg,#5f5cf6 0%,#6d4fe6 58%,#7b57ef 100%);-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent}
.viiv-about-copy-live{display:block!important;width:100%!important;max-width:none!important;margin:30px 0 0!important;padding:0!important;font-size:clamp(18px,1.32vw,22px)!important;line-height:1.5!important;color:#62636d!important}
.viiv-about-card-live{min-width:0!important;border:1px solid rgba(30,31,41,.11)!important;border-radius:24px!important;background:rgba(255,255,255,.20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.74)!important;padding-top:28px!important}
.viiv-about-card-title-live{
  font-weight:800!important;
  letter-spacing:-.035em!important;
  line-height:1.08!important;
  overflow-wrap:anywhere;
  background:linear-gradient(105deg,var(--viiv-logo-green-1) 0%,var(--viiv-logo-green-2) 42%,var(--viiv-logo-green-3) 100%)!important;
  -webkit-background-clip:text!important;
  background-clip:text!important;
  color:transparent!important;
  -webkit-text-fill-color:transparent!important;
}
.viiv-about-card-live::before{content:'';display:block;width:42px;height:3px;border-radius:999px;margin:0 0 18px 0;background:linear-gradient(90deg,var(--viiv-logo-green-1),var(--viiv-logo-green-2),var(--viiv-logo-green-3));opacity:.96}
.viiv-about-menu-link{cursor:pointer}
#about{scroll-margin-top:96px}
@media(max-width:1180px){.viiv-about-heading-live{font-size:clamp(28px,3vw,36px)!important}.viiv-about-copy-live{font-size:19px!important}}
@media(max-width:900px){.viiv-about-heading-live{font-size:clamp(27px,4.5vw,35px)!important;line-height:1.07!important}.viiv-about-copy-live{margin-top:24px!important;font-size:18px!important}.viiv-about-card-live{border-radius:22px!important}}
@media(max-width:640px){.viiv-about-heading-live{font-size:26px!important;line-height:1.08!important;letter-spacing:-.035em!important}.viiv-about-brand-live{font-size:1.07em!important}.viiv-about-copy-live{margin-top:20px!important;font-size:17px!important;line-height:1.48!important}.viiv-about-card-live{border-radius:20px!important;padding-top:24px!important}.viiv-about-card-title-live{font-size:23px!important}}
@media(max-width:390px){.viiv-about-heading-live{font-size:23px!important}.viiv-about-copy-live{font-size:16px!important}.viiv-about-card-title-live{font-size:21px!important}}
</style>
<script id="viiversion-about-live-patch">
(()=>{
  const I18N={
    ru:{menu:'О нас',kicker:'КТО МЫ',rest:'команда разработчиков с опытом в сложных IT-системах, цифровых продуктах и визуальных коммуникациях.',copy:'Мы создаём интеграционные связки между отдельными системами бизнеса, цифровые контуры между офлайн- и онлайн-процессами, автоматизируем ручные и повторяющиеся операции, разрабатываем внутренние инструменты, клиентские приложения и интерфейсы для команды.',cards:[['20+ лет в IT и telecom','Разработка и внедрение сложных систем для крупных российских и международных компаний, включая телеком-операторов и enterprise-проекты.'],['16+ лет в digital и визуальных коммуникациях','Дизайн, видео, motion, интерфейсы, контент и визуальная подача цифровых продуктов — от идеи до готового пользовательского опыта.'],['Техническая и визуальная экспертиза в одной команде','Разработка, архитектура, UX/UI и визуальная коммуникация соединены в одном процессе — от бизнес-задачи до готового цифрового продукта.']]},
    en:{menu:'About',kicker:'WHO WE ARE',rest:'a development team with experience in complex IT systems, digital products and visual communications.',copy:'We build integration layers between business systems, connect offline and online processes, automate manual and repetitive operations, and develop internal tools, customer applications and interfaces for teams.',cards:[['20+ years in IT & telecom','Development and implementation of complex systems for major Russian and international companies, including telecom operators and enterprise projects.'],['16+ years in digital & visual communications','Design, video, motion, interfaces, content and visual presentation of digital products — from idea to a complete user experience.'],['Technical and visual expertise in one team','Development, architecture, UX/UI and visual communication are combined in one process — from a business task to a finished digital product.']]},
    vi:{menu:'Giới thiệu',kicker:'CHÚNG TÔI LÀ AI',rest:'đội ngũ phát triển có kinh nghiệm với các hệ thống IT phức tạp, sản phẩm số và truyền thông thị giác.',copy:'Chúng tôi xây dựng các lớp tích hợp giữa các hệ thống của doanh nghiệp, kết nối quy trình offline và online, tự động hóa các thao tác thủ công và lặp lại, đồng thời phát triển công cụ nội bộ, ứng dụng khách hàng và giao diện cho đội ngũ.',cards:[['Hơn 20 năm trong IT & telecom','Phát triển và triển khai các hệ thống phức tạp cho các công ty lớn tại Nga và quốc tế, bao gồm nhà mạng viễn thông và các dự án enterprise.'],['Hơn 16 năm trong digital & truyền thông thị giác','Thiết kế, video, motion, giao diện, nội dung và trình bày trực quan cho sản phẩm số — từ ý tưởng đến trải nghiệm người dùng hoàn chỉnh.'],['Chuyên môn kỹ thuật và thị giác trong một đội ngũ','Phát triển, kiến trúc, UX/UI và truyền thông thị giác được kết nối trong một quy trình — từ bài toán kinh doanh đến sản phẩm số hoàn chỉnh.']]}
  };
  const norm=v=>(v||'').replace(/\s+/g,' ').trim();
  const headings=['VIIVERSION — команда разработчиков с опытом в сложных IT-системах, цифровых продуктах и визуальных коммуникациях.','VIIVERSION — a development team with experience in complex IT systems, digital products and visual communications.','VIIVERSION — đội ngũ phát triển có kinh nghiệm với các hệ thống IT phức tạp, sản phẩm số và truyền thông thị giác.'];
  const copies=Object.values(I18N).map(v=>v.copy);
  let refs=null;

  const exact=texts=>[...document.querySelectorAll('body *')].filter(el=>texts.includes(norm(el.textContent))).sort((a,b)=>a.children.length-b.children.length)[0]||null;
  const langFromTarget=t=>{const el=t&&t.closest?t.closest('button,a,[role="button"]'):null;if(!el)return null;const v=norm(el.textContent).toUpperCase();return v==='RU'?'ru':v==='EN'?'en':v==='VI'?'vi':null};
  const currentLang=()=>{const stored=localStorage.getItem('viiversion-lang')||localStorage.getItem('viiversion-hero-lang');if(I18N[stored])return stored;const dl=(document.documentElement.lang||'').toLowerCase();return dl.startsWith('en')?'en':dl.startsWith('vi')?'vi':'ru'};
  const findCard=title=>{let n=title;for(let i=0;i<7&&n.parentElement;i++,n=n.parentElement){const r=n.getBoundingClientRect();if(r.width>220&&r.height>150&&r.width<760)return n}return title.parentElement};
  const findTop=(heading,copy,cardTitle)=>{let n=heading.parentElement;while(n&&n!==document.body){if(n.contains(copy)&&(!cardTitle||!n.contains(cardTitle)))return n;n=n.parentElement}return null};

  const ensureMenu=lang=>{
    const label=(I18N[lang]||I18N.ru).menu;
    const navs=[...document.querySelectorAll('header nav, nav')];
    const targets=navs.length?navs:[...document.querySelectorAll('header')].flatMap(h=>[...h.querySelectorAll('div')]).filter(el=>{const links=el.querySelectorAll(':scope > a,:scope > button');return links.length>=2&&links.length<=10});
    targets.forEach(nav=>{
      let item=nav.querySelector('.viiv-about-menu-link');
      if(!item){
        const sample=[...nav.querySelectorAll(':scope > a,:scope > button')].find(el=>!['RU','EN','VI'].includes(norm(el.textContent).toUpperCase())&&norm(el.textContent).length>1);
        item=document.createElement('a');
        if(sample)item.className=sample.className;
        item.classList.add('viiv-about-menu-link');
        item.href='#about';
        item.addEventListener('click',e=>{e.preventDefault();document.getElementById('about')?.scrollIntoView({behavior:'smooth',block:'start'})});
        nav.appendChild(item);
      }
      item.textContent=label;
      item.setAttribute('aria-label',label);
    });
  };

  const init=()=>{
    if(refs)return true;
    const heading=exact(headings),copy=exact(copies);
    if(!heading||!copy)return false;
    const cardTitles=[],cards=[],cardBodies=[];
    for(let i=0;i<3;i++){
      const title=exact(Object.values(I18N).map(v=>v.cards[i][0]));
      if(!title)continue;
      const card=findCard(title);cardTitles[i]=title;cards[i]=card;
      cardBodies[i]=[...card.querySelectorAll('p,div,span')].filter(el=>el!==title&&el.children.length===0&&norm(el.textContent).length>30).sort((a,b)=>norm(b.textContent).length-norm(a.textContent).length)[0]||null;
    }
    const top=findTop(heading,copy,cardTitles[0]);
    if(top)top.classList.add('viiv-about-layout-live');
    if(heading.parentElement)heading.parentElement.classList.add('viiv-about-heading-wrap-live');
    heading.insertAdjacentElement('afterend',copy);
    heading.classList.add('viiv-about-heading-live');copy.classList.add('viiv-about-copy-live');
    cards.forEach(c=>c&&c.classList.add('viiv-about-card-live'));cardTitles.forEach(t=>t&&t.classList.add('viiv-about-card-title-live'));
    const kicker=[...document.querySelectorAll('body *')].find(el=>['КТО МЫ','WHO WE ARE','CHÚNG TÔI LÀ AI'].includes(norm(el.textContent)))||null;
    const anchor=heading.closest('section')||top||heading.parentElement;
    if(anchor){anchor.id='about';anchor.style.scrollMarginTop='96px'}
    refs={heading,copy,cardTitles,cardBodies,kicker};return true;
  };

  const render=lang=>{
    if(!init())return false;
    const c=I18N[lang]||I18N.ru;
    refs.heading.innerHTML='<span class="viiv-about-brand-live">VIIVERSION —</span> <span>'+c.rest+'</span>';
    refs.copy.textContent=c.copy;
    if(refs.kicker)refs.kicker.textContent=c.kicker;
    c.cards.forEach((card,i)=>{if(refs.cardTitles[i])refs.cardTitles[i].textContent=card[0];if(refs.cardBodies[i])refs.cardBodies[i].textContent=card[1]});
    ensureMenu(lang);
    return true;
  };

  const setLang=lang=>{if(!I18N[lang])return;localStorage.setItem('viiversion-lang',lang);localStorage.setItem('viiversion-hero-lang',lang);render(lang)};
  document.addEventListener('click',e=>{const lang=langFromTarget(e.target);if(lang)setTimeout(()=>setLang(lang),0)},true);
  document.addEventListener('viiversion:languagechange',e=>{if(e.detail&&e.detail.lang)setLang(e.detail.lang)});
  const start=()=>{const lang=currentLang();if(render(lang)){setTimeout(()=>ensureMenu(lang),250);setTimeout(()=>ensureMenu(lang),900);return}const o=new MutationObserver(()=>{if(render(currentLang())){o.disconnect();setTimeout(()=>ensureMenu(currentLang()),300)}});o.observe(document.body,{subtree:true,childList:true,characterData:true});setTimeout(()=>o.disconnect(),7000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text=path.read_text(encoding='utf-8')
    for marker in ('<style id="viiversion-about-redesign-style">','<style id="viiversion-about-live-style">'):
        while marker in text:
            start=text.index(marker);script_end=text.find('</script>',start)
            if script_end==-1:break
            text=text[:start]+text[script_end+len('</script>'):]
    text=text.replace('</body>',PATCH+'\n</body>',1) if '</body>' in text else text+'\n'+PATCH+'\n'
    path.write_text(text,encoding='utf-8')
