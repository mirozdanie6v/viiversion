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

PATCH = r'''<style id="viiversion-about-redesign-style">
.viiv-about-shell{max-width:1240px;margin:0 auto;padding:88px 28px 96px;color:#111217}
.viiv-about-kicker{display:flex;align-items:center;gap:12px;margin-bottom:30px;font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#6559ee}
.viiv-about-kicker:before{content:'';width:42px;height:2px;border-radius:999px;background:linear-gradient(90deg,#6559ee,#8b6cf4)}
.viiv-about-top{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr);gap:70px;align-items:start}
.viiv-about-title{margin:0;max-width:720px;line-height:.98;letter-spacing:-.05em;color:#111217}
.viiv-about-brand{display:block;margin-bottom:12px;font-size:clamp(52px,5vw,78px);font-weight:850;line-height:.92;letter-spacing:-.06em;background:linear-gradient(90deg,#5f5cf6 0%,#6d4fe6 58%,#7b57ef 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
.viiv-about-rest{display:block;font-size:clamp(31px,2.75vw,46px);font-weight:800;line-height:1.02;letter-spacing:-.045em}
.viiv-about-copy{padding-top:56px;font-size:clamp(19px,1.45vw,24px);line-height:1.48;color:#5f616b;max-width:560px}
.viiv-about-diagram{margin-top:42px;width:min(100%,590px);height:170px;position:relative}
.viiv-about-diagram svg{width:100%;height:100%;display:block;overflow:visible}
.viiv-about-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:46px}
.viiv-about-card{min-height:275px;padding:30px 28px 28px;border:1px solid rgba(31,33,45,.11);border-radius:24px;background:rgba(255,255,255,.24);box-shadow:inset 0 1px 0 rgba(255,255,255,.72)}
.viiv-about-card-head{display:flex;align-items:center;gap:15px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid rgba(31,33,45,.08)}
.viiv-about-icon{width:48px;height:48px;flex:0 0 48px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,rgba(99,88,246,.10),rgba(100,191,232,.10));border:1px solid rgba(99,88,246,.13);color:#6559ee}
.viiv-about-icon svg{width:23px;height:23px}
.viiv-about-card h3{margin:0;font-size:clamp(22px,1.7vw,30px);line-height:1.08;letter-spacing:-.035em;font-weight:800;color:#6559ee}
.viiv-about-card p{margin:0;font-size:17px;line-height:1.48;color:#5f616b}
@media(max-width:1000px){.viiv-about-top{grid-template-columns:1fr;gap:18px}.viiv-about-copy{padding-top:0;max-width:760px}.viiv-about-diagram{margin-top:30px}.viiv-about-cards{grid-template-columns:1fr}.viiv-about-card{min-height:0}.viiv-about-shell{padding-top:72px}}
@media(max-width:640px){.viiv-about-shell{padding:64px 20px 72px}.viiv-about-brand{font-size:48px}.viiv-about-rest{font-size:32px;line-height:1.04}.viiv-about-copy{font-size:18px}.viiv-about-diagram{height:145px;margin-top:24px}.viiv-about-card{padding:24px 22px;border-radius:20px}.viiv-about-card h3{font-size:24px}}
</style>
<script id="viiversion-about-redesign-patch">
(()=>{
 const norm=v=>(v||'').replace(/\s+/g,' ').trim();
 const findRoot=()=>{
   const marker=[...document.querySelectorAll('body *')].find(el=>norm(el.textContent)==='КТО МЫ');
   if(!marker)return null;
   const section=marker.closest('section');
   if(section)return section;
   let node=marker;
   for(let i=0;i<8&&node.parentElement;i++,node=node.parentElement){
     const t=norm(node.textContent);
     if(t.includes('20+ лет')&&t.includes('16+ лет'))return node;
   }
   return marker.parentElement;
 };
 const icon1='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V10h6v11M10 21V4h6v17M16 21v-8h4v8M2 21h20"/></svg>';
 const icon2='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="12" height="12" rx="2"/><circle cx="16.5" cy="15.5" r="4.5"/></svg>';
 const icon3='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"/><circle cx="12" cy="7" r="3"/><path d="M3 18v-1a3 3 0 0 1 3-3M21 18v-1a3 3 0 0 0-3-3"/></svg>';
 const markup=`<div class="viiv-about-shell">
   <div class="viiv-about-kicker">КТО МЫ</div>
   <div class="viiv-about-top">
     <div>
       <h2 class="viiv-about-title"><span class="viiv-about-brand">VIIVERSION</span><span class="viiv-about-rest">команда разработчиков с опытом в сложных IT-системах, цифровых продуктах и визуальных коммуникациях.</span></h2>
       <div class="viiv-about-diagram" aria-hidden="true">
         <svg viewBox="0 0 590 170">
           <defs>
             <linearGradient id="viivLine" x1="0" x2="1"><stop offset="0" stop-color="#9aa0ad" stop-opacity=".42"/><stop offset=".52" stop-color="#6559ee" stop-opacity=".72"/><stop offset="1" stop-color="#79c7ee" stop-opacity=".52"/></linearGradient>
             <linearGradient id="viivCore" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6559ee"/><stop offset="1" stop-color="#7c63f2"/></linearGradient>
           </defs>
           <g fill="none" stroke="url(#viivLine)" stroke-width="1.4">
             <path d="M62 31 C150 31 163 72 248 72"/><path d="M62 85 C153 85 171 85 248 85"/><path d="M62 139 C150 139 163 98 248 98"/>
             <path d="M342 72 C430 72 438 31 528 31"/><path d="M342 85 C430 85 440 85 528 85"/><path d="M342 98 C430 98 438 139 528 139"/>
           </g>
           <g fill="#f8f7f2" stroke="#d9d8dd">
             <rect x="13" y="8" width="54" height="46" rx="13"/><rect x="13" y="62" width="54" height="46" rx="13"/><rect x="13" y="116" width="54" height="46" rx="13"/>
             <rect x="523" y="8" width="54" height="46" rx="13"/><rect x="523" y="62" width="54" height="46" rx="13"/><rect x="523" y="116" width="54" height="46" rx="13"/>
             <rect x="248" y="47" width="94" height="76" rx="19" fill="#fbfaf7"/>
           </g>
           <g stroke="#6559ee" stroke-width="2" fill="none" stroke-linecap="round">
             <ellipse cx="40" cy="24" rx="10" ry="4"/><path d="M30 24v14c0 2 4 4 10 4s10-2 10-4V24M30 31c0 2 4 4 10 4s10-2 10-4"/>
             <path d="M29 84c3-7 8-10 13-6 7-6 16 0 16 7 0 5-4 8-9 8H31c-5 0-8-4-8-8 0-4 3-7 6-7"/>
             <rect x="27" y="126" width="26" height="20" rx="3"/><path d="M31 131h18M31 137h18"/>
             <path d="M535 39l7-7 6 6 10-12"/><path d="M535 44h26"/>
             <circle cx="550" cy="79" r="5"/><path d="M541 96v-2a8 8 0 0 1 18 0v2M538 92v-1a5 5 0 0 1 5-5M562 92v-1a5 5 0 0 0-5-5"/>
             <path d="M539 139l7-7M539 132l7 7M554 132l7 7M554 139l7-7"/>
           </g>
           <g fill="url(#viivCore)"><path d="M276 70h13l8 20 8-20h13l-20 34h-3z"/></g>
           <circle cx="248" cy="72" r="3" fill="#6559ee"/><circle cx="248" cy="85" r="3" fill="#6559ee"/><circle cx="248" cy="98" r="3" fill="#6559ee"/><circle cx="342" cy="72" r="3" fill="#6559ee"/><circle cx="342" cy="85" r="3" fill="#6559ee"/><circle cx="342" cy="98" r="3" fill="#6559ee"/>
         </svg>
       </div>
     </div>
     <div class="viiv-about-copy">Мы создаём интеграционные связки между отдельными системами бизнеса, цифровые контуры между офлайн- и онлайн-процессами, автоматизируем ручные и повторяющиеся операции, разрабатываем внутренние инструменты, клиентские приложения и интерфейсы для команды.</div>
   </div>
   <div class="viiv-about-cards">
     <article class="viiv-about-card"><div class="viiv-about-card-head"><span class="viiv-about-icon">${icon1}</span><h3>20+ лет в IT и telecom</h3></div><p>Разработка и внедрение сложных систем для крупных российских и международных компаний, включая телеком-операторов и enterprise-проекты.</p></article>
     <article class="viiv-about-card"><div class="viiv-about-card-head"><span class="viiv-about-icon">${icon2}</span><h3>16+ лет в digital и визуальных коммуникациях</h3></div><p>Дизайн, видео, motion, интерфейсы, контент и визуальная подача цифровых продуктов — от идеи до готового пользовательского опыта.</p></article>
     <article class="viiv-about-card"><div class="viiv-about-card-head"><span class="viiv-about-icon">${icon3}</span><h3>Техническая и визуальная экспертиза в одной команде</h3></div><p>Разработка, архитектура, UX/UI и визуальная коммуникация соединены в одном процессе — от бизнес-задачи до готового цифрового продукта.</p></article>
   </div>
 </div>`;
 const apply=()=>{if(document.querySelector('.viiv-about-shell'))return true;const root=findRoot();if(!root)return false;root.innerHTML=markup;root.style.padding='0';return true};
 const start=()=>{if(apply())return;setTimeout(apply,100);setTimeout(apply,300);setTimeout(apply,700)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    marker = '<style id="viiversion-about-redesign-style">'
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
