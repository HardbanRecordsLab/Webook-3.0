import type { Chapter, WebookMeta, QuizOption } from './blocks'

// ═══════════════════════════════════════════════════════════
// WEBOOK HTML EXPORT ENGINE
// Generates standalone interactive HTML from a Webook
// ═══════════════════════════════════════════════════════════

export function exportToHTML(chapters: Chapter[], meta: WebookMeta): string {
  const totalBlocks = chapters.reduce((acc, ch) => acc + ch.blocks.length, 0)
  const hasQuiz = chapters.some(ch => ch.blocks.some(b => b.type === 'quiz'))

  const chaptersNav = chapters.map((ch, i) =>
    `<button class="toc-item" onclick="goTo(${i})" id="toc-${i}">${ch.emoji || '📖'} ${ch.title}</button>`
  ).join('\n')

  const chaptersContent = chapters.map((ch, ci) => `
    <section class="chapter" id="chapter-${ci}" style="display:${ci===0?'block':'none'}">
      <div class="chapter-header">
        <span class="chapter-emoji">${ch.emoji || '📖'}</span>
        <h1 class="chapter-title">${ch.title}</h1>
      </div>
      ${ch.blocks.map((b, bi) => renderBlockToHTML(b, ci, bi)).join('\n')}
    </section>
  `).join('\n')

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@500;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* ─── RESET & VARS ─────────────────────────────── */
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#060E1C;--bg1:#0A1628;--bg2:#0F1F35;--bg3:#162844;
  --blue:#1E6FDB;--blue2:#2563EB;--gold:#F59E0B;--orange:#EA6C1E;
  --ink:#F0F4FF;--ink2:#9BB0CC;--ink3:#4D6A8A;
  --emerald:#34d399;--red:#f87171;--violet:#a78bfa;--amber:#fbbf24;
  --font-display:'Cabinet Grotesk',system-ui,sans-serif;
  --font-body:'DM Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --r:14px;
}
html{scroll-behavior:smooth}
body{font-family:var(--font-body);background:var(--bg);color:var(--ink);min-height:100vh;
  background-image:radial-gradient(ellipse 60% 40% at 20% 0%,rgba(30,111,219,0.1) 0%,transparent 60%),
    radial-gradient(ellipse 40% 30% at 80% 100%,rgba(234,108,30,0.07) 0%,transparent 60%);}
::selection{background:rgba(30,111,219,0.3)}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:2px}

/* ─── LAYOUT ────────────────────────────────────── */
.app{display:flex;height:100vh;overflow:hidden}
.sidebar{width:260px;flex-shrink:0;background:var(--bg1);border-right:1px solid rgba(255,255,255,0.06);
  display:flex;flex-direction:column;overflow:hidden}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}

/* ─── SIDEBAR ───────────────────────────────────── */
.sidebar-header{padding:20px;border-bottom:1px solid rgba(255,255,255,0.06)}
.book-title{font-family:var(--font-display);font-weight:800;font-size:16px;color:var(--ink);line-height:1.2;margin-bottom:4px}
.book-author{font-size:12px;color:var(--ink3)}
.progress-wrap{margin-top:14px}
.progress-label{display:flex;justify-content:space-between;font-size:11px;color:var(--ink3);margin-bottom:6px}
.progress-bar{height:4px;background:var(--bg3);border-radius:2px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--gold));border-radius:2px;
  transition:width 0.5s cubic-bezier(0.16,1,0.3,1)}
.toc{flex:1;padding:8px;overflow-y:auto}
.toc-item{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:10px;
  background:transparent;border:none;color:var(--ink2);font-size:13px;font-family:var(--font-body);
  font-weight:500;text-align:left;cursor:pointer;transition:all 0.15s}
.toc-item:hover{background:rgba(255,255,255,0.04);color:var(--ink)}
.toc-item.active{background:rgba(30,111,219,0.12);color:#E8F0FE;border:1px solid rgba(30,111,219,0.25)}
.sidebar-footer{padding:12px;border-top:1px solid rgba(255,255,255,0.06)}

/* ─── TOPBAR ────────────────────────────────────── */
.topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;
  border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(6,14,28,0.8);backdrop-filter:blur(16px);flex-shrink:0}
.chapter-label{font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--ink)}
.chapter-num{font-family:var(--font-mono);font-size:12px;color:var(--ink3)}

/* ─── CONTENT ───────────────────────────────────── */
.content{flex:1;overflow-y:auto;padding:40px 0}
.content-wrap{max-width:680px;margin:0 auto;padding:0 32px}
.chapter{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.chapter-header{display:flex;align-items:center;gap:16px;margin-bottom:32px}
.chapter-emoji{font-size:40px}
.chapter-title{font-family:var(--font-display);font-weight:800;font-size:32px;color:var(--ink)}

/* ─── BLOCKS ────────────────────────────────────── */
.block{margin-bottom:20px}
.b-h1{font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--ink);line-height:1.15}
.b-h2{font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--ink);margin-top:8px}
.b-h3{font-family:var(--font-display);font-weight:600;font-size:18px;color:rgba(240,244,255,0.85);margin-top:4px}
.b-p{font-size:15px;color:var(--ink2);line-height:1.75}
.b-quote{display:flex;gap:16px;padding:4px 0}
.b-quote-bar{width:3px;flex-shrink:0;background:linear-gradient(to bottom,var(--emerald),#14b8a6);border-radius:2px}
.b-quote-text{font-size:16px;font-style:italic;color:var(--ink2);line-height:1.6}
.b-callout{display:flex;gap:12px;padding:16px;border-radius:14px;border:1px solid}
.b-callout.amber{background:rgba(245,158,11,0.08);border-color:rgba(245,158,11,0.3)}
.b-callout.blue{background:rgba(30,111,219,0.08);border-color:rgba(30,111,219,0.3)}
.b-callout.green{background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.3)}
.b-callout.red{background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.3)}
.b-callout.purple{background:rgba(139,92,246,0.08);border-color:rgba(139,92,246,0.3)}
.b-callout-icon{font-size:20px;flex-shrink:0}
.b-callout-text{font-size:14px;color:var(--ink2);line-height:1.6}
.b-note{display:flex;gap:12px;padding:14px;border-radius:12px;background:rgba(30,111,219,0.06);border:1px solid rgba(30,111,219,0.2)}
.b-code{border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}
.b-code-header{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;
  background:var(--bg3);border-bottom:1px solid rgba(255,255,255,0.06)}
