from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-home-visual-style">
.viiv-system-visual{
  position:relative;
  width:108%;
  min-height:560px;
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
.viiv-static-art{
  width:min(100%,590px);
  height:auto;
  display:block;
  overflow:visible;
}
@media(max-width:1150px){
  .viiv-system-visual{width:104%;margin-left:-2%;min-height:520px}
  .viiv-static-art{width:min(100%,540px)}
}
@media(max-width:900px){
  .viiv-system-visual{width:100%;margin-left:0;min-height:440px}
  .viiv-static-art{width:min(92%,490px)}
}

/* Mobile: visual becomes the first element of the hero, above all hero copy. */
@media(max-width:760px){
  .viiv-mobile-hero-layout{
    display:flex!important;
    flex-direction:column!important;
    align-items:stretch!important;
    gap:0!important;
  }
  .viiv-mobile-art-col{
    order:-10!important;
    width:100%!important;
    max-width:100%!important;
    min-width:0!important;
    margin:0!important;
    padding:0!important;
  }
  .viiv-mobile-copy-col{
    order:10!important;
    width:100%!important;
    max-width:100%!important;
    min-width:0!important;
  }
  .viiv-mobile-art-col > *{
    width:100%!important;
    max-width:100%!important;
  }
  .viiv-system-visual{
    width:100%!important;
    min-height:250px!important;
    margin:-18px auto -6px!important;
    padding:0!important;
    place-items:center!important;
    overflow:visible!important;
  }
  .viiv-system-visual::before{
    width:68%!important;
    opacity:.78;
  }
  .viiv-static-art{
    width:min(78vw,340px)!important;
    max-width:340px!important;
    margin:0 auto!important;
  }
}
@media(max-width:480px){
  .viiv-system-visual{min-height:220px!important;margin:-14px auto -8px!important}
  .viiv-static-art{width:min(80vw,310px)!important;max-width:310px!important}
}
@media(max-width:390px){
  .viiv-system-visual{min-height:205px!important;margin:-10px auto -10px!important}
  .viiv-static-art{width:min(82vw,285px)!important;max-width:285px!important}
}
@media(max-width:340px){
  .viiv-system-visual{min-height:190px!important}
  .viiv-static-art{width:min(84vw,260px)!important;max-width:260px!important}
}
</style>
<script id="viiversion-home-visual-patch">
(()=>{
 const norm=v=>(v||'').replace(/\s+/g,' ').trim();
 const markup=`
 <div class="viiv-system-visual" aria-label="VIIVERSION static digital object">
   <svg class="viiv-static-art" viewBox="0 0 620 560" role="img" aria-hidden="true">
     <defs>
       <linearGradient id="vvTop" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#fafaff" stop-opacity=".92"/>
         <stop offset=".55" stop-color="#cbc9ee" stop-opacity=".72"/>
         <stop offset="1" stop-color="#7d75d5" stop-opacity=".52"/>
       </linearGradient>
       <linearGradient id="vvFront" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#aaa5eb" stop-opacity=".88"/>
         <stop offset=".48" stop-color="#7770c9" stop-opacity=".88"/>
         <stop offset="1" stop-color="#3c3e66" stop-opacity=".96"/>
       </linearGradient>
       <linearGradient id="vvSide" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#d8d8f4" stop-opacity=".84"/>
         <stop offset=".45" stop-color="#9ea7dc" stop-opacity=".72"/>
         <stop offset="1" stop-color="#4b526f" stop-opacity=".96"/>
       </linearGradient>
       <linearGradient id="vvRing" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0" stop-color="#6557ec" stop-opacity=".85"/>
         <stop offset=".52" stop-color="#8074ff" stop-opacity=".74"/>
         <stop offset="1" stop-color="#80d0eb" stop-opacity=".76"/>
       </linearGradient>
       <radialGradient id="vvOrb" cx="30%" cy="24%" r="76%">
         <stop offset="0" stop-color="#ffffff"/>
         <stop offset=".23" stop-color="#cec9ff"/>
         <stop offset=".55" stop-color="#7160ef"/>
         <stop offset="1" stop-color="#332f64"/>
       </radialGradient>
       <radialGradient id="vvCore" cx="36%" cy="31%" r="70%">
         <stop offset="0" stop-color="#ffffff" stop-opacity=".92"/>
         <stop offset=".24" stop-color="#d8d2ff" stop-opacity=".82"/>
         <stop offset=".56" stop-color="#7260ed" stop-opacity=".64"/>
         <stop offset="1" stop-color="#4b438f" stop-opacity=".22"/>
       </radialGradient>
     </defs>

     <ellipse cx="320" cy="492" rx="184" ry="27" fill="#6b5cf2" opacity=".06"/>
     <ellipse cx="315" cy="284" rx="260" ry="92" transform="rotate(-12 315 284)" fill="none" stroke="url(#vvRing)" stroke-width="14" stroke-opacity=".58"/>
     <ellipse cx="315" cy="286" rx="215" ry="143" transform="rotate(39 315 286)" fill="none" stroke="#8074ff" stroke-width="7" stroke-opacity=".18"/>
     <ellipse cx="315" cy="286" rx="164" ry="224" transform="rotate(72 315 286)" fill="none" stroke="#79cae8" stroke-width="5" stroke-opacity=".13"/>

     <g>
       <path d="M205 185 L336 118 Q351 110 366 119 L476 184 Q490 193 477 205 L349 272 Q334 280 319 272 L204 204 Q190 196 205 185Z" fill="url(#vvTop)" stroke="#ffffff" stroke-opacity=".72" stroke-width="2"/>
       <path d="M199 199 Q199 186 211 193 L332 264 Q342 270 342 285 L342 431 Q342 448 328 439 L211 370 Q199 362 199 347Z" fill="url(#vvFront)" stroke="#d9d8ff" stroke-opacity=".38" stroke-width="2"/>
       <path d="M342 279 Q342 267 353 261 L472 199 Q484 192 484 206 L484 350 Q484 363 473 370 L354 439 Q342 446 342 431Z" fill="url(#vvSide)" stroke="#ffffff" stroke-opacity=".42" stroke-width="2"/>
       <path d="M210 214 L331 282" stroke="#ffffff" stroke-opacity=".20" stroke-width="2"/>
       <path d="M355 279 L469 218" stroke="#ffffff" stroke-opacity=".28" stroke-width="2"/>
       <path d="M220 181 L349 118" stroke="#ffffff" stroke-opacity=".54" stroke-width="3"/>
     </g>

     <circle cx="414" cy="329" r="61" fill="url(#vvCore)" opacity=".70"/>
     <path d="M389 302 L414 349 L439 302" fill="none" stroke="#f7f5ff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round" opacity=".90"/>

     <g opacity=".92">
       <rect x="105" y="122" width="126" height="84" rx="22" fill="#ffffff" fill-opacity=".68" stroke="#ffffff" stroke-opacity=".82" transform="rotate(-13 168 164)"/>
       <rect x="132" y="149" width="56" height="7" rx="4" fill="#6b5cf2" transform="rotate(-13 160 152)"/>
       <rect x="130" y="168" width="74" height="6" rx="3" fill="#33384a" fill-opacity=".10" transform="rotate(-13 167 171)"/>
       <rect x="128" y="185" width="58" height="6" rx="3" fill="#33384a" fill-opacity=".08" transform="rotate(-13 157 188)"/>
     </g>

     <g opacity=".88">
       <rect x="451" y="390" width="124" height="82" rx="22" fill="#ffffff" fill-opacity=".66" stroke="#ffffff" stroke-opacity=".82" transform="rotate(12 513 431)"/>
       <rect x="478" y="414" width="54" height="7" rx="4" fill="#6b5cf2" transform="rotate(12 505 418)"/>
       <rect x="475" y="433" width="69" height="6" rx="3" fill="#33384a" fill-opacity=".10" transform="rotate(12 509 436)"/>
       <rect x="473" y="450" width="55" height="6" rx="3" fill="#33384a" fill-opacity=".08" transform="rotate(12 501 453)"/>
     </g>

     <circle cx="114" cy="258" r="18" fill="url(#vvOrb)"/>
     <circle cx="526" cy="154" r="11" fill="url(#vvOrb)"/>
     <circle cx="550" cy="377" r="22" fill="url(#vvOrb)"/>
     <circle cx="155" cy="421" r="10" fill="url(#vvOrb)"/>
   </svg>
 </div>`;

 const findCard=()=>{
   const marker=[...document.querySelectorAll('body *')].find(el=>norm(el.textContent)==='СИСТЕМА / 01'||norm(el.textContent)==='SYSTEM / 01');
   if(!marker)return null;
   let node=marker;
   for(let i=0;i<8&&node.parentElement;i++,node=node.parentElement){
     const txt=norm(node.textContent);
     const r=node.getBoundingClientRect();
     if(r.width>320&&r.height>320&&(txt.includes('повторной продажи')||txt.includes('repeat sale')||txt.includes('AI-консультант')))return node;
   }
   return marker.parentElement;
 };

 const findHeading=()=>document.querySelector('.viiv-hero-heading')||[...document.querySelectorAll('h1,h2,[role="heading"]')].find(el=>{
   const t=norm(el.textContent);
   return t.includes('Проектируем цифровую систему')||t.includes('We design the digital system')||t.includes('Thiết kế hệ thống số');
 })||null;

 const childUnder=(ancestor,node)=>{
   let current=node;
   while(current&&current.parentElement&&current.parentElement!==ancestor)current=current.parentElement;
   return current&&current.parentElement===ancestor?current:null;
 };

 const wireMobileOrder=(card)=>{
   const heading=findHeading();
   if(!heading||!card)return;
   let ancestor=heading.parentElement;
   while(ancestor&&ancestor!==document.body){
     if(ancestor.contains(card)){
       const copyCol=childUnder(ancestor,heading);
       const artCol=childUnder(ancestor,card);
       if(copyCol&&artCol&&copyCol!==artCol){
         ancestor.classList.add('viiv-mobile-hero-layout');
         copyCol.classList.add('viiv-mobile-copy-col');
         artCol.classList.add('viiv-mobile-art-col');
         return;
       }
     }
     ancestor=ancestor.parentElement;
   }
 };

 const apply=()=>{
   if(document.querySelector('.viiv-system-visual')){
     const visual=document.querySelector('.viiv-system-visual');
     const card=visual.closest('.viiv-mobile-art-col')||visual.parentElement;
     wireMobileOrder(card);
     return true;
   }
   const card=findCard();
   if(!card)return false;
   card.innerHTML=markup;
   card.style.background='transparent';
   card.style.border='0';
   card.style.boxShadow='none';
   card.style.overflow='visible';
   card.style.padding='0';
   card.style.minHeight='0';
   wireMobileOrder(card);
   return true;
 };

 const start=()=>{
   if(apply())return;
   setTimeout(apply,80);
   setTimeout(apply,220);
   setTimeout(apply,500);
   setTimeout(apply,900);
 };

 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    marker = '<style id="viiversion-home-visual-style">'
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
