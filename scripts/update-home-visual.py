from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-home-visual-style">
.viiv-system-visual{position:relative;width:100%;min-height:500px;display:grid;place-items:center;overflow:visible;isolation:isolate}
.viiv-system-visual:before{content:'';position:absolute;inset:10% 3% 8% 8%;background:radial-gradient(circle at 52% 48%,rgba(102,88,238,.15),rgba(93,177,229,.07) 32%,transparent 67%);filter:blur(28px);z-index:-2}
.viiv-object-wrap{position:relative;width:min(92%,590px);aspect-ratio:1.08;display:grid;place-items:center;transform:translateY(-2px)}
.viiv-object-svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 30px 48px rgba(25,28,46,.10))}
.viiv-object-svg .float-a{animation:viivFloatA 8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.viiv-object-svg .float-b{animation:viivFloatB 10s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.viiv-object-svg .pulse{animation:viivPulse 6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes viivFloatA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-7px) rotate(.8deg)}}
@keyframes viivFloatB{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(6px) rotate(-.65deg)}}
@keyframes viivPulse{0%,100%{opacity:.62;transform:scale(1)}50%{opacity:.95;transform:scale(1.025)}}
@media (prefers-reduced-motion:reduce){.viiv-object-svg .float-a,.viiv-object-svg .float-b,.viiv-object-svg .pulse{animation:none}}
@media(max-width:900px){.viiv-system-visual{min-height:430px}.viiv-object-wrap{width:min(94%,540px)}}
@media(max-width:680px){.viiv-system-visual{min-height:340px}.viiv-object-wrap{width:100%;max-width:430px}}
</style>
<script id="viiversion-home-visual-patch">
(()=>{
 const norm=v=>(v||'').replace(/\s+/g,' ').trim();
 const markup=`
 <div class="viiv-system-visual" aria-label="Abstract VIIVERSION digital system">
   <div class="viiv-object-wrap">
     <svg class="viiv-object-svg" viewBox="0 0 620 570" role="img" aria-hidden="true">
       <defs>
         <linearGradient id="gDark" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#161821"/>
           <stop offset=".48" stop-color="#29293b"/>
           <stop offset="1" stop-color="#101116"/>
         </linearGradient>
         <linearGradient id="gViolet" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#8276ff"/>
           <stop offset=".45" stop-color="#6559ee"/>
           <stop offset="1" stop-color="#80c8ef"/>
         </linearGradient>
         <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#ffffff" stop-opacity=".88"/>
           <stop offset=".48" stop-color="#e8e8f6" stop-opacity=".36"/>
           <stop offset="1" stop-color="#bfc2db" stop-opacity=".10"/>
         </linearGradient>
         <linearGradient id="gEdge" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0" stop-color="#ffffff" stop-opacity=".10"/>
           <stop offset=".42" stop-color="#ffffff" stop-opacity=".92"/>
           <stop offset=".72" stop-color="#8f83ff" stop-opacity=".65"/>
           <stop offset="1" stop-color="#ffffff" stop-opacity=".06"/>
         </linearGradient>
         <radialGradient id="gOrb" cx="35%" cy="28%" r="72%">
           <stop offset="0" stop-color="#ffffff"/>
           <stop offset=".20" stop-color="#b5b1ff"/>
           <stop offset=".55" stop-color="#685bed"/>
           <stop offset="1" stop-color="#27263a"/>
         </radialGradient>
         <radialGradient id="gCore" cx="34%" cy="25%" r="76%">
           <stop offset="0" stop-color="#ffffff" stop-opacity=".96"/>
           <stop offset=".22" stop-color="#dad7ff" stop-opacity=".92"/>
           <stop offset=".55" stop-color="#7d70ff" stop-opacity=".78"/>
           <stop offset="1" stop-color="#221f3e" stop-opacity=".96"/>
         </radialGradient>
         <filter id="blur16"><feGaussianBlur stdDeviation="16"/></filter>
         <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
         <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
           <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#25263a" flood-opacity=".20"/>
         </filter>
         <clipPath id="clipCore"><rect x="215" y="170" width="190" height="190" rx="44"/></clipPath>
       </defs>

       <ellipse cx="315" cy="483" rx="178" ry="29" fill="#6b5cf2" opacity=".08" filter="url(#blur16)"/>

       <g class="float-b" opacity=".96">
         <path d="M86 330 C119 191, 262 111, 418 145 C520 168, 573 248, 546 329 C518 414, 408 460, 286 446 C168 432, 65 390, 86 330Z" fill="none" stroke="#22242d" stroke-opacity=".15" stroke-width="2"/>
         <path d="M92 331 C132 213, 265 149, 420 176 C505 191, 545 245, 525 311 C499 394, 402 425, 289 414 C188 405, 75 383, 92 331Z" fill="none" stroke="url(#gViolet)" stroke-opacity=".28" stroke-width="4"/>
         <path d="M105 327 C149 238, 274 191, 405 205 C471 212, 510 254, 492 305 C466 374, 384 396, 291 386 C200 377, 91 360, 105 327Z" fill="none" stroke="url(#gEdge)" stroke-width="8" stroke-linecap="round"/>
       </g>

       <g class="float-a" filter="url(#shadow)">
         <path d="M172 194 L316 110 L458 196 L458 352 L315 435 L172 351Z" fill="url(#gDark)" opacity=".98"/>
         <path d="M172 194 L316 110 L316 272 L172 351Z" fill="#20222d" opacity=".88"/>
         <path d="M316 110 L458 196 L458 352 L316 272Z" fill="#37364c" opacity=".82"/>
         <path d="M172 194 L316 272 L458 196 L316 110Z" fill="url(#gGlass)" opacity=".54"/>
         <path d="M172 194 L316 272 L458 196" fill="none" stroke="#ffffff" stroke-opacity=".42" stroke-width="1.4"/>
         <path d="M316 110 L316 272 L315 435" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width="1.3"/>
         <path d="M172 351 L315 435 L458 352" fill="none" stroke="#7b6ff5" stroke-opacity=".28" stroke-width="1.2"/>
       </g>

       <g class="pulse">
         <rect x="216" y="171" width="188" height="188" rx="44" fill="url(#gGlass)" stroke="#ffffff" stroke-opacity=".74" stroke-width="1.5"/>
         <rect x="227" y="182" width="166" height="166" rx="36" fill="url(#gCore)" opacity=".92"/>
         <path d="M254 214 C291 186, 352 186, 383 223 C409 255, 402 311, 365 336 C329 360, 272 350, 246 314 C220 278, 223 238, 254 214Z" fill="#ffffff" opacity=".10" filter="url(#blur6)"/>
         <path d="M266 243 L309 314 L352 242 L329 242 L309 278 L289 243Z" fill="#ffffff" opacity=".92"/>
         <path d="M266 243 L309 314 L352 242" fill="none" stroke="#ffffff" stroke-opacity=".32" stroke-width="2"/>
       </g>

       <g class="float-b">
         <ellipse cx="315" cy="284" rx="223" ry="83" transform="rotate(-18 315 284)" fill="none" stroke="url(#gEdge)" stroke-width="4.5" opacity=".84"/>
         <ellipse cx="315" cy="284" rx="189" ry="132" transform="rotate(37 315 284)" fill="none" stroke="#7a6ef3" stroke-opacity=".34" stroke-width="3"/>
         <ellipse cx="315" cy="284" rx="149" ry="205" transform="rotate(71 315 284)" fill="none" stroke="#8dcff1" stroke-opacity=".22" stroke-width="2"/>
       </g>

       <g class="float-a">
         <circle cx="123" cy="242" r="16" fill="url(#gOrb)"/>
         <circle cx="489" cy="180" r="11" fill="url(#gOrb)"/>
         <circle cx="507" cy="365" r="18" fill="url(#gOrb)"/>
         <circle cx="179" cy="406" r="10" fill="url(#gOrb)"/>
         <circle cx="123" cy="242" r="25" fill="#695ced" opacity=".10" filter="url(#blur6)"/>
         <circle cx="507" cy="365" r="29" fill="#695ced" opacity=".09" filter="url(#blur6)"/>
       </g>

       <path d="M142 131 C208 81 281 61 358 74" fill="none" stroke="#242631" stroke-opacity=".09" stroke-width="1.2"/>
       <path d="M401 102 C479 119 526 159 553 220" fill="none" stroke="#6c5ff0" stroke-opacity=".10" stroke-width="1.2"/>
     </svg>
   </div>
 </div>`;
 const findCard=()=>{
   const marker=[...document.querySelectorAll('body *')].find(el=>norm(el.textContent)==='СИСТЕМА / 01'||norm(el.textContent)==='SYSTEM / 01');
   if(!marker)return null;
   let node=marker;
   for(let i=0;i<8&&node.parentElement;i++,node=node.parentElement){
     const txt=norm(node.textContent);const r=node.getBoundingClientRect();
     if(r.width>320&&r.height>320&&(txt.includes('повторной продажи')||txt.includes('repeat sale')||txt.includes('AI-консультант')))return node;
   }
   return marker.parentElement;
 };
 const apply=()=>{
   if(document.querySelector('.viiv-system-visual'))return;
   const card=findCard();if(!card)return;
   card.innerHTML=markup;
   card.style.background='transparent';card.style.border='0';card.style.boxShadow='none';card.style.overflow='visible';card.style.padding='0';
 };
 const start=()=>{apply();new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{subtree:true,childList:true,characterData:true})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    marker = '<style id="viiversion-home-visual-style">'
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
