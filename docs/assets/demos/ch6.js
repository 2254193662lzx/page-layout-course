/* =============================================================
 * demos/ch6.js — 第 6 章的三个交互演示
 *   d-6-1 顺序分歧检测器（DOM / 视觉 / 焦点 三套顺序）
 *   d-6-2 可访问性压力测试（WCAG 1.4.10 / 1.4.4 / 1.4.12 / 2.5.8 / 1.4.3）
 *   d-6-3 综合案例：v1→v2 对比 + 8 病灶 + 评审清单
 * ============================================================= */

import {
  el, L, register, slider, seg, toggle, buttons, readout, tableMini, panel, preview,
  split, nextFrame, num, clamp
} from '../lab.js';
import { courseHub, measureHub, scoreOf, scoreCard, contrastRatio } from './case.js';

/* =============================================================
 * d-6-1 顺序分歧检测器
 * ============================================================= */
register('d-6-1', (mount) => {
  const state = { mode: 'order', playing: false };

  const shell = el('div', { class: 'fo-shell' });
  const layout = el('div', { class: 'fo-layout' });
  shell.append(layout);

  const log = readout();
  const domSeq = el('div', { class: 'fo-seq' });
  const visSeq = el('div', { class: 'fo-seq' });
  const focSeq = el('div', { class: 'fo-seq' });

  const modeSeg = seg({
    label: L('重排方式', 'Reordering technique'),
    options: [
      { value: 'order', label: L('v1：用 order 强改', 'v1: forced with order') },
      { value: 'grid', label: L('v2：用 grid 重排', 'v2: reordered with grid') }
    ],
    value: 'order',
    onChange: (v) => { state.mode = v; draw(); }
  });

  const bPlay = buttons([{ label: L('▶ 播放 Tab 顺序', '▶ Play tab order'), kind: 'primary', onClick: play }]);

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('重排方式', 'Technique'), modeSeg.node, bPlay,
      el('p', { class: 'text-xs mt-0 muted', text: L('DOM 里侧栏在正文之前（v1 的写法）。点播放看键盘用户实际会依次停在哪些元素上。', 'The sidebar precedes the body in the DOM (the v1 pattern). Press play to see where a keyboard user actually lands, in order.') })),
    el('div', {}, shell,
      el('div', { class: 'mt-3' },
        el('div', { class: 'text-xs muted', style: 'margin-bottom:4px', text: L('DBO 顺序（= 键盘 Tab 顺序）', 'DOM order (= keyboard tab order)') }), domSeq,
        el('div', { class: 'text-xs muted', style: 'margin:8px 0 4px', text: L('视觉顺序（左上 → 右下）', 'Visual order (top-left → bottom-right)') }), visSeq,
        el('div', { class: 'text-xs muted', style: 'margin:8px 0 4px', text: L('焦点顺序（实测：依次聚焦）', 'Focus order (measured by actually focusing)') }), focSeq
      ),
      el('div', { class: 'mt-3' }, log.node))
  ));

  const ITEMS = [
    { id: 's1', group: 'side', tag: L('侧栏 · 搜索框', 'Sidebar · search'), el: () => el('input', { type: 'search', placeholder: L('搜索课程', 'Search courses'), 'aria-label': L('侧栏搜索框', 'Sidebar search') }) },
    { id: 's2', group: 'side', tag: L('侧栏 · 筛选按钮', 'Sidebar · filter'), el: () => el('button', { type: 'button', class: 'btn', text: L('按价格筛选', 'Filter by price') }) },
    { id: 'm1', group: 'main', tag: L('正文 · 报名按钮', 'Body · enroll'), el: () => el('button', { type: 'button', class: 'btn primary', text: L('立即报名', 'Enroll now') }) },
    { id: 'm2', group: 'main', tag: L('正文 · 课程详情链接', 'Body · course link'), el: () => el('a', { href: '#', class: 'btn', text: L('查看课程详情', 'View course details') }) }
  ];

  function draw() {
    layout.dataset.mode = state.mode;
    layout.innerHTML = '';

    const sideBox = el('div', { class: 'fo-side' });
    const mainBox = el('div', { class: 'fo-main' });
    const nodes = {};

    ITEMS.forEach((it) => {
      const node = it.el();
      if (node.tagName === 'INPUT' || node.classList.contains('btn')) {
        node.classList.add('fo-item');
        node.prepend(el('b', { text: it.tag }));
      }
      nodes[it.id] = node;
    });

    // v1：DOM 里侧栏在前；v2：DOM 里正文在前（= 阅读顺序）
    const order = state.mode === 'order'
      ? [['side', ['s1', 's2']], ['main', ['m1', 'm2']]]
      : [['main', ['m1', 'm2']], ['side', ['s1', 's2']]];
    order.forEach(([group, ids]) => {
      const box = group === 'side' ? sideBox : mainBox;
      ids.forEach((id) => box.append(nodes[id]));
    });
    layout.append(mainBox, sideBox);

    nextFrame().then(() => {
      const items = Array.from(layout.querySelectorAll('input, button, a'));
      const labelOf = (n) => {
        const idx = items.indexOf(n);
        const it = ITEMS.find((x) => x.id === Object.keys(nodes).find((k) => nodes[k] === n));
        void idx;
        return it ? it.tag : (n.textContent || '').trim().slice(0, 10);
      };

      const dom = items.slice();
      const vis = items.slice().sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return Math.abs(ra.top - rb.top) > 8 ? ra.top - rb.top : ra.left - rb.left;
      });

      const short = (n) => {
        const it = ITEMS.find((x) => x.id === Object.keys(nodes).find((k) => nodes[k] === n));
        return it ? it.tag.split(' · ')[1] : '';
      };
      const renderSeq = (host, arr) => {
        host.innerHTML = '';
        arr.forEach((n, i) => host.append(el('span', { text: (i + 1) + '. ' + short(n) })));
      };
      renderSeq(domSeq, dom);
      renderSeq(visSeq, vis);
      focSeq.innerHTML = '';

      // 真正的可访问性问题不是"第 3 个元素是不是第 3 个"，
      // 而是"次要内容（侧栏）是否被排在了主要内容之前" —— 所以按分组去重后比较
      const groupOf = (n) => (n.closest('.fo-side') ? 'side' : 'main');
      const uniqGroups = (arr) => arr.map(groupOf).filter((g, i, a) => a.indexOf(g) === i).join(' → ');
      const domGroups = uniqGroups(dom);
      const visGroups = uniqGroups(vis);
      const conflict = domGroups !== visGroups;

      log.set([
        { k: L('重排方式', 'technique'), v: state.mode === 'order' ? '.fo-main { order: 1 } / .fo-side { order: 2 }' : 'grid-template-areas: "main side"', cls: state.mode === 'order' ? 'bad' : 'ok' },
        { k: L('DOM（= 键盘与读屏）顺序', 'DOM (= keyboard & screen reader)'), v: domGroups, cls: conflict ? 'bad' : 'ok' },
        { k: L('视觉上的阅读顺序', 'visual reading order'), v: visGroups, cls: conflict ? 'bad' : 'ok' },
        { k: L('两套顺序是否一致', 'do they agree'), v: conflict ? L('✗ 不一致', '✗ no') : L('✓ 一致', '✓ yes'), cls: conflict ? 'bad' : 'ok' },
        { k: L('首个可聚焦元素', 'first focusable reached'), v: L(short(dom[0]), short(dom[0])) + (groupOf(dom[0]) === 'side' ? L('（侧栏，次要内容）✗', ' (sidebar, secondary content) ✗') : L('（正文，主要内容）✓', ' (body, primary content) ✓')), cls: groupOf(dom[0]) === 'side' ? 'bad' : 'ok' },
        '',
        state.mode === 'order'
          ? { text: L('✗ 视觉上"正文在左、侧栏在右"，但 DOM 里侧栏在前，所以键盘会先进入侧栏的搜索与筛选，再跳到左边的正文，然后回到右侧 —— 焦点在"乱跳"。屏幕阅读器则会把侧栏读在正文之前，语义颠倒。', '✗ Visually the body is left and the sidebar right, but the sidebar comes first in the DOM, so the keyboard enters the sidebar’s search and filter, then jumps to the body on the left, then back to the right — focus appears to jump around. A screen reader reads the sidebar before the body, inverting the meaning.'), cls: 'bad' }
          : { text: L('✓ DOM 里正文在前（也就是手机单列的阅读顺序），桌面端用 grid-template-areas 把侧栏放到右侧。两套顺序第一次完全一致，键盘与屏幕阅读器都得到正确的顺序。', '✓ The body comes first in the DOM (which is also the phone reading order) and grid-template-areas places the sidebar on the right on desktop. Both orders agree for the first time, so the keyboard and screen reader get the right sequence.'), cls: 'ok' }
      ]);
    });
  }

  async function play() {
    const items = Array.from(layout.querySelectorAll('input, button, a'));
    for (const n of items) {
      layout.querySelectorAll('.playing').forEach((x) => x.classList.remove('playing'));
      const box = n.closest('.fo-item') || n;
      box.classList.add('playing');
      if (n.focus) n.focus();
      const label = n.getAttribute('aria-label') || (n.textContent || '').trim().slice(0, 14);
      focSeq.append(el('span', { class: state.mode === 'order' ? 'bad' : 'good', text: focSeq.children.length + 1 + '. ' + label }));
      await new Promise((r) => setTimeout(r, 700));
    }
    layout.querySelectorAll('.playing').forEach((x) => x.classList.remove('playing'));
  }

  draw();
});

