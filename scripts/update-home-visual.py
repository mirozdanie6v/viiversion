from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-home-visual-style">
.viiv-system-visual{position:relative;width:124%;min-height:675px;margin-left:-12%;display:grid;place-items:center;overflow:visible;isolation:isolate}
.viiv-system-visual::before{content:'';position:absolute;width:610px;height:610px;border-radius:50%;background:radial-gradient(circle at 48% 46%,rgba(108,89,242,.20),rgba(84,177,231,.09) 36%,transparent 69%);filter:blur(38px);z-index:-3}
.viiv-stage{position:relative;width:760px;height:700px;perspective:1400px;perspective-origin:50% 44%;transform-style:preserve-3d;transform:scale(.92)}
.viiv-stage::after{content:'';position:absolute;left:50%;bottom:42px;width:430px;height:72px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(ellipse at center,rgba(50,48,98,.22),rgba(90,76,224,.09) 48%,transparent 72%);filter:blur(24px)}
.viiv-cube-wrap{position:absolute;left:50%;top:48%;width:320px;height:320px;transform:translate(-50%,-50%);transform-style:preserve-3d}
.viiv-cube{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(-17deg) rotateY(34deg) rotateZ(-2deg)}
.viiv-face{position:absolute;inset:0;border-radius:38px;border:1px solid rgba(255,255,255,.80);background:linear-gradient(145deg,rgba(255,255,255,.68),rgba(222,221,249,.20) 48%,rgba(91,79,212,.11)),linear-gradient(160deg,rgba(30,31,43,.08),rgba(255,255,255,.04));box-shadow:inset 0 1px 0 rgba(255,255,255,.96),inset 0 0 52px rgba(112,96,242,.11),0 24px 62px rgba(31,33,55,.10);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
.viiv-front{transform:translateZ(160px)}
.viiv-back{transform:rotateY(180deg) translateZ(160px);background:linear-gradient(145deg,rgba(26,27,37,.82),rgba(93,76,218,.28))}
.viiv-right{transform:rotateY(90deg) translateZ(160px);background:linear-gradient(145deg,rgba(71,65,126,.36),rgba(31,31,44,.74))}
.viiv-left{transform:rotateY(-90deg) translateZ(160px);background:linear-gradient(145deg,rgba(245,246,255,.40),rgba(101,88,228,.18))}
.viiv-top{transform:rotateX(90deg) translateZ(160px);background:linear-gradient(145deg,rgba(255,255,255,.86),rgba(198,201,246,.28))}
.viiv-bottom{transform:rotateX(-90deg) translateZ(160px);background:linear-gradient(145deg,rgba(24,25,34,.84),rgba(86,72,211,.42))}
.viiv-face::after{content:'';position:absolute;inset:18px;border-radius:28px;border:1px solid rgba(112,99,234,.13)}
.viiv-vmark{position:absolute;left:50%;top:50%;width:112px;height:94px;transform:translate(-50%,-50%)}
.viiv-vmark::before,.viiv-vmark::after{content:'';position:absolute;top:0;width:25px;height:100px;border-radius:14px;background:linear-gradient(180deg,#fff 0%,#cfc9ff 42%,#725ff1 100%);box-shadow:0 0 28px rgba(108,89,242,.24)}
.viiv-vmark::before{left:27px;transform:rotate(-28deg);transform-origin:50% 8%}
.viiv-vmark::after{right:27px;transform:rotate(28deg);transform-origin:50% 8%}
.viiv-core-glow{position:absolute;left:50%;top:50%;width:154px;height:154px;border-radius:50%;transform:translate(-50%,-50%) translateZ(4px);background:radial-gradient(circle at 36% 30%,rgba(255,255,255,.98),rgba(160,145,255,.72) 24%,rgba(94,72,224,.38) 48%,transparent 72%);filter:blur(3px);opacity:.80}
.viiv-ring{position:absolute;left:50%;top:50%;border-radius:50%;transform-style:preserve-3d;pointer-events:none}
.viiv-ring::before{content:'';position:absolute;inset:0;border-radius:50%;border:2px solid transparent;background:linear-gradient(#fff0,#fff0) padding-box,linear-gradient(110deg,rgba(255,255,255,.12),rgba(113,96,239,.88),rgba(106,202,244,.64),rgba(255,255,255,.20)) border-box;box-shadow:0 0 26px rgba(106,91,238,.14),inset 0 0 24px rgba(102,184,233,.07)}
.viiv-ring.r1{width:650px;height:300px;margin-left:-325px;margin-top:-150px;transform:rotateX(66deg) rotateZ(-17deg) translateZ(16px)}
.viiv-ring.r2{width:560px;height:360px;margin-left:-280px;margin-top:-180px;transform:rotateX(77deg) rotateY(34deg) rotateZ(26deg) translateZ(-20px);opacity:.68}
.viiv-ring.r3{width:450px;height:560px;margin-left:-225px;margin-top:-280px;transform:rotateY(69deg) rotateZ(52deg) translateZ(-42px);opacity:.44}
.viiv-orb{position:absolute;border-radius:50%;background:radial-gradient(circle at 30% 25%,#fff 0%,#cbc4ff 20%,#7764f2 52%,#2f2b58 100%);box-shadow:0 12px 26px rgba(46,43,89,.20),0 0 34px rgba(111,94,239,.22)}
.viiv-orb.o1{width:34px;height:34px;left:86px;top:252px}.viiv-orb.o2{width:22px;height:22px;right:92px;top:184px}.viiv-orb.o3{width:44px;height:44px;right:58px;bottom:164px}.viiv-orb.o4{width:20px;height:20px;left:128px;bottom:146px}
.viiv-plate{position:absolute;width:154px;height:98px;border-radius:25px;border:1px solid rgba(255,255,255,.80);background:linear-gradient(145deg,rgba(255,255,255,.60),rgba(225,224,248,.20));box-shadow:0 20px 44px rgba(32,34,55,.09),inset 0 1px 0 rgba(255,255,255,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.viiv-plate::before{content:'';position:absolute;left:22px;top:24px;width:56px;height:8px;border-radius:10px;background:linear-gradient(90deg,#6c5ee9,#9ca0ff);box-shadow:0 22px 0 rgba(37,39,52,.12),0 44px 0 rgba(37,39,52,.07)}
.viiv-plate.p1{left:56px;top:106px;transform:rotate(-14deg) translateZ(-34px)}
.viiv-plate.p2{right:50px;bottom:94px;transform:rotate(12deg) translateZ(30px);width:136px;height:88px;opacity:.90}
.viiv-system-visual *{animation:none!important}
@media(max-width:1150px){.viiv-system-visual{width:114%;margin-left:-7%;min-height:600px}.viiv-stage{width:700px;height:650px;transform:scale(.86)}}
@media(max-width:900px){.viiv-system-visual{width:100%;margin-left:0;min-height:550px}.viiv-stage{width:650px;height:610px;transform:scale(.75)}}
@media(max-width:680px){.viiv-system-visual{min-height:435px}.viiv-stage{width:600px;height:560px;transform:scale(.56)}}
</style>
<script id="viiversion-home-visual-patch">
(()=>{
 const norm=v=>(v||'').replace(/\s+/g,' ').trim();
 const markup=`<div class="viiv-system-visual" aria-label="VIIVERSION static three dimensional digital object"><div class="viiv-stage"><div class="viiv-ring r1"></div><div class="viiv-ring r2"></div><div class="viiv-ring r3"></div><div class="viiv-orb o1"></div><div class="viiv-orb o2"></div><div class="viiv-orb o3"></div><div class="viiv-orb o4"></div><div class="viiv-plate p1"></div><div class="viiv-plate p2"></div><div class="viiv-cube-wrap"><div class="viiv-cube"><div class="viiv-face viiv-front"><div class="viiv-core-glow"></div><div class="viiv-vmark"></div></div><div class="viiv-face viiv-back"></div><div class="viiv-face viiv-right"></div><div class="viiv-face viiv-left"></div><div class="viiv-face viiv-top"></div><div class="viiv-face viiv-bottom"></div></div></div></div></div>`;
 const findCard=()=>{const marker=[...document.querySelectorAll('body *')].find(el=>norm(el.textContent)==='СИСТЕМА / 01'||norm(el.textContent)==='SYSTEM / 01');if(!marker)return null;let node=marker;for(let i=0;i<8&&node.parentElement;i++,node=node.parentElement){const txt=norm(node.textContent);const r=node.getBoundingClientRect();if(r.width>320&&r.height>320&&(txt.includes('повторной продажи')||txt.includes('repeat sale')||txt.includes('AI-консультант')))return node}return marker.parentElement};
 const apply=()=>{if(document.querySelector('.viiv-system-visual'))return true;const card=findCard();if(!card)return false;card.innerHTML=markup;card.style.background='transparent';card.style.border='0';card.style.boxShadow='none';card.style.overflow='visible';card.style.padding='0';card.style.minHeight='660px';return true};
 const start=()=>{if(apply())return;setTimeout(apply,80);setTimeout(apply,220);setTimeout(apply,500)};
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
