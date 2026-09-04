from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-about-tags-v2-style">
.viiv-about-card-title-live{
  color:#111217!important;
  -webkit-text-fill-color:#111217!important;
  background:none!important;
}
.viiv-about-tags-live{
  display:flex!important;
  flex-wrap:wrap!important;
  gap:8px!important;
  margin-top:18px!important;
}
.viiv-about-tag-live{
  display:inline-flex!important;
  align-items:center!important;
  min-height:30px!important;
  padding:6px 11px!important;
  border:1px solid rgba(17,18,23,.12)!important;
  border-radius:999px!important;
  background:rgba(255,255,255,.48)!important;
  color:#303139!important;
  font-size:12px!important;
  line-height:1!important;
  font-weight:700!important;
  letter-spacing:.01em!important;
  white-space:nowrap!important;
}
@media(max-width:640px){
  .viiv-about-tags-live{gap:7px!important;margin-top:16px!important}
  .viiv-about-tag-live{font-size:11px!important;min-height:28px!important;padding:6px 10px!important}
}
</style>
<script id="viiversion-about-tags-v2">
(()=>{
  const norm=v=>(v||'').replace(/\s+/g,' ').trim();
  const TITLES=[
    ['20+ лет в IT и telecom','20+ years in IT & telecom','Hơn 20 năm trong IT & telecom'],
    ['16+ лет в digital и визуальных коммуникациях','16+ years in digital & visual communications','Hơn 16 năm trong digital & truyền thông thị giác'],
    ['Техническая и визуальная экспертиза в одной команде','Technical and visual expertise in one team','Chuyên môn kỹ thuật và thị giác trong một đội ngũ']
  ];
  const TAGS=[
    ['MegaFon','Tele2 Kazakhstan','Saudi Telecom Company','UCELL'],
    ['Product Analytics','Information Architecture','Technical Scenarios','Product Design','UX/UI','User Flows','Motion Design','Graphic Design','Video','Content Design'],
    ['Web Development','Telegram Mini Apps','Bots','CRM','AI Integration','Automation','API Integrations','Admin Panels','Dashboards','Data & Analytics','Payment Integrations','Cloud Deployment','Prototyping']
  ];

  const exact=(texts)=>[...document.querySelectorAll('body *')]
    .filter(el=>texts.includes(norm(el.textContent)))
    .sort((a,b)=>a.children.length-b.children.length)[0]||null;

  const findCard=(title)=>{
    let n=title;
    for(let i=0;i<7&&n.parentElement;i++,n=n.parentElement){
      const r=n.getBoundingClientRect();
      if(r.width>220&&r.height>150&&r.width<780)return n;
    }
    return title.parentElement;
  };

  const render=()=>{
    let found=0;
    TITLES.forEach((variants,i)=>{
      const title=exact(variants);
      if(!title)return;
      found++;
      title.classList.add('viiv-about-card-title-live');
      const card=findCard(title);
      if(!card)return;
      let box=card.querySelector('.viiv-about-tags-live');
      if(!box){
        box=document.createElement('div');
        box.className='viiv-about-tags-live';
        card.appendChild(box);
      }
      box.innerHTML=TAGS[i].map(tag=>`<span class="viiv-about-tag-live">${tag}</span>`).join('');
    });
    return found>0;
  };

  const run=()=>{
    render();
    setTimeout(render,120);
    setTimeout(render,420);
  };

  document.addEventListener('click',e=>{
    const el=e.target&&e.target.closest?e.target.closest('button,a,[role="button"]'):null;
    if(!el)return;
    const v=norm(el.textContent).toUpperCase();
    if(v==='RU'||v==='EN'||v==='VI')setTimeout(run,80);
  },false);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    marker = '<style id="viiversion-about-tags-v2-style">'
    while marker in text:
        start = text.index(marker)
        script_end = text.find('</script>', start)
        if script_end == -1:
            break
        text = text[:start] + text[script_end + len('</script>'):]
    if '</body>' in text:
        text = text.replace('</body>', PATCH + '\n</body>', 1)
    else:
        text += '\n' + PATCH + '\n'
    path.write_text(text, encoding='utf-8')
