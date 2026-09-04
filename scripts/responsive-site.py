from pathlib import Path

ROOT = Path('public')

STYLE = r'''<style id="viiversion-global-responsive-style">
html{width:100%;max-width:100%;overflow-x:hidden;-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{width:100%;max-width:100%;min-width:0;overflow-x:hidden}
*,*::before,*::after{box-sizing:border-box}
img,picture,video,svg,canvas{max-width:100%;height:auto}
iframe,embed,object{max-width:100%}
main,header,footer,section,article,aside,nav{max-width:100%;min-width:0}
main>*,section>*,article>*{min-width:0}
h1,h2,h3,h4,h5,h6,p,li,blockquote{max-width:100%;overflow-wrap:break-word}
pre,code{max-width:100%}
pre{overflow-x:auto;-webkit-overflow-scrolling:touch}
table{max-width:100%;display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}
input,textarea,select,button{max-width:100%;font:inherit}
.viiv-hero-heading,.viiv-about-heading-live{word-break:normal;hyphens:auto}
.viiv-hero-benefits{max-width:100%}
.viiv-system-visual{max-width:100%!important;contain:layout paint}
.viiv-static-art{max-width:100%!important}
@media(max-width:1200px){.viiv-system-visual{width:100%!important;margin-left:0!important}}
@media(max-width:900px){.viiv-system-visual{min-height:420px!important}.viiv-static-art{width:min(92vw,500px)!important}.viiv-hero-benefits{gap:14px 18px!important}}
@media(max-width:720px){body{overflow-x:hidden}.viiv-system-visual{min-height:330px!important;padding:6px 0!important}.viiv-static-art{width:min(94vw,390px)!important}.viiv-hero-benefits{display:grid!important;grid-template-columns:1fr!important;gap:12px!important;width:100%!important}.viiv-hero-benefit,.viiv-hero-benefit:last-child{width:100%!important;min-width:0!important}.viiv-about-card-live{width:100%!important;max-width:100%!important}}
@media(max-width:480px){input,textarea,select{font-size:16px!important}.viiv-system-visual{min-height:285px!important}.viiv-static-art{width:min(96vw,340px)!important}}
@media(max-width:360px){.viiv-system-visual{min-height:250px!important}.viiv-static-art{width:min(96vw,310px)!important}}
@media(orientation:landscape) and (max-height:520px) and (max-width:950px){.viiv-system-visual{min-height:300px!important}.viiv-static-art{width:min(55vw,380px)!important}}
@media(hover:none) and (pointer:coarse){button,a[role="button"],input[type="button"],input[type="submit"]{min-height:44px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
</style>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    if '<meta name="viewport"' not in text.lower():
        viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        if '<head>' in text:
            text = text.replace('<head>', '<head>\n' + viewport, 1)
        else:
            text = viewport + text
    marker = '<style id="viiversion-global-responsive-style">'
    while marker in text:
        start = text.index(marker)
        style_end = text.find('</style>', start)
        if style_end == -1:
            break
        script_start = text.find('<script id="viiversion-language-bridge">', style_end)
        if script_start != -1:
            script_end = text.find('</script>', script_start)
            if script_end != -1:
                text = text[:start] + text[script_end + len('</script>'):]
                continue
        text = text[:start] + text[style_end + len('</style>'):]
    if '</body>' in text:
        text = text.replace('</body>', STYLE + '\n</body>', 1)
    else:
        text += '\n' + STYLE + '\n'
    path.write_text(text, encoding='utf-8')
