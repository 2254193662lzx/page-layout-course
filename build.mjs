/* =============================================================
 * build.mjs — 静态站点生成器 / static site generator
 *
 * 设计要点：
 *   · 内容只写一遍（src/content/*.mjs 里的 { zh, en } 结构），
 *     构建期成对生成双语节点 → 两种语言内容一致由机制保证
 *   · 零依赖：只用 Node 内置模块；输出纯静态 HTML/CSS/ESM，可直接部署 GitHub Pages
 *   · 自带轻量语法高亮器（CSS / HTML / JS），把 ⭐ 标记的行高亮成"关键行"
 *
 * 用法： node build.mjs
 * ============================================================= */

import { readFile, writeFile, mkdir, rm, cp, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'docs');

/* ============================================================
 * 0. 小工具
 * ========================================================== */
export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LANG_ZH = 'zh-CN';
const LANG_EN = 'en-US';

const chapterSlug = (n) => 'lesson-' + String(n).padStart(2, '0');

/** 找到内容里所有 { zh, en } 文本对象，供双语审计使用 */
export function collectTextPairs(node, out = [], where = 'root') {
  if (node == null) return out;
  if (typeof node === 'string') return out;
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectTextPairs(v, out, where + '[' + i + ']'));
    return out;
  }
  if (typeof node === 'object') {
    const keys = Object.keys(node);
    if (keys.includes('zh')) {
      out.push({ where, zh: node.zh, en: node.en });
      return out;
    }
    for (const k of keys) collectTextPairs(node[k], out, where + '.' + k);
  }
  return out;
}

/* ============================================================
 * 1. 语法高亮器
 * ========================================================== */

const CSS_RE = new RegExp([
  '(\\/\\*[\\s\\S]*?\\*\\/)',                        // 1 comment
  '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')', // 2 string
  '(@[\\w-]+)',                                      // 3 at-rule
  '(^[^{}\\/\\n]*?(?=\\s*\\{))',                     // 4 selector
  '(--[\\w-]+)',                                     // 5 custom property
  '([a-zA-Z-]+(?=\\s*:))',                           // 6 property
  '(-?\\d*\\.?\\d+(?:px|rem|em|ex|ch|%|fr|vw|vh|vmin|vmax|dvh|svh|s|ms|deg)?)' // 7 number
].join('|'), 'gm');

const JS_RE = new RegExp([
  '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)',           // 1 comment
  '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)', // 2 string
  '(\\b(?:const|let|var|function|return|if|else|for|of|in|new|await|async|class|typeof|instanceof|true|false|null|undefined|this|try|catch|finally|import|export|from|default|switch|case|break|continue|while|do|throw|delete|void|yield)\\b)', // 3 keyword
  '(#[\\w-]+)',                                      // 4 color / id
  '(\\b\\d*\\.?\\d+\\b)',                            // 5 number
  '([A-Za-z_$][\\w$]*(?=\\())'                       // 6 function call
].join('|'), 'g');

const HTML_RE = new RegExp([
  '(<!--[\\s\\S]*?-->)',                             // 1 comment
  '(<\\/?[a-zA-Z][\\w-]*)',                          // 2 tag open
  '([a-zA-Z-]+(?==))',                               // 3 attribute
  '("[^"]*")'                                        // 4 value
].join('|'), 'g');

const CLASS_OF = {
  css: ['cmt', 'str', 'at', 'sel', 'prop', 'prop', 'num'],
  js: ['cmt', 'str', 'kw', 'num', 'num', 'fn'],
  html: ['cmt', 'tag', 'attr', 'str']
};

function wrap(code, cls) {
  return '<span class="' + cls + '">' + esc(code) + '</span>';
}

/**
 * 逐行高亮。逐行的原因：① 需要按行检测 ⭐ 来加 hl-line 高亮；
 * ② 便于处理跨行块注释的状态。
 */
