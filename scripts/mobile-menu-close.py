from pathlib import Path

ROOT = Path('public')

PATCH = r'''<script id="viiversion-mobile-menu-close-script">
(()=>{
  const MOBILE='(max-width:720px)';
  const isMobile=()=>window.matchMedia(MOBILE).matches;
  const visible=el=>{
    if(!el)return false;
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    return s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'&&r.width>0&&r.height>0;
  };
  const norm=v=>(v||'').replace(/\s+/g,' ').trim();
  const isLangControl=el=>{
    if(!el)return false;
    if(el.closest('.langs'))return true;
    const t=norm(el.textContent).toUpperCase();
    return t==='RU'||t==='EN'||t==='VI';
  };
  const getHeader=()=>document.querySelector('.viiv-mobile-sticky-header,header')||document.querySelector('[role="banner"]');

  const candidateScore=btn=>{
    if(!visible(btn)||isLangControl(btn))return -100;
    const bits=[btn.id,btn.className,btn.getAttribute('aria-label'),btn.getAttribute('title'),btn.getAttribute('aria-controls')].join(' ').toLowerCase();
    let score=0;
    if(btn.getAttribute('aria-expanded')!==null)score+=12;
    if(/menu|nav|burger|hamburger|toggle|drawer/.test(bits))score+=10;
    if(btn.querySelector('svg'))score+=3;
    const r=btn.getBoundingClientRect();
    if(r.width>=28&&r.width<=76&&r.height>=28&&r.height<=76)score+=2;
    if(norm(btn.textContent).length===0)score+=1;
    return score;
  };

  const getToggle=()=>{
    const h=getHeader();
    if(!h)return null;
    const buttons=[...h.querySelectorAll('button,[role="button"],[aria-controls]')]
      .filter(el=>!isLangControl(el));
    buttons.sort((a,b)=>candidateScore(b)-candidateScore(a));
    return buttons[0]&&candidateScore(buttons[0])>0?buttons[0]:null;
  };

  const openPanel=()=>{
    const h=getHeader();
    if(!h)return null;
    const selectors='nav,[role="navigation"],.mobile-menu,.mobile-nav,.nav-menu,.menu-panel,.menu-drawer,.drawer';
    const panels=[...h.querySelectorAll(selectors)].filter(el=>{
      if(!visible(el))return false;
      const r=el.getBoundingClientRect(),s=getComputedStyle(el);
      const links=el.querySelectorAll('a,button').length;
      const state=(el.className||'').toString().toLowerCase();
      return links>=2&&(
        /(^|\s)(open|active|show|visible|expanded|is-open)(\s|$)/.test(state)||
        r.height>110||
        ((s.position==='fixed'||s.position==='absolute')&&r.width>window.innerWidth*.55&&r.height>70)
      );
    });
    return panels[0]||null;
  };

  const isOpen=()=>{
    if(!isMobile())return false;
    const toggle=getToggle();
    if(toggle?.getAttribute('aria-expanded')==='true')return true;
    const roots=[document.documentElement,document.body,getHeader(),toggle].filter(Boolean);
    if(roots.some(el=>/(menu|nav|drawer)[-_ ]?(open|active)|(^|\s)(menu-open|nav-open|drawer-open|is-open)(\s|$)/i.test((el.className||'').toString())))return true;
    return !!openPanel();
  };

  let closing=false;
  const closeMenu=(assumeOpen=false)=>{
    if(!isMobile()||closing)return false;
    const toggle=getToggle();
    if(!toggle)return false;
    if(!assumeOpen&&!isOpen())return false;
    closing=true;
    try{toggle.click()}catch(_){ }
    setTimeout(()=>{closing=false},120);
    return true;
  };

  // Selecting any real navigation item should immediately dismiss the mobile menu.
  document.addEventListener('click',e=>{
    if(!isMobile())return;
    const item=e.target.closest?.('nav a,[role="navigation"] a,.mobile-menu a,.mobile-nav a,.nav-menu a,.menu-panel a,.menu-drawer a,.drawer a');
    if(!item)return;
    if(isLangControl(item))return;
    const panel=item.closest('nav,[role="navigation"],.mobile-menu,.mobile-nav,.nav-menu,.menu-panel,.menu-drawer,.drawer');
    const panelLooksOpen=panel&&visible(panel)&&(panel.getBoundingClientRect().height>70||isOpen());
    if(panelLooksOpen)setTimeout(()=>closeMenu(true),0);
  },true);

  // Tapping outside an open menu closes it as expected on mobile.
  document.addEventListener('pointerdown',e=>{
    if(!isMobile()||!isOpen())return;
    const h=getHeader(),panel=openPanel(),toggle=getToggle();
    const t=e.target;
    if(toggle?.contains(t))return;
    if(panel?.contains(t))return;
    if(h&&h.contains(t)&&!panel)return;
    closeMenu(true);
  },true);

  // Escape is useful for external keyboards and accessibility testing.
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&isOpen())closeMenu(true);
  });

  // If navigation changes the hash through native handlers, ensure no stale overlay remains.
  window.addEventListener('hashchange',()=>setTimeout(()=>closeMenu(false),0));
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    marker = '<script id="viiversion-mobile-menu-close-script">'
    while marker in text:
        start = text.index(marker)
        end = text.find('</script>', start)
        if end == -1:
            break
        text = text[:start] + text[end + len('</script>'):]
    if '</body>' in text:
        text = text.replace('</body>', PATCH + '\n</body>', 1)
    else:
        text += '\n' + PATCH + '\n'
    path.write_text(text, encoding='utf-8')
