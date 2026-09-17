/* =============================================================
 * demos/ch1.js — 第 1 章的三个交互演示
 *   d-1-1 布局诊断仪（病灶标记 + AB 对比）
 *   d-1-2 层次强度台（四个杠杆滑杆 + 实时评分）
 *   d-1-3 网格与节奏尺（对齐误差量测 + 直方图）
 * ============================================================= */

import {
  el, L, register, slider, seg, toggle, buttons, readout, tableMini, panel, preview,
  split, nextFrame, num, clamp
} from '../lab.js';
import { courseHub, measureHub, scoreOf, scoreCard, SPACING_SCHEMES, SCHEME_LABEL, contrastRatio } from './case.js';

/* ---------- 公共：把病灶标记摆成"标注钉"，贴在目标元素的左上角外侧，不遮文字 ---------- */
function placeMark(hub, mark, target) {
  if (!target) return;
  const hr = hub.getBoundingClientRect();
  const tr = target.getBoundingClientRect();
  mark.style.left = Math.max(9, tr.left - hr.left - 9) + 'px';
  mark.style.top = Math.max(9, tr.top - hr.top - 2) + 'px';
}

/* =============================================================
 * d-1-1 布局诊断仪
 * ============================================================= */
register('d-1-1', (mount) => {
  const state = { mode: 'fix', hierarchy: false, spacing: false, marks: true, active: null };

  const hubHost = el('div', { style: 'position:relative' });
  const noteHost = el('div', { style: 'position:relative' });
  const log = readout();
  const scoreHost = el('div');

  const modeSeg = seg({
    label: L('模式', 'Mode'),
    options: [
      { value: 'fix', label: L('交互修复', 'Fix live') },
      { value: 'ab', label: L('v1 / v2 对比', 'v1 vs v2') }
    ],
    value: 'fix',
    onChange: (v) => { state.mode = v; draw(); }
  });

  const tHier = toggle({
    label: L('层次修复：字号比 + CTA 实心', 'Hierarchy fix: type ratio + solid CTA'),
    checked: false,
    onChange: (v) => { state.hierarchy = v; draw(); }
  });
  const tSpace = toggle({
    label: L('间距修复：换成 8pt 网格', 'Spacing fix: switch to 8pt grid'),
    checked: false,
    onChange: (v) => { state.spacing = v; draw(); }
  });
  const tMarks = toggle({
    label: L('显示病灶标记 ① ②', 'Show defect markers ① ②'),
    checked: true,
    onChange: (v) => { state.marks = v; draw(); }
  });

  const openAll = buttons([
    { label: L('全部修复', 'Fix everything'), kind: 'primary', onClick: () => { state.hierarchy = true; state.spacing = true; tHier.set(true); tSpace.set(true); draw(); } },
    { label: L('回到 v1', 'Back to v1'), onClick: () => { state.hierarchy = false; state.spacing = false; tHier.set(false); tSpace.set(false); draw(); } }
  ]);

  const stage = el('div', { class: 'demo-stage wide-controls' },
    panel(L('控制台', 'Console'), modeSeg.node, tHier.node, tSpace.node, tMarks.node, openAll),
    el('div', {},
      hubHost,
      noteHost,
      el('div', { class: 'mt-3' }, scoreHost),
      el('div', { class: 'mt-3' }, log.node),
      el('div', { class: 'text-xs muted mt-2', id: 'd1-1-legend' })
    )
  );
  mount.append(stage);

  const DIAG = {
    title: {
      title: { zh: '① 层次缺失', en: '① No hierarchy' },
      text: {
        zh: '真实测量：标题、正文、按钮全是 <b>13px</b>，字号比 1.00。眯眼看整块是均匀的灰，视线没有落点。修复后字号比 1.69，CTA 变成实心色块 + 700 字重 + 9/18px 内边距——它自己就"跳"出来了。',
        en: 'Measured: heading, body and button are all <b>13px</b> — a ratio of 1.00. Squint and the block is uniform grey with nothing to land on. After the fix the ratio is 1.69 and the CTA becomes a solid block at weight 700 with 9/18px padding, so it pops out by itself.'
      }
    },
    spacing: {
      title: { zh: '② 间距无系统', en: '② Arbitrary spacing' },
      text: {
        zh: '真实测量：卡片内边距 13px、卡片间距 21px、区块间距 37px，互不成倍数；元素边缘相对 8pt 刻度的最大偏差 <b>5px</b> 个元素不在刻度上。修复后换成 24/32/64，最大偏差 0px，组间:组内 = 4:1，分组信号终于"读得出来"。',
        en: 'Measured: card padding 13px, card gap 21px, section gap 37px — no common multiple; the largest deviation from the 8pt scale is <b>5px</b> and elements fall off the scale. After the fix they become 24/32/64, deviation drops to 0px and between:within becomes 4:1, so grouping finally reads correctly.'
      }
    }
  };

  function buildHub() {
    const hub = courseHub({
      scheme: state.spacing ? 's8' : 'feel',
      hierarchy: state.hierarchy,
      contrast: state.hierarchy,
      align: state.spacing,
      grid: false
    });
    return hub;
  }

  function draw() {
    hubHost.innerHTML = '';
    noteHost.innerHTML = '';

    if (state.mode === 'ab') {
      const v1 = buildVariant(false, false);
      const v2 = buildVariant(true, true);
      const sp = split(
        el('div', {}, el('div', { class: 'text-xs muted mt-2', style: 'font-weight:800;color:#e11d48', text: L('v1 改造前', 'v1 before') }), v1),
        el('div', {}, el('div', { class: 'text-xs muted mt-2', style: 'font-weight:800;color:#059669', text: L('v2 改造后', 'v2 after') }), v2)
      );
      // split 的右侧是绝对定位覆盖层，需要给足够高度
      hubHost.append(el('div', { style: 'padding-bottom:8px' }, sp.node));
      log.set([
        { text: L('◧ 左右拖动分割线对比 v1 / v2。', '◧ Drag the divider to compare v1 and v2.'), cls: 'hl' },
        '',
        L('固定变量：文案、卡片数量、整体结构都相同。', 'Held constant: copy, card count, overall structure.'),
        L('改变的只有：字号比、间距尺度、对比度、对齐基准。', 'Changed only: type ratio, spacing scale, contrast, alignment baseline.')
      ]);
      return;
    }

    const hub = buildHub();
    hubHost.append(hub);

    if (state.marks) {
      const marks = [
        { key: 'title', target: hub.querySelector('[data-measure="title"]'), label: '①' },
        { key: 'spacing', target: hub.querySelector('[data-measure="card"]'), label: '②' }
      ];
      const t = state.spacing ? true : false;
      marks.forEach((m) => {
        const fixed = m.key === 'title' ? state.hierarchy : t;
        const node = el('button', { class: 'ch-mark' + (fixed ? ' fixed' : '') + (state.active === m.key ? ' active' : ''), type: 'button', title: L('点击查看诊断', 'Click for diagnosis'), text: m.label });
        node.addEventListener('click', () => {
          state.active = state.active === m.key ? null : m.key;
          draw();
        });
        hub.append(node);
        nextFrame().then(() => placeMark(hub, node, m.target));
      });
    }

    if (state.active && DIAG[state.active]) {
      const d = DIAG[state.active];
      const note = el('div', { class: 'ch-note' },
        el('b', { text: L(d.title.zh, d.title.en) }), el('br'),
        el('span', { html: L(d.text.zh, d.text.en) })
      );
      note.style.left = '50%';
      note.style.top = '-4px';
      noteHost.append(el('div', { style: 'position:relative;height:0' }, note));
      note.style.top = '8px';
    }

    // 真实量测
    const m = measureHub(hub);
    const score = scoreOf(m);
    scoreHost.innerHTML = '';
    scoreHost.append(scoreCard(score));

    const okAa = m.ctaTextContrast >= 4.5;
    log.set([
      { text: L('浏览器真实计算值（不是写死的）', 'Real values measured from the browser (not hard-coded)'), cls: 'hl' },
      '',
      { k: L('标题/正文字号比', 'title / body ratio'), v: num(m.ratio, 2) + (m.ratio >= 1.5 ? '  ✓' : '  ✗'), cls: m.ratio >= 1.5 ? 'ok' : 'bad' },
      { k: L('组间 : 组内间距', 'between : within'), v: num(m.spaceRatio, 2) + ' : 1' + (m.spaceRatio >= 2.5 ? '  ✓' : '  ✗ 分组信号偏弱'), cls: m.spaceRatio >= 2.5 ? 'ok' : 'bad' },
      { k: L('按钮块面对比度', 'CTA block contrast'), v: num(m.ctaBlockContrast, 2) + ' : 1' + (m.ctaBlockContrast >= 3 ? '  ✓ 看得见' : '  ✗ 淹没在页面里'), cls: m.ctaBlockContrast >= 3 ? 'ok' : 'bad' },
      { k: L('按钮文字对比度', 'CTA text contrast'), v: num(m.ctaTextContrast, 2) + ' : 1' + (okAa ? '  ✓ AA 4.5:1' : '  ✗ 低于 AA'), cls: okAa ? 'ok' : 'bad' },
      { k: L('外框左边缘漂移', 'outer edge drift'), v: m.outerSpread + 'px' + (m.outerSpread === 0 ? '  ✓' : '  ✗'), cls: m.outerSpread === 0 ? 'ok' : 'bad' },
      { k: L('内框左边缘漂移', 'inner edge drift'), v: m.innerSpread + 'px' + (m.innerSpread === 0 ? '  ✓' : '  ✗'), cls: m.innerSpread === 0 ? 'ok' : 'bad' },
      { k: L('偏离 8pt 刻度', 'off the 8pt scale'), v: m.offScale + ' / ' + m.errors.length + L(' 个，最大 ', ' elements, max ') + m.maxError + 'px', cls: m.offScale === 0 ? 'ok' : 'bad' },
      '',
      { k: L('综合层次评分', 'hierarchy score'), v: score.total + ' / 100', cls: 'hl' }
    ]);
  }

  /** AB 对比里用的固定版本（不随开关变化） */
  function buildVariant(hierarchy, spacing) {
    return courseHub({ scheme: spacing ? 's8' : 'feel', hierarchy, contrast: hierarchy, align: spacing, grid: false });
  }

  draw();
});

