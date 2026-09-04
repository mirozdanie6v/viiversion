from pathlib import Path

ROOT = Path('public')

STYLE = r'''<style id="viiversion-mobile-typography-style">
@media (max-width: 720px) {
  :root {
    --vv-mobile-hero: clamp(38px, 10.4vw, 42px);
    --vv-mobile-section: clamp(28px, 7.8vw, 32px);
    --vv-mobile-card: clamp(20px, 5.7vw, 22px);
    --vv-mobile-lead: clamp(17px, 4.6vw, 18px);
    --vv-mobile-body: clamp(15px, 4.05vw, 16px);
    --vv-mobile-tag: clamp(12px, 3.2vw, 13px);
  }

  /* Base mobile rhythm */
  body {
    font-size: var(--vv-mobile-body) !important;
    line-height: 1.55 !important;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* Never split words automatically on mobile. */
  h1, h2, h3, h4, h5, h6,
  [role="heading"],
  .viiv-hero-heading,
  .viiv-about-heading-live,
  .viiv-about-card-title-live,
  p, li, button, a, span {
    word-break: normal !important;
    overflow-wrap: normal !important;
    hyphens: none !important;
    -webkit-hyphens: none !important;
  }

  h1, h2, h3, h4, h5, h6,
  [role="heading"],
  .viiv-hero-heading,
  .viiv-about-heading-live,
  .viiv-about-card-title-live {
    text-wrap: pretty !important;
  }

  /* Hero */
  h1,
  .viiv-hero-heading {
    font-size: var(--vv-mobile-hero) !important;
    line-height: 1.06 !important;
    letter-spacing: -0.035em !important;
    max-inline-size: 100% !important;
  }

  .viiv-hero-heading[data-viiv-lang="vi"] {
    font-size: clamp(36px, 9.6vw, 40px) !important;
    line-height: 1.12 !important;
    letter-spacing: -0.02em !important;
    max-inline-size: 100% !important;
  }

  /* Section headings */
  h2,
  .viiv-about-heading-live {
    font-size: var(--vv-mobile-section) !important;
    line-height: 1.12 !important;
    letter-spacing: -0.03em !important;
    max-inline-size: 100% !important;
  }

  /* Card / subsection headings */
  h3,
  h4,
  .viiv-about-card-title-live,
  [class*="card"] h3,
  [class*="card"] h4 {
    font-size: var(--vv-mobile-card) !important;
    line-height: 1.17 !important;
    letter-spacing: -0.022em !important;
    max-inline-size: 100% !important;
  }

  h5, h6 {
    font-size: 18px !important;
    line-height: 1.2 !important;
    letter-spacing: -0.015em !important;
  }

  /* Leads */
  .viiv-about-copy-live,
  [class*="hero"] p:first-of-type,
  section > p:first-of-type,
  article > p:first-of-type {
    font-size: var(--vv-mobile-lead) !important;
    line-height: 1.5 !important;
    letter-spacing: 0 !important;
    max-inline-size: min(100%, 42ch) !important;
  }

  /* Body copy */
  main p,
  section p,
  article p,
  .viiv-about-card-live p,
  li {
    font-size: var(--vv-mobile-body) !important;
    line-height: 1.55 !important;
    letter-spacing: 0 !important;
  }

  main p,
  section p,
  article p {
    max-inline-size: min(100%, 44ch);
  }

  /* Buttons / nav */
  button,
  a[role="button"],
  [class*="button"],
  [class*="btn"] {
    font-size: 15px !important;
    line-height: 1.2 !important;
    letter-spacing: -0.01em !important;
  }

  nav a,
  nav button,
  header a,
  header button {
    font-size: 14px !important;
    line-height: 1.2 !important;
  }

  /* Tags and small badges */
  .viiv-about-tag-live,
  .viiv-project-tag-live,
  [class*="tag"],
  [class*="badge"],
  [class*="chip"] {
    font-size: var(--vv-mobile-tag) !important;
    line-height: 1.15 !important;
    letter-spacing: 0 !important;
    white-space: nowrap !important;
    word-break: normal !important;
    overflow-wrap: normal !important;
    hyphens: none !important;
  }

  /* Eyebrows / kickers stay visibly subordinate */
  .viiv-about-kicker-live,
  [class*="kicker"],
  [class*="eyebrow"] {
    font-size: 14px !important;
    line-height: 1.2 !important;
    letter-spacing: .08em !important;
  }
}

@media (max-width: 390px) {
  :root {
    --vv-mobile-hero: 38px;
    --vv-mobile-section: 28px;
    --vv-mobile-card: 20px;
    --vv-mobile-lead: 17px;
    --vv-mobile-body: 15px;
    --vv-mobile-tag: 12px;
  }
}

@media (orientation: landscape) and (max-width: 950px) and (max-height: 520px) {
  h1,
  .viiv-hero-heading {
    font-size: 36px !important;
    line-height: 1.06 !important;
    max-inline-size: 100% !important;
  }

  h2,
  .viiv-about-heading-live {
    font-size: 27px !important;
  }
}
</style>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    marker = '<style id="viiversion-mobile-typography-style">'
    while marker in text:
        start = text.index(marker)
        end = text.find('</style>', start)
        if end == -1:
            break
        text = text[:start] + text[end + len('</style>'):]

    if '</body>' in text:
        text = text.replace('</body>', STYLE + '\n</body>', 1)
    else:
        text += '\n' + STYLE + '\n'

    path.write_text(text, encoding='utf-8')