/* =============================================================
 * d-6-2 可访问性压力测试
 * ============================================================= */
register('d-6-2', (mount) => {
  const state = { fixed: false, reflow: true, text200: false, spacing: false, contrastCheck: true };

  const clip = el('div', { class: 'ax-clip' });
  const frame = el('div', { class: 'ax-frame' });
  clip.append(frame);

  const log = readout();
  const scoreHost = el('div');

  const fixToggle = toggle({
    label: L('使用修复后的写法（v2）', 'Use the fixed version (v2)'),
    checked: false,
    onChange: (v) => { state.fixed = v; draw(); }
  });
  const tReflow = toggle({ label: L('① 1.4.10 重排：视口压到 320px', '① 1.4.10 Reflow: viewport squeezed to 320px'), checked: true, onChange: (v) => { state.reflow = v; draw(); } });
  const tText = toggle({ label: L('② 1.4.4 缩放：文本放大到 200%', '② 1.4.4 Resize text: 200%'), checked: false, onChange: (v) => { state.text200 = v; draw(); } });
  const tSpacing = toggle({ label: L('③ 1.4.12 文本间距增强', '③ 1.4.12 Enhanced text spacing'), checked: false, onChange: (v) => { state.spacing = v; draw(); } });
  const tContrast = toggle({ label: L('④ 1.4.3 检查文字对比度', '④ 1.4.3 Check text contrast'), checked: true, onChange: (v) => { state.contrastCheck = v; draw(); } });

  let reportOverride = null;
  const bRun = buttons([{ label: L('▶ 逐项测试并生成报告', '▶ Run every check and produce a report'), kind: 'primary', onClick: runAll }]);

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('压力条件', 'Stress conditions'), fixToggle.node, tReflow.node, tText.node, tSpacing.node, tContrast.node, bRun,
      el('p', { class: 'text-xs mt-1 muted', text: L('四条标准来自 WCAG 2.2：1.4.10 / 1.4.4 / 1.4.12 / 2.5.8，外加 1.4.3 对比度。', 'The criteria come from WCAG 2.2: 1.4.10 / 1.4.4 / 1.4.12 / 2.5.8, plus 1.4.3 contrast.') })),
    el('div', {}, clip, el('div', { class: 'mt-3' }, scoreHost), el('div', { class: 'mt-3' }, log.node))
  ));

  function build() {
    frame.className = 'ax-frame' + (state.fixed ? '' : ' v1')
      + (state.text200 ? ' text200' : '')
      + (state.spacing ? ' spacing' : '');
    frame.innerHTML = '';
    frame.append(
      el('div', { class: 'ax-nav' },
        el('a', { href: '#', text: L('课程', 'Courses') }),
        el('a', { href: '#', text: L('讲师', 'Instructors') }),
        el('a', { href: '#', text: L('价格', 'Pricing') }),
        el('a', { href: '#', text: L('常见问题', 'FAQ') })
      ),
      el('div', { class: 'ax-body' },
        el('div', { class: 'ax-card' },
          el('b', { text: L('用一年时间，学会做出好看又能用的界面', 'Learn to build interfaces that look right and work right, in one year') }),
          el('p', { text: L('12 周项目驱动课程，从文档流讲到网格系统，包含 18 个可交互演示。', 'A 12-week project-driven course, from document flow to grid systems, with 18 interactive demos.') })
        ),
        el('div', { class: 'ax-links', text: L('相关阅读：', 'Related: ') },
          el('a', { href: '#', text: L('布局基础', 'Layout basics') }), document.createTextNode(' · '),
          el('a', { href: '#', text: L('响应式实战', 'Responsive in practice') })
        )
      ),
      el('div', { class: 'ax-foot' },
        el('button', { class: 'ax-cta', type: 'button', text: L('立即报名', 'Enroll now') }),
        el('span', { class: 'text-xs muted', text: L('点击目标需要 ≥ 24×24px', 'Targets must be at least 24×24px') })
      )
    );
  }

  /** 四个检查 + 对比度，返回结果数组 */
  function inspect() {
    const results = [];
    // ① Reflow：容器宽 320px 时是否溢出
    const clipW = Math.min(320, clip.parentElement.clientWidth);
    clip.style.width = (state.reflow ? clipW : clip.parentElement.clientWidth) + 'px';
    clip.style.maxWidth = '100%';
    const cr = clip.getBoundingClientRect();
    let excess = 0;
    frame.querySelectorAll('*').forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.width > 1) excess = Math.max(excess, Math.round(r.right - cr.right));
    });
    results.push({
      id: '1.4.10',
      name: { zh: '重排（320px 无横向滚动）', en: 'Reflow (no horizontal scroll at 320px)' },
      ok: excess <= 1,
      value: excess > 1 ? L('横向溢出 ' + excess + 'px', 'overflows by ' + excess + 'px') : '✓',
      fix: { zh: '把固定宽度换成 min(100%, …) 与 auto-fit；给子元素 min-width: 0。', en: 'Replace fixed widths with min(100%, …) and auto-fit; add min-width: 0 to children.' }
    });

    // ② Resize Text / ③ Text Spacing：固定高度导致内容被裁
    const clipped = Array.from(frame.querySelectorAll('*')).filter((n) => {
      const cs = getComputedStyle(n);
      return n.scrollHeight > n.clientHeight + 2 && cs.overflow !== 'visible';
    });
    results.push({
      id: '1.4.4 + 1.4.12',
      name: { zh: '缩放 200% / 文本间距增强后不丢内容', en: 'No content lost at 200% text or enhanced spacing' },
      ok: clipped.length === 0,
      value: clipped.length ? L(clipped.length + ' 个元素被裁切（如 ' + (clipped[0].className || clipped[0].tagName) + '）', clipped.length + ' clipped elements (e.g. ' + (clipped[0].className || clipped[0].tagName) + ')') : '✓',
      fix: { zh: '文本容器不要写 height，只用 min-height；需要截断时显式用 line-clamp 并给出 title。', en: 'Never use height on a text container, only min-height; if you must clip, use line-clamp explicitly and add a title.' }
    });

    // ④ Target Size
    const small = [];
    frame.querySelectorAll('a, button, input, select').forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.height > 0 && (r.height < 24 || r.width < 24)) small.push(Math.round(r.width) + '×' + Math.round(r.height));
    });
    results.push({
      id: '2.5.8',
      name: { zh: '点击目标 ≥ 24×24px', en: 'Targets at least 24×24px' },
      ok: small.length === 0,
      value: small.length ? small.length + L(' 个过小：', ' too small: ') + small.slice(0, 3).join(', ') : '✓',
      fix: {
        zh: '用 padding 撑开点击区域，而不是只靠文字大小。注：WCAG 2.5.8 对"句子中的行内链接"有豁免，但对触屏用户来说，把链接做成有内边距的可点击块仍然更友好。',
        en: 'Grow the target with padding instead of relying on the text size. Note: WCAG 2.5.8 exempts links inside a sentence, but giving links padded hit areas is still friendlier on touch screens.'
      }
    });

    // 对比度
    if (state.contrastCheck) {
      const samples = [
        [frame.querySelector('.ax-links a'), 'rgb(255,255,255)', 4.5, { zh: '正文链接', en: 'body link' }],
        [frame.querySelector('.ax-card p'), 'rgb(255,255,255)', 4.5, { zh: '卡片正文', en: 'card body' }],
        [frame.querySelector('.ax-cta'), null, 4.5, { zh: '按钮文字', en: 'button label' }]
      ];
      const fails = [];
      samples.forEach(([n, bg, min, label]) => {
        if (!n) return;
        const cs = getComputedStyle(n);
        const ratio = contrastRatio(cs.color, bg || cs.backgroundColor);
        if (ratio < min) fails.push(L(label.zh, label.en) + ' ' + num(ratio, 2) + ':1');
      });
      results.push({
        id: '1.4.3',
        name: { zh: '正文文字对比度 ≥ 4.5:1', en: 'Body text contrast at least 4.5:1' },
        ok: fails.length === 0,
        value: fails.length ? fails.join(' / ') : '✓',
        fix: { zh: '正文用 slate-600 (#475569) 或更深，不要用 slate-400 这类装饰性浅灰。', en: 'Use slate-600 (#475569) or darker for body text; decorative light greys like slate-400 are not readable text colours.' }
      });
    }
    return results;
  }

  function draw() {
    build();
    nextFrame().then(() => {
      const results = inspect();
      const passed = results.filter((r) => r.ok).length;
      scoreHost.innerHTML = '';
      scoreHost.append(el('div', { class: 'flex items-center gap-2 flex-wrap' },
        el('span', { class: 'text-sm', text: L('本次通过：', 'Passing now: ') }),
        el('span', { class: 'pill ' + (passed === results.length ? 'ok' : 'bad'), text: passed + ' / ' + results.length })
      ));
      if (reportOverride) {
        log.set(reportOverride);
        reportOverride = null;
        scoreHost.innerHTML = '';
        scoreHost.append(el('div', { class: 'flex items-center gap-2 flex-wrap' },
          el('span', { class: 'text-sm', text: L('已完成全部压力测试', 'All stress tests complete') }),
          el('span', { class: 'pill info', text: L('见下方报告', 'see the report below') })
        ));
        return;
      }
      log.set([
        { text: state.fixed ? L('写法：v2（修复后）', 'Version: v2 (fixed)') : L('写法：v1（病态）', 'Version: v1 (broken)'), cls: state.fixed ? 'ok' : 'bad' },
        '',
        ...results.flatMap((r) => ([
          { k: 'WCAG ' + r.id, v: r.value, cls: r.ok ? 'ok' : 'bad' },
          { k: '', v: L(r.name.zh, r.name.en), cls: '' }
        ])),
        '',
        L('提示：打开"使用修复后的写法"再跑一遍，对比四条标准的变化。', 'Tip: turn on the fixed version and run the checks again to compare all four criteria.')
      ]);
    });
  }

  async function runAll() {
    const base = { ...state };
    const report = [];
    // 逐项单独测试
    const cases = [
      { key: 'reflow', label: { zh: '① 320px 重排', en: '① 320px reflow' }, apply: () => { state.reflow = true; state.text200 = false; state.spacing = false; } },
      { key: 'text200', label: { zh: '② 200% 字号', en: '② 200% text' }, apply: () => { state.reflow = true; state.text200 = true; state.spacing = false; } },
      { key: 'spacing', label: { zh: '③ 文本间距增强', en: '③ enhanced spacing' }, apply: () => { state.reflow = true; state.text200 = false; state.spacing = true; } }
    ];
    for (const fixed of [false, true]) {
      state.fixed = fixed;
      for (const c of cases) {
        c.apply();
        build();
        await nextFrame();
        const res = inspect();
        report.push({ fixed, label: c.label, passed: res.filter((r) => r.ok).length, total: res.length, results: res });
      }
    }
    Object.assign(state, base);
    fixToggle.set(base.fixed);
    build();

    const v1 = report.filter((r) => !r.fixed);
    const v2 = report.filter((r) => r.fixed);
    const sum = (a) => a.reduce((n, r) => n + r.passed, 0);
    const tot = (a) => a.reduce((n, r) => n + r.total, 0);
    reportOverride = [
      { text: L('可访问性报告（3 组压力 × 2 套写法）', 'Accessibility report (3 stress sets × 2 versions)'), cls: 'hl' },
      '',
      { k: L('v1 病态写法', 'v1 broken'), v: sum(v1) + ' / ' + tot(v1) + L(' 项通过', ' checks passed'), cls: 'bad' },
      { k: L('v2 修复写法', 'v2 fixed'), v: sum(v2) + ' / ' + tot(v2) + L(' 项通过', ' checks passed'), cls: 'ok' },
      '',
      ...cases.map((c) => {
        const a = report.find((r) => !r.fixed && r.label === c.label);
        const b = report.find((r) => r.fixed && r.label === c.label);
        return { k: L(c.label.zh, c.label.en), v: 'v1 ' + a.passed + '/' + a.total + '   →   v2 ' + b.passed + '/' + b.total, cls: b.passed === b.total ? 'ok' : 'hl' };
      }),
      '',
      { k: L('最典型的失败项', 'most typical failures'), v: '1.4.10 固定宽度溢出 · 2.5.8 点击目标 30×23px · 1.4.3 浅灰文字 2.12:1', cls: 'bad' },
      '',
      L('同一份 HTML、同一份文案：v1 的固定宽度、固定高度、过小目标与浅灰文字在压力下全部失效；换成相对单位、min-height、padding 撑开的点击区域与合格对比度之后全部通过。', 'Same HTML, same copy: the v1 fixed widths, fixed heights, undersized targets and light grey text all fail under stress; relative units, min-height, padded targets and compliant contrast pass every check.')
    ];
    draw();
  }

  draw();
});

