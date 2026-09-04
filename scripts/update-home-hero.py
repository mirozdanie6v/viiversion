from pathlib import Path

ROOT = Path("public")

# Keep source content aligned with the new Russian hero copy before runtime i18n is applied.
REPLACEMENTS = {
    "VIIVERSION · КОМАНДА ЦИФРОВЫХ ПРОДУКТОВ": "VIIVERSION · ЦИФРОВЫЕ ПРОДУКТЫ ДЛЯ БИЗНЕСА",
    "Собираем цифровую систему вокруг того, как уже работает ваш бизнес.": "Проектируем цифровую систему вашего бизнеса",
    "От первого касания до повторной продажи. VIIVERSION — команда разработки цифровых продуктов для бизнеса: лендинги, Mini Apps, CRM, AI, автоматизация, интеграции и аналитика работают как единый контур.": "Разбираемся, как устроен ваш бизнес, находим слабые места и точки роста, а затем проектируем конкретные цифровые решения под ваши процессы и задачи.",
}

TEXT_EXTENSIONS = {".html", ".htm", ".js", ".mjs", ".json", ".txt"}
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    updated = text
    for old, new in REPLACEMENTS.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding="utf-8")

PATCH = r'''<style id="viiversion-home-hero-style">
.viiv-hero-heading {
  letter-spacing: -0.055em !important;
  line-height: 1.02 !important;
  max-width: 760px !important;
  text-wrap: balance;
  overflow: visible !important;
  padding-top: .08em;
  padding-bottom: .08em;
}
.viiv-hero-heading > span,
.viiv-hero-heading .viiv-gradient-line {
  overflow: visible !important;
}
html[lang^="vi"] .viiv-hero-heading,
body.viiv-lang-vi .viiv-hero-heading {
  line-height: 1.12 !important;
  padding-top: .14em;
  padding-bottom: .14em;
  letter-spacing: -0.045em !important;
}
.viiv-hero-heading .viiv-gradient-line {
  display: inline-block;
  background: linear-gradient(90deg, #5f5cf6 0%, #6d4fe6 48%, #7b57ef 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}
.viiv-hero-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 22px 34px;
  margin-top: 28px;
  align-items: center;
}
.viiv-hero-benefit {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #17181c;
  font-size: 15px;
  line-height: 1.18;
  font-weight: 600;
}
.viiv-hero-benefit-icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, rgba(107,88,246,.08), rgba(117,215,247,.16));
  border: 1px solid rgba(96,86,230,.18);
  color: #6259e8;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
}
.viiv-hero-benefit-icon svg { width: 21px; height: 21px; }
@media (min-width: 1100px) {
  .viiv-hero-heading { font-size: clamp(68px, 5.15vw, 86px) !important; }
}
@media (max-width: 1099px) {
  .viiv-hero-heading { font-size: clamp(50px, 8vw, 72px) !important; }
}
@media (max-width: 720px) {
  .viiv-hero-heading { font-size: clamp(44px, 12vw, 60px) !important; line-height: 1.04 !important; }
  html[lang^="vi"] .viiv-hero-heading,
  body.viiv-lang-vi .viiv-hero-heading { line-height: 1.14 !important; }
  .viiv-hero-benefits { gap: 16px; margin-top: 22px; }
  .viiv-hero-benefit { width: calc(50% - 8px); font-size: 13px; }
  .viiv-hero-benefit:last-child { width: 100%; }
  .viiv-hero-benefit-icon { width: 40px; height: 40px; flex-basis: 40px; }
}
</style>
<script id="viiversion-home-hero-copy-patch">
(() => {
  const HERO_I18N = {
    ru: {
      kicker: 'VIIVERSION · ЦИФРОВЫЕ ПРОДУКТЫ ДЛЯ БИЗНЕСА',
      headingLead: 'Проектируем цифровую систему',
      headingAccent: 'вашего бизнеса',
      subtitle: 'Разбираемся, как устроен ваш бизнес, находим слабые места и точки роста, а затем проектируем конкретные цифровые решения под ваши процессы и задачи.',
      benefits: ['Быстрый старт', 'Измеримый результат', 'Долгосрочное партнёрство']
    },
    en: {
      kicker: 'VIIVERSION · DIGITAL PRODUCTS FOR BUSINESS',
      headingLead: 'We design the digital system',
      headingAccent: 'for your business',
      subtitle: 'We study how your business works, identify weak points and growth opportunities, then design specific digital solutions around your processes and goals.',
      benefits: ['Fast start', 'Measurable results', 'Long-term partnership']
    },
    vi: {
      kicker: 'VIIVERSION · SẢN PHẨM SỐ CHO DOANH NGHIỆP',
      headingLead: 'Thiết kế hệ thống số',
      headingAccent: 'cho doanh nghiệp của bạn',
      subtitle: 'Chúng tôi tìm hiểu cách doanh nghiệp của bạn vận hành, xác định điểm yếu và cơ hội tăng trưởng, sau đó thiết kế các giải pháp số cụ thể phù hợp với quy trình và mục tiêu của bạn.',
      benefits: ['Khởi động nhanh', 'Kết quả đo lường được', 'Hợp tác dài hạn']
    }
  };

  const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
  let selectedLang = 'ru';
  let applying = false;

  const exact = (...texts) => {
    const wanted = new Set(texts.map(normalize));
    return [...document.querySelectorAll('body *')]
      .filter(el => wanted.has(normalize(el.textContent)))
      .sort((a,b) => a.children.length - b.children.length)[0] || null;
  };

  const langFromButton = (target) => {
    const el = target && target.closest ? target.closest('button, a, [role="button"]') : null;
    if (!el) return null;
    const value = normalize(el.textContent).toUpperCase();
    return value === 'RU' ? 'ru' : value === 'EN' ? 'en' : value === 'VI' ? 'vi' : null;
  };

  const inferLanguage = () => {
    const docLang = (document.documentElement.lang || '').toLowerCase();
    if (docLang.startsWith('en')) return 'en';
    if (docLang.startsWith('vi')) return 'vi';
    const stored = localStorage.getItem('viiversion-hero-lang');
    return HERO_I18N[stored] ? stored : selectedLang;
  };

  const icons = [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4.8 13h6.4L11 22l8.2-11h-6.4L13 2Z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>'
  ];

  const findHeroNodes = () => {
    const allKick = Object.values(HERO_I18N).map(v => v.kicker);
    const allSub = Object.values(HERO_I18N).map(v => v.subtitle);
    const kicker = exact(...allKick, 'VIIVERSION · КОМАНДА ЦИФРОВЫХ ПРОДУКТОВ');
    const subtitle = exact(...allSub, 'Разбираемся, как устроен ваш бизнес, находим слабые места и точки роста, а затем проектируем конкретные цифровые решения под ваши процессы и задачи.');

    let heading = document.querySelector('.viiv-hero-heading');
    if (!heading) {
      heading = [...document.querySelectorAll('h1,h2,[role="heading"]')].find(el => {
        const t = normalize(el.textContent);
        return t.includes('Проектируем цифровую') || t.includes('Собираем цифровую систему') ||
               t.includes('We design the digital') || t.includes('Thiết kế hệ thống số');
      }) || exact('Проектируем цифровую систему вашего бизнеса');
    }
    return { kicker, subtitle, heading };
  };

  const ensureBenefits = (labels) => {
    let benefits = document.querySelector('.viiv-hero-benefits');
    if (!benefits) {
      const buttons = [...document.querySelectorAll('a,button')];
      const cta = buttons.find(el => /обсудить проект|discuss|trao đổi/i.test(normalize(el.textContent)));
      if (!cta) return;
      const row = cta.parentElement;
      if (row && row.parentElement) {
        benefits = document.createElement('div');
        benefits.className = 'viiv-hero-benefits';
        row.insertAdjacentElement('afterend', benefits);
      }
    }
    if (!benefits) return;
    benefits.innerHTML = labels.map((label, i) => `
      <div class="viiv-hero-benefit">
        <span class="viiv-hero-benefit-icon" aria-hidden="true">${icons[i]}</span>
        <span>${label}</span>
      </div>`).join('');
  };

  const apply = () => {
    if (applying || !document.body) return;
    applying = true;
    try {
      selectedLang = inferLanguage();
      const copy = HERO_I18N[selectedLang] || HERO_I18N.ru;
      document.body.classList.toggle('viiv-lang-vi', selectedLang === 'vi');
      const { kicker, subtitle, heading } = findHeroNodes();

      if (kicker) kicker.textContent = copy.kicker;
      if (heading) {
        heading.classList.add('viiv-hero-heading');
        heading.style.overflow = 'visible';
        heading.innerHTML = `<span>${copy.headingLead}</span><br><span class="viiv-gradient-line">${copy.headingAccent}</span>`;
      }
      if (subtitle) subtitle.textContent = copy.subtitle;
      ensureBenefits(copy.benefits);
    } finally {
      applying = false;
    }
  };

  document.addEventListener('click', (event) => {
    const lang = langFromButton(event.target);
    if (!lang) return;
    selectedLang = lang;
    localStorage.setItem('viiversion-hero-lang', lang);
    setTimeout(apply, 0);
    setTimeout(apply, 100);
  }, true);

  const start = () => {
    selectedLang = inferLanguage();
    apply();
    const observer = new MutationObserver(() => requestAnimationFrame(apply));
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class','lang','aria-pressed'] });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
</script>'''

for path in ROOT.rglob("*.html"):
    text = path.read_text(encoding="utf-8")
    marker_start = '<style id="viiversion-home-hero-style">'
    old_script = '<script id="viiversion-home-hero-copy-patch">'

    if marker_start in text:
        start = text.index(marker_start)
        script_end = text.find('</script>', start)
        if script_end != -1:
            text = text[:start] + text[script_end + len('</script>'):]
    elif old_script in text:
        start = text.index(old_script)
        script_end = text.find('</script>', start)
        if script_end != -1:
            text = text[:start] + text[script_end + len('</script>'):]

    if '</body>' in text:
        text = text.replace('</body>', PATCH + '\n</body>', 1)
    else:
        text += '\n' + PATCH + '\n'
    path.write_text(text, encoding='utf-8')