function highlight(code, lang) {
  const lines = String(code).replace(/\r\n?/g, '\n').replace(/\t/g, '  ').split('\n');
  let inBlockComment = false;

  const out = lines.map((line) => {
    const starred = line.includes('⭐');
    let html;

    if (lang === 'text' || !lang) {
      html = esc(line);
    } else if (lang === 'html') {
      html = tokenize(line, HTML_RE, CLASS_OF.html, inBlockComment);
      inBlockComment = html.__inComment;
    } else {
      const re = lang === 'css' ? CSS_RE : JS_RE;
      html = tokenize(line, re, CLASS_OF[lang === 'css' ? 'css' : 'js'], inBlockComment);
      inBlockComment = html.__inComment;
    }

    let text = typeof html === 'object' ? html.text : html;
    // CSS 里 `/* … */` 存在跨行注释；简单状态机处理
    if (inBlockComment === undefined) inBlockComment = false;
    text = text.replace(/⭐/g, '<span class="star">⭐</span>');
    return starred ? '<span class="hl-line">' + text + '</span>' : text;
  });

  return out.join('\n');

  function tokenize(line, re, classes, startInComment) {
    let inComment = startInComment;
    let rest = line;
    let result = '';
    // 进入本行时已在块注释中：先吃掉注释尾巴
    if (inComment) {
      const end = rest.indexOf('*/');
      if (end === -1) return { text: wrap(rest, 'cmt'), __inComment: true };
      result += wrap(rest.slice(0, end + 2), 'cmt');
      rest = rest.slice(end + 2);
      inComment = false;
    }
    re.lastIndex = 0;
    let m;
    let cursor = 0;
    while ((m = re.exec(rest)) !== null) {
      if (m[0] === '') { re.lastIndex++; continue; }
      result += esc(rest.slice(cursor, m.index));
      const gi = m.slice(1).findIndex((g) => g !== undefined);
      const cls = classes[gi] || null;
      const token = m[0];
      result += cls ? wrap(token, cls) : esc(token);
      cursor = m.index + token.length;
      if (cls === 'cmt' && token.startsWith('/*') && !token.includes('*/')) inComment = true;
    }
    result += esc(rest.slice(cursor));
    return { text: result, __inComment: inComment };
  }
}

/* ============================================================
 * 2. 双语块渲染
 * ========================================================== */

/** 把 { zh, en } 渲染成一对节点。
 *  即使两种语言文本相同也成对输出：这样"每个 data-lang=zh-CN 节点都有一个
 *  对应的 en-US 节点"成为一条可被脚本审计的不变量（见 tools/audit.mjs）。 */
function pair(renderFn, p) {
  const zh = typeof p === 'string' ? p : p.zh;
  const en = typeof p === 'string' ? p : (p.en ?? p.zh);
  return renderFn(zh, LANG_ZH) + renderFn(en, LANG_EN);
}

const hid = (lang) => (lang === LANG_EN ? ' hidden' : '');

/** 双语列表（ul / ol） */
function renderList(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  const mk = (key, lang) => '<' + tag + ' data-lang="' + lang + '"' + hid(lang) + '>' +
    items.map((it) => '<li>' + ((it && it[key] != null) ? it[key] : (it.zh ?? it)) + '</li>').join('') +
    '</' + tag + '>';
  return mk('zh', LANG_ZH) + mk('en', LANG_EN);
}

const T = {
  h: (p) => pair((t, lang) => '<h3 data-lang="' + lang + '"' + hid(lang) + '>' + t + '</h3>', p),
  p: (p) => pair((t, lang) => '<p data-lang="' + lang + '"' + hid(lang) + '>' + t + '</p>', p),
  note: (p) => pair((t, lang) => '<p class="note" data-lang="' + lang + '"' + hid(lang) + '>' + t + '</p>', p),
  theory: (b) => pair((_, lang) => {
    const t = lang === LANG_ZH ? b.zh : b.en;
    const cite = b.cite ? (lang === LANG_ZH ? b.cite.zh : b.cite.en) : null;
    return '<div class="theory-card" data-lang="' + lang + '"' + hid(lang) + '>' +
      '<strong>🧠 ' + (lang === LANG_ZH ? '理论支点：' : 'Theory: ') + '</strong>' + t +
      (cite ? '<cite>' + cite + '</cite>' : '') + '</div>';
  }, b),
  case: (b) => pair((_, lang) => {
    const t = lang === LANG_ZH ? b.zh : b.en;
    const title = b.title ? (lang === LANG_ZH ? b.title.zh : b.title.en) : (lang === LANG_ZH ? '案例现场' : 'Case in point');
    return '<div class="case-card" data-lang="' + lang + '"' + hid(lang) + '>' +
      '<span class="case-title">🧩 ' + title + '</span>' + t + '</div>';
  }, b),
  table: (b) => pair((_, lang) => {
    const k = lang === LANG_ZH ? 'zh' : 'en';
    const head = b.head.map((h) => '<th>' + (h[k] ?? h.zh) + '</th>').join('');
    const body = b.rows.map((r) => '<tr>' + r.map((c) => '<td>' + (c[k] ?? c.zh) + '</td>').join('') + '</tr>').join('');
    return '<table class="mini" data-lang="' + lang + '"' + hid(lang) + '><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>';
  }, b),
  code: (b) => pair((_, lang) => {
    const code = lang === LANG_ZH ? b.zh : (b.en ?? b.zh);
    return '<pre data-lang="' + lang + '"' + hid(lang) + '><code>' + highlight(code, b.lang || 'css') + '</code></pre>';
  }, b)
};

