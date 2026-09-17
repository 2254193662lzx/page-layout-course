/* =============================================================
 * demos/ch5.js — 第 5 章的三个交互演示
 *   d-5-1 断点探测器（扫描宽度 → 内容失败清单 → 断点建议）
 *   d-5-2 媒体查询 vs 容器查询
 *   d-5-3 clamp() 生成器 + Switcher 原语
 * ============================================================= */

import {
  el, L, register, slider, seg, toggle, buttons, readout, tableMini, panel, preview,
  nextFrame, num, clamp
} from '../lab.js';

/* =============================================================
 * d-5-1 断点探测器
 * ============================================================= */
register('d-5-1', (mount) => {
  const state = { width: 1024, breakable: false };
  const PROSE = {
    zh: '响应式布局的断点应该由内容决定。把浏览器窗口慢慢拖窄，注意内容在哪一个宽度第一次看起来不对：可能是行长变得太长、卡片被压成一条、或者两个按钮挤在一起。那个宽度就是你的断点。',
    en: 'Responsive breakpoints should be decided by the content. Drag the browser window narrower and watch for the width at which the content first looks wrong: the measure becomes too long, a card is squeezed into a strip, or two buttons collide. That width is your breakpoint.'
  };

  const clip = el('div', { class: 'bp-clip' });
  const frame = el('div', { class: 'bp-frame' });
  const flagHost = el('div', { style: 'position:absolute;inset:0;pointer-events:none' });
  clip.style.position = 'relative';
  clip.append(frame, flagHost);

  function buildFrame() {
    frame.innerHTML = '';
    const cards = [1, 2, 3].map((i) => el('div', { class: 'bp-card' },
      el('b', { text: i === 1 && state.breakable ? 'LayoutConsistencyChecklist' : L('课程模块 ', 'Module ') + i }),
      el('span', { text: L('12 课时 · 项目驱动', '12 lessons · project-driven') })
    ));
    frame.append(
      el('div', { class: 'bp-nav' },
        el('b', { text: 'CourseHub' }),
        el('a', { href: '#', text: L('课程', 'Courses') }),
        el('a', { href: '#', text: L('讲师', 'Instructors') }),
        el('a', { href: '#', text: L('价格', 'Pricing') }),
        el('a', { href: '#', text: L('常见问题', 'FAQ') }),
        el('a', { href: '#', text: L('登录', 'Sign in') })
      ),
      el('div', { class: 'bp-cards' }, cards),
      el('div', { class: 'bp-prose' }, el('p', { text: L(PROSE.zh, PROSE.en) })),
      el('div', { class: 'bp-foot' },
        el('button', { class: 'bp-cta' + (state.breakable ? ' small' : ''), type: 'button', text: L('立即报名', 'Enroll now') }),
        el('button', { class: 'bp-cta small', type: 'button', text: L('了解更多', 'Learn more') })
      )
    );
  }

  const log = readout();
  const stripHost = el('div');

  const wSlider = slider({
    label: L('容器宽度（模拟视口）', 'container width (simulated viewport)'),
    min: 320, max: 1440, step: 20, value: state.width, unit: 'px',
    onChange: (v) => { state.width = v; draw(); }
  });
  const tBreak = toggle({
    label: L('注入破坏因素（长单词 + 固定宽导航 + 过小点击目标）', 'Inject the problems (long word, fixed-width nav, tiny targets)'),
    checked: false,
    onChange: (v) => { state.breakable = v; draw(); }
  });
  const bScan = buttons([{ label: L('▶ 扫描全部宽度并给出断点建议', '▶ Scan all widths and suggest breakpoints'), kind: 'primary', onClick: scan }]);

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('探测', 'Probe'), wSlider.node, tBreak.node, bScan,
      el('p', { class: 'text-xs mt-0 muted', text: L('四类"内容失败"：横向溢出 / 行长过长 / 元素被压到不可读 / 点击目标 < 24px。', 'Four kinds of content failure: horizontal overflow / over-long measure / squeezed past legibility / tap target under 24px.') })),
    el('div', {}, clip, el('div', { class: 'mt-3' }, log.node), el('div', { class: 'mt-3' }, stripHost))
  ));

  /** 在给定宽度下测量四类失败 */
  function probe(frameEl, width) {
    const fr = frameEl.getBoundingClientRect();
    const issues = [];

    // ① 横向溢出：任何子元素右边缘超出框架
    let excess = 0;
    frameEl.querySelectorAll('*').forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.width > 1) excess = Math.max(excess, Math.round(r.right - fr.right));
    });
    if (excess > 1) issues.push({ key: 'overflow', detail: '+' + excess + 'px', zh: '横向溢出 ' + excess + 'px', en: 'horizontal overflow ' + excess + 'px', node: null });

    // ② 行长过长：以 em 为单位衡量（1em = 当前字号）
    const p = frameEl.querySelector('.bp-prose p');
    if (p) {
      const fs = parseFloat(getComputedStyle(p).fontSize);
      const measure = p.clientWidth / fs;
      // 舒适行长约 20–36em；超过 36em 视为偏长（中文排版同样适用）
      if (measure > 36) issues.push({ key: 'measure', detail: num(measure, 1) + 'em', zh: '行长 ' + num(measure, 1) + 'em（偏长）', en: 'measure ' + num(measure, 1) + 'em (long)', node: p });
    }

    // ③ 元素被压到不可读：卡片宽 < 120px
    frameEl.querySelectorAll('.bp-card').forEach((c) => {
      const w = c.getBoundingClientRect().width;
      if (w < 120) issues.push({ key: 'squeeze', detail: Math.round(w) + 'px', zh: '卡片被压到 ' + Math.round(w) + 'px', en: 'card squeezed to ' + Math.round(w) + 'px', node: c });
    });

    // ④ 点击目标 < 24px（WCAG 2.5.8）
    frameEl.querySelectorAll('button, a').forEach((b) => {
      const r = b.getBoundingClientRect();
      if (r.height > 0 && (r.height < 24 || r.width < 24)) {
        issues.push({ key: 'target', detail: Math.round(r.width) + '×' + Math.round(r.height), zh: '点击目标 ' + Math.round(r.width) + '×' + Math.round(r.height) + 'px（< 24px）', en: 'tap target ' + Math.round(r.width) + '×' + Math.round(r.height) + 'px (< 24px)', node: b });
      }
    });

    return { width, issues };
  }

  const FAIL_LABEL = {
    overflow: { zh: '横向溢出', en: 'Horizontal overflow' },
    measure: { zh: '行长过长', en: 'Over-long measure' },
    squeeze: { zh: '元素被压扁', en: 'Element squeezed' },
    target: { zh: '点击目标过小', en: 'Tap target too small' }
  };

  function render(width) {
    clip.style.width = width + 'px';
    clip.style.maxWidth = '100%';
    frame.style.width = '100%';
    frame.style.fontSize = state.breakable ? '13px' : '13px';
  }

  function draw() {
    buildFrame();
    frame.classList.toggle('breakable', state.breakable);
    render(state.width);
    nextFrame().then(() => {
      const res = probe(frame, state.width);
      flagHost.innerHTML = '';
      // 在预览里标出问题位置
      const cr = clip.getBoundingClientRect();
      const seen = new Set();
      res.issues.slice(0, 6).forEach((it) => {
        if (!it.node || seen.has(it.key)) return;
        seen.add(it.key);
        const r = it.node.getBoundingClientRect();
        const flag = el('div', { class: 'bp-flag', text: L(FAIL_LABEL[it.key].zh, FAIL_LABEL[it.key].en) });
        flag.style.left = Math.min(Math.max(r.left - cr.left + r.width / 2, 60), clip.clientWidth - 60) + 'px';
        flag.style.top = (r.top - cr.top + 8) + 'px';
        flagHost.append(flag);
      });

      const byKey = {};
      res.issues.forEach((i) => { byKey[i.key] = (byKey[i.key] || 0) + 1; });

      log.set([
        { k: L('当前宽度', 'current width'), v: state.width + 'px' + (state.width < 640 ? L('（窄屏区）', ' (narrow range)') : ''), cls: 'hl' },
        '',
        ...Object.keys(FAIL_LABEL).map((k) => ({
          k: L(FAIL_LABEL[k].zh, FAIL_LABEL[k].en),
          v: byKey[k] ? '✗ ' + byKey[k] + L(' 处', ' occurrences') : '✓',
          cls: byKey[k] ? 'bad' : 'ok'
        })),
        '',
        state.breakable
          ? L('⚠ 当前注入了破坏因素。真实项目里这三类问题来自：固定像素宽度、没有 max-width 的图片、以及只考虑鼠标的尺寸设定。', '⚠ Problems are currently injected. In real projects these come from fixed pixel widths, images without max-width, and sizes chosen for a mouse only.')
          : L('✓ 当前版本用了内在布局：auto-fit 卡片、min(100%, …) 宽度、相对单位尺寸。把宽度拖到 320px 也不会出问题。', '✓ This version uses intrinsic layout: auto-fit cards, min(100%, …) widths, relative sizes. Drag the width down to 320px and nothing breaks.')
      ]);
    });
  }

  async function scan() {
    const samples = [];
    const widths = [];
    for (let w = 320; w <= 1440; w += 40) widths.push(w);
    const prev = state.width;
    for (const w of widths) {
      buildFrame();
      frame.classList.toggle('breakable', state.breakable);
      render(w);
      await nextFrame();
      samples.push(probe(frame, w));
    }
    state.width = prev;
    buildFrame();
    frame.classList.toggle('breakable', state.breakable);
    render(prev);

    // 找出"第一次出现某类失败"的宽度 = 内容驱动断点
    const firstFailure = {};
    samples.forEach((s) => {
      s.issues.forEach((i) => {
        if (firstFailure[i.key] === undefined) firstFailure[i.key] = s.width;
      });
    });
    const suggestions = Array.from(new Set(Object.values(firstFailure))).sort((a, b) => a - b);

    stripHost.innerHTML = '';
    stripHost.append(el('div', { class: 'text-xs muted', style: 'margin-bottom:4px', text: L('每格 = 一个采样宽度（320 → 1440，步长 40）：绿 = 无问题，红 = 有内容失败', 'Each cell is a sampled width (320 → 1440, step 40): green = no problems, red = a content failure') }));
    stripHost.append(el('div', { class: 'bp-strip' }, samples.map((s) => el('i', { class: s.issues.length ? 'bad' : 'ok', title: s.width + 'px' }))));
    stripHost.append(el('div', { class: 'bp-axis' }, el('span', { text: '320px' }), el('span', { text: '880px' }), el('span', { text: '1440px' })));

    const lines = [
      { text: L('扫描结果：' + samples.filter((s) => s.issues.length).length + ' / ' + samples.length + ' 个宽度存在内容失败', 'Scan result: content fails at ' + samples.filter((s) => s.issues.length).length + ' / ' + samples.length + ' sampled widths'), cls: 'hl' },
      ''
    ];
    Object.entries(firstFailure).forEach(([k, w]) => {
      lines.push({ k: L(FAIL_LABEL[k].zh, FAIL_LABEL[k].en), v: L('最早出现在 ', 'first appears at ') + w + 'px', cls: 'bad' });
    });
    if (!Object.keys(firstFailure).length) {
      lines.push({ text: L('✓ 所有采样宽度都没有出现内容失败 —— 这就是"内在布局"要达成的效果：不需要断点。', '✓ No content failure at any sampled width — exactly what intrinsic layout achieves: no breakpoints needed.'), cls: 'ok' });
    } else {
      lines.push('');
      lines.push({ text: L('内容驱动的断点建议（取每一类"首次失败宽度"上取整到 100px）：', 'Content-driven breakpoint suggestions (each first-failure width rounded up to 100px):'), cls: 'hl' });
      suggestions.forEach((w) => {
        const rounded = Math.ceil(w / 100) * 100;
        lines.push({ text: L('  @media (min-width: ', '  @media (min-width: ') + rounded + 'px) { /* 在此以上，这一项才成立 */ }' });
      });
      lines.push('');
      lines.push({ text: L('注意：这些断点来自"内容先崩"的位置，而不是来自设备型号 —— 这就是内容驱动断点与设备断点的区别。', 'Note: these come from where the content fails, not from device models — that is the difference between content-driven and device-driven breakpoints.') });
    }
    log.set(lines);
  }

  draw();
  // 初始做一次扫描，让读者一进来就看到结论
  setTimeout(() => { if (!mount.dataset.scanned) { mount.dataset.scanned = '1'; scan(); } }, 400);
});

