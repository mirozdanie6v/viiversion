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
:root{--viiv-about-green:#0b6f5b;--viiv-about-violet:#6559ee}
.viiv-about-top-live{display:block!important;width:100%!important;max-width:none!important}
.viiv-about-heading-live{
  width:100%!important;
  max-width:none!important;
  margin:0!important;
  font-size:clamp(30px,2.3vw,40px)!important;
  line-height:1.04!important;
  letter-spacing:-.045em!important;
  font-weight:800!important;
  color:#111217!important;
}
.viiv-about-brand-live{
  display:inline!important;
  font-size:1.16em!important;
  line-height:inherit!important;
  letter-spacing:-.055em!important;
  font-weight:850!important;
  background:linear-gradient(90deg,#5f5cf6 0%,#6d4fe6 58%,#7b57ef 100%);
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent!important;
  -webkit-text-fill-color:transparent;
}
.viiv-about-mid-live{
  display:grid!important;
  grid-template-columns:minmax(0,1.02fr) minmax(390px,.98fr)!important;
  gap:64px!important;
  align-items:center!important;
  width:100%!important;
  margin-top:34px!important;
}
.viiv-about-diagram-live{width:100%;max-width:590px;margin:0;aspect-ratio:590/172}
.viiv-about-diagram-live svg{display:block;width:100%;height:100%;overflow:visible}
.viiv-about-copy-live{
  width:100%!important;
  max-width:590px!important;
  margin:0!important;
  padding:0!important;
  font-size:clamp(18px,1.34vw,22px)!important;
  line-height:1.5!important;
  color:#62636d!important;
}
.viiv-about-card-live{
  border:1px solid rgba(30,31,41,.11)!important;
  border-radius:24px!important;
  background:rgba(255,255,255,.20)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.74)!important;
  padding-top:28px!important;
}
.viiv-about-card-title-live{
  color:var(--viiv-about-green)!important;
  font-weight:800!important;
  letter-spacing:-.035em!important;
  line-height:1.08!important;
}
.viiv-about-card-live::before{
  content:'';
  display:block;
  width:42px;
  height:3px;
  border-radius:999px;
  margin:0 0 18px 0;
  background:var(--viiv-about-green);
  opacity:.92;
}
@media(max-width:1180px){
  .viiv-about-heading-live{font-size:clamp(29px,2.7vw,37px)!important}
  .viiv-about-mid-live{grid-template-columns:minmax(0,1fr) minmax(350px,.95fr)!important;gap:42px!important}
  .viiv-about-copy-live{font-size:19px!important}
}
@media(max-width:900px){
  .viiv-about-heading-live{font-size:clamp(29px,4.4vw,36px)!important;line-height:1.05!important}
  .viiv-about-mid-live{grid-template-columns:1fr!important;gap:24px!important;margin-top:28px!important}
  .viiv-about-diagram-live{max-width:560px}
  .viiv-about-copy-live{max-width:720px!important;font-size:18px!important}
}
@media(max-width:640px){
  .viiv-about-heading-live{font-size:27px!important;line-height:1.07!important;letter-spacing:-.035em!important}
  .viiv-about-brand-live{font-size:1.08em!important}
  .viiv-about-mid-live{margin-top:24px!important;gap:20px!important}
  .viiv-about-diagram-live{max-width:100%}
  .viiv-about-copy-live{font-size:17px!important;line-height:1.48!important}
  .viiv-about-card-live{border-radius:20px!important;padding-top:24px!important}
  .viiv-about-card-title-live{font-size:24px!important}
}
@media(max-width:390px){
  .viiv-about-heading-live{font-size:24px!important}
  .viiv-about-copy-live{font-size:16px!important}
  .viiv-about-card-title-live{font-size:22px!important}
}
</style>
<script id="viiversion-about-live-patch">
(()=>{
  const norm=v=>(v||'').replace(/\s+/g,' ').trim();
  const HEADING='VIIVERSION — команда разработчиков с опытом в сложных IT-системах, цифровых продуктах и визуальных коммуникациях.';
  const COPY='Мы создаём интеграционные связки между отдельными системами бизнеса, цифровые контуры между офлайн- и онлайн-процессами, автоматизируем ручные и повторяющиеся операции, разрабатываем внутренние инструменты, клиентские приложения и интерфейсы для команды.';
  const TITLES=['20+ лет в IT и telecom','16+ лет в digital и визуальных коммуникациях','Техническая и визуальная экспертиза в одной команде'];

  const exact=(text)=>[...document.querySelectorAll('body *')]
    .filter(el=>norm(el.textContent)===text)
    .sort((a,b)=>a.children.length-b.children.length)[0]||null;

  const diagram=`<div class="viiv-about-diagram-live" aria-hidden="true">
    <svg viewBox="0 0 590 172">
      <defs>
        <linearGradient id="vaLine" x1="0" x2="1"><stop offset="0" stop-color="#8f94a1" stop-opacity=".34"/><stop offset=".52" stop-color="#6559ee" stop-opacity=".74"/><stop offset="1" stop-color="#7bc7ef" stop-opacity=".44"/></linearGradient>
        <linearGradient id="vaCore" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5f5cf6"/><stop offset="1" stop-color="#7b57ef"/></linearGradient>
      </defs>
      <g fill="none" stroke="url(#vaLine)" stroke-width="1.35">
        <path d="M65 31 C146 31 167 69 245 69"/><path d="M65 86 C150 86 170 86 245 86"/><path d="M65 141 C146 141 167 103 245 103"/>
        <path d="M345 69 C425 69 446 31 525 31"/><path d="M345 86 C425 86 446 86 525 86"/><path d="M345 103 C425 103 446 141 525 141"/>
      </g>
      <g fill="#f8f7f2" stroke="#dad9df" stroke-width="1.1">
        <rect x="12" y="8" width="56" height="46" rx="13"/><rect x="12" y="63" width="56" height="46" rx="13"/><rect x="12" y="118" width="56" height="46" rx="13"/>
        <rect x="522" y="8" width="56" height="46" rx="13"/><rect x="522" y="63" width="56" height="46" rx="13"/><rect x="522" y="118" width="56" height="46" rx="13"/>
        <rect x="245" y="45" width="100" height="82" rx="20" fill="#fbfaf7"/>
      </g>
      <g stroke="#6559ee" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="40" cy="23" rx="10" ry="4"/><path d="M30 23v14c0 2 4 4 10 4s10-2 10-4V23M30 30c0 2 4 4 10 4s10-2 10-4"/>
        <path d="M29 85c3-7 8-10 13-6 7-6 16 0 16 7 0 5-4 8-9 8H31c-5 0-8-4-8-8 0-4 3-7 6-7"/>
        <rect x="27" y="128" width="26" height="20" rx="3"/><path d="M31 133h18M31 139h18"/>
        <path d="M535 40l7-7 6 6 10-12M535 45h26"/>
        <circle cx="550" cy="79" r="5"/><path d="M541 97v-2a8 8 0 0 1 18 0v2M538 93v-1a5 5 0 0 1 5-5M562 93v-1a5 5 0 0 0-5-5"/>
        <path d="M539 140l7-7M539 133l7 7M554 133l7 7M554 140l7-7"/>
      </g>
      <g fill="url(#vaCore)"><path d="M273 67h15l8 21 9-21h15l-22 38h-4z"/></g>
      <g fill="#6559ee"><circle cx="245" cy="69" r="3"/><circle cx="245" cy="86" r="3"/><circle cx="245" cy="103" r="3"/><circle cx="345" cy="69" r="3"/><circle cx="345" cy="86" r="3"/><circle cx="345" cy="103" r="3"/></g>
    </svg>
  </div>`;

  const findCard=(titleEl)=>{
    let node=titleEl;
    for(let i=0;i<6&&node.parentElement;i++,node=node.parentElement){
      const r=node.getBoundingClientRect();
      const t=norm(node.textContent);
      if(r.width>240&&r.height>170&&r.width<700&&t.includes(titleEl.textContent.trim()))return node;
    }
    return titleEl.parentElement;
  };

  const findTopContainer=(heading,copy,cardTitle)=>{
    let node=heading.parentElement;
    while(node&&node!==document.body){
      if(node.contains(copy)&&(!cardTitle||!node.contains(cardTitle)))return node;
      node=node.parentElement;
    }
    return null;
  };

  const apply=()=>{
    const heading=exact(HEADING);
    const copy=exact(COPY);
    const firstCardTitle=exact(TITLES[0]);
    if(!heading||!copy)return false;

    heading.classList.add('viiv-about-heading-live');
    heading.innerHTML='<span class="viiv-about-brand-live">VIIVERSION —</span> <span>команда разработчиков с опытом в сложных IT-системах, цифровых продуктах и визуальных коммуникациях.</span>';
    copy.classList.add('viiv-about-copy-live');

    const top=findTopContainer(heading,copy,firstCardTitle);
    if(top&&!top.classList.contains('viiv-about-top-live')){
      top.classList.add('viiv-about-top-live');
      const mid=document.createElement('div');
      mid.className='viiv-about-mid-live';
      mid.innerHTML=diagram;
      mid.appendChild(copy);
      top.replaceChildren(heading,mid);
    } else if(!document.querySelector('.viiv-about-diagram-live')){
      const mid=document.createElement('div');
      mid.className='viiv-about-mid-live';
      mid.innerHTML=diagram;
      heading.insertAdjacentElement('afterend',mid);
      mid.appendChild(copy);
    }

    TITLES.forEach(text=>{
      const title=exact(text);
      if(!title)return;
      title.classList.add('viiv-about-card-title-live');
      const card=findCard(title);
      if(card)card.classList.add('viiv-about-card-live');
    });
    return true;
  };

  const start=()=>{
    if(apply())return;
    const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    setTimeout(()=>{apply();observer.disconnect()},5000);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    for marker in ('<style id="viiversion-about-redesign-style">', '<style id="viiversion-about-live-style">'):
        if marker in text:
            start = text.index(marker)
            script_end = text.find('</script>', start)
            if script_end != -1:
                text = text[:start] + text[script_end + len('</script>'):]
    if '</body>' in text:
        text = text.replace('</body>', PATCH + '\n</body>', 1)
    else:
        text += '\n' + PATCH + '\n'
    path.write_text(text, encoding='utf-8')
