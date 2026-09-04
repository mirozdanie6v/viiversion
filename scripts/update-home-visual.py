from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-home-visual-style">
.viiv-system-visual {
  position: relative;
  width: 100%;
  min-height: 470px;
  display: grid;
  place-items: center;
  overflow: visible;
  isolation: isolate;
}
.viiv-system-visual::before {
  content: '';
  position: absolute;
  inset: 10% 8%;
  border-radius: 48%;
  background:
    radial-gradient(circle at 50% 45%, rgba(103,88,246,.22), transparent 34%),
    radial-gradient(circle at 62% 58%, rgba(72,196,255,.16), transparent 38%);
  filter: blur(22px);
  z-index: -2;
}
.viiv-system-orbit {
  position: absolute;
  width: 74%;
  aspect-ratio: 1;
  border: 1px solid rgba(95,92,246,.16);
  border-radius: 50%;
  transform: rotate(-8deg) scaleY(.48);
  box-shadow: 0 0 40px rgba(95,92,246,.06) inset;
}
.viiv-system-core {
  position: relative;
  width: min(72%, 420px);
  aspect-ratio: 1.18;
  display: grid;
  place-items: center;
  transform: translateY(-2px);
}
.viiv-system-layer {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) perspective(900px) rotateX(62deg) rotateZ(-7deg);
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,.72);
  box-shadow: 0 24px 50px rgba(29,31,56,.12), inset 0 1px 0 rgba(255,255,255,.88);
  backdrop-filter: blur(14px);
}
.viiv-system-layer.l1 { width: 92%; height: 42%; bottom: 4%; background: linear-gradient(145deg, rgba(25,31,63,.95), rgba(79,63,212,.94)); }
.viiv-system-layer.l2 { width: 80%; height: 36%; bottom: 18%; background: linear-gradient(145deg, rgba(90,78,239,.86), rgba(88,170,255,.54)); }
.viiv-system-layer.l3 { width: 67%; height: 30%; bottom: 31%; background: linear-gradient(145deg, rgba(255,255,255,.78), rgba(202,210,255,.52)); }
.viiv-system-cube {
  position: absolute;
  top: 11%;
  width: 48%;
  aspect-ratio: 1;
  border-radius: 30px;
  background: linear-gradient(145deg, rgba(255,255,255,.9), rgba(228,233,255,.5));
  border: 1px solid rgba(255,255,255,.95);
  box-shadow: 0 28px 60px rgba(74,65,194,.18), inset 0 1px 0 white;
  backdrop-filter: blur(16px);
  display: grid;
  place-items: center;
  transform: perspective(900px) rotateX(9deg) rotateY(-10deg) rotateZ(2deg);
}
.viiv-system-cube::after {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 22px;
  border: 1px solid rgba(99,88,236,.14);
}
.viiv-system-brand {
  font-size: clamp(20px, 2vw, 30px);
  font-weight: 800;
  letter-spacing: -.045em;
  background: linear-gradient(90deg,#5e5af3,#14151c 78%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.viiv-system-tag {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 9px;
  font-size: 10px;
  letter-spacing: .16em;
  color: rgba(255,255,255,.9);
  text-transform: uppercase;
  white-space: nowrap;
}
.viiv-system-node {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 13px;
  border-radius: 15px;
  background: rgba(255,255,255,.78);
  border: 1px solid rgba(74,76,107,.12);
  box-shadow: 0 12px 28px rgba(33,34,54,.09);
  backdrop-filter: blur(12px);
  font-size: 11px;
  font-weight: 700;
  color: #252633;
  white-space: nowrap;
}
.viiv-system-node b {
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  font-size: 11px;
  background: linear-gradient(145deg, rgba(99,88,246,.12), rgba(72,196,255,.16));
  color: #6259e8;
}
.viiv-n1 { left: 0; top: 18%; }
.viiv-n2 { left: -2%; top: 42%; }
.viiv-n3 { left: 5%; bottom: 15%; }
.viiv-n4 { right: 2%; top: 17%; }
.viiv-n5 { right: -2%; top: 42%; }
.viiv-n6 { right: 5%; bottom: 15%; }
.viiv-system-line {
  position: absolute;
  height: 2px;
  width: 24%;
  background: linear-gradient(90deg, transparent, rgba(99,88,246,.66), rgba(72,196,255,.45));
  filter: drop-shadow(0 0 4px rgba(99,88,246,.38));
}
.viiv-l1 { left: 17%; top: 27%; transform: rotate(15deg); }
.viiv-l2 { left: 16%; top: 48%; transform: rotate(2deg); }
.viiv-l3 { left: 18%; bottom: 23%; transform: rotate(-12deg); }
.viiv-l4 { right: 17%; top: 27%; transform: rotate(165deg); }
.viiv-l5 { right: 16%; top: 48%; transform: rotate(178deg); }
.viiv-l6 { right: 18%; bottom: 23%; transform: rotate(192deg); }
.viiv-system-caption {
  position: absolute;
  bottom: 2%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #8b8e9b;
  white-space: nowrap;
}
@media (max-width: 900px) {
  .viiv-system-visual { min-height: 420px; }
  .viiv-system-node { font-size: 10px; padding: 9px 10px; }
  .viiv-system-core { width: min(68%, 390px); }
}
@media (max-width: 680px) {
  .viiv-system-visual { min-height: 360px; }
  .viiv-system-node span { display: none; }
  .viiv-system-node { padding: 8px; border-radius: 13px; }
  .viiv-system-node b { width: 26px; height: 26px; }
  .viiv-system-tag { font-size: 8px; gap: 6px; }
  .viiv-system-caption { font-size: 8px; }
}
</style>
<script id="viiversion-home-visual-patch">
(() => {
  const norm = v => (v || '').replace(/\s+/g,' ').trim();
  const markup = `
    <div class="viiv-system-visual" aria-label="VIIVERSION digital ecosystem">
      <div class="viiv-system-orbit"></div>
      <div class="viiv-system-line viiv-l1"></div><div class="viiv-system-line viiv-l2"></div><div class="viiv-system-line viiv-l3"></div>
      <div class="viiv-system-line viiv-l4"></div><div class="viiv-system-line viiv-l5"></div><div class="viiv-system-line viiv-l6"></div>
      <div class="viiv-system-node viiv-n1"><b>↗</b><span>Channels</span></div>
      <div class="viiv-system-node viiv-n2"><b>AI</b><span>AI</span></div>
      <div class="viiv-system-node viiv-n3"><b>DB</b><span>CRM</span></div>
      <div class="viiv-system-node viiv-n4"><b>⚙</b><span>Automation</span></div>
      <div class="viiv-system-node viiv-n5"><b>↔</b><span>Integrations</span></div>
      <div class="viiv-system-node viiv-n6"><b>↗</b><span>Analytics</span></div>
      <div class="viiv-system-core">
        <div class="viiv-system-layer l1"></div>
        <div class="viiv-system-layer l2"></div>
        <div class="viiv-system-layer l3"></div>
        <div class="viiv-system-cube"><div class="viiv-system-brand">VIIVERSION</div></div>
        <div class="viiv-system-tag"><span>IDEAS</span><span>•</span><span>SYSTEMS</span><span>•</span><span>GROWTH</span></div>
      </div>
      <div class="viiv-system-caption">DIGITAL PRODUCTS · CONNECTED AS ONE SYSTEM</div>
    </div>`;

  const findCard = () => {
    const marker = [...document.querySelectorAll('body *')].find(el => norm(el.textContent) === 'СИСТЕМА / 01' || norm(el.textContent) === 'SYSTEM / 01');
    if (!marker) return null;
    let node = marker;
    for (let i = 0; i < 8 && node.parentElement; i++, node = node.parentElement) {
      const txt = norm(node.textContent);
      const r = node.getBoundingClientRect();
      if (r.width > 320 && r.height > 320 && (txt.includes('повторной продажи') || txt.includes('repeat sale') || txt.includes('AI-консультант'))) return node;
    }
    return marker.parentElement;
  };

  const apply = () => {
    if (document.querySelector('.viiv-system-visual')) return;
    const card = findCard();
    if (!card) return;
    card.innerHTML = markup;
    card.style.background = 'transparent';
    card.style.border = '0';
    card.style.boxShadow = 'none';
    card.style.overflow = 'visible';
    card.style.padding = '0';
  };

  const start = () => {
    apply();
    const observer = new MutationObserver(() => requestAnimationFrame(apply));
    observer.observe(document.body, {subtree:true, childList:true, characterData:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    if 'viiversion-home-visual-patch' in text:
        continue
    if '</body>' in text:
        text = text.replace('</body>', PATCH + '\n</body>', 1)
    else:
        text += '\n' + PATCH + '\n'
    path.write_text(text, encoding='utf-8')
