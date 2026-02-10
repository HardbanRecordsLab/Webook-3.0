import { Webbook } from '@/types/webbook';

export function exportWebbookToHtml(webbook: Webbook): string {
  const { metadata, modules, branding, introPages } = webbook;
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))
  );

  // Build intro pages HTML
  const introPageIds: string[] = [];
  let introPagesHtml = '';

  if (introPages) {
    if (introPages.aboutAuthor) {
      introPageIds.push('intro-about');
      introPagesHtml += `<div class="page" id="intro-about"><div class="page-header"><h1>O Autorze</h1></div><div style="white-space:pre-wrap;color:#555;line-height:1.7;">${esc(introPages.aboutAuthor)}</div></div>`;
    }
    if (introPages.copyright) {
      introPageIds.push('intro-copyright');
      introPagesHtml += `<div class="page" id="intro-copyright"><div class="page-header"><h1>Prawa Autorskie</h1></div><div class="content-block warning"><p>${esc(introPages.copyright)}</p></div></div>`;
    }
    if (introPages.disclaimer) {
      introPageIds.push('intro-disclaimer');
      introPagesHtml += `<div class="page" id="intro-disclaimer"><div class="page-header"><h1>Ważne Zastrzeżenia</h1></div><div class="content-block danger"><p>${esc(introPages.disclaimer)}</p></div></div>`;
    }
    if (introPages.forWhom) {
      introPageIds.push('intro-forwhom');
      introPagesHtml += `<div class="page" id="intro-forwhom"><div class="page-header"><h1>Dla Kogo Jest Ten Kurs</h1></div><div style="white-space:pre-wrap;color:#555;line-height:1.7;">${esc(introPages.forWhom)}</div></div>`;
    }
    if (introPages.howToUse) {
      introPageIds.push('intro-howtouse');
      introPagesHtml += `<div class="page" id="intro-howtouse"><div class="page-header"><h1>Jak Korzystać z Webbooka</h1></div><div style="white-space:pre-wrap;color:#555;line-height:1.7;">${esc(introPages.howToUse)}</div></div>`;
    }
  }

  const introSidebarLinks = introPageIds.length > 0 ? `
    <div class="sidebar-section">
      <div class="sidebar-title">Wstęp</div>
      ${introPages?.aboutAuthor ? '<a href="#" class="sidebar-link" onclick="showPage(\'intro-about\')">O Autorze</a>' : ''}
      ${introPages?.copyright ? '<a href="#" class="sidebar-link" onclick="showPage(\'intro-copyright\')">Prawa Autorskie</a>' : ''}
      ${introPages?.disclaimer ? '<a href="#" class="sidebar-link" onclick="showPage(\'intro-disclaimer\')">Zastrzeżenia</a>' : ''}
      ${introPages?.forWhom ? '<a href="#" class="sidebar-link" onclick="showPage(\'intro-forwhom\')">Dla Kogo</a>' : ''}
      ${introPages?.howToUse ? '<a href="#" class="sidebar-link" onclick="showPage(\'intro-howtouse\')">Jak Korzystać</a>' : ''}
    </div>` : '';

  const sidebarSections = modules.map((mod) => `
    <div class="sidebar-section">
      <div class="sidebar-title">${esc(mod.title)}</div>
      ${mod.lessons.map((l) => `<a href="#" class="sidebar-link" onclick="showPage('page-${l.id}')">${esc(l.title)}</a>`).join('\n')}
    </div>`).join('\n');

  const pages = allLessons.map((l, idx) => {
    const progress = Math.round(((idx + 1) / allLessons.length) * 100);
    const prevId = idx > 0 ? allLessons[idx - 1].id : (introPageIds.length > 0 ? introPageIds[introPageIds.length - 1] : null);
    const nextId = idx < allLessons.length - 1 ? allLessons[idx + 1].id : null;

    let imagesHtml = '';
    if (l.multimedia.images && l.multimedia.images.length > 0) {
      imagesHtml = l.multimedia.images.map((img) => `
        <div class="media-container">
          <img src="${esc(img.url)}" alt="${esc(img.name)}">
          <p class="media-caption">${esc(img.name)}</p>
        </div>`).join('');
    }

    let audioHtml = '';
    if (l.multimedia.audio) {
      audioHtml = `
        <div class="audio-player">
          <div class="audio-player-title">🎧 ${esc(l.multimedia.audio.name)}</div>
          <audio controls><source src="${esc(l.multimedia.audio.url)}" type="${esc(l.multimedia.audio.type)}"></audio>
        </div>`;
    }

    let videoHtml = '';
    if (l.multimedia.video) {
      const match = l.multimedia.video.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
      if (match) {
        videoHtml = `<div class="video-container"><iframe src="https://www.youtube.com/embed/${match[1]}" allowfullscreen></iframe></div>`;
      }
    }

    let worksheetHtml = '';
    if (l.worksheet && l.worksheet.questions.length > 0) {
      worksheetHtml = `
        <div class="worksheet">
          <div class="worksheet-title">📋 ${esc(l.worksheet.title)}</div>
          ${l.worksheet.questions.map((q) => `
            <div class="form-group">
              <label>${esc(q.question)}</label>
              ${q.type === 'textarea' ? '<textarea placeholder="Wpisz odpowiedź..."></textarea>' : '<input type="text" placeholder="Wpisz odpowiedź...">'}
            </div>`).join('')}
          <button class="btn btn-save" onclick="alert('✓ Zapisano!')">💾 Zapisz</button>
        </div>`;
    }

    let quizHtml = '';
    if (l.quiz && l.quiz.questions.length > 0) {
      quizHtml = `
        <div class="quiz">
          <div class="quiz-title">❓ ${esc(l.quiz.title)}</div>
          ${l.quiz.questions.map((q, qi) => `
            <div class="quiz-question">
              <div class="quiz-question-text">${qi + 1}. ${esc(q.question)}</div>
              <div class="quiz-options">
                ${q.options.map((opt) => `
                  <label class="quiz-option"><input type="radio" name="q-${q.id}" value="${opt.id}"> ${esc(opt.text)}</label>`).join('')}
              </div>
            </div>`).join('')}
        </div>`;
    }

    return `
      <div class="page" id="page-${l.id}">
        <div class="progress-container">
          <div class="progress-label">Postęp: ${idx + 1} z ${allLessons.length} (${progress}%)</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        </div>
        <div class="page-header">
          <p style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;color:#666;margin-bottom:0.3rem;">${esc(l.moduleTitle)}</p>
          <h1>${esc(l.title)}</h1>
          ${l.subtitle ? `<p class="subtitle">${esc(l.subtitle)}</p>` : ''}
        </div>
        ${l.content ? `<div style="white-space:pre-wrap;margin-bottom:2rem;color:#555;line-height:1.7;">${esc(l.content)}</div>` : ''}
        ${imagesHtml}
        ${audioHtml}
        ${videoHtml}
        ${worksheetHtml}
        ${quizHtml}
        <div style="margin-top:2rem;display:flex;gap:1rem;">
          ${prevId ? `<button class="btn btn-secondary" onclick="showPage('${prevId.startsWith('intro') ? prevId : 'page-' + prevId}')">← Wstecz</button>` : ''}
          ${nextId ? `<button class="btn btn-primary" onclick="showPage('page-${nextId}')">Dalej →</button>` : ''}
        </div>
      </div>`;
  }).join('\n');

  const firstPageId = introPageIds.length > 0 ? introPageIds[0] : (allLessons.length > 0 ? `page-${allLessons[0].id}` : '');

  return `<!DOCTYPE html>
<html lang="${metadata.language || 'pl'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(metadata.title)} - Interaktywny Kurs Online</title>
  <meta name="description" content="${esc(metadata.description)}">
  <meta name="author" content="${esc(metadata.author)}">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f5f5f5;color:#333;line-height:1.6}
    .container{display:flex;min-height:100vh}
    header{position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,${branding.primaryColor},${branding.secondaryColor});color:#fff;padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center;z-index:1000;box-shadow:0 2px 10px rgba(0,0,0,.1)}
    .logo{font-size:1.5rem;font-weight:700;display:flex;align-items:center;gap:.5rem}
    .logo-icon{width:40px;height:40px;background:rgba(255,255,255,.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.2rem}
    .menu-toggle{display:none;background:0 0;border:none;color:#fff;font-size:1.5rem;cursor:pointer}
    .sidebar{width:280px;background:#fff;border-right:1px solid #ddd;overflow-y:auto;margin-top:70px;position:fixed;left:0;height:calc(100vh - 70px);z-index:999}
    .sidebar-section{padding:1.5rem 0;border-bottom:1px solid #eee}
    .sidebar-title{padding:0 1.5rem;font-weight:700;color:${branding.primaryColor};font-size:.9rem;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.8rem}
    .sidebar-link{display:block;padding:.7rem 1.5rem;color:#666;text-decoration:none;border-left:3px solid transparent;transition:all .3s;font-size:.95rem}
    .sidebar-link:hover,.sidebar-link.active{background:#eff6ff;color:${branding.primaryColor};border-left-color:${branding.primaryColor}}
    .sidebar-link.active{font-weight:600}
    main{margin-left:280px;margin-top:70px;flex:1;background:#fff;min-height:calc(100vh - 70px)}
    .page{display:none;padding:3rem 4rem;max-width:900px;margin:0 auto;animation:fadeIn .3s}
    .page.active{display:block}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .page-header{margin-bottom:2rem;border-bottom:2px solid #f0f0f0;padding-bottom:1.5rem}
    .page-header h1{font-size:2rem;color:#1f2937;margin-bottom:.5rem}
    .subtitle{color:#666;font-size:1.1rem}
    .content-block{background:#f9fafb;padding:1.5rem;border-radius:8px;margin:1.5rem 0;border-left:4px solid #e5e7eb}
    .content-block.warning{background:#fef3c7;border-left-color:#f59e0b}
    .content-block.danger{background:#fee2e2;border-left-color:#ef4444}
    .content-block.success{background:#ecfdf5;border-left-color:#10b981}
    .content-block.highlight{background:#eff6ff;border-left-color:${branding.primaryColor}}
    .progress-container{background:#f0f7ff;padding:1rem;border-radius:8px;margin-bottom:2rem}
    .progress-label{font-size:.9rem;color:#666;margin-bottom:.5rem}
    .progress-bar{width:100%;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden}
    .progress-fill{height:100%;background:linear-gradient(90deg,${branding.primaryColor},${branding.secondaryColor});transition:width .3s}
    .media-container{margin:2rem 0;text-align:center}
    .media-container img{max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.1)}
    .media-caption{font-size:.9rem;color:#666;margin-top:.8rem;font-style:italic}
    .audio-player{background:#f0f7ff;padding:1.5rem;border-radius:8px;margin:1.5rem 0;border:1px solid #bfdbfe}
    .audio-player-title{font-weight:600;color:${branding.primaryColor};margin-bottom:1rem}
    audio{width:100%}
    .worksheet{background:#f9fafb;padding:2rem;border-radius:8px;margin:2rem 0;border:2px solid #e5e7eb}
    .worksheet-title{font-size:1.2rem;font-weight:600;color:#1f2937;margin-bottom:1.5rem}
    .form-group{margin-bottom:1.5rem}
    label{display:block;font-weight:600;color:#374151;margin-bottom:.5rem}
    input[type=text],textarea{width:100%;padding:.75rem;border:1px solid #d1d5db;border-radius:6px;font-size:1rem;font-family:inherit}
    input[type=text]:focus,textarea:focus{outline:none;border-color:${branding.primaryColor};box-shadow:0 0 0 3px ${branding.primaryColor}1a}
    textarea{resize:vertical;min-height:120px}
    .quiz{background:#f9fafb;padding:2rem;border-radius:8px;margin:2rem 0;border:2px solid #e5e7eb}
    .quiz-title{font-size:1.2rem;font-weight:600;color:#1f2937;margin-bottom:1.5rem}
    .quiz-question{margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #e5e7eb}
    .quiz-question:last-child{border-bottom:none}
    .quiz-question-text{font-weight:600;color:#374151;margin-bottom:1rem}
    .quiz-options{display:flex;flex-direction:column;gap:.8rem}
    .quiz-option{display:flex;align-items:center;padding:.8rem;background:#fff;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;transition:all .3s}
    .quiz-option:hover{background:#f0f7ff;border-color:${branding.primaryColor}}
    .quiz-option input[type=radio]{margin-right:.8rem}
    .btn{display:inline-block;padding:.75rem 1.5rem;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .3s;text-decoration:none}
    .btn-primary{background:${branding.primaryColor};color:#fff}
    .btn-primary:hover{background:${branding.secondaryColor};transform:translateY(-2px);box-shadow:0 4px 12px ${branding.primaryColor}4d}
    .btn-secondary{background:#e5e7eb;color:#374151}
    .btn-secondary:hover{background:#d1d5db}
    .btn-save{background:${branding.accentColor};color:#fff}
    .btn-save:hover{opacity:.9}
    .video-container{position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1.5rem 0;background:#000}
    .video-container iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}
    footer{background:#1f2937;color:#d1d5db;padding:3rem 2rem;margin-left:280px;text-align:center}
    @media(max-width:768px){.sidebar{transform:translateX(-100%);transition:transform .3s;width:250px}.sidebar.active{transform:translateX(0)}main{margin-left:0}footer{margin-left:0}.menu-toggle{display:block}.page{padding:2rem 1.5rem}}
  </style>
</head>
<body>
  <header>
    <div class="logo"><div class="logo-icon">📚</div><span>${esc(metadata.title || 'Webbook')}</span></div>
    <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
  </header>
  <div class="container">
    <aside class="sidebar" id="sidebar">
      ${introSidebarLinks}
      ${sidebarSections}
    </aside>
    <main>
      ${introPagesHtml}
      ${pages}
    </main>
  </div>
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${esc(metadata.author)}. Wszystkie prawa zastrzeżone.</p>
    <p>Webbook stworzony przez <strong>Webbook 3.0 Creator</strong></p>
  </footer>
  <script>
    function showPage(id){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});var el=document.getElementById(id);if(el){el.classList.add('active');window.scrollTo(0,0)}document.querySelectorAll('.sidebar-link').forEach(function(l){l.classList.remove('active')});var al=document.querySelector("[onclick=\\"showPage('"+id+"')\\"]");if(al)al.classList.add('active');if(window.innerWidth<=768)document.getElementById('sidebar').classList.remove('active')}
    function toggleSidebar(){document.getElementById('sidebar').classList.toggle('active')}
    document.addEventListener('DOMContentLoaded',function(){showPage('${firstPageId}')});
  </script>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
