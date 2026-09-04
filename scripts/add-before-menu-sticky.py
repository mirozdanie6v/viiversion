from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-before-menu-sticky-style">
.viiv-before-menu-link{cursor:pointer}
@media(max-width:720px){
  .viiv-mobile-sticky-header{
    position:fixed!important;
    top:0!important;
    right:0!important;
    bottom:auto!important;
    left:0!important;
    width:100%!important;
    z-index:2147483000!important;
    transform:none!important;
    translate:none!important;
    opacity:1!important;
    visibility:visible!important;
    pointer-events:auto!important;
    background:rgba(255,255,255,.94)!important;
    -webkit-backdrop-filter:blur(18px) saturate(1.25)!important;
    backdrop-filter:blur(18px) saturate(1.25)!important;
    border-bottom:1px solid rgba(22,25,40,.08)!important;
    box-shadow:0 8px 28px rgba(22,25,40,.07)!important;
  }
  .viiv-mobile-header-spacer{
    display:block!important;
    width:100%!important;
    height:var(--viiv-mobile-header-height,72px)!important;
    min-height:var(--viiv-mobile-header-height,72px)!important;
    pointer-events:none!important;
  }
  html{
    scroll-padding-top:calc(var(--viiv-mobile-header-height,72px) + 14px)!important;
  }
  #before,
  [data-viiv-before-development="true"]{
    scroll-margin-top:calc(var(--viiv-mobile-header-height,72px) + 14px)!important;
  }
}
@media(min-width:721px){
  .viiv-mobile-header-spacer{display:none!important}
}
</style>
<script id="viiversion-before-menu-sticky-script">
(()=>{
  const LABELS={ru:'До разработки',en:'Before development',vi:'Trước phát triển'};
  const norm=v=>(v||'').replace(/\s+/g,' ').trim();
  const valid=new Set(['ru','en','vi']);
  let header=null;
  let spacer=null;
  let raf=0;

  const currentLang=()=>{
    let lang='';
    try{lang=(localStorage.getItem('bl-lang')||'').toLowerCase()}catch(_){ }
    if(!valid.has(lang)) lang=(document.documentElement.lang||'').toLowerCase().slice(0,2);
    return valid.has(lang)?lang:'ru';
  };

  const findBeforeSection=()=>{
    let section=document.getElementById('before');
    if(!section){
      const heading=document.getElementById('beforeH')||[...document.querySelectorAll('h1,h2,h3,[role="heading"]')].find(el=>{
        const t=norm(el.textContent).toLowerCase();
        return t.includes('мы начинаем ещё до разработки')||t.includes('мы начинаем еще до разработки')||t.includes('before development')||t.includes('trước khi phát triển');
      });
      if(heading){
        section=heading.closest('section,.section')||heading.parentElement;
        if(section&&!section.id)section.id='before';
      }
    }
    if(section)section.dataset.viivBeforeDevelopment='true';
    return section;
  };

  const menuBases=()=>{
    const nodes=[...document.querySelectorAll('a[href="#who"],.viiv-about-menu-link,[data-viiv-about-menu]')];
    if(nodes.length)return nodes;
    return [...document.querySelectorAll('nav a,nav button,[role="navigation"] a,[role="navigation"] button')].filter(el=>{
      const t=norm(el.textContent).toLowerCase();
      return t==='о нас'||t==='about'||t==='giới thiệu';
    });
  };

  const addMenuLinks=()=>{
    const section=findBeforeSection();
    if(!section)return false;
    let added=false;
    const bases=menuBases();
    const parents=[];
    bases.forEach(base=>{if(base.parentElement&&!parents.includes(base.parentElement))parents.push(base.parentElement)});

    parents.forEach(parent=>{
      if(parent.querySelector(':scope > [data-viiv-before-menu="true"]'))return;
      const base=[...parent.children].find(el=>el.matches?.('a[href="#who"],.viiv-about-menu-link,[data-viiv-about-menu]'))||bases.find(x=>x.parentElement===parent);
      const link=document.createElement('a');
      link.href='#before';
      link.className=((base&&base.className)||'').toString();
      link.classList.add('viiv-before-menu-link');
      link.dataset.viivBeforeMenu='true';
      link.textContent=LABELS[currentLang()];
      link.addEventListener('click',e=>{
        e.preventDefault();
        const target=findBeforeSection();
        if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
      });
      if(base&&base.nextSibling)parent.insertBefore(link,base.nextSibling);else parent.appendChild(link);
      added=true;
    });

    if(!parents.length){
      const nav=document.querySelector('header nav,header [role="navigation"],nav,[role="navigation"]');
      if(nav&&!nav.querySelector('[data-viiv-before-menu="true"]')){
        const link=document.createElement('a');
        link.href='#before';
        link.className='viiv-before-menu-link';
        link.dataset.viivBeforeMenu='true';
        link.textContent=LABELS[currentLang()];
        link.addEventListener('click',e=>{e.preventDefault();findBeforeSection()?.scrollIntoView({behavior:'smooth',block:'start'})});
        nav.appendChild(link);
        added=true;
      }
    }
    return added||document.querySelector('[data-viiv-before-menu="true"]');
  };

  const renderMenuLabel=(lang=currentLang())=>{
    document.querySelectorAll('[data-viiv-before-menu="true"]').forEach(el=>el.textContent=LABELS[lang]||LABELS.ru);
  };

  const findHeader=()=>{
    const direct=document.querySelector('header');
    if(direct)return direct;
    const langBox=document.querySelector('.langs');
    if(langBox){
      let n=langBox;
      for(let i=0;i<7&&n.parentElement;i++,n=n.parentElement){
        const r=n.getBoundingClientRect();
        const controls=n.querySelectorAll('a,button').length;
        if(r.width>Math.min(window.innerWidth*.72,760)&&r.height>36&&r.height<180&&controls>=3)return n;
      }
    }
    const about=menuBases()[0];
    if(about){
      let n=about.parentElement;
      for(let i=0;i<7&&n;i++,n=n.parentElement){
        const r=n.getBoundingClientRect();
        if(r.width>Math.min(window.innerWidth*.72,760)&&r.height>36&&r.height<180)return n;
      }
    }
    return null;
  };

  const setupSticky=()=>{
    const mobile=window.matchMedia('(max-width:720px)').matches;
    const next=findHeader();
    if(next!==header){
      if(header)header.classList.remove('viiv-mobile-sticky-header');
      header=next;
      spacer=null;
    }
    if(!header)return false;
    if(!mobile){
      header.classList.remove('viiv-mobile-sticky-header');
      if(spacer)spacer.style.display='none';
      return true;
    }

    const prePosition=getComputedStyle(header).position;
    header.classList.add('viiv-mobile-sticky-header');
    const h=Math.max(52,Math.ceil(header.getBoundingClientRect().height));
    document.documentElement.style.setProperty('--viiv-mobile-header-height',h+'px');
    header.style.setProperty('top','0','important');
    header.style.setProperty('transform','none','important');
    header.style.setProperty('opacity','1','important');
    header.style.setProperty('visibility','visible','important');

    if(prePosition!=='fixed'){
      spacer=header.nextElementSibling?.classList?.contains('viiv-mobile-header-spacer')?header.nextElementSibling:null;
      if(!spacer){
        spacer=document.createElement('div');
        spacer.className='viiv-mobile-header-spacer';
        spacer.setAttribute('aria-hidden','true');
        header.insertAdjacentElement('afterend',spacer);
      }
      spacer.style.setProperty('height',h+'px','important');
      spacer.style.setProperty('min-height',h+'px','important');
      spacer.style.display='block';
    }
    return true;
  };

  const refresh=()=>{
    addMenuLinks();
    renderMenuLabel();
    setupSticky();
  };
  const schedule=()=>{
    if(raf)cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{raf=0;refresh()});
  };

  const start=()=>{
    refresh();
    [80,220,520,1000].forEach(ms=>setTimeout(refresh,ms));
  };

  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('.langs button');
    if(!btn)return;
    const txt=norm(btn.textContent).toUpperCase();
    const lang=txt==='EN'?'en':txt==='VI'?'vi':txt==='RU'?'ru':null;
    if(!lang)return;
    [0,80,220,520].forEach(ms=>setTimeout(()=>{addMenuLinks();renderMenuLabel(lang);setupSticky()},ms));
  },true);

  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(refresh,120),{passive:true});
  window.addEventListener('storage',e=>{if(e.key==='bl-lang')setTimeout(refresh,0)});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    marker = '<style id="viiversion-before-menu-sticky-style">'
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
