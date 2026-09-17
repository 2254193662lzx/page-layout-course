/* =============================================================
 * demos/ch2.js — 第 2 章的三个交互演示
 *   d-2-1 格式化上下文实验台
 *   d-2-2 盒模型解剖器 + 外边距折叠
 *   d-2-3 粘性导航事故现场
 * ============================================================= */

import {
  el, L, register, slider, seg, toggle, buttons, readout, tableMini, panel, preview,
  nextFrame, num, clamp, styleOf
} from '../lab.js';

/* =============================================================
 * d-2-1 格式化上下文实验台
 * ============================================================= */
register('d-2-1', (mount) => {
  const state = { mode: 'block', badge: true };

  const stage = el('div', { class: 'fc-stage' });
  const parent = el('div', { class: 'fc-parent' });
  const c1 = el('div', { class: 'fc-child', text: L('浮动子元素 A（float: left）', 'Floated child A (float: left)') });
  const c2 = el('div', { class: 'fc-child alt', text: L('浮动子元素 B（float: left）', 'Floated child B (float: left)') });
  const badge = el('span', { class: 'fc-badge', text: L('溢出边界的内容', 'Overflowing badge') });
  const tag = el('span', { class: 'fc-tag' });
  parent.append(c1, c2, badge, tag);
  stage.append(parent);

  const log = readout();

  const modeSeg = seg({
    label: L('父元素的 display / 清除方式', 'Parent display / float containment'),
    options: [
      { value: 'block', label: L('默认（无清除）', 'Default (none)') },
      { value: 'flow-root', label: 'flow-root' },
      { value: 'overflow-hidden', label: 'overflow:hidden' },
      { value: 'clearfix', label: 'clearfix' },
      { value: 'flex', label: 'flex' }
    ],
    value: 'block',
    onChange: (v) => { state.mode = v; draw(); }
  });

  const tBadge = toggle({
    label: L('在父元素边界外放一个元素（测试副作用）', 'Put an element outside the parent edge (test side effects)'),
    checked: true,
    onChange: (v) => { state.badge = v; draw(); }
  });

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('实验条件', 'Experiment'), modeSeg.node, tBadge.node,
      el('p', { class: 'text-xs mt-0 muted', text: L('两个子元素都 float:left。父元素只有虚线边框，没有内容参与正常流。', 'Both children are floated left. The parent has only a dashed border and no in-flow content.') })),
    el('div', {}, stage, el('div', { class: 'mt-4' }, log.node))
  ));

  const CONFIG = {
    block: { bfc: false, note: { zh: '父元素不建立 BFC：浮动子元素不贡献高度，父元素高度塌成 0。', en: 'No BFC: floated children contribute no height, so the parent collapses to 0.' }, side: { zh: '—', en: '—' } },
    'flow-root': { bfc: true, note: { zh: 'flow-root 建立 BFC 且不改变外部行为：高度被"兜住"，同时没有任何副作用。', en: 'flow-root creates a BFC without changing outside behaviour: height is contained, with no side effects.' }, side: { zh: '无 ✓', en: 'None ✓' } },
    'overflow-hidden': { bfc: true, note: { zh: 'overflow:hidden 也能建立 BFC，但会裁掉超出边界的内容（看右上角的勋章）。', en: 'overflow:hidden also creates a BFC but clips anything outside the box (see the badge at the top-right).' }, side: { zh: '裁掉溢出内容 + 破坏位置粘性', en: 'Clips overflow + breaks sticky' } },
    clearfix: { bfc: true, note: { zh: 'clearfix 用 ::after 伪元素清除浮动，效果正确但依赖一个"空节点"技巧。', en: 'clearfix clears floats with an ::after pseudo-element: correct, but it relies on an empty-node trick.' }, side: { zh: '需要额外伪元素', en: 'Extra pseudo-element' } },
    flex: { bfc: true, note: { zh: 'flex 容器本身就是 BFC，而且会忽略子元素的 float —— 但子元素的宽度分配方式也随之改变。', en: 'A flex container is itself a BFC and ignores float on its children — but how children share width changes too.' }, side: { zh: '忽略 float、改变宽度分配', en: 'Ignores float, changes width sharing' } }
  };

  function draw() {
    const cfg = CONFIG[state.mode];
    parent.dataset.mode = state.mode;
    parent.classList.toggle('bfc', cfg.bfc);
    badge.style.display = state.badge ? '' : 'none';
    badge.classList.toggle('clipped', state.mode === 'overflow-hidden');

    nextFrame().then(() => {
      const ph = Math.round(parent.getBoundingClientRect().height);
      const ch = Math.round(c1.getBoundingClientRect().height);
      const contained = ph >= ch;
      tag.className = 'fc-tag ' + (contained ? 'good' : 'bad');
      tag.textContent = L('父元素高度 ', 'parent height ') + ph + 'px' + (contained ? ' ✓' : ' ✗ 高度塌陷');

      log.set([
        { k: L('父元素 display', 'parent display'), v: state.mode + (cfg.bfc ? '  → 建立 BFC ✓' : '  → 未建立 BFC ✗'), cls: cfg.bfc ? 'ok' : 'bad' },
        { k: L('父元素实测高度', 'measured height'), v: ph + 'px' + L('（子元素高 ', ' (child ') + ch + 'px)', cls: contained ? 'ok' : 'bad' },
        { k: L('浮动是否被包含', 'float contained'), v: contained ? '✓' : '✗ 高度塌陷', cls: contained ? 'ok' : 'bad' },
        { k: L('副作用', 'side effects'), v: L(cfg.side.zh, cfg.side.en), cls: state.mode === 'flow-root' ? 'ok' : 'hl' },
        '',
        L(cfg.note.zh, cfg.note.en)
      ]);
    });
  }

  draw();
});