/* =============================================================
 * d-5-2 媒体查询 vs 容器查询
 * ============================================================= */
register('d-5-2', (mount) => {
  const state = { mode: 'container', widths: [340, 250, 170] };

  const host = el('div', { class: 'cq-row' });
  const log = readout();

  const modeSeg = seg({
    label: L('响应方式', 'Response mechanism'),
    options: [
      { value: 'container', label: L('容器查询 @container', 'Container query') },
      { value: 'media', label: L('媒体查询 @media', 'Media query') }
    ],
    value: 'container',
    onChange: (v) => { state.mode = v; draw(); }
  });

  const widthSliders = [0, 1, 2].map((i) => slider({
    label: L('容器 ', 'Container ') + (i + 1) + L(' 宽度', ' width'),
    min: 130, max: 420, step: 10, value: state.widths[i], unit: 'px',
    onChange: (v) => { state.widths[i] = v; draw(); }
  }));

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('对比', 'Comparison'), modeSeg.node, ...widthSliders.map((s) => s.node),
      el('p', { class: 'text-xs mt-0 muted', text: L('提示：媒体查询版只随浏览器窗口变化 —— 请拖动浏览器窗口宽度再看一次。', 'Tip: the media-query version only reacts to the browser window — resize the window and look again.') })),
    el('div', {}, host, el('div', { class: 'mt-3' }, log.node))
  ));

  const NAMES = [
    { zh: '主区卡片墙', en: 'Main wall' },
    { zh: '详情页侧栏', en: 'Detail sidebar' },
    { zh: '页脚推荐位', en: 'Footer slot' }
  ];

  function draw() {
    host.className = 'cq-row' + (state.mode === 'media' ? ' cq-media' : '');
    host.innerHTML = '';
    state.widths.forEach((w, i) => {
      const slot = el('div', { class: 'cq-slot', style: 'width:' + w + 'px;max-width:100%' },
        el('div', { class: 'cq-card' },
          el('div', { class: 'cq-cover', text: '🎓' }),
          el('div', { style: 'min-width:0' },
            el('b', { style: 'display:block;font-size:12.5px', text: L('布局基础', 'Layout basics') }),
            el('span', { class: 'text-xs muted', text: L('12 课时', '12 lessons') })
          )
        )
      );
      slot.dataset.i = String(i);
      host.append(el('div', {}, el('div', { class: 'text-xs muted', style: 'margin-bottom:4px', text: L(NAMES[i].zh, NAMES[i].en) + ' · ' + w + 'px' }), slot));
    });

    nextFrame().then(() => {
      const rows = [];
      state.widths.forEach((w, i) => {
        const slot = host.querySelectorAll('.cq-slot')[i];
        const card = slot.querySelector('.cq-card');
        const cover = slot.querySelector('.cq-cover');
        const cs = getComputedStyle(card);
        const cr = card.getBoundingClientRect();
        const vr = cover.getBoundingClientRect();
        rows.push({
          name: L(NAMES[i].zh, NAMES[i].en),
          w,
          dir: cs.flexDirection,
          cover: Math.round(vr.width) + '×' + Math.round(vr.height),
          stacked: cs.flexDirection === 'column',
          cardW: Math.round(cr.width)
        });
      });
      const stackedCount = rows.filter((r) => r.stacked).length;

      log.set([
        { k: L('响应方式', 'mechanism'), v: state.mode === 'container' ? '@container card (max-width: 26rem)' : '@media (max-width: 40rem)', cls: 'hl' },
        { k: L('三个容器宽度', 'container widths'), v: state.widths.join(' / ') + 'px' },
        { k: L('视口宽度', 'viewport width'), v: '（demo 里固定不变，媒体查询因此对三个容器给出相同结果）' },
        '',
        ...rows.map((r) => ({
          k: r.name + ' ' + r.w + 'px',
          v: 'flex-direction: ' + r.dir + '  封面 ' + r.cover,
          cls: r.stacked ? 'hl' : 'ok'
        })),
        '',
        {
          text: state.mode === 'container'
            ? L('✓ 每个卡片按<b>自己容器</b>的宽度独立决定形态：' + stackedCount + ' 个容器里的卡片变成了竖排，其余的保持横排。', '✓ Each card decides from the width of <b>its own container</b>: ' + stackedCount + ' containers switch to a column while the others stay as rows.')
            : L('✗ 三个容器里的卡片形态完全相同 —— 因为媒体查询只看视口，它"不知道"卡片所在的容器有多宽。窄容器里的卡片因此被压扁。', '✗ All three cards have identical form — a media query only sees the viewport and has no idea how wide the card’s container is, so the card in the narrow container is squeezed.'),
          cls: state.mode === 'container' ? 'ok' : 'bad'
        }
      ]);
    });
  }

  draw();
});