.b-code-dots{display:flex;gap:6px}
.b-code-dot{width:10px;height:10px;border-radius:50%}
.b-code-lang{font-family:var(--font-mono);font-size:10px;color:var(--ink3);text-transform:uppercase;letter-spacing:0.1em}
.b-code pre{background:#080f1a;padding:20px;font-family:var(--font-mono);font-size:13px;color:#86efac;
  overflow-x:auto;line-height:1.6;margin:0}
.b-image img{width:100%;border-radius:14px;max-height:360px;object-fit:cover;border:1px solid rgba(255,255,255,0.06)}
.b-image figcaption{text-align:center;font-size:12px;color:var(--ink3);margin-top:8px;font-style:italic}
.b-video iframe,.b-embed iframe{width:100%;aspect-ratio:16/9;border:none;border-radius:14px;overflow:hidden}
.b-divider{display:flex;align-items:center;gap:12px;padding:12px 0}
.b-divider-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)}
.b-divider-icon{color:var(--ink3);font-size:14px}
.b-spacer{display:block}
.b-cols{display:grid;gap:16px}
.b-cols.cols-2{grid-template-columns:1fr 1fr}
.b-cols.cols-3{grid-template-columns:1fr 1fr 1fr}
.b-col{background:var(--bg2);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;
  font-size:14px;color:var(--ink2);line-height:1.6}

/* ─── QUIZ ──────────────────────────────────────── */
.b-quiz{background:var(--bg2);border:1px solid rgba(245,158,11,0.2);border-radius:16px;padding:20px}
.b-quiz-label{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:11px;
  font-family:var(--font-mono);color:rgba(245,158,11,0.6);text-transform:uppercase;letter-spacing:0.15em}
.b-quiz-q{font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--ink);margin-bottom:16px}
.b-quiz-opts{display:flex;flex-direction:column;gap:8px}
.b-quiz-opt{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;
  background:var(--bg3);border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.2s;font-size:14px;color:var(--ink2)}