function renderExplain(blocks) {
  return blocks.map((b) => {
    if (b.h) return T.h(b.h);
    if (b.p) return T.p(b.p);
    if (b.ul) return renderList(b.ul);
    if (b.ol) return renderList(b.ol, true);
    if (b.note) return T.note(b.note);
    if (b.theory) return T.theory(b.theory);
    if (b.case) return T.case(b.case);
    if (b.table) return T.table(b.table);
    if (b.code) return T.code(b.code);
    if (b.raw) return b.raw;
    return '';
  }).join('\n');
}

function renderCodeTab(items) {
  return items.map((item) => {
    const parts = [];
    if (item.title) parts.push(T.h(item.title));
    if (item.purpose) parts.push(pair((t, lang) => '<p class="code-purpose" data-lang="' + lang + '"' + hid(lang) + '>' + t + '</p>', item.purpose));
    parts.push(T.code({ zh: item.code.zh, en: item.code.en, lang: item.lang || 'css' }));
    if (item.points) {
      parts.push(pair((t, lang) => '<p class="key-point" data-lang="' + lang + '"' + hid(lang) + '>' +
        '<strong>' + (lang === LANG_ZH ? '关键点解释：' : 'Key point: ') + '</strong>' + t + '</p>', item.points));
    }
    return parts.join('\n');
  }).join('\n');
}

function renderDemoTab(section) {
  return pair((t, lang) => '<p class="demo-hint" data-lang="' + lang + '"' + hid(lang) + '>🎛️ ' + t + '</p>', section.demo.hint) +
    '<div class="demo-mount" data-demo="' + section.demo.key + '"></div>';
}

/* ============================================================
 * 3. 页面模板
 * ========================================================== */

const ASSET_V = 'v1';

