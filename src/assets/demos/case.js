/* =============================================================
 * demos/case.js — 贯穿案例 CourseHub 的"可改变量"迷你首页
 *
 * 关键设计：页面上的所有可变量都是 CSS 自定义属性。演示只改属性值，
 * 然后用 getComputedStyle / getBoundingClientRect 把浏览器的真实计算结果
 * 读回来（字号比、组间距、对比度、对齐误差）。所以演示里的分数不是写死的，
 * 是当场量出来的。
 * ============================================================= */

import { el, L, clamp, num } from '../lab.js';

/** 三套间距方案：手感 / 4pt / 8pt
 *  v1（手感）的病灶是"分组信号反了"：卡片间距 13px 竟小于卡片内边距 21px，
 *  两张卡片在视觉上粘成一块；而且这些值都不在 8pt 刻度上。 */
export const SPACING_SCHEMES = {
  feel: { pad: 21, within: 9, group: 13, block: 37, edge: 11, titleOffset: 6, tagOffset: 7, navGap: 13, cardsOffset: 5 },
  s4: { pad: 20, within: 8, group: 28, block: 60, edge: 20, titleOffset: 0, tagOffset: 0, navGap: 16, cardsOffset: 0 },
  s8: { pad: 24, within: 8, group: 32, block: 64, edge: 16, titleOffset: 0, tagOffset: 0, navGap: 16, cardsOffset: 0 }
};

export const SCHEME_LABEL = {
  feel: { zh: '手感（21 / 13 / 37）', en: 'By feel (21 / 13 / 37)' },
  s4: { zh: '4pt 网格', en: '4pt grid' },
  s8: { zh: '8pt 网格', en: '8pt grid' }
};

const CARDS = [
  { icon: '🧱', title: { zh: '布局基础', en: 'Layout basics' }, body: { zh: '流转盒模型，12 课时', en: 'Flow and box model, 12 lessons' }, tag: { zh: '第 1–2 章', en: 'Ch 1–2' } },
  { icon: '📐', title: { zh: 'Flex 与 Grid', en: 'Flex & Grid' }, body: { zh: '一维与二维布局，14 课时', en: 'One- and two-dimensional layout, 14 lessons' }, tag: { zh: '第 3–4 章', en: 'Ch 3–4' } },
  { icon: '📱', title: { zh: '响应式实战', en: 'Responsive in practice' }, body: { zh: '断点、容器查询，10 课时', en: 'Breakpoints and container queries, 10 lessons' }, tag: { zh: '第 5–6 章', en: 'Ch 5–6' } }
];

const LONG_TITLE = {
  zh: '用一年时间，学会把信息排好：从文档流到网格系统的完整训练营',
  en: 'Learn to order information in a year: a full bootcamp from document flow to grid systems'
};
const LONG_WORD = 'LayoutConsistencyChecklistForResponsiveInterfaces';

/**
 * 生成案例迷你首页
 * @param {object} opts
 *   scheme     'feel' | 's4' | 's8'
 *   hierarchy  boolean  尺寸杠杆
 *   contrast   boolean  对比杠杆
 *   align      boolean  对齐杠杆（关掉时故意制造多处错位）
 *   stress     null | 'longTitle' | 'longWord' | 'image'
 *   grid       boolean  叠加 8pt 刻度尺
 */