/* =============================================================
 * d-5-3 clamp() 生成器 + Switcher 原语
 * ============================================================= */
register('d-5-3', (mount) => {
  const clampCfg = { min: 1.75, mid: 2.4, max: 3, vwMin: 320, vwMax: 1440, view: 780 };
  const sw = { width: 560, threshold: 34, long: false, text200: false };

  const clampStage = el('div', { class: 'clamp-stage' });
  const clampLog = readout();
  const codeHost = el('div', { class: 'generated-code' });
  const swHost = el('div', { class: 'sw-root' });
  const swLog = readout();

  const cMin = slider({ label: L('最小值 (rem)', 'min (rem)'), min: 0.875, max: 2.5, step: 0.125, value: clampCfg.min, fmt: (v) => v.toFixed(3), onChange: (v) => { clampCfg.min = v; drawClamp(); } });
  const cMid = slider({ label: L('中段斜率 (vw)', 'preferred slope (vw)'), min: 0.5, max: 6, step: 0.1, value: clampCfg.mid, fmt: (v) => v.toFixed(1), onChange: (v) => { clampCfg.mid = v; drawClamp(); } });
  const cMax = slider({ label: L('最大值 (rem)', 'max (rem)'), min: 1.25, max: 4.5, step: 0.125, value: clampCfg.max, fmt: (v) => v.toFixed(3), onChange: (v) => { clampCfg.max = v; drawClamp(); } });
  const cView = slider({ label: L('模拟视口宽度', 'simulated viewport'), min: 320, max: 1440, step: 20, value: clampCfg.view, unit: 'px', onChange: (v) => { clampCfg.view = v; drawClamp(); } });

  const sWidth = slider({ label: L('容器宽度', 'container width'), min: 260, max: 820, step: 10, value: sw.width, unit: 'px', onChange: (v) => { sw.width = v; drawSw(); } });
  const sThresh = slider({ label: L('切换阈值 --sw-threshold', 'threshold'), min: 20, max: 60, step: 1, value: sw.threshold, unit: 'rem', onChange: (v) => { sw.threshold = v; drawSw(); } });
  const tLong = toggle({ label: L('注入长单词', 'Inject a long word'), checked: false, onChange: (v) => { sw.long = v; drawSw(); } });
  const tText = toggle({ label: L('字号放大 200%', 'Text at 200%'), checked: false, onChange: (v) => { sw.text200 = v; drawSw(); } });

  mount.append(
    el('div', { class: 'demo-stage wide-controls' },
      panel(L('① clamp() 流式字号生成器', '① clamp() fluid type generator'), cMin.node, cMid.node, cMax.node, cView.node),
      el('div', {}, clampStage, el('div', { class: 'mt-3' }, codeHost), el('div', { class: 'mt-3' }, clampLog.node))
    ),
    el('div', { class: 'demo-stage wide-controls', style: 'margin-top:18px' },
      panel(L('② Switcher 原语（无断点切换）', '② The Switcher primitive (no breakpoints)'), sWidth.node, sThresh.node, tLong.node, tText.node,
        el('p', { class: 'text-xs mt-0 muted', text: L('阈值是"容器宽于多少就横排"的界线，它由 flex-basis 计算式参与，不需要媒体查询。', 'The threshold is where the container is wide enough to sit side by side; it participates in the flex-basis formula, so no media query is needed.') })),
      el('div', {}, swHost, el('div', { class: 'mt-3' }, swLog.node))
    )
  );

  /* ---- ① clamp 生成器 ---- */
  const titleEl = el('h3', { class: 'clamp-title', text: L('用一年时间，学会页面布局', 'Learn page layout in a year') });
  const clampFrame = el('div', { class: 'clamp-frame' }, el('div', { style: 'padding:14px' }, titleEl, el('p', { style: 'margin:6px 0 0;font-size:12.5px;color:#64748b', text: L('拖动滑杆观察标题随视口连续变化。', 'Drag the sliders and watch the heading change continuously with the viewport.') })));
  clampStage.append(clampFrame);

  function drawClamp() {
    const expr = 'clamp(' + clampCfg.min.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + 'rem, '
      + clampCfg.mid.toFixed(1) + 'vw, '
      + clampCfg.max.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + 'rem)';
    titleEl.style.fontSize = expr;
    clampFrame.style.width = Math.min(clampCfg.view, 760) + 'px';
    clampFrame.style.maxWidth = '100%';

    codeHost.innerHTML = '';
    codeHost.append(document.createTextNode('/* ' + L('生成的代码（可直接复制）', 'generated code (copy as is)') + ' */\n\n'));
    codeHost.append(el('span', { class: 'kw', text: 'h1' }), document.createTextNode(' { font-size: '));
    codeHost.append(el('span', { class: 'fn', text: expr }), document.createTextNode('; }\n\n'));
    codeHost.append(el('span', { class: 'cmt', text: '/* ' + L('最小/最大值用 rem → 用户放大字号时上下限一起变大（WCAG 1.4.4）', 'min/max in rem → bounds grow with the user’s font size (WCAG 1.4.4)') + ' */' }));

    nextFrame().then(() => {
      const cs = getComputedStyle(titleEl);
      const fs = parseFloat(cs.fontSize);
      const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const clamped = fs <= clampCfg.min * root + 0.5 ? L('触到下限', 'at the floor')
        : fs >= clampCfg.max * root - 0.5 ? L('触到上限', 'at the ceiling') : L('正在插值', 'interpolating');
      clampLog.set([
        { k: L('模拟视口', 'simulated viewport'), v: clampCfg.view + 'px' },
        { k: L('实测字号', 'measured font size'), v: num(fs, 1) + 'px = ' + num(fs / root, 2) + 'rem', cls: 'hl' },
        { k: L('当前处于', 'currently'), v: clamped },
        '',
        { k: L('下限 / 上限', 'floor / ceiling'), v: num(clampCfg.min * root, 1) + 'px / ' + num(clampCfg.max * root, 1) + 'px' },
        { k: L('纯 vw 版本会怎样', 'what a pure vw version does'), v: L('忽略用户字号设置，放大字体时标题纹丝不动 ✗', 'ignores the user’s font size; zooming text does nothing to the heading ✗'), cls: 'bad' },
        { k: L('本方案', 'this version'), v: L('上下限用 rem，随用户字号一起变大 ✓', 'bounds in rem grow with the user’s font size ✓'), cls: 'ok' }
      ]);
    });
  }

  /* ---- ② Switcher ---- */
  const swFrame = el('div', { class: 'sw-frame' });
  const switcher = el('div', { class: 'switcher' });
  const swFlagHost = el('div', { style: 'position:absolute;inset:0;pointer-events:none' });
  swFrame.style.position = 'relative';
  swFrame.append(switcher, swFlagHost);
  swHost.append(swFrame);

  function drawSw() {
    swFrame.style.width = sw.width + 'px';
    swFrame.style.fontSize = sw.text200 ? '24px' : '13px';
    switcher.style.setProperty('--sw-threshold', sw.threshold + 'rem');
    switcher.innerHTML = '';
    [1, 2, 3].forEach((i) => {
      switcher.append(el('div', {
        text: i === 2 && sw.long ? 'LayoutConsistencyChecklist' : L('区域 ', 'Area ') + i
      }));
    });

    nextFrame().then(() => {
      const items = Array.from(switcher.children);
      const tops = items.map((n) => Math.round(n.getBoundingClientRect().top));
      const rows = new Set(tops).size;
      const fr = swFrame.getBoundingClientRect();
      let excess = 0;
      switcher.querySelectorAll('*').forEach((n) => {
        const r = n.getBoundingClientRect();
        excess = Math.max(excess, Math.round(r.right - fr.right + 10));
      });
      const overflow = excess > 1;
      swFrame.classList.toggle('overflowing', overflow);

      swFlagHost.innerHTML = '';
      const flag = el('div', { class: 'sw-row-flag', text: rows === 1 ? L('横排（1 行）', 'row (1 line)') : L('竖排（' + rows + ' 行）', 'stacked (' + rows + ' rows)') });
      flag.style.left = '50%';
      flag.style.top = '-2px';
      swFlagHost.append(flag);

      const need = sw.threshold * 16;
      swLog.set([
        { k: L('容器宽度', 'container width'), v: Math.round(fr.width) + 'px' },
        { k: L('阈值', 'threshold'), v: sw.threshold + 'rem = ' + need + 'px' },
        { k: L('当前形态', 'current form'), v: rows === 1 ? L('横排（容器宽于阈值）', 'row (container wider than threshold)') : L('竖排（容器窄于阈值）', 'stacked (container narrower than threshold)'), cls: rows === 1 ? 'ok' : 'hl' },
        { k: L('实测行数', 'measured rows'), v: String(rows) },
        { k: L('溢出', 'overflow'), v: overflow ? '✗ +' + excess + 'px' : '✓ 无', cls: overflow ? 'bad' : 'ok' },
        '',
        { text: L('切换点就在 ' + need + 'px —— 没有写任何 @media。把阈值滑杆从 20rem 拉到 60rem，可以看到"界线"随之移动。', 'The switch happens at ' + need + 'px with no @media anywhere. Drag the threshold from 20rem to 60rem and watch the line move.'), cls: 'hl' }
      ]);
    });
  }

  drawClamp();
  drawSw();
});