.b-quiz-opt:hover{border-color:rgba(30,111,219,0.4);background:rgba(30,111,219,0.06);color:var(--ink)}
.b-quiz-opt.correct{border-color:rgba(52,211,153,0.5);background:rgba(52,211,153,0.1);color:#6ee7b7}
.b-quiz-opt.wrong{border-color:rgba(248,113,113,0.5);background:rgba(248,113,113,0.1);color:#fca5a5}
.b-quiz-opt.disabled{cursor:default;pointer-events:none}
.b-quiz-letter{width:28px;height:28px;border-radius:8px;background:var(--bg1);display:flex;
  align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;font-family:var(--font-mono)}
.b-quiz-feedback{margin-top:12px;padding:12px;border-radius:10px;font-size:13px;font-weight:600;display:none}
.b-quiz-feedback.show{display:block}
.b-quiz-feedback.ok{background:rgba(52,211,153,0.1);color:#6ee7b7;border:1px solid rgba(52,211,153,0.2)}
.b-quiz-feedback.bad{background:rgba(248,113,113,0.1);color:#fca5a5;border:1px solid rgba(248,113,113,0.2)}

/* ─── POLL ──────────────────────────────────────── */
.b-poll{background:var(--bg2);border:1px solid rgba(52,211,153,0.2);border-radius:16px;padding:20px}
.b-poll-q{font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--ink);margin-bottom:14px}
.b-poll-opt{display:flex;align-items:center;gap:12px;margin-bottom:8px;cursor:pointer}
.b-poll-radio{width:18px;height:18px;border-radius:50%;border:2px solid var(--ink3);flex-shrink:0;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
.b-poll-opt.voted .b-poll-radio{border-color:var(--emerald);background:var(--emerald)}
.b-poll-bar-wrap{flex:1;height:6px;background:var(--bg3);border-radius:3px;overflow:hidden}
.b-poll-bar{height:100%;background:linear-gradient(90deg,var(--blue),var(--emerald));border-radius:3px;transition:width 0.6s}
.b-poll-pct{font-size:11px;font-family:var(--font-mono);color:var(--ink3);min-width:30px;text-align:right}

/* ─── CHECKLIST ─────────────────────────────────── */
.b-checklist{background:var(--bg2);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px}
.b-check-item{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer}
.b-check-item:last-child{border-bottom:none}
.b-check-box{width:20px;height:20px;border-radius:6px;border:2px solid var(--ink3);flex-shrink:0;
  transition:all 0.2s;display:flex;align-items:center;justify-content:center}
.b-check-item.done .b-check-box{background:var(--emerald);border-color:var(--emerald)}
.b-check-item.done .b-check-text{text-decoration:line-through;color:var(--ink3)}
.b-check-text{font-size:14px;color:var(--ink2);transition:all 0.2s}
.b-checklist-progress{margin-bottom:14px}

/* ─── FLASHCARDS ────────────────────────────────── */
.b-flashcards{background:var(--bg2);border:1px solid rgba(139,92,246,0.2);border-radius:16px;padding:20px}
.b-flashcard-wrap{perspective:1000px;cursor:pointer;height:150px;margin-bottom:12px}
.b-flashcard{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 0.5s}
.b-flashcard.flipped{transform:rotateY(180deg)}
.b-flashcard-face{position:absolute;inset:0;border-radius:12px;display:flex;align-items:center;justify-content:center;
  padding:20px;text-align:center;backface-visibility:hidden;font-size:16px;line-height:1.4}
.b-flashcard-front{background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);color:var(--ink)}
.b-flashcard-back{background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.25);color:var(--ink2);transform:rotateY(180deg)}
.b-flashcard-nav{display:flex;align-items:center;justify-content:space-between;gap:8px}
.b-fc-btn{background:var(--bg3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;
  padding:6px 12px;color:var(--ink2);font-size:12px;cursor:pointer;transition:all 0.15s;font-family:var(--font-body)}
.b-fc-btn:hover{background:var(--blue);color:white;border-color:var(--blue)}
.b-fc-counter{font-family:var(--font-mono);font-size:12px;color:var(--ink3)}

/* ─── TABLE ─────────────────────────────────────── */
.b-table{overflow-x:auto;border-radius:12px;border:1px solid rgba(255,255,255,0.08)}
.b-table table{width:100%;border-collapse:collapse;font-size:13px}
.b-table th{background:var(--bg3);padding:10px 14px;text-align:left;font-weight:700;color:var(--gold);
  border-bottom:1px solid rgba(255,255,255,0.08);font-family:var(--font-display)}
.b-table td{padding:10px 14px;color:var(--ink2);border-bottom:1px solid rgba(255,255,255,0.04)}
.b-table tr:last-child td{border-bottom:none}
.b-table tr:hover td{background:rgba(255,255,255,0.02)}

/* ─── TOGGLE ────────────────────────────────────── */
.b-toggle{border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden}
.b-toggle-header{display:flex;align-items:center;gap:10px;padding:14px 16px;background:var(--bg2);
  cursor:pointer;font-weight:600;font-size:14px;color:var(--ink);user-select:none}
.b-toggle-icon{transition:transform 0.25s;font-size:12px;color:var(--ink3)}
.b-toggle.open .b-toggle-icon{transform:rotate(90deg)}
.b-toggle-body{max-height:0;overflow:hidden;transition:max-height 0.3s cubic-bezier(0.16,1,0.3,1)}
.b-toggle.open .b-toggle-body{max-height:500px}
.b-toggle-content{padding:14px 16px;font-size:14px;color:var(--ink2);line-height:1.6;
  background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.06)}

/* ─── TIMELINE ──────────────────────────────────── */
.b-timeline{display:flex;flex-direction:column;gap:0}
.b-tl-item{display:flex;gap:16px}
.b-tl-track{display:flex;flex-direction:column;align-items:center}
.b-tl-dot{width:12px;height:12px;border-radius:50%;background:var(--blue);border:2px solid var(--blue2);flex-shrink:0;margin-top:4px}
.b-tl-line{width:2px;flex:1;background:linear-gradient(to bottom,rgba(30,111,219,0.3),transparent);margin-top:4px}
.b-tl-content{flex:1;padding-bottom:24px}
.b-tl-date{font-family:var(--font-mono);font-size:11px;color:var(--gold);margin-bottom:4px}
.b-tl-title{font-weight:700;font-size:14px;color:var(--ink);margin-bottom:2px}
.b-tl-desc{font-size:13px;color:var(--ink2)}

/* ─── STEPS ─────────────────────────────────────── */
.b-steps{display:flex;flex-direction:column;gap:12px}
.b-step{display:flex;gap:16px}
.b-step-num{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--blue2));
  display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:white;flex-shrink:0}
.b-step-body{flex:1;background:var(--bg2);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px 16px}
.b-step-title{font-weight:700;font-size:14px;color:var(--ink);margin-bottom:4px}
.b-step-desc{font-size:13px;color:var(--ink2)}

/* ─── KEYTERM ───────────────────────────────────── */
.b-keyterm{display:flex;gap:12px;padding:16px;background:rgba(245,158,11,0.05);
  border:1px solid rgba(245,158,11,0.25);border-radius:14px}
.b-keyterm-icon{font-size:20px;flex-shrink:0}
.b-keyterm-term{font-family:var(--font-display);font-weight:800;font-size:16px;color:var(--amber);margin-bottom:4px}
.b-keyterm-def{font-size:14px;color:var(--ink2);line-height:1.5}

/* ─── HIGHLIGHT ─────────────────────────────────── */
.b-hl{padding:20px;border-radius:16px;background:linear-gradient(135deg,rgba(30,111,219,0.08),rgba(234,108,30,0.05));
  border:1px solid rgba(30,111,219,0.2);font-size:15px;color:var(--ink2);line-height:1.6}

/* ─── PROGRESS ──────────────────────────────────── */
.b-progress{padding:4px 0}
.b-progress-header{display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px}
.b-progress-label{color:var(--ink);font-weight:600}
.b-progress-val{font-family:var(--font-mono);font-size:12px;color:var(--gold)}
.b-progress-track{height:10px;background:var(--bg3);border-radius:5px;overflow:hidden}
.b-progress-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--gold));border-radius:5px;transition:width 1s}