/* =============================================================
 * d-2-2 盒模型解剖器 + 外边距折叠
 * ============================================================= */
register('d-2-2', (mount) => {
  const box = { w: 200, pad: 16, bw: 4, mg: 16, sizing: 'content-box' };
  const collapse = { ma: 21, mb: 37, useGap: false };

  const host = el('div', { class: 'demo-preview', style: 'overflow:auto' });
  const log = readout();
  const collapseHost = el('div', { class: 'demo-preview' });
  const collapseLog = readout();

  const cW = slider({ label: L('width', 'width'), min: 80, max: 280, step: 4, value: box.w, unit: 'px', onChange: (v) => { box.w = v; drawBox(); } });
  const cP = slider({ label: L('padding', 'padding'), min: 0, max: 40, step: 2, value: box.pad, unit: 'px', onChange: (v) => { box.pad = v; drawBox(); } });
  const cB = slider({ label: L('border-width', 'border-width'), min: 0, max: 16, step: 1, value: box.bw, unit: 'px', onChange: (v) => { box.bw = v; drawBox(); } });
  const cM = slider({ label: L('margin', 'margin'), min: 0, max: 48, step: 2, value: box.mg, unit: 'px', onChange: (v) => { box.mg = v; drawBox(); } });

  const sizingSeg = seg({
    label: 'box-sizing',
    options: [{ value: 'content-box', label: 'content-box' }, { value: 'border-box', label: 'border-box' }],
    value: 'content-box',
    onChange: (v) => { box.sizing = v; drawBox(); }
  });

  const cMa = slider({ label: L('A 的下外边距 margin-bottom', 'A margin-bottom'), min: 0, max: 48, step: 1, value: 21, unit: 'px', onChange: (v) => { collapse.ma = v; drawCollapse(); } });
  const cMb = slider({ label: L('B 的上外边距 margin-top', 'B margin-top'), min: 0, max: 48, step: 1, value: 37, unit: 'px', onChange: (v) => { collapse.mb = v; drawCollapse(); } });
  const tGap = toggle({
    label: L('改用容器 gap 表达间距（修复）', 'Express the gap on the container instead (fix)'),
    checked: false,
    onChange: (v) => { collapse.useGap = v; drawCollapse(); }
  });

  mount.append(
    el('div', { class: 'demo-stage wide-controls' },
      panel(L('① 盒模型四层', '① The four layers'), cW.node, cP.node, cB.node, cM.node, sizingSeg.node),
      el('div', {}, host, el('div', { class: 'mt-3' }, log.node))
    ),
    el('div', { class: 'demo-stage wide-controls', style: 'margin-top:18px' },
      panel(L('② 外边距折叠', '② Margin collapsing'), cMa.node, cMb.node, tGap.node,
        el('p', { class: 'text-xs mt-0 muted', text: L('两个相邻块级元素在垂直方向上的外边距会合并为较大的那个。', 'Two adjacent block boxes merge their vertical margins into the larger value.') })),
      el('div', {}, collapseHost, el('div', { class: 'mt-3' }, collapseLog.node))
    )
  );

  /* ---- ① 盒模型 ---- */
  const mEl = el('div', { class: 'bm-margin', style: 'display:inline-block' });
  const bEl = el('div', { class: 'bm-border' });
  const pEl = el('div', { class: 'bm-padding' });
  const kEl = el('div', { class: 'bm-content' });
  const labels = {
    margin: el('span', { class: 'bm-label' }),
    border: el('span', { class: 'bm-label' }),
    padding: el('span', { class: 'bm-label' }),
    content: el('span', { class: 'bm-label' })
  };
  pEl.append(kEl, labels.padding, labels.content);
  bEl.append(pEl, labels.border);
  mEl.append(bEl, labels.margin);
  host.append(el('div', { style: 'text-align:center;padding:6px 0' }, mEl));

  function drawBox() {
    mEl.style.boxSizing = box.sizing;
    mEl.style.width = box.w + 'px';
    mEl.style.padding = box.mg + 'px';
    bEl.style.padding = box.bw + 'px';
    pEl.style.padding = box.pad + 'px';

    nextFrame().then(() => {
      const totalRect = mEl.getBoundingClientRect();
      const contentRect = kEl.getBoundingClientRect();
      const total = Math.round(totalRect.width);
      const content = Math.round(contentRect.width);
      const chrome = box.pad * 2 + box.bw * 2;

      labels.margin.textContent = 'margin ' + box.mg;
      labels.margin.style.cssText = 'position:absolute;top:2px;left:3px';
      labels.border.textContent = 'border ' + box.bw;
      labels.border.style.cssText = 'position:absolute;top:50%;left:-2px;transform:translateY(-50%)';
      labels.padding.textContent = 'padding ' + box.pad;
      labels.padding.style.cssText = 'position:absolute;bottom:2px;right:3px';
      labels.content.textContent = 'content ' + content + 'px';
      labels.content.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)';

      const container = host.clientWidth || 520;
      log.set([
        { text: 'box-sizing: ' + box.sizing, cls: 'hl' },
        '',
        { k: L('你写的 width', 'width written'), v: box.w + 'px' },
        { k: L('内容区实际宽度', 'content area'), v: content + 'px' },
        { k: L('padding + border', 'padding + border'), v: chrome + 'px' },
        { k: L('元素实际占用宽度', 'real footprint'), v: total + 'px  ' + (total === box.w ? '= width ✓' : '= width + ' + (total - box.w) + 'px'), cls: total === box.w ? 'ok' : 'bad' },
        '',
        { k: L('父容器可用宽度', 'container width'), v: Math.round(container) + 'px' },
        { k: L('横向能放几个', 'boxes that fit'), v: Math.max(0, Math.floor(container / Math.max(total, 1))) + L(' 个', ' pcs') },
        '',
        box.sizing === 'content-box'
          ? L('⚠ content-box：width 只管内容区，加上 padding/border 后总宽超出预期 —— width:50% 的两栏再加 padding 必然溢出。', '⚠ content-box: width covers only the content area, so padding and border push the total past what you expect — two 50% columns plus padding inevitably overflow.')
          : L('✓ border-box：width 就是元素实际占用的宽度，加 padding 不再"变胖"。', '✓ border-box: width is the real footprint; adding padding does not make it fatter.')
      ]);
    });
  }

  /* ---- ② 外边距折叠 ---- */
  const stage = el('div', { class: 'collapse-stage' });
  const blockA = el('div', { class: 'collapse-block', text: L('区块 A（margin-bottom）', 'Block A (margin-bottom)') });
  const blockB = el('div', { class: 'collapse-block', text: L('区块 B（margin-top）', 'Block B (margin-top)') });
  const bandA = el('div', { class: 'collapse-band a' }, el('span'));
  const bandB = el('div', { class: 'collapse-band b' }, el('span'));
  stage.append(blockA, blockB, bandA, bandB);
  collapseHost.append(stage);

  function drawCollapse() {
    collapse.useGap = tGap.checked;
    if (collapse.useGap) {
      stage.style.display = 'flex';
      stage.style.flexDirection = 'column';
      stage.style.gap = collapse.mb + 'px';
      blockA.style.marginBottom = '0px';
      blockB.style.marginTop = '0px';
    } else {
      stage.style.display = 'block';
      stage.style.gap = '';
      blockA.style.marginBottom = collapse.ma + 'px';
      blockB.style.marginTop = collapse.mb + 'px';
    }

    nextFrame().then(() => {
      const ra = blockA.getBoundingClientRect();
      const rb = blockB.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      const gap = Math.round(rb.top - ra.bottom);
      const maxV = Math.max(collapse.ma, collapse.mb);

      // 把两个 margin 画成色带：A 的从 A 底部开始，B 的贴着 B 顶部往上
      bandA.style.top = (ra.bottom - sr.top) + 'px';
      bandA.style.height = collapse.ma + 'px';
      bandA.querySelector('span').textContent = 'A margin ' + collapse.ma + 'px';
      bandB.style.top = (rb.top - sr.top - collapse.mb) + 'px';
      bandB.style.height = collapse.mb + 'px';
      bandB.querySelector('span').textContent = 'B margin ' + collapse.mb + 'px';
      bandA.classList.toggle('merged', collapse.useGap);
      bandB.classList.toggle('merged', collapse.useGap);
      bandA.style.opacity = collapse.useGap ? '0' : '0.9';
      bandB.style.opacity = collapse.useGap ? '0' : '0.9';
      stage.style.paddingBottom = '0';

      if (collapse.useGap) {
        collapseLog.set([
          { text: L('模式：容器 gap（修复后）', 'mode: container gap (fixed)'), cls: 'ok' },
          '',
          { k: L('gap 值', 'gap value'), v: collapse.mb + 'px' },
          { k: L('实测间距', 'measured gap'), v: gap + 'px', cls: gap === collapse.mb ? 'ok' : 'bad' },
          '',
          L('✓ 间距等于你写的那个值，不会折叠，也不会被吞掉。', '✓ The gap equals the value you wrote: no collapsing, nothing swallowed.'),
          L('（A 原本的 margin-bottom 已置 0，避免两套机制混用）', '(A’s margin-bottom is set to 0 so two mechanisms do not mix.)')
        ]);
      } else {
        collapseLog.set([
          { text: L('模式：两个 margin 相遇（浏览器默认行为）', 'mode: two margins meet (browser default)'), cls: 'hl' },
          '',
          { k: L('A 的 margin-bottom', 'A margin-bottom'), v: collapse.ma + 'px' },
          { k: L('B 的 margin-top', 'B margin-top'), v: collapse.mb + 'px' },
          { k: L('两者相加（直觉值）', 'naive sum'), v: (collapse.ma + collapse.mb) + 'px' },
          { k: L('浏览器实测间距', 'measured gap'), v: gap + 'px  = max(' + collapse.ma + ', ' + collapse.mb + ')', cls: 'bad' },
          { k: L('被丢弃的值', 'discarded margin'), v: Math.min(collapse.ma, collapse.mb) + 'px', cls: 'bad' },
          '',
          L('⚠ 你写的两个值只有一个生效。这就是"卡片间距看起来和设计稿不一样"的常见原因。', '⚠ Only one of the two values takes effect. This is the usual reason "the card gap does not match the design".')
        ]);
      }
      void maxV;
    });
  }

  drawBox();
  drawCollapse();
});

