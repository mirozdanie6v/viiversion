from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-home-visual-style">
.viiv-system-visual{position:relative;width:100%;min-height:500px;display:grid;place-items:center;overflow:visible;isolation:isolate}
.viiv-system-visual:before{content:'';position:absolute;width:78%;height:70%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(103,91,238,.14),rgba(116,198,242,.07) 38%,transparent 70%);filter:blur(26px);z-index:-2}
.viiv-architecture{position:relative;width:min(88%,560px);height:430px;perspective:1100px;transform:translateY(-4px)}
.viiv-architecture:before{content:'';position:absolute;left:10%;right:10%;bottom:7%;height:1px;background:linear-gradient(90deg,transparent,rgba(30,31,42,.12),transparent)}
.viiv-arc{position:absolute;border:1px solid rgba(44,46,66,.10);border-radius:50%;left:50%;top:49%;transform:translate(-50%,-50%);pointer-events:none}
.viiv-arc.a1{width:88%;height:72%;transform:translate(-50%,-50%) rotate(-12deg)}
.viiv-arc.a2{width:72%;height:92%;transform:translate(-50%,-50%) rotate(24deg);border-color:rgba(99,88,236,.11)}
.viiv-arc.a3{width:55%;height:108%;transform:translate(-50%,-50%) rotate(66deg);border-color:rgba(77,169,221,.08)}
.viiv-plane{position:absolute;left:50%;top:50%;border-radius:30px;border:1px solid rgba(255,255,255,.78);box-shadow:0 28px 70px rgba(32,35,58,.10),inset 0 1px 0 rgba(255,255,255,.85);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.viiv-plane.p1{width:58%;height:47%;background:linear-gradient(145deg,rgba(24,25,34,.96),rgba(52,50,82,.94));transform:translate(-57%,-31%) rotateX(61deg) rotateZ(-24deg);box-shadow:0 34px 70px rgba(25,27,47,.17)}
.viiv-plane.p2{width:55%;height:44%;background:linear-gradient(145deg,rgba(108,91,238,.80),rgba(90,172,227,.38));transform:translate(-43%,-58%) rotateX(61deg) rotateZ(-24deg)}
.viiv-plane.p3{width:50%;height:40%;background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(218,218,248,.34));transform:translate(-55%,-85%) rotateX(61deg) rotateZ(-24deg)}
.viiv-monolith{position:absolute;left:50%;top:46%;width:31%;aspect-ratio:1;transform:translate(-50%,-50%) rotate(45deg);border-radius:34px;background:linear-gradient(145deg,rgba(255,255,255,.96),rgba(236,235,250,.72));border:1px solid rgba(255,255,255,.96);box-shadow:0 34px 90px rgba(78,68,183,.18),0 8px 30px rgba(30,31,48,.08),inset 0 1px 0 #fff;backdrop-filter:blur(22px)}
.viiv-monolith:before{content:'';position:absolute;inset:13px;border-radius:25px;border:1px solid rgba(90,81,214,.12);background:linear-gradient(145deg,rgba(102,88,235,.035),rgba(109,197,238,.04))}
.viiv-monolith:after{content:'';position:absolute;width:13px;height:13px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);background:#675ee9;box-shadow:0 0 0 8px rgba(103,94,233,.08),0 0 32px rgba(103,94,233,.28)}
.viiv-signal{position:absolute;width:7px;height:7px;border-radius:50%;background:#fff;border:2px solid rgba(102,91,231,.58);box-shadow:0 0 0 5px rgba(102,91,231,.055)}
.viiv-s1{left:16%;top:32%}.viiv-s2{right:15%;top:25%}.viiv-s3{left:19%;bottom:21%}.viiv-s4{right:18%;bottom:18%}
.viiv-beam{position:absolute;height:1px;transform-origin:left center;background:linear-gradient(90deg,rgba(102,91,231,.05),rgba(102,91,231,.34),rgba(100,180,228,.08))}
.viiv-b1{width:31%;left:17%;top:33%;transform:rotate(19deg)}.viiv-b2{width:29%;left:53%;top:48%;transform:rotate(-38deg)}.viiv-b3{width:30%;left:20%;bottom:22%;transform:rotate(-31deg)}.viiv-b4{width:29%;left:52%;top:51%;transform:rotate(36deg)}
.viiv-wordmark{position:absolute;left:50%;bottom:2%;transform:translateX(-50%);font-size:11px;font-weight:750;letter-spacing:.25em;color:rgba(29,30,39,.50);white-space:nowrap}
@media(max-width:900px){.viiv-system-visual{min-height:430px}.viiv-architecture{height:390px;width:min(92%,520px)}}
@media(max-width:680px){.viiv-system-visual{min-height:330px}.viiv-architecture{height:300px;width:96%}.viiv-monolith{width:33%;border-radius:24px}.viiv-plane{border-radius:22px}.viiv-wordmark{font-size:8px;bottom:0}}
</style>
<script id="viiversion-home-visual-patch">
(()=>{
 const norm=v=>(v||'').replace(/\s+/g,' ').trim();
 const markup=`<div class="viiv-system-visual" aria-label="VIIVERSION digital architecture"><div class="viiv-architecture"><div class="viiv-arc a1"></div><div class="viiv-arc a2"></div><div class="viiv-arc a3"></div><div class="viiv-plane p1"></div><div class="viiv-plane p2"></div><div class="viiv-plane p3"></div><div class="viiv-beam viiv-b1"></div><div class="viiv-beam viiv-b2"></div><div class="viiv-beam viiv-b3"></div><div class="viiv-beam viiv-b4"></div><i class="viiv-signal viiv-s1"></i><i class="viiv-signal viiv-s2"></i><i class="viiv-signal viiv-s3"></i><i class="viiv-signal viiv-s4"></i><div class="viiv-monolith"></div><div class="viiv-wordmark">VIIVERSION</div></div></div>`;
 const findCard=()=>{
   const marker=[...document.querySelectorAll('body *')].find(el=>norm(el.textContent)==='СИСТЕМА / 01'||norm(el.textContent)==='SYSTEM / 01');
   if(!marker)return null;
   let node=marker;
   for(let i=0;i<8&&node.parentElement;i++,node=node.parentElement){const txt=norm(node.textContent);const r=node.getBoundingClientRect();if(r.width>320&&r.height>320&&(txt.includes('повторной продажи')||txt.includes('repeat sale')||txt.includes('AI-консультант')))return node}
   return marker.parentElement;
 };
 const apply=()=>{if(document.querySelector('.viiv-system-visual'))return;const card=findCard();if(!card)return;card.innerHTML=markup;card.style.background='transparent';card.style.border='0';card.style.boxShadow='none';card.style.overflow='visible';card.style.padding='0'};
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
