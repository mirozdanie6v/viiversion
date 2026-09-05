from pathlib import Path

ROOT = Path('public')

PATCH = r'''<style id="viiversion-before-copy-style">
#before .viiv-before-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
#before .viiv-before-tag{display:inline-flex;align-items:center;min-height:30px;padding:6px 11px;border-radius:999px;border:1px solid rgba(101,89,238,.28);background:rgba(101,89,238,.055);color:#7f74ff;font-size:12px;line-height:1;font-weight:700;letter-spacing:.01em;white-space:nowrap}
#before .viiv-before-note{margin-top:18px!important;padding-top:18px;border-top:1px solid rgba(255,255,255,.09);font-weight:650;color:rgba(255,255,255,.78)}
@media(max-width:720px){
  #before .viiv-before-tags{gap:7px;margin-top:16px}
  #before .viiv-before-tag{font-size:12px;min-height:28px;padding:6px 10px}
  #before .viiv-before-note{font-size:15px!important;line-height:1.5!important}
}
</style>
<script id="viiversion-before-copy-script">
(()=>{
  const valid=new Set(['ru','en','vi']);
  const COPY={
    ru:{
      eyebrow:'МЫ НАЧИНАЕМ ЕЩЁ ДО РАЗРАБОТКИ',
      heading:'Сначала разбираемся, как работает ваш бизнес сейчас.',
      lead:'Изучаем цифровой контур бизнеса: откуда приходят клиенты, какой путь они проходят до покупки, где возникают потери, какие каналы и системы уже используются, что можно связать между собой и какие процессы имеет смысл автоматизировать.',
      steps:[
        ['Изучаем точки входа клиента','Сайт, Google Maps, соцсети, мессенджеры, реклама, рекомендации и другие каналы привлечения.'],
        ['Восстанавливаем путь клиента','От первого контакта до заявки, покупки, обслуживания и повторного обращения.'],
        ['Разбираем внутренние процессы','Как заявки передаются сотрудникам, где возникает ручная работа, дублирование и потеря информации.'],
        ['Находим точки роста','Определяем, где цифровые инструменты могут сократить путь клиента, автоматизировать работу и дать бизнесу больше данных.']
      ],
      cardEyebrow:'АНАЛИЗ / РЫНОК / РЕШЕНИЯ',
      cardTitle:'Смотрим, как эту задачу уже решает рынок',
      cardText:'Изучаем цифровые продукты, клиентские сценарии и механики компаний из вашей ниши — локально и на других рынках.',
      tags:['Competitors','Best Practices','UX Patterns','Customer Journey','Market Research'],
      note:'Берём работающие механики за ориентир, а решение проектируем под процессы именно вашего бизнеса.'
    },
    en:{
      eyebrow:'WE START BEFORE DEVELOPMENT',
      heading:'First, we understand how your business works today.',
      lead:'We study the digital landscape of the business: where customers come from, how they move toward a purchase, where they drop off, which channels and systems are already in use, what can be connected, and which processes are worth automating.',
      steps:[
        ['Map customer entry points','Website, Google Maps, social media, messengers, advertising, referrals and other acquisition channels.'],
        ['Reconstruct the customer journey','From first contact to inquiry, purchase, service and repeat interaction.'],
        ['Review internal processes','How inquiries move between employees, where manual work, duplication and information loss occur.'],
        ['Identify growth opportunities','We determine where digital tools can shorten the customer journey, automate work and give the business better data.']
      ],
      cardEyebrow:'ANALYSIS / MARKET / SOLUTIONS',
      cardTitle:'We look at how the market already solves this problem',
      cardText:'We study digital products, customer scenarios and mechanics used by companies in your niche — locally and in other markets.',
      tags:['Competitors','Best Practices','UX Patterns','Customer Journey','Market Research'],
      note:'We use proven mechanics as references, while designing the solution around the processes of your business.'
    },
    vi:{
      eyebrow:'CHÚNG TÔI BẮT ĐẦU TRƯỚC CẢ GIAI ĐOẠN PHÁT TRIỂN',
      heading:'Trước tiên, chúng tôi tìm hiểu doanh nghiệp của bạn đang vận hành như thế nào.',
      lead:'Chúng tôi phân tích toàn bộ hệ sinh thái số của doanh nghiệp: khách hàng đến từ đâu, họ đi qua những bước nào trước khi mua, họ rời đi ở đâu, doanh nghiệp đang dùng những kênh và hệ thống nào, những gì có thể kết nối và quy trình nào nên được tự động hóa.',
      steps:[
        ['Xác định các điểm khách hàng tiếp cận','Website, Google Maps, mạng xã hội, ứng dụng nhắn tin, quảng cáo, giới thiệu và các kênh thu hút khác.'],
        ['Khôi phục hành trình khách hàng','Từ lần tiếp xúc đầu tiên đến yêu cầu, mua hàng, sử dụng dịch vụ và quay lại.'],
        ['Phân tích quy trình nội bộ','Cách yêu cầu được chuyển giữa nhân viên, nơi phát sinh thao tác thủ công, trùng lặp và thất thoát thông tin.'],
        ['Tìm cơ hội tăng trưởng','Xác định nơi công cụ số có thể rút ngắn hành trình khách hàng, tự động hóa công việc và cung cấp nhiều dữ liệu hơn cho doanh nghiệp.']
      ],
      cardEyebrow:'PHÂN TÍCH / THỊ TRƯỜNG / GIẢI PHÁP',
      cardTitle:'Xem thị trường đang giải quyết bài toán này như thế nào',
      cardText:'Chúng tôi nghiên cứu sản phẩm số, kịch bản khách hàng và các cơ chế mà doanh nghiệp trong cùng lĩnh vực đang sử dụng — tại địa phương và ở các thị trường khác.',
      tags:['Competitors','Best Practices','UX Patterns','Customer Journey','Market Research'],
      note:'Chúng tôi lấy các cơ chế đã chứng minh hiệu quả làm tham chiếu, còn giải pháp được thiết kế theo đúng quy trình của doanh nghiệp bạn.'
    }
  };
  const norm=v=>(v||'').replace(/\s+/g,' ').trim();
  const lang=()=>{
    let l='';
    try{l=(localStorage.getItem('bl-lang')||'').toLowerCase()}catch(_){ }
    if(!valid.has(l))l=(document.documentElement.lang||'').toLowerCase().slice(0,2);
    return valid.has(l)?l:'ru';
  };
  const section=()=>document.querySelector('#before,[data-viiv-before-development="true"]');
  const setText=(el,text)=>{if(el&&text)el.textContent=text};
  const render=(forced)=>{
    const s=section(); if(!s)return false;
    const c=COPY[forced||lang()]||COPY.ru;
    const h=s.querySelector('#beforeH,h2');
    setText(h,c.heading);
    const lead=s.querySelector('#beforeP,.section-head p');
    setText(lead,c.lead);

    const eyebrow=[...s.querySelectorAll('.eyebrow,.kicker,[class*="eyebrow"],[class*="kicker"],small')]
      .find(el=>{const t=norm(el.textContent).toLowerCase();return t.includes('до разработки')||t.includes('before development')||t.includes('trước')||el.getBoundingClientRect().top < (h?.getBoundingClientRect().top||Infinity)});
    setText(eyebrow,c.eyebrow);

    [...s.querySelectorAll('.before-step')].slice(0,4).forEach((step,i)=>{
      const data=c.steps[i]; if(!data)return;
      setText(step.querySelector('h3,h4,b,strong'),data[0]);
      setText(step.querySelector('p'),data[1]);
    });

    const card=s.querySelector('.competitive,[class*="competitive"]');
    if(card){
      const title=card.querySelector('#competitiveTitle,h3,h4');
      setText(title,c.cardTitle);
      const label=[...card.querySelectorAll('.eyebrow,.kicker,[class*="eyebrow"],[class*="kicker"],small')][0];
      setText(label,c.cardEyebrow);
      const body=[...card.querySelectorAll('p')].find(p=>!p.classList.contains('viiv-before-note'));
      setText(body,c.cardText);

      let tags=card.querySelector('.viiv-before-tags');
      if(!tags){tags=document.createElement('div');tags.className='viiv-before-tags';(body||title)?.insertAdjacentElement('afterend',tags)}
      tags.innerHTML='';
      c.tags.forEach(t=>{const el=document.createElement('span');el.className='viiv-before-tag';el.textContent=t;tags.appendChild(el)});

      let note=card.querySelector('.viiv-before-note');
      if(!note){note=document.createElement('p');note.className='viiv-before-note';tags.insertAdjacentElement('afterend',note)}
      note.textContent=c.note;
    }
    return true;
  };
  const start=()=>{render();[80,220,520,1000].forEach(ms=>setTimeout(()=>render(),ms))};
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('.langs button'); if(!b)return;
    const t=norm(b.textContent).toUpperCase();
    const l=t==='EN'?'en':t==='VI'?'vi':t==='RU'?'ru':null;
    if(l)[0,80,220,520].forEach(ms=>setTimeout(()=>render(l),ms));
  },true);
  window.addEventListener('storage',e=>{if(e.key==='bl-lang')setTimeout(()=>render(),0)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''

for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    marker = '<style id="viiversion-before-copy-style">'
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