/* =============================================================
 * d-2-3 粘性导航事故现场
 * ============================================================= */
register('d-2-3', (mount) => {
  const breaks = { overflow: false, noTop: false, noBg: false, noZ: false };

  const scroller = el('div', { class: 'sticky-scroller' });
  const inner = el('div', { class: 'sticky-inner' });
  const bar = el('div', { class: 'sticky-bar' });
  const barLabel = el('span', { text: L('CourseHub · 吸顶导航', 'CourseHub · sticky nav') });
  const barTag = el('span', { class: 'sticky-measure', text: L('未吸顶', 'not stuck') });
  bar.append(barLabel, barTag);

  const content = el('div', { class: 'sticky-content' });
  for (let i = 1; i <= 5; i += 1) {
    content.append(el('div', { class: 'sticky-card' + (i === 2 ? ' overlap' : ''),
      text: L('课程模块 ' + i + '：这一段是滚动内容，用来检验导航是否真的吸住了。', 'Module ' + i + ': this is scrolling content, used to test whether the nav really sticks.') }));
  }
  inner.append(bar, content);
  scroller.append(inner);

  const log = readout();
  const chainHost = el('div', { class: 'chain' });

  function makeToggle(key, label) {
    return toggle({ label, checked: false, onChange: (v) => { breaks[key] = v; apply(); } });
  }
  const t1 = makeToggle('overflow', L('① 祖先元素 overflow: hidden', '① Ancestor overflow: hidden'));
  const t2 = makeToggle('noTop', L('② 缺少 top: 0（没有门槛值）', '② Missing top: 0 (no threshold)'));
  const t3 = makeToggle('noBg', L('③ 没有背景色', '③ No background colour'));
  const t4 = makeToggle('noZ', L('④ z-index: auto，被后续兄弟盖住', '④ z-index: auto, covered by a later sibling'));

  const btns = buttons([
    { label: L('▶ 运行滚动测试（真实滚动 + 实测）', '▶ Run scroll test (really scrolls and measures)'), kind: 'primary', onClick: runTest },
    { label: L('一键修复全部', 'Fix everything'), onClick: () => { Object.keys(breaks).forEach((k) => { breaks[k] = false; }); [t1, t2, t3, t4].forEach((t) => t.set(false)); apply(); } }
  ]);

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('四个经典失效条件', 'Four classic failure conditions'), t1.node, t2.node, t3.node, t4.node, btns,
      el('div', { class: 'mt-3' }, el('h4', { class: 'text-sm mt-0', text: L('祖先链检查', 'Ancestor chain') }), chainHost)),
    el('div', {}, scroller, el('div', { class: 'mt-3' }, log.node))
  ));

  function apply() {
    inner.classList.toggle('blocked', breaks.overflow);
    bar.classList.toggle('notop', breaks.noTop);
    bar.classList.toggle('noz', breaks.noZ);
    bar.classList.toggle('strongz', !breaks.noZ);
    bar.style.background = breaks.noBg ? 'transparent' : '';
    bar.style.color = breaks.noBg ? 'var(--ink-700)' : '';
    drawChain();
    measure(L('参数已改变 —— 点"运行滚动测试"实测结果', 'Parameters changed — hit "Run scroll test" to measure'));
  }

  function drawChain() {
    const items = [
      { t: '.sticky-scroller', note: 'overflow: auto', bad: false },
      { t: '.sticky-inner', note: breaks.overflow ? 'overflow: hidden ✗' : 'overflow: visible', bad: breaks.overflow },
      { t: '.sticky-bar', note: 'position: sticky' + (breaks.noTop ? ' · top: auto ✗' : ' · top: 0'), bad: breaks.noTop },
      { t: '.sticky-card', note: breaks.noZ ? 'z-index: 2 盖住导航 ✗' : 'z-index: 2', bad: breaks.noZ }
    ];
    chainHost.innerHTML = '';
    items.forEach((it, i) => {
      chainHost.append(el('code', { class: it.bad ? 'flagged' : '', text: it.t }));
      if (i < items.length - 1) chainHost.append(el('span', { class: 'muted', text: i === 0 ? '▸ 滚动容器 ▸' : '▸' }));
    });
    chainHost.append(el('span', { class: 'muted text-xs', text: L('（红色 = 触发了失效条件）', '(red = broken condition active)') }));
  }

  async function runTest() {
    scroller.scrollTop = 0;
    await nextFrame();
    scroller.scrollTop = 150;
    await new Promise((r) => setTimeout(r, 420));
    measure(L('已在容器内滚动 150px', 'scrolled 150px inside the container'), true);
  }

  function measure(label, withVerdict) {
    const sr = scroller.getBoundingClientRect();
    const br = bar.getBoundingClientRect();
    const stuck = br.top - sr.top <= 1.5;
    const barH = Math.round(br.height);
    const travel = Math.round(inner.getBoundingClientRect().height - barH);

    // 用 elementFromPoint 实测"谁在最上层"
    const cx = Math.round(br.left + br.width / 2);
    const cy = Math.round(br.top + br.height / 2);
    const topEl = document.elementFromPoint(cx, cy);
    const onTop = !!(topEl && bar.contains(topEl));
    const blocker = onTop ? null : (topEl ? (topEl.className || topEl.tagName) : 'null');

    const bg = getComputedStyle(bar).backgroundColor;
    const transparent = /rgba\(0, 0, 0, 0\)|transparent/.test(bg);
    const stickyTop = getComputedStyle(bar).top;

    bar.style.background = breaks.noBg ? 'transparent' : '';
    bar.style.color = breaks.noBg ? 'var(--ink-700)' : '';

    const lines = [
      { text: label, cls: 'hl' },
      '',
      { k: L('导航是否吸顶', 'header stuck'), v: stuck ? L('✓ 是（贴在容器顶）', '✓ yes (pinned to the container top)') : L('✗ 否', '✗ no'), cls: stuck ? 'ok' : 'bad' },
      { k: L('导航高度 / 可移动量', 'height / travel room'), v: barH + 'px / ' + travel + 'px' },
      { k: L('是否绘制在最上层', 'painted on top'), v: onTop ? '✓' : '✗ ' + L('被 ', 'covered by ') + blocker, cls: onTop ? 'ok' : 'bad' },
      { k: L('背景色', 'background colour'), v: transparent ? L('✗ 透明，内容会透出来', '✗ transparent, content shows through') : '✓ ' + bg, cls: transparent ? 'bad' : 'ok' },
      { k: L('计算后的 top 值', 'computed top'), v: String(stickyTop), cls: stickyTop === 'auto' ? 'bad' : 'ok' },
      ''
    ];

    if (!stuck) {
      lines.push({ text: L('→ 吸顶失效原因：', '→ why it fails: ') + (breaks.overflow
        ? L('祖先 .sticky-inner 的 overflow: hidden 成为了"最近的滚动容器"，而它自己不滚动。', 'the ancestor .sticky-inner with overflow: hidden became the nearest scrollport, and it does not scroll.')
        : breaks.noTop
          ? L('没有 top 值，sticky 不知道何时开始吸附。', 'no top value, so sticky never knows when to start sticking.')
          : L('父元素没有给元素留出可移动的空间。', 'the parent leaves no room for the element to move.')), cls: 'bad' });
    } else if (transparent) {
      lines.push({ text: L('→ 导航其实吸住了，但因为背景透明，滚动的内容从它下面透出来，看起来"没生效"。', '→ the nav does stick, but with a transparent background the content shows through, so it looks broken.'), cls: 'bad' });
    } else if (!onTop) {
      lines.push({ text: L('→ 导航吸住了却被后续兄弟盖住：给 sticky 元素加上 z-index 与背景，让它建立层叠上下文。', '→ it sticks but a later sibling paints over it: give the sticky element a z-index and a background so it forms its own stacking context.'), cls: 'bad' });
    } else {
      lines.push({ text: L('✓ 吸顶正常：参与正常流（不会盖住内容）+ 有门槛值 + 自带层叠上下文。', '✓ sticky works: it stays in normal flow (never covers content), has a threshold and forms its own stacking context.'), cls: 'ok' });
    }

    barTag.textContent = stuck ? L('吸顶中', 'stuck') : L('未吸顶', 'not stuck');
    barTag.style.background = stuck ? 'rgba(5,150,105,.9)' : 'rgba(225,29,72,.9)';
    void withVerdict;
    log.set(lines);
  }

  apply();
  nextFrame().then(() => measure(L('初始状态：容器未滚动', 'initial state: container not scrolled')));
});