/* ─── RATING ────────────────────────────────────── */
.b-rating{display:flex;flex-direction:column;gap:10px}
.b-rating-label{font-size:14px;font-weight:600;color:var(--ink)}
.b-rating-stars{display:flex;gap:8px;font-size:28px;cursor:pointer}
.b-rating-star{transition:transform 0.15s;color:rgba(255,255,255,0.15)}
.b-rating-star.active{color:var(--amber)}
.b-rating-star:hover{transform:scale(1.15)}
.b-rating-result{font-size:12px;color:var(--ink3);font-family:var(--font-mono);margin-top:4px}

/* ─── STATS CARD ────────────────────────────────── */
.b-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px}
.b-stat{background:var(--bg2);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:16px;text-align:center}
.b-stat-val{font-family:var(--font-display);font-weight:800;font-size:24px;
  background:linear-gradient(135deg,var(--blue),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.b-stat-label{font-size:11px;color:var(--ink3);margin-top:4px;text-transform:uppercase;letter-spacing:0.08em}

/* ─── COMPARISON ────────────────────────────────── */
.b-comparison{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.b-comp-col{border-radius:14px;padding:16px}
.b-comp-col.left{background:rgba(30,111,219,0.06);border:1px solid rgba(30,111,219,0.25)}
.b-comp-col.right{background:rgba(234,108,30,0.06);border:1px solid rgba(234,108,30,0.25)}
.b-comp-title{font-family:var(--font-display);font-weight:700;font-size:15px;margin-bottom:12px}
.b-comp-col.left .b-comp-title{color:#60a5fa}
.b-comp-col.right .b-comp-title{color:var(--orange)}
.b-comp-item{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:var(--ink2)}
.b-comp-check{color:var(--emerald)}

/* ─── INTERACTIVE TOOL ──────────────────────────── */
.b-tool{border-radius:16px;overflow:hidden;border:1px solid rgba(245,158,11,0.15)}
.b-tool iframe{width:100%;border:none;display:block}

/* ─── COUNTDOWN ─────────────────────────────────── */
.b-countdown{display:flex;align-items:center;gap:20px;padding:16px;background:var(--bg2);
  border:1px solid rgba(244,63,94,0.2);border-radius:14px}
.b-cd-num{font-family:var(--font-display);font-weight:800;font-size:48px;
  background:linear-gradient(135deg,var(--gold),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.b-cd-label{font-size:11px;color:var(--ink3);text-transform:uppercase;letter-spacing:0.1em}
.b-cd-text{font-size:15px;font-weight:600;color:var(--ink)}

/* ─── SORTABLE (reader view) ────────────────────── */
.b-sortable{background:var(--bg2);border:1px solid rgba(249,115,22,0.2);border-radius:16px;padding:20px}
.b-sort-instruction{font-weight:700;font-size:15px;color:var(--ink);margin-bottom:14px}
.b-sort-items{display:flex;flex-direction:column;gap:8px}
.b-sort-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg3);
  border:1px solid rgba(255,255,255,0.08);border-radius:10px;cursor:grab;user-select:none}
.b-sort-grip{color:var(--ink3);font-size:16px}
.b-sort-check{display:none}

/* ─── MATCHING (reader view) ────────────────────── */
.b-matching{background:var(--bg2);border:1px solid rgba(6,182,212,0.2);border-radius:16px;padding:20px}
.b-match-instruction{font-weight:700;font-size:15px;color:var(--ink);margin-bottom:14px}
.b-match-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.b-match-col-title{font-size:11px;font-family:var(--font-mono);color:var(--ink3);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px}
.b-match-item{padding:8px 12px;background:var(--bg3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;
  font-size:13px;color:var(--ink2);margin-bottom:6px;cursor:pointer;transition:all 0.15s}
.b-match-item:hover,.b-match-item.selected{border-color:var(--blue);color:var(--ink);background:rgba(30,111,219,0.1)}
.b-match-item.matched{border-color:var(--emerald);background:rgba(52,211,153,0.1);color:#6ee7b7;cursor:default}

/* ─── NAV BAR ───────────────────────────────────── */
.nav-bar{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;
  border-top:1px solid rgba(255,255,255,0.06);background:rgba(10,22,40,0.9);backdrop-filter:blur(16px);flex-shrink:0}
.nav-btn{display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:12px;
  border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);
  color:var(--ink2);font-size:13px;font-family:var(--font-body);font-weight:600;
  cursor:pointer;transition:all 0.2s}
.nav-btn:hover{background:rgba(255,255,255,0.08);color:var(--ink)}
.nav-btn:disabled{opacity:0.3;cursor:default}
.nav-btn.primary{background:linear-gradient(135deg,var(--blue),var(--blue2));color:white;border-color:var(--blue);
  box-shadow:0 0 24px rgba(30,111,219,0.3)}
.nav-btn.primary:hover{box-shadow:0 0 32px rgba(30,111,219,0.5)}
.nav-dots{display:flex;gap:6px}
.nav-dot{height:4px;border-radius:2px;transition:all 0.3s}
.nav-dot.done{width:12px;background:rgba(52,211,153,0.5)}
.nav-dot.active{width:24px;background:var(--gold)}
.nav-dot.inactive{width:12px;background:var(--bg3)}

/* ─── RESPONSIVE ────────────────────────────────── */
@media(max-width:768px){
  .sidebar{display:none}
  .b-cols.cols-2,.b-cols.cols-3{grid-template-columns:1fr}
  .b-comparison{grid-template-columns:1fr}
  .content-wrap{padding:0 16px}
  .chapter-title{font-size:24px}
}
</style>
</head>
<body>
<div class="app">
  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="book-title">${meta.title}</div>
      <div class="book-author">by ${meta.author || 'Autor'}</div>
      <div class="progress-wrap">
        <div class="progress-label"><span>Postęp</span><span id="pct">0%</span></div>
        <div class="progress-bar"><div class="progress-fill" id="pfill" style="width:0%"></div></div>
      </div>
    </div>
    <nav class="toc">
      ${chaptersNav}
    </nav>
  </aside>

  <!-- MAIN -->
  <div class="main">
    <div class="topbar">
      <span class="chapter-label" id="ch-label">${chapters[0]?.title || ''}</span>
      <span class="chapter-num" id="ch-num">01 / ${String(chapters.length).padStart(2,'0')}</span>
    </div>

    <div class="content">
      <div class="content-wrap">
        ${chaptersContent}
      </div>
    </div>

    <nav class="nav-bar">
      <button class="nav-btn" id="btn-prev" onclick="navigate(-1)" disabled>← Poprzedni</button>
      <div class="nav-dots" id="nav-dots"></div>
      <button class="nav-btn primary" id="btn-next" onclick="navigate(1)">Następny →</button>
    </nav>
  </div>
</div>

<script>
// ─── Navigation ────────────────────────────────────────────
const CHAPTERS = ${JSON.stringify(chapters.map(ch => ({ title: ch.title, emoji: ch.emoji })))};
let current = 0;
const done = new Set();

function goTo(idx) {
  document.querySelectorAll('.chapter').forEach((el, i) => el.style.display = i === idx ? 'block' : 'none');
  document.querySelectorAll('.toc-item').forEach((el, i) => el.classList.toggle('active', i === idx));
  document.getElementById('ch-label').textContent = CHAPTERS[idx].title;
  document.getElementById('ch-num').textContent = String(idx+1).padStart(2,'0') + ' / ' + String(CHAPTERS.length).padStart(2,'0');
  document.getElementById('btn-prev').disabled = idx === 0;
  document.getElementById('btn-next').textContent = idx === CHAPTERS.length-1 ? '🏆 Ukończ' : 'Następny →';
  done.add(current);
  current = idx;
  updateProgress();
  renderDots();
  window.scrollTo({top:0,behavior:'smooth'});
}

function navigate(dir) {
  const next = current + dir;
  if (next < 0 || next > CHAPTERS.length-1) {
    if (dir === 1 && current === CHAPTERS.length-1) showComplete();
    return;
  }
  goTo(next);
}

function updateProgress() {
  const pct = Math.round(((done.size) / CHAPTERS.length) * 100);
  document.getElementById('pct').textContent = pct + '%';
  document.getElementById('pfill').style.width = pct + '%';
}

function renderDots() {
  const dots = document.getElementById('nav-dots');
  dots.innerHTML = CHAPTERS.map((_,i) => {
    const cls = i === current ? 'active' : done.has(i) ? 'done' : 'inactive';
    return '<div class="nav-dot '+cls+'"></div>';
  }).join('');
}

function showComplete() {
  done.add(current);
  updateProgress();
  alert('🏆 Gratulacje! Ukończyłeś "' + ${JSON.stringify(meta.title)} + '"!\\n\\nTwój certyfikat jest generowany...');
}

renderDots();
goTo(0);

// ─── Quiz Logic ────────────────────────────────────────────
function answerQuiz(quizId, optId, isCorrect, feedbackCorrect, feedbackWrong) {
  const quiz = document.getElementById('quiz-' + quizId);
  const opts = quiz.querySelectorAll('.b-quiz-opt');
  const fb = document.getElementById('fb-' + quizId);
  opts.forEach(opt => {
    opt.classList.add('disabled');
    if (opt.dataset.id === optId) opt.classList.add(isCorrect ? 'correct' : 'wrong');
    if (opt.dataset.correct === 'true') opt.classList.add('correct');
  });
  fb.textContent = isCorrect ? feedbackCorrect : feedbackWrong;
  fb.className = 'b-quiz-feedback show ' + (isCorrect ? 'ok' : 'bad');
}

// ─── Poll Logic ────────────────────────────────────────────
function vote(pollId, optIdx, totalOpts) {
  const poll = document.getElementById('poll-' + pollId);
  const opts = poll.querySelectorAll('.b-poll-opt');
  opts.forEach(o => o.classList.remove('voted'));
  opts[optIdx].classList.add('voted');
  // Simulate vote distribution
  const votes = Array.from({length: totalOpts}, (_, i) => i === optIdx ? 45 : Math.floor(Math.random()*30)+5);
  const total = votes.reduce((a,b) => a+b, 0);
  const bars = poll.querySelectorAll('.b-poll-bar');
  const pcts = poll.querySelectorAll('.b-poll-pct');
  bars.forEach((bar, i) => bar.style.width = ((votes[i]/total)*100) + '%');
  pcts.forEach((p, i) => p.textContent = Math.round((votes[i]/total)*100) + '%');
}

// ─── Checklist Logic ──────────────────────────────────────
function toggleCheck(itemEl) {
  itemEl.classList.toggle('done');
  const checklistEl = itemEl.closest('.b-checklist');
  const items = checklistEl.querySelectorAll('.b-check-item');
  const doneCount = checklistEl.querySelectorAll('.b-check-item.done').length;
  const prog = checklistEl.querySelector('.b-progress-fill');
  const label = checklistEl.querySelector('.b-progress-val');
  if (prog) prog.style.width = ((doneCount / items.length) * 100) + '%';
  if (label) label.textContent = doneCount + '/' + items.length;
}

// ─── Flashcard Logic ──────────────────────────────────────
const fcState = {};
function initFC(id, total) { fcState[id] = { current: 0, total, flipped: false }; }
function flipCard(id) {
  const card = document.getElementById('fc-card-' + id);
  fcState[id].flipped = !fcState[id].flipped;
  card.classList.toggle('flipped', fcState[id].flipped);
}
function nextCard(id, dir) {
  const s = fcState[id];
  s.current = (s.current + dir + s.total) % s.total;
  s.flipped = false;
  const card = document.getElementById('fc-card-' + id);
  const fronts = document.querySelectorAll('#fc-' + id + ' .fc-front');
  const backs = document.querySelectorAll('#fc-' + id + ' .fc-back');
  fronts.forEach((el, i) => el.style.display = i === s.current ? 'flex' : 'none');
  backs.forEach((el, i) => el.style.display = i === s.current ? 'flex' : 'none');
  card.classList.remove('flipped');
  document.getElementById('fc-counter-' + id).textContent = (s.current + 1) + ' / ' + s.total;
}

// ─── Toggle Logic ──────────────────────────────────────────
function toggleBlock(el) { el.classList.toggle('open'); }

// ─── Rating Logic ──────────────────────────────────────────
function setRating(id, val, max) {
  const stars = document.querySelectorAll('#rating-' + id + ' .b-rating-star');
  stars.forEach((s, i) => s.classList.toggle('active', i < val));
  const res = document.getElementById('rating-res-' + id);
  if (res) res.textContent = val + ' / ' + max + ' ★';
}

// ─── Matching Logic ────────────────────────────────────────
const matchState = {};
function selectMatchItem(matchId, col, idx) {
  if (!matchState[matchId]) matchState[matchId] = { left: null, right: null };
  const s = matchState[matchId];
  const allLeft = document.querySelectorAll('#match-' + matchId + ' .left-item');
  const allRight = document.querySelectorAll('#match-' + matchId + ' .right-item');
  if (col === 'left') {
    allLeft.forEach(el => el.classList.remove('selected'));
    if (!document.querySelectorAll('#match-' + matchId + ' .left-item')[idx].classList.contains('matched'))
      document.querySelectorAll('#match-' + matchId + ' .left-item')[idx].classList.add('selected');
    s.left = idx;
  } else {
    allRight.forEach(el => el.classList.remove('selected'));
    if (!document.querySelectorAll('#match-' + matchId + ' .right-item')[idx].classList.contains('matched'))
      document.querySelectorAll('#match-' + matchId + ' .right-item')[idx].classList.add('selected');
    s.right = idx;
  }
  if (s.left !== null && s.right !== null) {
    if (s.left === s.right) {
      allLeft[s.left].classList.remove('selected'); allLeft[s.left].classList.add('matched');
      allRight[s.right].classList.remove('selected'); allRight[s.right].classList.add('matched');
    }
    s.left = null; s.right = null;
  }
}
</script>
</body>
</html>`
}

// ─── Render block to HTML ─────────────────────────────────
function renderBlockToHTML(block: { id: string; type: string; content: string; props?: Record<string, unknown> }, ci: number, bi: number): string {
  const id = `b-${ci}-${bi}`
  const p = block.props || {}

  switch (block.type) {
    case 'h1': return `<div class="block"><h2 class="b-h1">${esc(block.content)}</h2></div>`
    case 'h2': return `<div class="block"><h3 class="b-h2">${esc(block.content)}</h3></div>`
    case 'h3': return `<div class="block"><h4 class="b-h3">${esc(block.content)}</h4></div>`
    case 'paragraph': return `<div class="block"><p class="b-p">${esc(block.content)}</p></div>`
    case 'quote': return `<div class="block b-quote"><div class="b-quote-bar"></div><div class="b-quote-text">${esc(block.content)}</div></div>`
    case 'callout': {
      const color = (p.color as string) || 'amber'
      return `<div class="block b-callout ${color}"><span class="b-callout-icon">${p.icon || '💡'}</span><div class="b-callout-text">${esc(block.content)}</div></div>`
    }
    case 'note': return `<div class="block b-note"><span class="b-callout-icon">${p.icon || '📌'}</span><div class="b-callout-text">${esc(block.content)}</div></div>`
    case 'codeblock': {
      const lang = (p.language as string) || 'code'
      return `<div class="block b-code"><div class="b-code-header"><div class="b-code-dots"><div class="b-code-dot" style="background:#f87171"></div><div class="b-code-dot" style="background:#fbbf24"></div><div class="b-code-dot" style="background:#34d399"></div></div><span class="b-code-lang">${lang}</span></div><pre><code>${esc(block.content)}</code></pre></div>`
    }
    case 'image': return `<div class="block b-image"><figure><img src="${esc(block.content)}" alt="${esc((p.alt as string) || '')}" loading="lazy"/>${p.alt ? `<figcaption>${esc(p.alt as string)}</figcaption>` : ''}</figure></div>`
    case 'video': {
      const src = getVideoEmbed(block.content)
      return src ? `<div class="block b-video"><iframe src="${src}" allowfullscreen></iframe></div>` : ''
    }
    case 'audio': return block.content ? `<div class="block"><audio controls style="width:100%;border-radius:8px"><source src="${esc(block.content)}"/></audio></div>` : ''
    case 'embed': return block.content ? `<div class="block b-embed"><iframe src="${esc(block.content)}" sandbox="allow-scripts allow-same-origin"></iframe></div>` : ''
    case 'divider': return `<div class="block b-divider"><div class="b-divider-line"></div><div class="b-divider-icon">✦</div><div class="b-divider-line"></div></div>`
    case 'spacer': return `<div class="b-spacer" style="height:${(p.height as number) || 40}px"></div>`
    case 'columns2': {
      return `<div class="block b-cols cols-2"><div class="b-col">${esc((p.col1 as string) || '')}</div><div class="b-col">${esc((p.col2 as string) || '')}</div></div>`
    }
    case 'columns3': {
      return `<div class="block b-cols cols-3"><div class="b-col">${esc((p.col1 as string) || '')}</div><div class="b-col">${esc((p.col2 as string) || '')}</div><div class="b-col">${esc((p.col3 as string) || '')}</div></div>`
    }
    case 'quiz': {
      const opts = (p.options as QuizOption[]) || []
      const fb = (p.feedback as Record<string,string>) || { correct: '✅ Poprawnie!', incorrect: '❌ Błędna odpowiedź.' }
      const letters = ['A','B','C','D','E','F']
      const optsHtml = opts.map((opt, i) =>
        `<div class="b-quiz-opt" data-id="${opt.id}" data-correct="${opt.isCorrect}" onclick="answerQuiz('${id}','${opt.id}',${opt.isCorrect},'${esc(fb.correct)}','${esc(fb.incorrect)}')">
          <div class="b-quiz-letter">${letters[i]}</div>
          ${esc(opt.text)}
        </div>`
      ).join('\n')
      return `<div class="block b-quiz" id="quiz-${id}">
        <div class="b-quiz-label"><span>❓</span> Quiz · ${p.points || 1} pkt</div>
        <div class="b-quiz-q">${esc(block.content)}</div>
        <div class="b-quiz-opts">${optsHtml}</div>
        <div class="b-quiz-feedback" id="fb-${id}"></div>
      </div>`
    }
    case 'poll': {
      const opts = (p.options as string[]) || []
      const optsHtml = opts.map((opt, i) =>
        `<div class="b-poll-opt" onclick="vote('${id}',${i},${opts.length})">
          <div class="b-poll-radio"></div>
          <span style="font-size:14px;min-width:80px;color:var(--ink2)">${esc(opt)}</span>
          <div class="b-poll-bar-wrap"><div class="b-poll-bar" style="width:0%"></div></div>
          <div class="b-poll-pct">0%</div>
        </div>`
      ).join('\n')
      return `<div class="block b-poll" id="poll-${id}">
        <div class="b-poll-q">${esc(block.content)}</div>
        ${optsHtml}
      </div>`
    }
    case 'checklist': {
      const items = (p.items as { id: string; text: string; done: boolean }[]) || []
      const itemsHtml = items.map(item =>
        `<div class="b-check-item${item.done ? ' done' : ''}" onclick="toggleCheck(this)">
          <div class="b-check-box"><span style="font-size:10px;font-weight:800;color:#060E1C">✓</span></div>
          <span class="b-check-text">${esc(item.text)}</span>
        </div>`
      ).join('\n')
      return `<div class="block b-checklist">
        <div class="b-checklist-progress">
          <div class="b-progress-header"><span class="b-progress-label">Postęp</span><span class="b-progress-val">0/${items.length}</span></div>
          <div class="b-progress-track"><div class="b-progress-fill" style="width:0%"></div></div>
        </div>
        ${itemsHtml}
      </div>`
    }
    case 'flashcards': {
      const cards = (p.cards as { id: string; front: string; back: string }[]) || []
      const fronts = cards.map((c, i) => `<div class="fc-front b-flashcard-face b-flashcard-front" style="display:${i===0?'flex':'none'};flex-direction:column">${esc(c.front)}</div>`).join('')
      const backs = cards.map((c, i) => `<div class="fc-back b-flashcard-face b-flashcard-back" style="display:${i===0?'flex':'none'};flex-direction:column">${esc(c.back)}</div>`).join('')
      return `<div class="block b-flashcards" id="fc-${id}">
        <div class="b-flashcard-wrap" onclick="flipCard('${id}')">
          <div class="b-flashcard" id="fc-card-${id}">
            <div class="b-flashcard-front">${fronts}</div>
            <div class="b-flashcard-back">${backs}</div>
          </div>
        </div>
        <div class="b-flashcard-nav">
          <button class="b-fc-btn" onclick="nextCard('${id}',-1)">← Poprzednia</button>
          <span class="b-fc-counter" id="fc-counter-${id}">1 / ${cards.length}</span>
          <button class="b-fc-btn" onclick="nextCard('${id}',1)">Następna →</button>
        </div>
      </div>
      <script>initFC('${id}',${cards.length})<\/script>`
    }
    case 'sortable': {
      const items = (p.items as { id: string; text: string }[]) || []
      return `<div class="block b-sortable">
        <div class="b-sort-instruction">${esc(block.content)}</div>
        <div class="b-sort-items" id="sort-${id}">
          ${items.map((item) => `<div class="b-sort-item" draggable="true"><span class="b-sort-grip">⠿</span>${esc(item.text)}</div>`).join('\n')}
        </div>
      </div>`
    }
    case 'matching': {
      const pairs = (p.pairs as { id: string; left: string; right: string }[]) || []
      const shuffledRight = [...pairs].sort(() => Math.random() - 0.5)
      return `<div class="block b-matching" id="match-${id}">
        <div class="b-match-instruction">${esc(block.content)}</div>
        <div class="b-match-grid">
          <div>
            <div class="b-match-col-title">Pojęcia</div>
            ${pairs.map((p2, i) => `<div class="b-match-item left-item" onclick="selectMatchItem('${id}','left',${i})">${esc(p2.left)}</div>`).join('')}
          </div>
          <div>
            <div class="b-match-col-title">Definicje</div>
            ${shuffledRight.map((p2, i) => {
              const origIdx = pairs.findIndex(op => op.id === p2.id)
              return `<div class="b-match-item right-item" onclick="selectMatchItem('${id}','right',${origIdx})">${esc(p2.right)}</div>`
            }).join('')}
          </div>
        </div>
      </div>`
    }
    case 'table': {
      const headers = (p.headers as string[]) || []
      const rows = (p.rows as string[][]) || []
      return `<div class="block b-table"><table>
        <thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`
    }
    case 'toggle': return `<div class="block b-toggle" onclick="toggleBlock(this)">
        <div class="b-toggle-header"><span class="b-toggle-icon">▶</span>${esc(block.content)}</div>
        <div class="b-toggle-body"><div class="b-toggle-content">${esc((p.body as string) || '')}</div></div>
      </div>`
    case 'timeline': {
      const events = (p.events as { date: string; title: string; desc: string }[]) || []
      return `<div class="block b-timeline">
        ${events.map((ev, i) => `<div class="b-tl-item">
          <div class="b-tl-track"><div class="b-tl-dot"></div>${i < events.length-1 ? '<div class="b-tl-line"></div>' : ''}</div>
          <div class="b-tl-content"><div class="b-tl-date">${esc(ev.date)}</div><div class="b-tl-title">${esc(ev.title)}</div><div class="b-tl-desc">${esc(ev.desc)}</div></div>
        </div>`).join('')}
      </div>`
    }
    case 'steps': {
      const steps = (p.steps as { title: string; desc: string }[]) || []
      return `<div class="block b-steps">
        ${steps.map((s, i) => `<div class="b-step">
          <div class="b-step-num">${i+1}</div>
          <div class="b-step-body"><div class="b-step-title">${esc(s.title)}</div><div class="b-step-desc">${esc(s.desc)}</div></div>
        </div>`).join('')}
      </div>`
    }
    case 'keyterm': return `<div class="block b-keyterm">
      <div class="b-keyterm-icon">🔑</div>
      <div><div class="b-keyterm-term">${esc(block.content)}</div><div class="b-keyterm-def">${esc((p.definition as string) || '')}</div></div>
    </div>`
    case 'highlight_box': return `<div class="block b-hl"><span style="font-size:20px;margin-right:10px">${p.icon || '💡'}</span>${esc(block.content)}</div>`
    case 'progress_bar': {
      const val = (p.value as number) || 0; const max = (p.max as number) || 100
      const pct = Math.round((val / max) * 100)
      return `<div class="block b-progress">
        <div class="b-progress-header"><span class="b-progress-label">${esc(block.content)}</span><span class="b-progress-val">${pct}%</span></div>
        <div class="b-progress-track"><div class="b-progress-fill" style="width:${pct}%"></div></div>
      </div>`
    }
    case 'rating': {
      const max = (p.max as number) || 5
      return `<div class="block b-rating" id="rating-${id}">
        <div class="b-rating-label">${esc(block.content)}</div>
        <div class="b-rating-stars">${Array.from({length: max}).map((_,i) =>
          `<span class="b-rating-star" onclick="setRating('${id}',${i+1},${max})">★</span>`
        ).join('')}</div>
        <div class="b-rating-result" id="rating-res-${id}">Kliknij gwiazdkę by ocenić</div>
      </div>`
    }
    case 'countdown': {
      const target = (p.targetDate as string) || ''
      const label = (p.label as string) || 'dni'
      const daysLeft = target ? Math.max(0, Math.ceil((new Date(target).getTime() - Date.now()) / 86400000)) : '?'
      return `<div class="block b-countdown">
        <div><div class="b-cd-num">${daysLeft}</div><div class="b-cd-label">${esc(label)}</div></div>
        <div class="b-cd-text">${esc(block.content)}</div>
      </div>`
    }
    case 'stats_card': {
      const stats = (p.stats as { value: string; label: string }[]) || []
      return `<div class="block b-stats">${stats.map(s =>
        `<div class="b-stat"><div class="b-stat-val">${esc(s.value)}</div><div class="b-stat-label">${esc(s.label)}</div></div>`
      ).join('')}</div>`
    }
    case 'comparison': {
      const left = (p.left as { title: string; items: string[] }) || { title: 'Opcja A', items: [] }
      const right = (p.right as { title: string; items: string[] }) || { title: 'Opcja B', items: [] }
      return `<div class="block b-comparison">
        <div class="b-comp-col left"><div class="b-comp-title">${esc(left.title)}</div>${left.items.map(i => `<div class="b-comp-item"><span class="b-comp-check">✓</span>${esc(i)}</div>`).join('')}</div>
        <div class="b-comp-col right"><div class="b-comp-title">${esc(right.title)}</div>${right.items.map(i => `<div class="b-comp-item"><span class="b-comp-check">✓</span>${esc(i)}</div>`).join('')}</div>
      </div>`
    }
    case 'interactive_tool': {
      const h = (p.height as number) || 320
      return block.content ? `<div class="block b-tool"><iframe srcdoc="${escAttr(block.content)}" style="height:${h}px" sandbox="allow-scripts allow-forms"></iframe></div>` : ''
    }
    default: return ''
  }
}

function esc(s: string): string {
  if (!s) return ''
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
function escAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
function getVideoEmbed(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return ''
}
