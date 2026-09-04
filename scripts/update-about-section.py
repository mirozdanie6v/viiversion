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
.viiv-about-heading-live{width:100%!important;max-width:none!important;margin:0!important;font-size:clamp(30px,2.3vw,40px)!important;line-height:1.04!important;letter-spacing:-.045em!important;font-weight:800!important;color:#111217!important}
.viiv-about-brand-live{display:inline!important;font-size:1.16em!important;line-height:inherit!important;letter-spacing:-.055em!important;font-weight:850!important;background:linear-gradient(90deg,#5f5cf6 0%,#6d4fe6 58%,#7b57ef 100%);-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent}
.viiv-about-copy-live{display:block!important;width:100%!important;max-width:none!important;margin:30px 0 0!important;padding:0!important;font-size:clamp(18px,1.35vw,22px)!important;line-height:1.5!important;color:#62636d!important}
.viiv-about-card-live{border:1px solid rgba(30,31,41,.11)!important;border-radius:24px!important;background:rgba(255,255,255,.20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.74)!important;padding-top:28px!important}
.viiv-about-card-title-live{color:var(--viiv-about-green)!important;font-weight:800!important;letter-spacing:-.035em!important;line-height:1.08!important}
.viiv-about-card-live::before{content:'';display:block;width:42px;height:3px;border-radius:999px;margin:0 0 18px 0;background:var(--viiv-about-green);opacity:.92}
@media(max-width:1180px){.viiv-about-heading-live{font-size:clamp(29px,2.7vw,37px)!important}.viiv-about-copy-live{font-size:19px!important}}
@media(max-width:900px){.viiv-about-heading-live{font-size:clamp(29px,4.4vw,36px)!important;line-height:1.05!important}.viiv-about-copy-live{margin-top:24px!important;font-size:18px!important}}
@media(max-width:640px){.viiv-about-heading-live{font-size:27px!important;line-height:1.07!important;letter-spacing:-.035em!important}.viiv-about-brand-live{font-size:1.08em!important}.viiv-about-copy-live{margin-top:20px!important;font-size:17px!important;line-height:1.48!important}.viiv-about-card-live{border-radius:20px!important;padding-top:24px!important}.viiv-about-card-title-live{font-size:24px!important}}
@media(max-width:390px){.viiv-about-heading-live{font-size:24px!important}.viiv-about-copy-live{font-size:16px!important}.viiv-about-card-title-live{font-size:22px!important}}
</style>
<script id="viiversion-about-live-patch">
(()=>{
  const norm=v=>(v||'').replace(/\s+/g,' ').trim();
  const HEADING='VIIVERSION — команда разработчиков с опытом в сложных IT-системах, цифровых продуктах и визуальных коммуникациях.';
  const COPY='Мы создаём интеграционные связки между отдельными системами бизнеса, цифровые контуры между офлайн- и онлайн-процессами, автоматизируем ручные и повторяющиеся операции, разрабатываем внутренние инструменты, клиентские приложения и интерфейсы для команды.';
  const TITLES=['20+ лет в IT и telecom','16+ лет в digital и визуальных коммуникациях','Техническая и визуальная экспертиза в одной команде'];
  const exact=text=>[...document.querySelectorAll('body *')].filter(el=>norm(el.textContent)===text).sort((a,b)=>a.children.length-b.children.length)[0]||null;
  const findCard=titleEl=>{let node=titleEl;for(let i=0;i<6&&node.parentElement;i++,node=node.parentElement){const r=node.getBoundingClientRect();const t=norm(node.textContent);if(r.width>240&&r.height>170&&r.width<700&&t.includes(titleEl.textContent.trim()))return node}return titleEl.parentElement};
  const findTop=(heading,copy,firstCard)=>{let node=heading.parentElement;while(node&&node!==document.body){if(node.contains(copy)&&(!firstCard||!node.contains(firstCard)))return node;node=node.parentElement}return null};
  const apply=()=>{
    const heading=exact(HEADING),copy=exact(COPY),firstCard=exact(TITLES[0]);
    if(!heading||!copy)return false;
    heading.classList.add('viiv-about-heading-live');
    heading.innerHTML='<span class="viiv-about-brand-live">VIIVERSION —</span> <span>команда разработчиков с опытом в сложных IT-системах, цифровых продуктах и визуальных коммуникациях.</span>';
    copy.classList.add('viiv-about-copy-live');
    const oldDiagram=document.querySelector('.viiv-about-diagram-live');if(oldDiagram)oldDiagram.remove();
    const top=findTop(heading,copy,firstCard);
    if(top){top.classList.add('viiv-about-top-live');top.replaceChildren(heading,copy)}
    TITLES.forEach(text=>{const title=exact(text);if(!title)return;title.classList.add('viiv-about-card-title-live');const card=findCard(title);if(card)card.classList.add('viiv-about-card-live')});
    return true;
  };
  const start=()=>{if(apply())return;const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});observer.observe(document.body,{subtree:true,childList:true,characterData:true});setTimeout(()=>{apply();observer.disconnect()},5000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    marker = '<style id="viiversion-about-live-style">'
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