function head({ title, css, base = './' }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="《页面布局之道》—— 中英双语交互教学网站：讲解 / 关键代码 / 动态演示三合一的页面布局课程" />
<title>${title}</title>
<link rel="icon" type="image/svg+xml" href="${base}assets/favicon.svg" />
${css.map((h) => `<link rel="stylesheet" href="${h}" />`).join('\n')}
</head>`;
}

function langSwitch(cls = '') {
  return `<div class="lang-switch ${cls}" role="group" data-i18n-aria="nav.lang.label"></div>`;
}

const CHAPTER_SHORT = {
  1: { zh: '第 1 章 · 布局是信息设计', en: 'Ch 1 · Layout Is Information Design' },
  2: { zh: '第 2 章 · 文档流与盒模型', en: 'Ch 2 · Flow & Box Model' },
  3: { zh: '第 3 章 · 一维布局 Flexbox', en: 'Ch 3 · Flexbox (1D)' },
  4: { zh: '第 4 章 · 二维布局 Grid', en: 'Ch 4 · Grid (2D)' },
  5: { zh: '第 5 章 · 响应式与内在布局', en: 'Ch 5 · Responsive & Intrinsic' },
  6: { zh: '第 6 章 · 可访问性与综合案例', en: 'Ch 6 · Accessibility & Case Study' }
};

function topbar(chapters, current) {
  const items = [];
  chapters.forEach((ch) => {
    const short = CHAPTER_SHORT[ch.id];
    items.push(`<li data-lang="zh-CN"><a href="../${chapterSlug(ch.id)}/"${ch.id === current ? ' class="current"' : ''}>${short.zh}</a></li>`);
    items.push(`<li data-lang="en-US" hidden><a href="../${chapterSlug(ch.id)}/">${short.en}</a></li>`);
  });
  return `<nav class="course-topbar">
  <a class="brand" href="../"><span class="back">←</span><span data-i18n="nav.home"></span></a>
  <ul class="tabs">
    ${items.join('\n    ')}
  </ul>
  ${langSwitch()}
</nav>`;
}

function lessonPage(chapter, chapters) {
  const idx = chapters.findIndex((c) => c.id === chapter.id);
  const prev = chapters[idx - 1];
  const next = chapters[idx + 1];

  const navItems = chapter.sections.map((s) =>
    `<li><a href="#${s.id}" data-chapter="${s.id}"><span class="n">${s.num}</span><span data-lang="zh-CN">${s.title.zh}</span><span data-lang="en-US" hidden>${s.title.en}</span></a></li>`
  ).join('\n      ');

  const articles = chapter.sections.map((s) => `
    <article class="chapter" id="${s.id}">
      <h2 data-lang="zh-CN">${s.num} ${s.title.zh}</h2>
      <h2 data-lang="en-US" hidden>${s.num} ${s.title.en}</h2>
      <p class="chapter-subtitle" data-lang="zh-CN">${s.subtitle.zh}</p>
      <p class="chapter-subtitle" data-lang="en-US" hidden>${s.subtitle.en}</p>

      <div class="tabs" role="tablist">
        <button class="tab-btn active" role="tab" data-tab="explain" aria-selected="true" data-i18n="tab.explain"></button>
        <button class="tab-btn" role="tab" data-tab="code" aria-selected="false" data-i18n="tab.code"></button>
        <button class="tab-btn" role="tab" data-tab="demo" aria-selected="false" data-i18n="tab.demo"></button>
      </div>

      <div class="tab-panels">
        <div class="tab-panel active" data-panel="explain" role="tabpanel">
          <div class="panel-card">
${renderExplain(s.explain)}
          </div>
        </div>
        <div class="tab-panel" data-panel="code" role="tabpanel">
          <div class="panel-card">
${renderCodeTab(s.code)}
          </div>
        </div>
        <div class="tab-panel" data-panel="demo" role="tabpanel">
          <div class="panel-card">
${renderDemoTab(s)}
          </div>
        </div>
      </div>
    </article>`).join('\n');

  return `${head({ title: `${chapter.num.zh} ${chapter.title.zh} · ${chapter.title.en} · 《页面布局之道》`, css: ['../assets/styles.css', '../assets/lesson.css'], base: '../' })}
<body class="lesson" data-chapter="${chapter.id}">
${topbar(chapters, chapter.id)}

<header class="lesson-header">
  <div>
    <h1 data-lang="zh-CN">${chapter.num.zh} ${chapter.title.zh}</h1>
    <h1 data-lang="en-US" hidden>${chapter.num.en} ${chapter.title.en}</h1>
    <p class="subtitle" data-lang="zh-CN">${chapter.subtitle.zh}</p>
    <p class="subtitle" data-lang="en-US" hidden>${chapter.subtitle.en}</p>
  </div>
  <div class="header-tip">
    <span data-lang="zh-CN" data-i18n="tip.sections"></span>
    <span data-lang="en-US" hidden data-i18n="tip.sections"></span>
    <br /><span class="kbd">[</span> <span class="kbd">]</span> <span data-lang="zh-CN">切换小节</span><span data-lang="en-US" hidden>sections</span>
    · <span class="kbd">1</span><span class="kbd">2</span><span class="kbd">3</span> <span data-lang="zh-CN">切换讲解/代码/演示</span><span data-lang="en-US" hidden>explain/code/demo</span>
  </div>
</header>

<div class="case-banner">
  <span>🧩</span>
  <span data-lang="zh-CN">${chapter.caseNote.zh}</span>
  <span data-lang="en-US" hidden>${chapter.caseNote.en}</span>
</div>

<main class="lesson-main">
  <aside class="chapter-nav">
    <h3 data-i18n="nav.toc"></h3>
    <ul>
      ${navItems}
    </ul>
    <div class="nav-tip">
      <a href="../supplementary/" data-i18n="common.demo-index"></a>
      <a href="../" data-i18n="common.portal"></a>
    </div>
  </aside>

  <section class="chapter-content">
${articles}
  </section>
</main>

<footer class="lesson-footer">
  <p data-i18n="footer.copy"></p>
</footer>

<nav class="chapter-pager" aria-label="chapter pager">
  ${prev ? `<a class="pager-prev" href="../${chapterSlug(prev.id)}/"><span class="pager-dir" data-i18n="common.prev"></span><span class="pager-title" data-lang="zh-CN">${prev.num.zh} ${prev.title.zh}</span><span class="pager-title" data-lang="en-US" hidden>${prev.num.en} ${prev.title.en}</span></a>` : '<span class="pager-prev empty"></span>'}
  <a class="pager-portal" href="../" data-i18n="common.portal"></a>
  ${next ? `<a class="pager-next" href="../${chapterSlug(next.id)}/"><span class="pager-dir" data-i18n="common.next"></span><span class="pager-title" data-lang="zh-CN">${next.num.zh} ${next.title.zh}</span><span class="pager-title" data-lang="en-US" hidden>${next.num.en} ${next.title.en}</span></a>` : '<span class="pager-next empty"></span>'}
</nav>

<script type="module" src="../assets/lesson.js"></script>
<script type="module" src="../assets/lang.js"></script>
</body>
</html>
`;
}

function portalPage(course, chapters) {
  const cards = chapters.map((ch) => `
        <a class="card available" href="./${chapterSlug(ch.id)}/">
          <div class="card-status" data-i18n="common.live"></div>
          <div class="card-num" data-lang="zh-CN">${ch.num.zh} · ${ch.sections.length} 节</div>
          <div class="card-num" data-lang="en-US" hidden>${ch.num.en} · ${ch.sections.length} sections</div>
          <h3 data-lang="zh-CN">${ch.title.zh}</h3>
          <h3 data-lang="en-US" hidden>${ch.title.en}</h3>
          <p class="card-desc" data-lang="zh-CN">${ch.lede.zh}</p>
          <p class="card-desc" data-lang="en-US" hidden>${ch.lede.en}</p>
          <ul class="card-tags">
            ${ch.tags.map((t) => `<li><span data-lang="zh-CN">${t.zh}</span><span data-lang="en-US" hidden>${t.en}</span></li>`).join('\n            ')}
          </ul>
          <div class="card-cta" data-i18n="common.enter"></div>
        </a>`).join('\n');

  const defects = course.caseIntro.defects.map((d) => `
          <tr>
            <td class="mono" data-lang="zh-CN">${d.n}</td>
            <td class="mono" data-lang="en-US" hidden>${d.n}</td>
            <td data-lang="zh-CN">${d.zh}</td>
            <td data-lang="en-US" hidden>${d.en}</td>
          </tr>`).join('');

  return `${head({ title: '《页面布局之道》· The Art of Page Layout', css: ['./assets/styles.css', './assets/lesson.css'] })}
<body>
${langSwitch('lang-switch-floating')}

<header class="hero">
  <div class="hero-inner">
    <p class="hero-tag">PAGE LAYOUT · 页面布局</p>
    <h1 data-lang="zh-CN">${course.meta.title.zh}</h1>
    <h1 data-lang="en-US" hidden>${course.meta.title.en}</h1>
    <p class="hero-subtitle" data-lang="zh-CN">${course.meta.subtitle.zh}</p>
    <p class="hero-subtitle" data-lang="en-US" hidden>${course.meta.subtitle.en}</p>
    <p class="hero-meta" data-lang="zh-CN">${course.meta.meta.zh}</p>
    <p class="hero-meta" data-lang="en-US" hidden>${course.meta.meta.en}</p>
    <div class="hero-stats">
      ${course.meta.stats.map((s) => `<div class="hero-stat"><b>${s.n}</b><span data-lang="zh-CN">${s.zh}</span><span data-lang="en-US" hidden>${s.en}</span></div>`).join('\n      ')}
    </div>
  </div>
</header>

<nav class="nav">
  <a href="#chapters" data-lang="zh-CN">📚 章节</a><a href="#chapters" data-lang="en-US" hidden>📚 Chapters</a>
  <a href="#case" data-lang="zh-CN">🧩 贯穿案例</a><a href="#case" data-lang="en-US" hidden>🧩 Running Case</a>
  <a href="#howto" data-lang="zh-CN">▶️ 使用方式</a><a href="#howto" data-lang="en-US" hidden>▶️ How to Use</a>
  <a href="./supplementary/" data-lang="zh-CN">🎛️ 演示索引</a><a href="./supplementary/" data-lang="en-US" hidden>🎛️ Demo Index</a>
  <a href="#about" data-lang="zh-CN">ℹ️ 关于</a><a href="#about" data-lang="en-US" hidden>ℹ️ About</a>
</nav>

<main>
  <section id="chapters" class="section">
    <h2 data-lang="zh-CN">📚 课程章节</h2>
    <h2 data-lang="en-US" hidden>📚 Course Chapters</h2>
    <p class="section-lead" data-lang="zh-CN">${course.meta.lead.zh}</p>
    <p class="section-lead" data-lang="en-US" hidden>${course.meta.lead.en}</p>
    <div class="cards">
${cards}
    </div>
  </section>

  <section id="case" class="section">
    <h2 data-lang="zh-CN">🧩 贯穿案例：${course.caseIntro.title.zh}</h2>
    <h2 data-lang="en-US" hidden>🧩 Running case: ${course.caseIntro.title.en}</h2>
    <p class="section-lead" data-lang="zh-CN">${course.caseIntro.lead.zh}</p>
    <p class="section-lead" data-lang="en-US" hidden>${course.caseIntro.lead.en}</p>
    <div class="howto-card">
      <table class="mini">
        <thead>
          <tr>
            <th data-lang="zh-CN">编号</th><th data-lang="en-US" hidden>#</th>
            <th data-lang="zh-CN">布局病（v1 的症状）</th><th data-lang="en-US" hidden>Layout defect (symptom in v1)</th>
          </tr>
        </thead>
        <tbody>${defects}
        </tbody>
      </table>
      <p class="mt-3" data-lang="zh-CN">${course.caseIntro.note.zh}</p>
      <p class="mt-3" data-lang="en-US" hidden>${course.caseIntro.note.en}</p>
    </div>
  </section>

  <section id="howto" class="section">
    <h2 data-lang="zh-CN">▶️ 使用方式</h2>
    <h2 data-lang="en-US" hidden>▶️ How to Use</h2>
    <div class="howto-grid">
      ${course.usage.map((u) => `
      <div class="howto-card">
        <h3 data-lang="zh-CN">${u.icon} ${u.title.zh}</h3>
        <h3 data-lang="en-US" hidden>${u.icon} ${u.title.en}</h3>
        <p data-lang="zh-CN">${u.body.zh}</p>
        <p data-lang="en-US" hidden>${u.body.en}</p>
      </div>`).join('')}
    </div>
  </section>

  <section id="about" class="section">
    <h2 data-lang="zh-CN">ℹ️ 关于本课程</h2>
    <h2 data-lang="en-US" hidden>ℹ️ About This Course</h2>
    <div class="about">
      ${course.about.map((a) => `
      <div class="about-item">
        <h4 data-lang="zh-CN">${a.icon} ${a.title.zh}</h4>
        <h4 data-lang="en-US" hidden>${a.icon} ${a.title.en}</h4>
        <p data-lang="zh-CN">${a.body.zh}</p>
        <p data-lang="en-US" hidden>${a.body.en}</p>
      </div>`).join('')}
    </div>
  </section>
</main>

<footer>
  <p data-i18n="footer.copy"></p>
</footer>

<script type="module" src="./assets/lang.js"></script>
</body>
</html>
`;
}

function supplementaryPage(course, chapters) {
  const rows = chapters.flatMap((ch) => ch.sections.map((s) => `
      <a class="card" href="../${chapterSlug(ch.id)}/?tab=demo#${s.id}">
        <div class="card-num" data-lang="zh-CN">${s.num} · ${chapterSlug(ch.id)}</div>
        <div class="card-num" data-lang="en-US" hidden>${s.num} · ${chapterSlug(ch.id)}</div>
        <h3 data-lang="zh-CN">${s.title.zh}</h3>
        <h3 data-lang="en-US" hidden>${s.title.en}</h3>
        <p class="card-desc" data-lang="zh-CN">${s.demo.hint.zh}</p>
        <p class="card-desc" data-lang="en-US" hidden>${s.demo.hint.en}</p>
        <div class="card-cta"><span data-lang="zh-CN">打开演示 ${s.demo.key} →</span><span data-lang="en-US" hidden>Open demo ${s.demo.key} →</span></div>
      </a>`)).join('\n');

  return `${head({ title: '演示索引 · Demo Index · 《页面布局之道》', css: ['../assets/styles.css', '../assets/lesson.css'], base: '../' })}
<body>
${langSwitch('lang-switch-floating')}
<header class="lesson-header" style="padding-top:64px">
  <div>
    <h1 data-lang="zh-CN">🎛️ 全部 ${chapters.reduce((n, c) => n + c.sections.length, 0)} 个交互演示</h1>
    <h1 data-lang="en-US" hidden>🎛️ All ${chapters.reduce((n, c) => n + c.sections.length, 0)} Interactive Demos</h1>
    <p class="subtitle" data-lang="zh-CN">每个演示都直接打开对应小节的「演示」tab。所有演示均为纯前端原生 JS，可离线运行。</p>
    <p class="subtitle" data-lang="en-US" hidden>Each link opens the Demo tab of its section. All demos are vanilla JS, fully offline.</p>
  </div>
  <a class="btn" href="../" data-i18n="common.portal"></a>
</header>
<main class="section" style="padding-top:0">
  <div class="cards">
${rows}
  </div>
</main>
<footer><p data-i18n="footer.copy"></p></footer>
<script type="module" src="../assets/lang.js"></script>
</body>
</html>
`;
}

/* ============================================================
 * 4. 构建
 * ========================================================== */

async function copyAssets() {
  const files = ['styles.css', 'lesson.css', 'lang.js', 'lesson.js', 'lab.js', 'favicon.svg'];
  await mkdir(path.join(OUT, 'assets'), { recursive: true });
  for (const f of files) {
    await cp(path.join(SRC, 'assets', f), path.join(OUT, 'assets', f));
  }
  await cp(path.join(SRC, 'assets', 'demos'), path.join(OUT, 'assets', 'demos'), { recursive: true });
}

export async function loadContent() {
  const course = (await import('./src/content/index.mjs')).default;
  // 支持只构建部分章节： PLC_CHAPTERS=1,2 node build.mjs （便于写作时迭代）
  const filter = (process.env.PLC_CHAPTERS || '').split(',').map((s) => Number(s.trim())).filter(Boolean);
  const list = filter.length ? course.chapters.filter((n) => filter.includes(n)) : course.chapters;
  const chapters = [];
  for (const n of list) {
    const mod = await import('./src/content/ch' + n + '.mjs');
    chapters.push(mod.default);
  }
  return { course, chapters };
}

async function build() {
  const { course, chapters } = await loadContent();

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  await writeFile(path.join(OUT, 'index.html'), portalPage(course, chapters), 'utf8');

  for (const ch of chapters) {
    const dir = path.join(OUT, chapterSlug(ch.id));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), lessonPage(ch, chapters), 'utf8');
  }

  await mkdir(path.join(OUT, 'supplementary'), { recursive: true });
  await writeFile(path.join(OUT, 'supplementary', 'index.html'), supplementaryPage(course, chapters), 'utf8');

  await copyAssets();
  await writeFile(path.join(OUT, '.nojekyll'), '', 'utf8');

  // 构建统计
  const sectionTotal = chapters.reduce((n, c) => n + c.sections.length, 0);
  const codeTotal = chapters.reduce((n, c) => n + c.sections.reduce((m, s) => m + s.code.length, 0), 0);
  console.log('✓ built docs/');
  console.log('  chapters :', chapters.length);
  console.log('  sections :', sectionTotal);
  console.log('  code sets:', codeTotal);
  console.log('  demos    :', sectionTotal);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  build().catch((e) => { console.error(e); process.exit(1); });
}
