from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-about-tags-v2-style">
.viiv-about-card-title-live{
  color:#111217!important;
  -webkit-text-fill-color:#111217!important;
  background:none!important;
}
.viiv-about-tags-live{
  display:block!important;
  margin-top:18px!important;
}
.viiv-about-tag-group-live{
  display:flex!important;
  flex-wrap:wrap!important;
  gap:8px!important;
}
.viiv-about-tag-group-live + .viiv-about-tag-group-live{
  margin-top:12px!important;
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
.viiv-about-project-tag-live{
  border-color:rgba(101,89,238,.58)!important;
  background:rgba(101,89,238,.035)!important;
  color:#5148c7!important;
  box-shadow:inset 0 0 0 1px rgba(101,89,238,.04)!important;
}
.viiv-about-skill-tag-live{
  border-color:rgba(17,18,23,.12)!important;
  background:rgba(255,255,255,.52)!important;
  color:#303139!important;
}
@media(max-width:640px){
  .viiv-about-tags-live{margin-top:16px!important}
  .viiv-about-tag-group-live{gap:7px!important}
  .viiv-about-tag-group-live + .viiv-about-tag-group-live{margin-top:10px!important}
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

  const PROJECTS=['MegaFon','Tele2 Kazakhstan','Saudi Telecom Company','UCELL'];
  const TELECOM_SKILLS=[
    'Telecom BSS','Revenue Assurance','Fraud Management','Oracle','PL/SQL','PostgreSQL','ETL','CDR Processing','ASN.1',
    'Unix/Linux','Bash','REST API','JSON/XML','curl','Postman','SQL','Data Reconciliation','L2/L3 Support','System Integration','Jira','Confluence'
  ];
  const DIGITAL_SKILLS=[
    'Product Analytics','Information Architecture','Technical Scenarios','Product Design','UX/UI','User Flows','Motion Design','Graphic Design','Video','Content Design'
  ];
  const TEAM_SKILLS=[
    'Web Development','Telegram Mini Apps','Bots','CRM','AI Integration','Automation','API Integrations','Admin Panels','Dashboards','Data & Analytics','Payment Integrations','Cloud Deployment','Prototyping'
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

  const tagsMarkup=(items,extraClass='')=>items.map(tag=>`<span class="viiv-about-tag-live ${extraClass}">${tag}</span>`).join('');

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

      if(i===0){
        box.innerHTML=`
          <div class="viiv-about-tag-group-live viiv-about-projects-live">${tagsMarkup(PROJECTS,'viiv-about-project-tag-live')}</div>
          <div class="viiv-about-tag-group-live viiv-about-skills-live">${tagsMarkup(TELECOM_SKILLS,'viiv-about-skill-tag-live')}</div>`;
      } else if(i===1){
        box.innerHTML=`<div class="viiv-about-tag-group-live">${tagsMarkup(DIGITAL_SKILLS,'viiv-about-skill-tag-live')}</div>`;
      } else {
        box.innerHTML=`<div class="viiv-about-tag-group-live">${tagsMarkup(TEAM_SKILLS,'viiv-about-skill-tag-live')}</div>`;
      }
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
