from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-home-visual-style">
.viiv-system-visual{
  position:relative;
  width:116%;
  min-height:610px;
  margin-left:-8%;
  display:grid;
  place-items:center;
  overflow:visible;
  isolation:isolate;
}
.viiv-system-visual::before{
  content:'';
  position:absolute;
  width:520px;
  height:520px;
  border-radius:50%;
  background:
    radial-gradient(circle at 48% 46%,rgba(108,89,242,.18),rgba(84,177,231,.08) 36%,transparent 68%);
  filter:blur(34px);
  z-index:-3;
}
.viiv-stage{
  position:relative;
  width:620px;
  height:590px;
  perspective:1150px;
  perspective-origin:50% 44%;
  transform-style:preserve-3d;
}
.viiv-stage::after{
  content:'';
  position:absolute;
  left:50%;
  bottom:48px;
  width:340px;
  height:58px;
  transform:translateX(-50%);
  border-radius:50%;
  background:radial-gradient(ellipse at center,rgba(50,48,98,.20),rgba(90,76,224,.08) 48%,transparent 72%);
  filter:blur(20px);
}
.viiv-cube-wrap{
  position:absolute;
  left:50%;
  top:48%;
  width:244px;
  height:244px;
  transform:translate(-50%,-50%);
  transform-style:preserve-3d;
  animation:viivCubeFloat 8s ease-in-out infinite;
}
.viiv-cube{
  position:absolute;
  inset:0;
  transform-style:preserve-3d;
  transform:rotateX(-17deg) rotateY(34deg) rotateZ(-2deg);
  animation:viivCubeTurn 14s ease-in-out infinite;
}
.viiv-face{
  position:absolute;
  inset:0;
  border-radius:30px;
  border:1px solid rgba(255,255,255,.78);
  background:
    linear-gradient(145deg,rgba(255,255,255,.66),rgba(222,221,249,.18) 48%,rgba(91,79,212,.10)),
    linear-gradient(160deg,rgba(30,31,43,.08),rgba(255,255,255,.04));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.96),
    inset 0 0 42px rgba(112,96,242,.10),
    0 18px 46px rgba(31,33,55,.08);
  backdrop-filter:blur(18px);
  -webkit-backdrop-filter:blur(18px);
}
.viiv-front{transform:translateZ(122px)}
.viiv-back{transform:rotateY(180deg) translateZ(122px);background:linear-gradient(145deg,rgba(26,27,37,.80),rgba(93,76,218,.26))}
.viiv-right{transform:rotateY(90deg) translateZ(122px);background:linear-gradient(145deg,rgba(71,65,126,.34),rgba(31,31,44,.72))}
.viiv-left{transform:rotateY(-90deg) translateZ(122px);background:linear-gradient(145deg,rgba(245,246,255,.38),rgba(101,88,228,.16))}
.viiv-top{transform:rotateX(90deg) translateZ(122px);background:linear-gradient(145deg,rgba(255,255,255,.84),rgba(198,201,246,.26))}
.viiv-bottom{transform:rotateX(-90deg) translateZ(122px);background:linear-gradient(145deg,rgba(24,25,34,.82),rgba(86,72,211,.40))}
.viiv-face::after{
  content:'';
  position:absolute;
  inset:14px;
  border-radius:22px;
  border:1px solid rgba(112,99,234,.12);
}
.viiv-vmark{
  position:absolute;
  left:50%;
  top:50%;
  width:88px;
  height:72px;
  transform:translate(-50%,-50%);
}
.viiv-vmark::before,
.viiv-vmark::after{
  content:'';
  position:absolute;
  top:0;
  width:20px;
  height:78px;
  border-radius:12px;
  background:linear-gradient(180deg,#ffffff 0%,#cfc9ff 42%,#725ff1 100%);
  box-shadow:0 0 22px rgba(108,89,242,.22);
}
.viiv-vmark::before{left:22px;transform:rotate(-28deg);transform-origin:50% 8%}
.viiv-vmark::after{right:22px;transform:rotate(28deg);transform-origin:50% 8%}
.viiv-core-glow{
  position:absolute;
  left:50%;
  top:50%;
  width:118px;
  height:118px;
  border-radius:50%;
  transform:translate(-50%,-50%) translateZ(4px);
  background:radial-gradient(circle at 36% 30%,rgba(255,255,255,.96),rgba(160,145,255,.68) 24%,rgba(94,72,224,.34) 48%,transparent 72%);
  filter:blur(2px);
  opacity:.76;
}
.viiv-ring{
  position:absolute;
  left:50%;
  top:50%;
  border-radius:50%;
  transform-style:preserve-3d;
  pointer-events:none;
}
.viiv-ring::before{
  content:'';
  position:absolute;
  inset:0;
  border-radius:50%;
  border:2px solid transparent;
  background:
    linear-gradient(#fff0,#fff0) padding-box,
    linear-gradient(110deg,rgba(255,255,255,.12),rgba(113,96,239,.86),rgba(106,202,244,.62),rgba(255,255,255,.20)) border-box;
  box-shadow:0 0 22px rgba(106,91,238,.12),inset 0 0 20px rgba(102,184,233,.06);
}
.viiv-ring.r1{
  width:500px;height:226px;
  margin-left:-250px;margin-top:-113px;
  transform:rotateX(66deg) rotateZ(-17deg) translateZ(12px);
  animation:viivRingOne 16s linear infinite;
}
.viiv-ring.r2{
  width:430px;height:282px;
  margin-left:-215px;margin-top:-141px;
  transform:rotateX(77deg) rotateY(34deg) rotateZ(26deg) translateZ(-16px);
  opacity:.66;
  animation:viivRingTwo 20s linear infinite reverse;
}
.viiv-ring.r3{
  width:350px;height:440px;
  margin-left:-175px;margin-top:-220px;
  transform:rotateY(69deg) rotateZ(52deg) translateZ(-34px);
  opacity:.42;
}
.viiv-orb{
  position:absolute;
  border-radius:50%;
  background:radial-gradient(circle at 30% 25%,#ffffff 0%,#cbc4ff 20%,#7764f2 52%,#2f2b58 100%);
  box-shadow:0 10px 22px rgba(46,43,89,.18),0 0 30px rgba(111,94,239,.20);
}
.viiv-orb.o1{width:28px;height:28px;left:84px;top:214px;animation:viivOrbFloat 7s ease-in-out infinite}
.viiv-orb.o2{width:18px;height:18px;right:88px;top:160px;animation:viivOrbFloat 9s ease-in-out infinite reverse}
.viiv-orb.o3{width:36px;height:36px;right:62px;bottom:144px;animation:viivOrbFloat 8s ease-in-out infinite .8s}
.viiv-orb.o4{width:16px;height:16px;left:118px;bottom:128px;animation:viivOrbFloat 10s ease-in-out infinite reverse}
.viiv-plate{
  position:absolute;
  width:126px;
  height:82px;
  border-radius:22px;
  border:1px solid rgba(255,255,255,.78);
  background:linear-gradient(145deg,rgba(255,255,255,.58),rgba(225,224,248,.18));
  box-shadow:0 18px 38px rgba(32,34,55,.08),inset 0 1px 0 rgba(255,255,255,.90);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
}
.viiv-plate::before{content:'';position:absolute;left:18px;top:20px;width:46px;height:7px;border-radius:10px;background:linear-gradient(90deg,#6c5ee9,#9ca0ff);box-shadow:0 18px 0 rgba(37,39,52,.12),0 36px 0 rgba(37,39,52,.07)}
.viiv-plate.p1{left:48px;top:92px;transform:rotate(-14deg) translateZ(-30px)}
.viiv-plate.p2{right:44px;bottom:88px;transform:rotate(12deg) translateZ(26px);width:110px;height:72px;opacity:.88}
@keyframes viivCubeTurn{0%,100%{transform:rotateX(-17deg) rotateY(34deg) rotateZ(-2deg)}50%{transform:rotateX(-12deg) rotateY(43deg) rotateZ(1deg)}}
@keyframes viivCubeFloat{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-12px)}}
@keyframes viivRingOne{to{transform:rotateX(66deg) rotateZ(343deg) translateZ(12px)}}
@keyframes viivRingTwo{to{transform:rotateX(77deg) rotateY(34deg) rotateZ(386deg) translateZ(-16px)}}
@keyframes viivOrbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@media(prefers-reduced-motion:reduce){.viiv-cube-wrap,.viiv-cube,.viiv-ring,.viiv-orb{animation:none!important}}
@media(max-width:1150px){
  .viiv-system-visual{width:108%;margin-left:-4%;min-height:540px}
  .viiv-stage{width:540px;height:520px;transform:scale(.92)}
}
@media(max-width:900px){
  .viiv-system-visual{width:100%;margin-left:0;min-height:500px}
  .viiv-stage{width:520px;height:500px;transform:scale(.88)}
}
@media(max-width:680px){
  .viiv-system-visual{min-height:390px}
  .viiv-stage{width:430px;height:420px;transform:scale(.72)}
}
</style>
<script id="viiversion-home-visual-patch">
(()=>{
 const norm=v=>(v||'').replace(/\s+/g,' ').trim();
 const markup=`<div class="viiv-system-visual" aria-label="VIIVERSION three dimensional digital object"><div class="viiv-stage"><div class="viiv-ring r1"></div><div class="viiv-ring r2"></div><div class="viiv-ring r3"></div><div class="viiv-orb o1"></div><div class="viiv-orb o2"></div><div class="viiv-orb o3"></div><div class="viiv-orb o4"></div><div class="viiv-plate p1"></div><div class="viiv-plate p2"></div><div class="viiv-cube-wrap"><div class="viiv-cube"><div class="viiv-face viiv-front"><div class="viiv-core-glow"></div><div class="viiv-vmark"></div></div><div class="viiv-face viiv-back"></div><div class="viiv-face viiv-right"></div><div class="viiv-face viiv-left"></div><div class="viiv-face viiv-top"></div><div class="viiv-face viiv-bottom"></div></div></div></div></div>`;
 const findCard=()=>{
   const marker=[...document.querySelectorAll('body *')].find(el=>norm(el.textContent)==='СИСТЕМА / 01'||norm(el.textContent)==='SYSTEM / 01');
   if(!marker)return null;
   let node=marker;
   for(let i=0;i<8&&node.parentElement;i++,node=node.parentElement){const txt=norm(node.textContent);const r=node.getBoundingClientRect();if(r.width>320&&r.height>320&&(txt.includes('повторной продажи')||txt.includes('repeat sale')||txt.includes('AI-консультант')))return node}
   return marker.parentElement;
 };
 const apply=()=>{
   if(document.querySelector('.viiv-system-visual'))return;
   const card=findCard();if(!card)return;
   card.innerHTML=markup;
   card.style.background='transparent';
   card.style.border='0';
   card.style.boxShadow='none';
   card.style.overflow='visible';
   card.style.padding='0';
   card.style.minHeight='590px';
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