/* =============================================================
 * d-1-2 层次强度台
 * ============================================================= */
register('d-1-2', (mount) => {
  const hubHost = el('div', { style: 'position:relative' });
  const scoreHost = el('div');
  const focusHost = el('div');

  const S = {
    size: 1.7,
    space: 4,
    contrast: 100,
    align: 100
  };

  const cSize = slider({
    label: L('尺寸杠杆（标题/正文比）', 'Size lever (title / body)'),
    min: 1, max: 2.2, step: 0.05, value: S.size, fmt: (v) => v.toFixed(2),
    onChange: (v) => { S.size = v; apply(); }
  });
  const cSpace = slider({
    label: L('间距杠杆（组间/组内比）', 'Space lever (between / within)'),
    min: 1, max: 5, step: 0.25, value: S.space, fmt: (v) => v.toFixed(2),
    onChange: (v) => { S.space = v; apply(); }
  });
  const cContrast = slider({
    label: L('对比杠杆', 'Contrast lever'),
    min: 0, max: 100, step: 5, value: S.contrast,
    onChange: (v) => { S.contrast = v; apply(); }
  });
  const cAlign = slider({
    label: L('对齐杠杆', 'Alignment lever'),
    min: 0, max: 100, step: 5, value: S.align,
    onChange: (v) => { S.align = v; apply(); }
  });

  const presets = buttons([
    { label: L('载入 CourseHub v1', 'Load CourseHub v1'), kind: 'danger', onClick: () => preset(1, 1, 0, 0) },
    { label: L('一键优化', 'Auto-optimise'), kind: 'primary', onClick: () => preset(1.75, 4, 100, 100) }
  ]);

  function preset(sz, sp, ct, al) {
    S.size = sz; S.space = sp; S.contrast = ct; S.align = al;
    cSize.set(sz); cSpace.set(sp); cContrast.set(ct); cAlign.set(al);
    apply();
  }

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('四个杠杆', 'The four levers'), cSize.node, cSpace.node, cContrast.node, cAlign.node, presets,
      el('p', { class: 'text-xs muted mt-0', text: L('提示：把四个滑杆都拉到最低，就是 CourseHub v1 的样子。', 'Tip: drag all four levers to the minimum to reproduce CourseHub v1.') })),
    el('div', {},
      hubHost,
      el('div', { class: 'mt-3' }, scoreHost),
      el('div', { class: 'mt-3' }, el('h4', { class: 'text-sm mt-0', style: 'margin-bottom:6px', text: L('首屏焦点顺序（按 字号 × 对比度 排序）', 'First-glance focus order (ranked by size × contrast)') }), focusHost)
    )
  ));

  const hub = courseHub({ scheme: 's8', hierarchy: true, contrast: true, align: true, grid: false });
  hubHost.append(hub);

  function apply() {
    const base = 13;
    hub.style.setProperty('--title', (base * S.size).toFixed(1) + 'px');
    const within = 8;
    const group = Math.round(within * S.space);
    hub.style.setProperty('--group', group + 'px');
    // 对齐：从错位(messy)插值到对齐(aligned)
    const k = S.align / 100;
    hub.style.setProperty('--edge', (11 + (16 - 11) * k) + 'px');
    hub.style.setProperty('--title-offset', ((1 - k) * 6) + 'px');
    hub.style.setProperty('--tag-offset', ((1 - k) * 7) + 'px');
    hub.style.setProperty('--nav-gap', (13 + (16 - 13) * k) + 'px');
    // 对比：CTA 从灰色插值到实心 indigo；卡片边框随对比强度加深
    const c = S.contrast / 100;
    const mix = (a, b) => Math.round(a + (b - a) * c);
    hub.style.setProperty('--cta-bg', 'rgb(' + mix(226, 79) + ',' + mix(232, 70) + ',' + mix(240, 229) + ')');
    hub.style.setProperty('--cta-fg', c > 0.55 ? '#ffffff' : '#475569');
    hub.style.setProperty('--cta-weight', c > 0.5 ? '700' : '600');
    hub.style.setProperty('--cta-pad-block', (4 + 5 * c) + 'px');
    hub.style.setProperty('--cta-pad-inline', (8 + 10 * c) + 'px');
    hub.style.setProperty('--card-border', c > 0.5 ? '1px solid rgb(' + mix(226, 203) + ',' + mix(232, 213) + ',' + mix(240, 225) + ')' : '1px solid #e2e8f0');
    hub.style.setProperty('--title-color', c > 0.5 ? '#0f172a' : '#334155');

    nextFrame().then(measure);
  }

  function measure() {
    const m = measureHub(hub);
    const score = scoreOf(m);
    scoreHost.innerHTML = '';
    scoreHost.append(scoreCard(score));
    focusHost.innerHTML = '';
    focusHost.append(focusOrder(hub));
  }

  /** 按「字号 × 对比度」把元素排序，模拟第一眼的视觉落点顺序 */
  function focusOrder(root) {
    const items = [
      { sel: '[data-measure="title"]', name: L('主标题', 'Hero title') },
      { sel: '[data-measure="cta"]', name: L('报名按钮', 'CTA button'), bg: true },
      { sel: '[data-measure="cardTitle"]', name: L('卡片标题', 'Card title') },
      { sel: '[data-measure="sub"]', name: L('副标题', 'Subtitle') },
      { sel: '[data-measure="navlink"]', name: L('导航链接', 'Nav link') }
    ];
    const scored = items.map((it) => {
      const node = root.querySelector(it.sel);
      if (!node) return null;
      const cs = getComputedStyle(node);
      const fs = parseFloat(cs.fontSize) || 12;
      const cr = it.bg ? contrastRatio(cs.color, cs.backgroundColor) : contrastRatio(cs.color, 'rgb(255,255,255)');
      return { name: it.name, w: fs * Math.min(cr, 8) };
    }).filter(Boolean).sort((a, b) => b.w - a.w);

    return el('div', { class: 'focus-strip' }, scored.map((s, i) =>
      el('span', { class: 'focus-chip' + (i === 0 ? ' hot' : ''), text: (i + 1) + '. ' + s.name })
    ));
  }

  apply();
});