export function courseHub(opts = {}) {
  const o = Object.assign({ scheme: 'feel', hierarchy: false, contrast: false, align: false, stress: null, grid: false }, opts);
  const sp = SPACING_SCHEMES[o.scheme] || SPACING_SCHEMES.feel;

  const hub = el('div', { class: 'ch-hub' });
  const set = (k, v) => hub.style.setProperty(k, v);

  set('--base', '13px');
  set('--title', o.hierarchy ? '22px' : '13px');
  set('--pad', sp.pad + 'px');
  set('--within', sp.within + 'px');
  set('--group', sp.group + 'px');
  set('--block', sp.block + 'px');
  set('--edge', sp.edge + 'px');
  set('--nav-gap', sp.navGap + 'px');
  set('--cards-left', (o.align ? 0 : sp.cardsOffset) + 'px');
  set('--title-offset', o.align ? '0px' : sp.titleOffset + 'px');
  set('--tag-offset', o.align ? '0px' : sp.tagOffset + 'px');

  if (o.hierarchy || o.contrast) {
    set('--cta-bg', '#4f46e5');
    set('--cta-fg', '#ffffff');
    set('--cta-weight', '700');
    set('--cta-pad-block', o.hierarchy ? '9px' : '6px');
    set('--cta-pad-inline', o.hierarchy ? '18px' : '12px');
  }
  if (o.contrast) {
    set('--card-border', '1px solid #cbd5e1');
    set('--title-color', '#0f172a');
  } else if (o.hierarchy) {
    set('--title-color', '#1e293b');
  }

  const titleText = o.stress === 'longTitle' ? L(LONG_TITLE.zh, LONG_TITLE.en) : L(
    '用一年时间，学会做出好看又能用的界面',
    'Learn to build interfaces that look right and work right — in one year'
  );

  hub.append(
    el('div', { class: 'ch-bar' },
      el('span', { class: 'ch-dot' }), el('span', { class: 'ch-dot' }), el('span', { class: 'ch-dot' }),
      el('span', { class: 'ch-url', text: 'coursehub.example/2026' })
    ),
    el('div', { class: 'ch-nav', dataset: { measure: 'nav' } },
      el('span', { class: 'ch-logo', text: 'CourseHub', dataset: { measure: 'logo' } }),
      // 注意：导航链接的 x 由前面的 logo 文字宽度决定，属于"行内元素"，
      // 因此只用于对齐漂移的计算，不参与 8pt 刻度误差统计
      el('span', { class: 'ch-link', text: L('课程', 'Courses'), dataset: { inline: '1' } }),
      el('span', { class: 'ch-link', text: L('讲师', 'Instructors') }),
      el('span', { class: 'ch-link', text: L('价格', 'Pricing') })
    ),
    el('div', { class: 'ch-hero' },
      el('h3', { class: 'ch-title', text: titleText, dataset: { measure: 'title' } }),
      el('p', { class: 'ch-sub', text: L('12 周 · 项目驱动 · 讲师 1 对 1 代码评审', '12 weeks · project-driven · 1:1 code review'), dataset: { measure: 'sub' } }),
      el('button', { class: 'ch-cta', type: 'button', text: L('立即报名', 'Enroll now'), dataset: { measure: 'cta' } })
    ),
    el('div', { class: 'ch-cards' }, CARDS.map((c, ci) => {
      // 只有第一张卡片的位置由"间距 + 内边距"决定；第 2、3 张的 x 还取决于前面卡片的
      // 流动性宽度（可能是小数），所以它们只用于量测间距，不参与 8pt 刻度误差统计
      const inline = ci === 0 ? {} : { inline: '1' };
      const h4 = el('h4', {
        dataset: Object.assign({ measure: 'cardTitle' }, inline),
        text: o.stress === 'longWord' && c === CARDS[1] ? LONG_WORD : L(c.title.zh, c.title.en)
      });
      return el('article', { class: 'ch-card', dataset: Object.assign({ measure: 'card' }, inline) },
        h4,
        el('p', { text: L(c.body.zh, c.body.en) }),
        o.stress === 'image'
          ? el('div', { style: { height: '34px', width: '160px', background: 'repeating-linear-gradient(45deg,#a5b4fc,#a5b4fc 6px,#e0e7ff 6px,#e0e7ff 12px)', borderRadius: '5px' }, title: L('这张图宽 160px，容器只有约 90px', 'This image is 160px wide; the container is about 90px') })
          : null,
        el('span', { class: 'ch-tag', dataset: Object.assign({ measure: 'tag' }, inline), text: L(c.tag.zh, c.tag.en) })
      );
    }))
  );

  if (o.grid) hub.append(el('div', { class: 'ch-ruler', style: '--bl:8px' }));
  return hub;
}

/* ---------------------------------------------------------------
 * 量测
 * ------------------------------------------------------------- */

function parseColor(str) {
  const m = String(str || '').match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map((s) => parseFloat(s));
  if (parts.length > 3 && parts[3] === 0) return null;
  return parts.slice(0, 3);
}

