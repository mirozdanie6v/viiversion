from pathlib import Path

ROOT = Path("public")

OLD_KICKER = "VIIVERSION · КОМАНДА ЦИФРОВЫХ ПРОДУКТОВ"
NEW_KICKER = "VIIVERSION · ЦИФРОВЫЕ ПРОДУКТЫ ДЛЯ БИЗНЕСА"

OLD_HEADING = "Собираем цифровую систему вокруг того, как уже работает ваш бизнес."
NEW_HEADING = "Проектируем цифровую систему вашего бизнеса"

OLD_SUBTITLE = (
    "От первого касания до повторной продажи. VIIVERSION — команда разработки "
    "цифровых продуктов для бизнеса: лендинги, Mini Apps, CRM, AI, автоматизация, "
    "интеграции и аналитика работают как единый контур."
)
NEW_SUBTITLE = (
    "Разбираемся, как устроен ваш бизнес, находим слабые места и точки роста, "
    "а затем проектируем конкретные цифровые решения под ваши процессы и задачи."
)

TEXT_EXTENSIONS = {".html", ".htm", ".js", ".mjs", ".json", ".txt"}

for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue

    updated = (
        text.replace(OLD_KICKER, NEW_KICKER)
        .replace(OLD_HEADING, NEW_HEADING)
        .replace(OLD_SUBTITLE, NEW_SUBTITLE)
    )
    if updated != text:
        path.write_text(updated, encoding="utf-8")

# Runtime fallback for markup where the hero copy is split across nested spans.
# It also reapplies the Russian copy after a language switch and makes the hero
# heading slightly smaller without depending on the site's CSS class names.
PATCH = r'''<script id="viiversion-home-hero-copy-patch">
(() => {
  const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
  const oldKicker = 'VIIVERSION · КОМАНДА ЦИФРОВЫХ ПРОДУКТОВ';
  const newKicker = 'VIIVERSION · ЦИФРОВЫЕ ПРОДУКТЫ ДЛЯ БИЗНЕСА';
  const oldHeading = 'Собираем цифровую систему вокруг того, как уже работает ваш бизнес.';
  const newHeading = 'Проектируем цифровую систему вашего бизнеса';
  const oldSubtitle = 'От первого касания до повторной продажи. VIIVERSION — команда разработки цифровых продуктов для бизнеса: лендинги, Mini Apps, CRM, AI, автоматизация, интеграции и аналитика работают как единый контур.';
  const newSubtitle = 'Разбираемся, как устроен ваш бизнес, находим слабые места и точки роста, а затем проектируем конкретные цифровые решения под ваши процессы и задачи.';

  let applying = false;
  const findExact = (text) => {
    const matches = [...document.querySelectorAll('body *')]
      .filter((el) => normalize(el.textContent) === text);
    return matches.sort((a, b) => a.children.length - b.children.length)[0] || null;
  };

  const apply = () => {
    if (applying || !document.body) return;
    applying = true;
    try {
      const kicker = findExact(oldKicker);
      if (kicker) kicker.textContent = newKicker;

      let heading = findExact(oldHeading) || findExact(newHeading);
      if (heading) {
        if (normalize(heading.textContent) === oldHeading) {
          heading.textContent = newHeading;
        }
        if (!heading.dataset.viiversionHeroSized) {
          const px = parseFloat(getComputedStyle(heading).fontSize);
          if (Number.isFinite(px) && px > 0) heading.style.fontSize = `${px * 0.92}px`;
          heading.dataset.viiversionHeroSized = '1';
        }
      }

      const subtitle = findExact(oldSubtitle);
      if (subtitle) subtitle.textContent = newSubtitle;
    } finally {
      applying = false;
    }
  };

  const start = () => {
    apply();
    const observer = new MutationObserver(() => requestAnimationFrame(apply));
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
</script>'''

for path in ROOT.rglob("*.html"):
    text = path.read_text(encoding="utf-8")
    if "viiversion-home-hero-copy-patch" in text:
        continue
    if "</body>" in text:
        text = text.replace("</body>", PATCH + "\n</body>", 1)
    else:
        text += "\n" + PATCH + "\n"
    path.write_text(text, encoding="utf-8")