/* =============================================================
 * d-1-3 网格与节奏尺
 * ============================================================= */
register('d-1-3', (mount) => {
  const state = { scheme: 'feel', ruler: true, errors: true, auto: false };

  const hubHost = el('div', { style: 'position:relative' });
  const log = readout();
  const histHost = el('div');
  const tableHost = el('div');

  const schemeSeg = seg({
    label: L('间距方案', 'Spacing scheme'),
    options: [
      { value: 'feel', label: L('手感', 'By feel') },
      { value: 's4', label: '4pt' },
      { value: 's8', label: '8pt' }
    ],
    value: 'feel',
    onChange: (v) => { state.scheme = v; draw(); }
  });

  const tRuler = toggle({ label: L('叠加 8pt 刻度尺', 'Overlay the 8pt scale'), checked: true, onChange: (v) => { state.ruler = v; draw(); } });
  const tErr = toggle({ label: L('标注对齐误差', 'Annotate alignment error'), checked: true, onChange: (v) => { state.errors = v; draw(); } });

  let timer = null;
  const tAuto = toggle({
    label: L('自动巡回三套方案', 'Cycle through the three schemes'),
    checked: false,
    onChange: (v) => {
      state.auto = v;
      clearInterval(timer);
      if (v) {
        const order = ['feel', 's4', 's8'];
        timer = setInterval(() => {
          const i = (order.indexOf(state.scheme) + 1) % order.length;
          state.scheme = order[i];
          schemeSeg.set(state.scheme);
          draw();
        }, 2200);
      }
    }
  });

  const bDrift = buttons([
    {
      label: L('对齐漂移可视化', 'Visualise alignment drift'),
      onClick: () => drift()
    }
  ]);

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('方案与叠加层', 'Scheme & overlays'), schemeSeg.node, tRuler.node, tErr.node, tAuto.node, bDrift,
      el('p', { class: 'text-xs muted mt-0', text: L('尺子 = 8pt（8 / 16 / 24 …）。误差 = 元素左边缘到最近刻度的距离。', 'Ruler = 8pt (8 / 16 / 24 …). Error = distance from an element’s left edge to the nearest tick.') })),
    el('div', {},
      hubHost,
      el('div', { class: 'mt-3' }, log.node),
      el('div', { class: 'mt-3' }, el('h4', { class: 'text-sm mt-0', style: 'margin-bottom:6px', text: L('对齐误差分布（px）', 'Alignment error distribution (px)') }), histHost),
      el('div', { class: 'mt-3' }, tableHost)
    )
  ));

  function draw() {
    hubHost.innerHTML = '';
    const hub = courseHub({ scheme: state.scheme, hierarchy: state.scheme === 's8', contrast: state.scheme === 's8', align: state.scheme !== 'feel', grid: state.ruler });
    hubHost.append(hub);
    nextFrame().then(() => annotate(hub));
  }

  function annotate(hub) {
    const m = measureHub(hub);
    const sp = SPACING_SCHEMES[state.scheme];
    const hr = hub.getBoundingClientRect();

    if (state.errors) {
      Array.from(hub.querySelectorAll('[data-measure]')).forEach((node, i) => {
        const r = node.getBoundingClientRect();
        const err = m.errors[i];
        if (!err) return;
        const bar = el('div', { class: 'ch-off' });
        bar.style.left = (r.left - hr.left) + 'px';
        bar.style.top = (r.top - hr.top) + 'px';
        bar.style.width = Math.max(r.width, 18) + 'px';
        bar.dataset.px = err + 'px';
        hub.append(bar);
      });
    }

    const rows = Array.from(hub.querySelectorAll('[data-measure]')).map((node, i) => {
      const r = node.getBoundingClientRect();
      const off = m.edges[i];
      const err = m.errors[i];
      const name = node.dataset.measure;
      return { name, off, err };
    });

    log.set([
      { k: L('间距方案', 'spacing scheme'), v: L(SCHEME_LABEL[state.scheme].zh, SCHEME_LABEL[state.scheme].en), cls: 'hl' },
      { k: L('内边距 / 组间距 / 区块间距', 'padding / gap / block'), v: sp.pad + ' / ' + sp.group + ' / ' + sp.block + 'px' },
      '',
      { k: L('最大对齐误差', 'max alignment error'), v: m.maxError + 'px' + (m.maxError === 0 ? '  ✓ 全部落在刻度上' : '  ✗'), cls: m.maxError === 0 ? 'ok' : 'bad' },
      { k: L('容差', 'tolerance'), v: L('1.25px（1px 边框造成的整体偏移不计）', '1.25px (a uniform 1px shift from a 1px border is ignored)') },
      { k: L('偏离刻度的元素', 'elements off scale'), v: m.offScale + ' / ' + m.errors.length, cls: m.offScale === 0 ? 'ok' : 'bad' },
      { k: L('不同左边界数量', 'distinct left edges'), v: String(m.distinctEdges), cls: m.distinctEdges <= 2 ? 'ok' : 'bad' },
      { k: L('外框漂移', 'outer drift'), v: m.outerSpread + 'px', cls: m.outerSpread === 0 ? 'ok' : 'bad' }
    ]);

    // 误差直方图：0..7px
    const buckets = new Array(8).fill(0);
    m.errors.forEach((e) => { buckets[Math.min(7, Math.round(e))] += 1; });
    const maxB = Math.max(1, ...buckets);
    histHost.innerHTML = '';
    histHost.append(el('div', { class: 'hist' }, buckets.map((count, px) =>
      el('div', { class: 'hb' + (px > 0 && count > 0 ? ' bad' : ''), style: 'height:' + (count / maxB * 100) + '%' },
        el('span', { text: px + '' }))
    )) );
    histHost.append(el('div', { class: 'text-xs muted', style: 'margin-top:22px', text: L('横轴：误差像素值（0 表示正好落在 8pt 刻度上）；柱高：处于该误差的元素个数。', 'X axis: error in px (0 = exactly on the 8pt tick); bar height: number of elements with that error.') }));

    tableHost.innerHTML = '';
    tableHost.append(tableRaw(rows));
  }

  function tableRaw(rows) {
    const wrap = el('div');
    wrap.append(el('table', { class: 'mini' },
      el('thead', {}, el('tr', {},
        el('th', { text: L('量测元素', 'Element') }),
        el('th', { text: L('左边缘偏移', 'Left offset') }),
        el('th', { text: L('相对 8pt 误差', 'Error vs 8pt') })
      )),
      el('tbody', {}, rows.map((r) => el('tr', { class: r.err ? 'issue' : null },
        el('td', { text: r.name }),
        el('td', { class: 'num', text: r.off + 'px' }),
        el('td', { class: 'num', text: r.err ? r.err + 'px' : '0 ✓' })
      )))
    ));
    return wrap;
  }

  /** 让误差"动起来"：逐个元素依次闪出误差标注 */
  async function drift() {
    const hub = hubHost.querySelector('.ch-hub');
    if (!hub) return;
    const marks = Array.from(hub.querySelectorAll('.ch-off'));
    marks.forEach((m) => { m.style.transition = 'opacity 0.2s'; m.style.opacity = '0'; });
    for (const m of marks) {
      m.style.opacity = '1';
      await new Promise((r) => setTimeout(r, 260));
    }
    setTimeout(() => marks.forEach((m) => { m.style.opacity = '1'; }), 600);
  }

  draw();
});