function luminance(rgb) {
  const f = (c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}

/** WCAG 对比度 */
export function contrastRatio(fg, bg) {
  const a = parseColor(fg), b = parseColor(bg);
  if (!a || !b) return 1;
  const la = luminance(a), lb = luminance(b);
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** 读出迷你首页的真实计算结果 */
export function measureHub(root) {
  const g = (sel) => root.querySelector(sel);
  const cs = (node, prop) => (node ? getComputedStyle(node).getPropertyValue(prop) : '');
  const fpx = (node, prop) => parseFloat(cs(node, prop)) || 0;
  const rect = (node) => (node ? node.getBoundingClientRect() : null);
  // 以容器的"内容盒"左边缘为基准：排除边框与内边距，否则 8pt 误差会恒等于边框宽度
  const hubCs = getComputedStyle(root);
  const contentLeft = rect(root).left + (parseFloat(hubCs.borderLeftWidth) || 0) + (parseFloat(hubCs.paddingLeft) || 0);
  const lefts = (nodes) => nodes.filter(Boolean).map((n) => rect(n).left - contentLeft);
  const spread = (arr) => (arr.length > 1 ? Math.abs(Math.max(...arr) - Math.min(...arr)) : 0);
  // 误差容差 1.25px：亚像素布局，以及 1px 边框把"卡片内容"整体推移 1px，
  // 都属于可以接受的范围，不应被算作"偏离刻度"
  const errOf = (off) => { const r = Math.abs(off) % 8; const e = Math.min(r, 8 - r); return e <= 1.25 ? 0 : Math.round(e); };

  const title = g('[data-measure="title"]');
  const sub = g('[data-measure="sub"]');
  const cta = g('[data-measure="cta"]');
  const cards = Array.from(root.querySelectorAll('[data-measure="card"]'));
  const cardTitle = g('.ch-card h4');
  const tag = g('[data-measure="tag"]');

  const titleSize = fpx(title, 'font-size');
  const bodySize = fpx(sub, 'font-size') || 13;
  const ratio = titleSize / bodySize;

  // 组内间距 = 标题与副标题之间（flex gap）；组间间距 = 两张卡片之间
  const withinGap = title && sub ? Math.max(0, Math.round(rect(sub).top - rect(title).bottom)) : 0;
  const betweenGap = cards.length > 1 ? Math.round(rect(cards[1]).left - rect(cards[0]).right) : 0;
  const cardPad = Math.round(fpx(g('.ch-card'), 'padding-left'));

  // 对比：①按钮块面 vs 页面白底（层次意义）②按钮文字 vs 按钮底色（可访问性意义）
  const ctaBlockContrast = contrastRatio(cs(cta, 'background-color'), 'rgb(255, 255, 255)');
  const ctaTextContrast = contrastRatio(cs(cta, 'color'), cs(cta, 'background-color'));

  // 对齐：外框（导航/标题/副标题/按钮/卡片左边缘应共线）与内框（卡片标题/标签）各自的漂移
  // 用 logo 而不是 .ch-nav：nav 是整宽块级元素，左边缘恒等于容器边缘，
  // 与 hero 内的内容不是同一条对齐线。logo 与标题、卡片共享"内容左边缘"。
  const outerSpread = spread(lefts([g('[data-measure="logo"]'), title, sub, cta, cards[0]]));
  const innerSpread = spread(lefts([cardTitle, tag]));
  // 容差：小于 0.75px 的漂移视为共线
  const tol = (v) => (v < 0.75 ? 0 : v);

  // 相对 8pt 刻度的误差：只统计"位置由间距决定"的结构元素
  const measured = Array.from(root.querySelectorAll('[data-measure]:not([data-inline])'));
  const rawEdges = measured.map((n) => rect(n).left - contentLeft);
  const edges = rawEdges.map((e) => Math.round(e));
  const errors = rawEdges.map(errOf);

  const overflow = cards.filter((c) => c.scrollWidth > c.clientWidth + 1).length;

  return {
    ratio, titleSize, bodySize,
    withinGap, betweenGap, cardPad,
    spaceRatio: betweenGap / Math.max(withinGap, 1),
    ctaBlockContrast, ctaTextContrast,
    outerSpread: tol(outerSpread), innerSpread: tol(innerSpread),
    edges, errors,
    maxError: errors.length ? Math.max(...errors) : 0,
    offScale: errors.filter((e) => e !== 0).length,
    distinctEdges: new Set(edges).size,
    overflow, hubOverflow: root.scrollWidth > root.clientWidth + 1
  };
}

/** 把量测结果转成 0–100 的四个分项与总分 */
export function scoreOf(m) {
  const parts = {
    // 尺寸：字号比 1.0 → 0 分，1.7 及以上 → 满分
    size: clamp((m.ratio - 1) / 0.7, 0, 1) * 100,
    // 间距：组间/组内 比值 1 → 0 分，4 及以上 → 满分
    space: clamp((m.spaceRatio - 1) / 3, 0, 1) * 100,
    // 对比：按钮块面与白底的对比度，1.5 → 0 分，4.5 及以上 → 满分
    contrast: clamp((m.ctaBlockContrast - 1.5) / 3, 0, 1) * 100,
    // 对齐：外框与内框的漂移，8px 漂移即接近 0 分
    align: (clamp(1 - m.outerSpread / 8, 0, 1) * 0.6 + clamp(1 - m.innerSpread / 8, 0, 1) * 0.4) * 100
  };
  const total = parts.size * 0.35 + parts.space * 0.3 + parts.contrast * 0.15 + parts.align * 0.2;
  return { total: Math.round(total), parts };
}

/** 渲染评分卡 */
export function scoreCard(score) {
  const dial = el('div', { class: 'score-dial' }, el('span', { text: String(Math.round(score.total)) }));
  dial.style.setProperty('--v', String(Math.round(score.total)));
  const rows = [
    [L('尺寸杠杆', 'Size'), score.parts.size],
    [L('间距杠杆', 'Space'), score.parts.space],
    [L('对比杠杆', 'Contrast'), score.parts.contrast],
    [L('对齐杠杆', 'Alignment'), score.parts.align]
  ];
  const list = el('div', { style: 'flex:1;display:grid;gap:5px' }, rows.map(([label, v]) => {
    const val = Math.round(v);
    const cls = val < 40 ? 'low' : val < 75 ? 'mid' : 'high';
    return el('div', { class: 'bar-row' },
      el('span', { class: 'muted', text: label }),
      el('span', { class: 'bar ' + cls }, el('i', { style: 'width:' + val + '%' })),
      el('span', { class: 'num', text: val + '' })
    );
  }));
  return el('div', { class: 'score-card' }, dial, list);
}

export const clamp01 = (v) => clamp(v, 0, 1);
/** 对齐误差容差（px）—— 演示与文档里都要如实说明这个数字 */
export const ALIGN_TOLERANCE = 1.25;
export { num };