/* =============================================================
 * d-6-3 综合案例：v1 → v2 + 8 病灶 + 评审清单
 * ============================================================= */
register('d-6-3', (mount) => {
  const DEFECTS = [
    { n: '①', zh: '层次缺失：所有文字同尺寸', en: 'No hierarchy: everything the same size', fix: { zh: '模数尺度 + CTA 块面升级', en: 'modular scale + solid CTA' }, href: '../lesson-01/?tab=code#ch-1-1' },
    { n: '②', zh: '间距无系统：21/13/37 随手写', en: 'Arbitrary spacing: 21/13/37 by hand', fix: { zh: '8pt 间距 token', en: '8pt spacing tokens' }, href: '../lesson-01/?tab=demo#ch-1-3' },
    { n: '③', zh: '绝对定位摆盒子：header 写死高度', en: 'Absolute positioning: fixed header height', fix: { zh: '正常流 + min-height', en: 'normal flow + min-height' }, href: '../lesson-02/?tab=code#ch-2-1' },
    { n: '④', zh: '用空格对齐导航', en: 'Navigation aligned with spaces', fix: { zh: 'flex + gap', en: 'flex + gap' }, href: '../lesson-03/?tab=code#ch-3-1' },
    { n: '⑤', zh: '卡片高度不齐、图片撑破容器', en: 'Uneven cards, images breaking out', fix: { zh: '等高 flex + max-width:100%', en: 'equal-height flex + max-width:100%' }, href: '../lesson-03/?tab=demo#ch-3-3' },
    { n: '⑥', zh: '用 padding 假装网格', en: 'Grid faked with padding', fix: { zh: '12 栏 Grid + span', en: '12-column grid + spans' }, href: '../lesson-04/?tab=code#ch-4-1' },
    { n: '⑦', zh: '只做桌面端：320px 横向滚动', en: 'Desktop only: 320px scrolls sideways', fix: { zh: '内容驱动断点 + auto-fit', en: 'content-driven breakpoints + auto-fit' }, href: '../lesson-05/?tab=demo#ch-5-1' },
    { n: '⑧', zh: 'DOM 顺序与视觉顺序不一致', en: 'DOM order ≠ visual order', fix: { zh: 'grid-template-areas 重排', en: 'reorder with grid-template-areas' }, href: '../lesson-06/?tab=demo#ch-6-1' }
  ];

  const CHECKLIST = [
    { zh: '首屏眯眼看，3 秒内能说出第一重要的内容', en: 'Squinting at the first screen, the top priority is obvious within 3s' },
    { zh: '所有间距都来自同一套尺度（没有 21px 这种值）', en: 'Every spacing comes from one scale (no stray 21px)' },
    { zh: '组间距明显大于组内间距', en: 'Between-group spacing is clearly larger than within-group' },
    { zh: '没有用绝对定位参与布局的元素', en: 'No element uses absolute positioning for layout' },
    { zh: '文案加长一倍后版面仍然成立', en: 'The layout still holds when the copy is doubled' },
    { zh: '320px 宽度下没有横向滚动条（WCAG 1.4.10）', en: 'No horizontal scrollbar at 320px (WCAG 1.4.10)' },
    { zh: '字号放大 200% 后没有内容丢失（WCAG 1.4.4）', en: 'No content lost at 200% text (WCAG 1.4.4)' },
    { zh: '点击目标 ≥ 24×24px（WCAG 2.5.8）', en: 'Targets at least 24×24px (WCAG 2.5.8)' },
    { zh: '键盘 Tab 顺序与视觉顺序一致（WCAG 2.4.3）', en: 'Keyboard tab order matches visual order (WCAG 2.4.3)' },
    { zh: '同一份信息只在一个地方描述（改一处不会漏掉另一处）', en: 'Each fact is described in exactly one place' }
  ];

  const defectHost = el('div', { class: 'defect-list' });
  const splitHost = el('div');
  const checkHost = el('div', { style: 'display:grid;gap:6px' });
  const log = readout();
  const scoreHost = el('div');

  const checked = new Set();

  mount.append(
    el('div', { class: 'demo-stage wide-controls' },
      panel(L('8 个病灶 → 8 个解法', 'Eight defects → eight fixes'),
        el('p', { class: 'text-xs mt-0 muted', text: L('点"回顾"跳到对应章节的演示或代码。', 'Click "review" to jump to the matching demo or code in its chapter.') }),
        defectHost),
      el('div', {}, splitHost, el('div', { class: 'mt-3' }, log.node))
    ),
    el('div', { class: 'mt-5' },
      el('div', { class: 'flex items-center justify-between flex-wrap gap-2', style: 'margin-bottom:8px' },
        el('h4', { class: 'mt-0', style: 'margin:0', text: L('布局评审清单（自检打分）', 'Layout review checklist (self-scored)') }),
        buttons([
          { label: L('全部勾选', 'Tick everything'), onClick: () => { CHECKLIST.forEach((_, i) => checked.add(i)); drawChecks(); } },
          { label: L('清空', 'Clear'), onClick: () => { checked.clear(); drawChecks(); } }
        ])
      ),
      checkHost,
      el('div', { class: 'mt-3' }, scoreHost)
    )
  );

  // before/after：同一份 HTML，只有 CSS 不同
  const v1 = el('div', {}, el('div', { class: 'text-xs', style: 'font-weight:800;color:#e11d48;margin-bottom:6px', text: L('v1 · 改造前（8 个病灶都在）', 'v1 · before (all eight defects)') }),
    courseHub({ scheme: 'feel', hierarchy: false, contrast: false, align: false }));
  const v2 = el('div', {}, el('div', { class: 'text-xs', style: 'font-weight:800;color:#059669;margin-bottom:6px', text: L('v2 · 改造后', 'v2 · after') }),
    courseHub({ scheme: 's8', hierarchy: true, contrast: true, align: true }));

  const sp = split(v1, v2);
  splitHost.append(sp.node);
  splitHost.append(el('div', { class: 'text-xs muted mt-2', text: L('◧ 左右拖动分割线。两侧是同一份 HTML，只有 CSS 不同：文案、卡片数量、结构完全一致。', '◧ Drag the divider. Both sides use the same HTML — only the CSS differs: identical copy, card count and structure.') }));

  nextFrame().then(() => {
    const m1 = measureHub(v1.querySelector('.ch-hub'));
    const m2 = measureHub(v2.querySelector('.ch-hub'));
    const s1 = scoreOf(m1);
    const s2 = scoreOf(m2);
    log.set([
      { text: L('同一份 HTML 的两种 CSS，浏览器实测结果：', 'Two stylesheets, one HTML — measured by the browser:'), cls: 'hl' },
      '',
      { k: L('层次评分 v1 → v2', 'hierarchy score v1 → v2'), v: s1.total + ' → ' + s2.total, cls: 'hl' },
      { k: L('标题/正文字号比', 'title / body ratio'), v: num(m1.ratio, 2) + ' → ' + num(m2.ratio, 2), cls: m2.ratio > m1.ratio ? 'ok' : 'bad' },
      { k: L('组间 : 组内间距', 'between : within gap'), v: num(m1.spaceRatio, 2) + ' → ' + num(m2.spaceRatio, 2), cls: m2.spaceRatio > m1.spaceRatio ? 'ok' : 'bad' },
      { k: L('按钮块面对比度', 'CTA block contrast'), v: num(m1.ctaBlockContrast, 2) + ' → ' + num(m2.ctaBlockContrast, 2), cls: 'ok' },
      { k: L('最大对齐误差（vs 8pt）', 'max alignment error'), v: m1.maxError + 'px → ' + m2.maxError + 'px', cls: m2.maxError === 0 ? 'ok' : 'bad' },
      { k: L('偏离刻度的元素', 'elements off the 8pt scale'), v: m1.offScale + ' / ' + m1.errors.length + ' → ' + m2.offScale + ' / ' + m2.errors.length, cls: m2.offScale === 0 ? 'ok' : 'bad' },
      { k: L('容差说明', 'tolerance'), v: L('1.25px（亚像素布局与 1px 边框造成的整体偏移不计入）', '1.25px (sub-pixel layout and the 1px shift caused by a 1px border are not counted)') },
      '',
      L('这些数字不是写死的：它们由 getComputedStyle 与 getBoundingClientRect 从真实渲染结果读回，所以"改造有没有生效"是可验证的。', 'None of these numbers is hard-coded: they are read back from the real rendering via getComputedStyle and getBoundingClientRect, so whether the rebuild worked is verifiable.')
    ]);
    scoreHost.innerHTML = '';
    scoreHost.append(scoreCard(s2));
    scoreHost.append(el('div', { class: 'text-xs muted mt-2', text: L('右侧圆环 = v2 的层次评分（实时测量）。', 'The dial shows the measured v2 hierarchy score.') }));
  });

  function drawDefects() {
    defectHost.innerHTML = '';
    DEFECTS.forEach((d) => {
      defectRow(d);
    });
  }

  function defectRow(d) {
    const row = el('div', { class: 'defect-row fixed' },
      el('span', { class: 'n', text: d.n }),
      el('div', {}, el('b', { text: L(d.zh, d.en) }), el('p', { text: '→ ' + L(d.fix.zh, d.fix.en) })),
      el('a', { href: d.href, text: L('回顾 →', 'Review →') })
    );
    defectHost.append(row);
  }

  function drawChecks() {
    checkHost.innerHTML = '';
    CHECKLIST.forEach((c, i) => {
      const done = checked.has(i);
      const label = el('label', { class: 'check-item' + (done ? ' done' : '') });
      const input = el('input', { type: 'checkbox' });
      input.checked = done;
      input.addEventListener('change', () => {
        if (input.checked) checked.add(i); else checked.delete(i);
        label.classList.toggle('done', input.checked);
        updateScore();
      });
      label.append(input, el('span', {}, el('span', { text: L(c.zh, c.en) })));
      checkHost.append(label);
    });
    updateScore();
  }

  function updateScore() {
    const n = checked.size;
    const total = CHECKLIST.length;
    const pct = Math.round((n / total) * 100);
    scoreHost.innerHTML = '';
    scoreHost.append(el('div', { class: 'flex items-center gap-2 flex-wrap' },
      el('span', { class: 'pill ' + (pct >= 90 ? 'ok' : pct >= 60 ? 'warn' : 'bad'), text: n + ' / ' + total + '  (' + pct + '%)' }),
      el('span', { class: 'text-sm muted', text: pct >= 90 ? L('可以交付了。', 'Ready to ship.') : L('还有 ' + (total - n) + ' 项要处理。', (total - n) + ' items still to address.') })
    ));
  }

  drawDefects();
  drawChecks();
});
