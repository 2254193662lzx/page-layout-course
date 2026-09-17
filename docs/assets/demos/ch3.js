/* =============================================================
 * demos/ch3.js — 第 3 章的三个交互演示
 *   d-3-1 轴心可视化器
 *   d-3-2 空间分配计算器（含 min-width:auto 溢出陷阱）
 *   d-3-3 四个模板 + 破坏性测试
 * ============================================================= */

import {
  el, L, register, slider, seg, toggle, buttons, readout, tableMini, panel, preview,
  nextFrame, num, clamp
} from '../lab.js';

/* =============================================================
 * d-3-1 轴心可视化器
 * ============================================================= */
register('d-3-1', (mount) => {
  const state = { dir: 'row', wrap: 'nowrap', justify: 'flex-start', align: 'stretch', long: false };

  const wrapEl = el('div', { class: 'axis-wrap' });
  const box = el('div', { class: 'axis-box' });
  const items = [
    el('div', { class: 'axis-item', text: L('项目 1', 'Item 1') }),
    el('div', { class: 'axis-item b tall', text: L('项目 2（更高）', 'Item 2 (taller)') }),
    el('div', { class: 'axis-item c', text: L('项目 3', 'Item 3') })
  ];
  const mainArrow = el('div', { class: 'axis-arrow h' });
  const crossArrow = el('div', { class: 'axis-arrow v' });
  const mainLabel = el('div', { class: 'axis-label', text: L('主轴 main', 'main axis') });
  const crossLabel = el('div', { class: 'axis-label', text: L('交叉轴 cross', 'cross axis') });
  wrapEl.append(box, mainArrow, crossArrow, mainLabel, crossLabel);
  box.append(...items);

  const log = readout();
  const tableHost = el('div');

  const dirSeg = seg({
    label: 'flex-direction',
    options: [
      { value: 'row', label: 'row' },
      { value: 'row-reverse', label: 'row-rev' },
      { value: 'column', label: 'column' },
      { value: 'column-reverse', label: 'col-rev' }
    ],
    value: 'row',
    onChange: (v) => { state.dir = v; draw(); }
  });
  const wrapSeg = seg({
    label: 'flex-wrap',
    options: [{ value: 'nowrap', label: 'nowrap' }, { value: 'wrap', label: 'wrap' }],
    value: 'nowrap',
    onChange: (v) => { state.wrap = v; draw(); }
  });
  const jSeg = seg({
    label: 'justify-content（主轴）',
    options: [
      { value: 'flex-start', label: 'start' },
      { value: 'center', label: 'center' },
      { value: 'flex-end', label: 'end' },
      { value: 'space-between', label: 'between' },
      { value: 'space-around', label: 'around' }
    ],
    value: 'flex-start',
    onChange: (v) => { state.justify = v; draw(); }
  });
  const aSeg = seg({
    label: 'align-items（交叉轴）',
    options: [
      { value: 'stretch', label: 'stretch' },
      { value: 'flex-start', label: 'start' },
      { value: 'center', label: 'center' },
      { value: 'flex-end', label: 'end' }
    ],
    value: 'stretch',
    onChange: (v) => { state.align = v; draw(); }
  });
  const tLong = toggle({
    label: L('让项目 2 的内容变长（观察收缩）', 'Make item 2 longer (watch it shrink)'),
    checked: false,
    onChange: (v) => { state.long = v; draw(); }
  });

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('坐标系参数', 'Coordinate system'), dirSeg.node, wrapSeg.node, jSeg.node, aSeg.node, tLong.node,
      el('p', { class: 'text-xs mt-0 muted', text: L('提示：右下角可以拖拽改变容器宽度。', 'Tip: drag the bottom-right corner to resize the container.') })),
    el('div', {}, wrapEl, el('div', { class: 'mt-4' }, log.node), el('div', { class: 'mt-3' }, tableHost))
  ));

  function draw() {
    box.style.flexDirection = state.dir;
    box.style.flexWrap = state.wrap;
    box.style.justifyContent = state.justify;
    box.style.alignItems = state.align;
    items[1].style.flex = state.long ? '1 1 0' : '';
    items[1].textContent = state.long
      ? L('项目 2：这段文字很长，用来观察 flex 的收缩与换行行为', 'Item 2: this text is long, to observe shrinking and wrapping')
      : L('项目 2（更高）', 'Item 2 (taller)');

    nextFrame().then(() => {
      const br = box.getBoundingClientRect();
      const wr = wrapEl.getBoundingClientRect();
      const horizontal = state.dir.startsWith('row');
      const reverse = state.dir.endsWith('reverse');

      // 主轴箭头
      if (horizontal) {
        const y = br.top - wr.top + br.height / 2;
        mainArrow.className = 'axis-arrow h';
        mainArrow.style.cssText = 'left:' + (br.left - wr.left + 6) + 'px;top:' + y + 'px;height:2px;width:' + (br.width - 12) + 'px';
        crossArrow.className = 'axis-arrow v';
        crossArrow.style.cssText = 'left:' + (br.left - wr.left + br.width / 2) + 'px;top:' + (br.top - wr.top + 6) + 'px;width:2px;height:' + (br.height - 12) + 'px';
        mainLabel.style.cssText = 'left:' + (br.left - wr.left + 8) + 'px;top:' + (y - 20) + 'px';
        crossLabel.style.cssText = 'left:' + (br.left - wr.left + br.width / 2 + 8) + 'px;top:' + (br.top - wr.top + 4) + 'px';
      } else {
        const x = br.left - wr.left + br.width / 2;
        mainArrow.className = 'axis-arrow v';
        mainArrow.style.cssText = 'left:' + x + 'px;top:' + (br.top - wr.top + 6) + 'px;width:2px;height:' + (br.height - 12) + 'px';
        crossArrow.className = 'axis-arrow h';
        crossArrow.style.cssText = 'left:' + (br.left - wr.left + 6) + 'px;top:' + (br.top - wr.top + br.height / 2) + 'px;height:2px;width:' + (br.width - 12) + 'px';
        mainLabel.style.cssText = 'left:' + (x + 8) + 'px;top:' + (br.top - wr.top + 6) + 'px';
        crossLabel.style.cssText = 'left:' + (br.left - wr.left + 8) + 'px;top:' + (br.top - wr.top + br.height / 2 - 20) + 'px';
      }
      if (reverse) {
        mainLabel.textContent = L('主轴 main（反向）', 'main axis (reversed)');
      } else {
        mainLabel.textContent = L('主轴 main', 'main axis');
      }

      const rows = items.map((it, i) => {
        const r = it.getBoundingClientRect();
        return [L('项目 ', 'Item ') + (i + 1), Math.round(r.left - br.left) + 'px', Math.round(r.top - br.top) + 'px', Math.round(r.width) + ' × ' + Math.round(r.height)];
      });

      log.set([
        { k: 'flex-direction', v: state.dir + (horizontal ? L('  → 主轴水平，justify 管水平方向', '  → main axis horizontal, justify acts horizontally') : L('  → 主轴垂直，justify 管垂直方向', '  → main axis vertical, justify acts vertically')), cls: 'hl' },
        { k: 'justify-content', v: state.justify + L('（作用在主轴）', ' (acts on the main axis)') },
        { k: 'align-items', v: state.align + L('（作用在交叉轴）', ' (acts on the cross axis)') },
        { k: 'flex-wrap', v: state.wrap },
        '',
        { k: L('容器尺寸', 'container'), v: Math.round(br.width) + ' × ' + Math.round(br.height) + 'px' }
      ]);

      tableHost.innerHTML = '';
      tableHost.append(el('h4', { class: 'text-sm mt-0', style: 'margin-bottom:6px', text: L('每个项目的实际位置与尺寸（相对容器左上角）', 'Each item’s real position and size (relative to the container’s top-left)') }));
      tableHost.append(tableMini(['', 'x', 'y', L('尺寸 w × h', 'size w × h')], rows));
    });
  }

  draw();
});

/* =============================================================
 * d-3-2 空间分配计算器
 * ============================================================= */
register('d-3-2', (mount) => {
  const cfg = [
    { grow: 1, shrink: 1, basis: 80, cls: '' },
    { grow: 1, shrink: 1, basis: 80, cls: 'b' },
    { grow: 1, shrink: 1, basis: 80, cls: 'c' }
  ];
  const state = { width: 420, longWord: false, minZero: true };

  const lab = el('div', { class: 'flex-lab' });
  const frame = el('div', { class: 'flex-frame' });
  const measureTag = el('div', { class: 'flex-measure' }, el('span'));
  const nodes = cfg.map((c, i) => el('div', { class: 'flex-item ' + c.cls, text: L('项目 ', 'Item ') + (i + 1) }));
  frame.append(...nodes);
  lab.append(frame, measureTag);

  const log = readout();
  const barHost = el('div', { style: 'display:grid;gap:6px' });

  const wSlider = slider({ label: L('容器宽度', 'container width'), min: 220, max: 620, step: 10, value: state.width, unit: 'px', onChange: (v) => { state.width = v; draw(); } });

  const rows = cfg.map((c, i) => {
    const g = slider({ label: L('项目 ', 'Item ') + (i + 1) + ' flex-grow', min: 0, max: 3, step: 0.5, value: c.grow, onChange: (v) => { c.grow = v; draw(); } });
    const s = slider({ label: 'flex-shrink', min: 0, max: 3, step: 0.5, value: c.shrink, onChange: (v) => { c.shrink = v; draw(); } });
    const b = slider({ label: 'flex-basis (px)', min: 0, max: 220, step: 10, value: c.basis, unit: 'px', onChange: (v) => { c.basis = v; draw(); } });
    return el('div', { style: 'display:grid;gap:4px;padding:6px 0;border-top:1px dashed var(--ink-200)' },
      el('div', { class: 'text-xs', style: 'font-weight:800', text: L('项目 ', 'Item ') + (i + 1) }),
      g.node, s.node, b.node
    );
  });

  const tLong = toggle({
    label: L('注入 30 字符长单词', 'Inject a 30-character word'),
    checked: false,
    onChange: (v) => { state.longWord = v; draw(); }
  });
  const tMin = toggle({
    label: L('给子元素加 min-width: 0（修复）', 'Add min-width: 0 to children (fix)'),
    checked: true,
    onChange: (v) => { state.minZero = v; draw(); }
  });

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('容器', 'Container'), wSlider.node, tLong.node, tMin.node, ...rows),
    el('div', {}, lab, el('div', { class: 'mt-4' }, barHost), el('div', { class: 'mt-3' }, log.node))
  ));

  const WORD = 'LayoutConsistencyChecklist';

  function draw() {
    frame.style.width = state.width + 'px';
    nodes.forEach((n, i) => {
      n.style.flexGrow = String(cfg[i].grow);
      n.style.flexShrink = String(cfg[i].shrink);
      n.style.flexBasis = cfg[i].basis + 'px';
      n.style.minWidth = state.minZero ? '0' : 'auto';
      n.textContent = state.longWord && i === 1
        ? WORD
        : L('项目 ', 'Item ') + (i + 1) + ' · basis ' + cfg[i].basis;
    });

    nextFrame().then(() => {
      const fr = frame.getBoundingClientRect();
      const cs = getComputedStyle(frame);
      const gap = parseFloat(cs.columnGap) || 0;
      const inner = frame.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const totalGap = gap * (cfg.length - 1);
      const sumBasis = cfg.reduce((a, c) => a + c.basis, 0);
      const free = inner - totalGap - sumBasis;
      const sumGrow = cfg.reduce((a, c) => a + c.grow, 0);
      const sumShrinkWeight = cfg.reduce((a, c) => a + c.shrink * c.basis, 0);

      const predicted = cfg.map((c) => {
        if (free >= 0) {
          return sumGrow > 0 ? c.basis + free * (c.grow / sumGrow) : c.basis;
        }
        return sumShrinkWeight > 0 ? c.basis + free * ((c.shrink * c.basis) / sumShrinkWeight) : c.basis;
      });
      const measured = nodes.map((n) => n.getBoundingClientRect().width);

      // 每个项目画一条"计算 vs 实测"的条
      barHost.innerHTML = '';
      barHost.append(el('div', { class: 'text-xs muted', text: L('每项宽度：计算值（上）vs 浏览器实测（下）', 'Per item: predicted (top) vs measured (bottom)') }));
      nodes.forEach((n, i) => {
        const p = Math.max(0, predicted[i]);
        const m = measured[i];
        const off = Math.abs(p - m) > 1.5;
        barHost.append(el('div', {},
          el('div', { class: 'text-xs', text: L('项目 ', 'Item ') + (i + 1) + ' · ' + num(p, 1) + 'px' + (off ? L('  ✗ 被最小尺寸限制', '  ✗ clamped by min size') : '  ✓') }),
          el('div', { class: 'basis-bar', title: 'predicted' }, el('i', { style: 'width:' + clamp(p / state.width * 100, 0, 100) + '%;background:var(--accent-500)' })),
          el('div', { class: 'basis-bar', style: 'margin-top:2px' }, el('i', { style: 'width:' + clamp(m / state.width * 100, 0, 100) + '%;background:' + (off ? '#e11d48' : '#059669') + ';flex:none' }))
        ));
      });

      const overflow = frame.scrollWidth > frame.clientWidth + 1;
      frame.classList.toggle('overflowing', overflow);
      measureTag.querySelector('span').textContent = overflow
        ? L('✗ 内容溢出容器（横向滚动条）', '✗ content overflows the container (horizontal scrollbar)')
        : L('✓ 内容在容器内', '✓ content fits the container');

      const lines = [
        { text: L('空间分配计算过程', 'Space distribution, step by step'), cls: 'hl' },
        '',
        { k: L('容器内容宽度', 'container inner width'), v: num(inner, 1) + 'px' },
        { k: L('间距总和', 'total gap'), v: num(totalGap, 1) + 'px' },
        { k: 'Σ flex-basis', v: sumBasis + 'px' },
        { k: L('剩余空间 free space', 'free space'), v: num(free, 1) + 'px' + (free < 0 ? L('  （负数 = 需要收缩）', '  (negative = must shrink)') : ''), cls: free < 0 ? 'bad' : 'ok' },
        { k: 'Σ flex-grow', v: String(sumGrow) },
        '',
        { text: free >= 0
          ? L('规则：每项最终宽度 = basis + 剩余空间 × (该项 grow ÷ Σgrow)', 'Rule: final width = basis + free space × (this grow ÷ Σgrow)')
          : L('规则：每项收缩量 = 超出量 × ((shrink × basis) ÷ Σ(shrink × basis))', 'Rule: shrink amount = excess × ((shrink × basis) ÷ Σ(shrink × basis))') },
        ''
      ];

      measured.forEach((m, i) => {
        lines.push({
          k: L('项目 ', 'Item ') + (i + 1),
          v: num(predicted[i], 1) + L('px → 实测 ', 'px → measured ') + num(m, 1) + 'px' + (Math.abs(predicted[i] - m) > 1.5 ? L('  ✗ 不一致', '  ✗ mismatch') : ''),
          cls: Math.abs(predicted[i] - m) > 1.5 ? 'bad' : 'ok'
        });
      });

      lines.push('');
      if (overflow) {
        lines.push({ text: L('✗ 溢出了。原因：flex 项目的隐含最小尺寸是 min-content，长单词/不可断内容不肯收缩，把容器撑开。', '✗ It overflows: a flex item’s implicit minimum size is min-content, so an unbreakable word refuses to shrink and pushes the container open.'), cls: 'bad' });
        lines.push({ text: L('→ 修复：给子元素 min-width: 0（本演示的开关），并让长内容 overflow-wrap: anywhere。', '→ Fix: give the child min-width: 0 (the toggle above) and let long content use overflow-wrap: anywhere.'), cls: 'ok' });
      } else if (state.longWord) {
        lines.push({ text: L('✓ 长单词没有撑破容器，计算值与实测值一致。', '✓ The long word no longer breaks the container and prediction matches measurement.'), cls: 'ok' });
      } else {
        lines.push({ text: L('✓ 计算值与浏览器实测一致：这就是 flex 的分配算法。', '✓ Prediction matches the browser’s measurement — that is the flex distribution algorithm.'), cls: 'ok' });
      }

      log.set(lines);
    });
  }

  draw();
});

/* =============================================================
 * d-3-3 四个模板 + 破坏性测试
 * ============================================================= */
register('d-3-3', (mount) => {
  const state = { tpl: 'media', fixed: false, stresses: {} };
  const STRESS = [
    { key: 'longText', label: { zh: '① 超长文案', en: '① Long copy' } },
    { key: 'longWord', label: { zh: '② 30 字符长单词', en: '② 30-char word' } },
    { key: 'wideImage', label: { zh: '③ 1200px 宽图片', en: '③ 1200px image' } },
    { key: 'narrow', label: { zh: '④ 容器压到 320px', en: '④ Container at 320px' } },
    { key: 'text200', label: { zh: '⑤ 字号放大 200%', en: '⑤ Text at 200%' } }
  ];

  const frameHost = el('div', { style: 'position:relative' });
  const log = readout();
  const scoreHost = el('div');
  // 跑完破坏性测试后要保留报告文本，所以用一个"覆盖值"让 draw() 不要把它冲掉
  let reportOverride = null;

  const tplSeg = seg({
    label: L('模板', 'Template'),
    options: [
      { value: 'media', label: L('媒体对象', 'Media object') },
      { value: 'cards', label: L('等高卡片', 'Equal cards') },
      { value: 'footer', label: L('页脚贴底', 'Sticky footer') },
      { value: 'two', label: L('经典双栏', 'Two column') }
    ],
    value: 'media',
    onChange: (v) => { state.tpl = v; draw(); }
  });

  const fixToggle = toggle({
    label: L('使用修复后的写法（v2）', 'Use the fixed version (v2)'),
    checked: false,
    onChange: (v) => { state.fixed = v; draw(); }
  });

  const stressBtns = buttons(STRESS.map((s) => ({
    label: L(s.label.zh, s.label.en),
    onClick: () => {
      state.stresses[s.key] = !state.stresses[s.key];
      draw();
    }
  })));

  const runAll = buttons([
    { label: L('▶ 运行全部破坏性测试', '▶ Run the full stress test'), kind: 'primary', onClick: runAllTests },
    { label: L('清空', 'Clear'), onClick: () => { state.stresses = {}; draw(); } }
  ]);

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('模板与破坏条件', 'Template and stress'), tplSeg.node, fixToggle.node, stressBtns, runAll,
      el('p', { class: 'text-xs mt-1 muted', text: L('先关掉"修复"，看出问题；再打开，看它被修好。', 'Turn the fix off to see the failure, then on to see it resolved.') })),
    el('div', {}, frameHost, el('div', { class: 'mt-3' }, scoreHost), el('div', { class: 'mt-3' }, log.node))
  ));

  const LONG = {
    zh: '这是一段刻意写得很长的课程介绍，用来观察模板在真实内容长度下的表现。它包含多个句子，模拟课程大纲、讲师介绍与常见问题等真实场景中的文案长度。',
    en: 'This copy is deliberately long so we can watch how the template behaves with realistic content length. It runs over several sentences, imitating a course outline, an instructor bio and an FAQ.'
  };
  const WORD = 'LayoutConsistencyChecklist';

  function build() {
    const frame = el('div', { class: 'tpl-frame' + (state.fixed ? '' : ' v1') });
    if (state.stresses.narrow) frame.style.width = '320px';
    if (state.stresses.text200) frame.style.fontSize = '24px';
    const tpl = el('div', { class: 'tpl' });
    frame.append(tpl);

    const title = L('用一年时间学会页面布局', 'Learn page layout in a year');
    const body = state.stresses.longText ? L(LONG.zh, LONG.en) : L('12 周项目驱动课程，从文档流讲到网格系统。', 'A 12-week project-driven course, from document flow to grid systems.');
    const head = state.stresses.longWord ? WORD : title;
    const img = state.stresses.wideImage ? el('div', { class: 'wide-img', style: 'width:1200px' }) : null;

    if (state.tpl === 'media') {
      tpl.append(el('div', { class: 'tpl-media' },
        el('div', { class: 'av', text: '🎓' }),
        el('div', { class: 'tx' },
          el('h4', { text: head }),
          el('p', { text: body }),
          img
        )
      ));
    } else if (state.tpl === 'cards') {
      const cards = [0, 1, 2].map((i) => el('div', { class: 'c' },
        el('h4', { text: i === 1 ? head : L('模块 ', 'Module ') + (i + 1) }),
        el('div', { class: 'body' }, el('p', { style: 'margin:0', text: i === 1 && state.stresses.longText ? L(LONG.zh, LONG.en) : (state.stresses.longText ? L(LONG.zh.slice(0, 60), LONG.en.slice(0, 120)) : L('短文案。', 'Short copy.')) }), img),
        el('button', { class: 'btn', type: 'button', text: L('查看详情', 'Details') })
      ));
      tpl.append(el('div', { class: 'tpl-cards' }, cards));
    } else if (state.tpl === 'footer') {
      const stage = el('div', { class: 'tpl-stage' },
        el('div', { class: 'tpl' },
          el('div', { class: 'tpl-foot' },
            el('div', { class: 'main3' },
              el('h4', { class: 'tpl-title', text: head }),
              el('p', { style: 'margin:0', text: body }),
              img
            ),
            el('div', { class: 'foot', text: L('页脚 · 应当贴在框架底部', 'Footer · should sit at the bottom of the frame') })
          )
        )
      );
      // 页脚模板自带舞台，直接替换 tpl
      frame.textContent = '';
      frame.append(stage);
      return frame;
    } else {
      tpl.append(el('div', { class: 'tpl-two' },
        el('div', { class: 'side', text: L('侧栏', 'Sidebar') }),
        el('div', { class: 'main2' },
          el('h4', { class: 'tpl-title', text: head }),
          el('p', { style: 'margin:0', text: body }),
          img
        )
      ));
    }
    return frame;
  }

  /** 单次测量：返回检查项数组 */
  function inspect(frame) {
    const checks = [];
    const cw = frame.clientWidth;
    const overflow = frame.scrollWidth > cw + 1;
    checks.push({ key: 'overflow', ok: !overflow, value: frame.scrollWidth + ' > ' + cw });

    if (state.tpl === 'media') {
      const av = frame.querySelector('.av');
      const parent = av && av.closest('.tpl');
      if (av && parent) {
        // float 版本下父元素高度不含浮动元素 → 头像会戳出父元素底部
        const gap = Math.round(parent.getBoundingClientRect().bottom - av.getBoundingClientRect().bottom);
        checks.push({ key: 'avatarContained', ok: gap >= -1, value: gap + 'px' });
      }
    } else if (state.tpl === 'cards') {
      const cards = Array.from(frame.querySelectorAll('.c'));
      const widths = cards.map((c) => c.getBoundingClientRect().width);
      const equal = Math.max(...widths) - Math.min(...widths) <= 1.5;
      checks.push({ key: 'equalWidth', ok: equal, value: widths.map((w) => Math.round(w)).join(' / ') });
      const btns = cards.map((c) => c.querySelector('.btn')).filter(Boolean);
      const bottoms = btns.map((b) => b.getBoundingClientRect().bottom);
      const aligned = bottoms.length > 1 ? Math.max(...bottoms) - Math.min(...bottoms) <= 1.5 : true;
      checks.push({ key: 'btnBottom', ok: aligned, value: bottoms.map((b) => Math.round(b)).join(' / ') });
    } else if (state.tpl === 'footer') {
      const foot = frame.querySelector('.foot');
      const stage = frame.querySelector('.tpl-stage');
      if (foot && stage) {
        const diff = Math.abs(stage.getBoundingClientRect().bottom - foot.getBoundingClientRect().bottom);
        checks.push({ key: 'footBottom', ok: diff <= 2, value: Math.round(diff) + 'px' });
      }
    } else {
      const side = frame.querySelector('.side');
      const main = frame.querySelector('.main2');
      if (side && main) {
        const sr = side.getBoundingClientRect();
        const mr = main.getBoundingClientRect();
        checks.push({ key: 'twoColumn', ok: mr.left >= sr.right - 1.5, value: Math.round(mr.left - sr.right) + 'px' });
      }
    }
    return checks;
  }

  const CHECK_LABEL = {
    overflow: { zh: '不横向溢出', en: 'No horizontal overflow' },
    avatarContained: { zh: '父元素高度包含头像', en: 'Avatar contained by its parent' },
    equalWidth: { zh: '三张卡片等宽', en: 'Cards equally wide' },
    btnBottom: { zh: '按钮底部对齐', en: 'Buttons bottom-aligned' },
    footBottom: { zh: '页脚贴底', en: 'Footer at the bottom' },
    twoColumn: { zh: '保持双栏', en: 'Stays two columns' }
  };

  function draw() {
    frameHost.innerHTML = '';
    const frame = build();
    frameHost.append(frame);
    if (getComputedStyle(frame.parentElement).position === 'static') frameHost.style.position = 'relative';

    nextFrame().then(() => {
      const checks = inspect(frame);
      const active = STRESS.filter((s) => state.stresses[s.key]);
      if (reportOverride) {
        log.set(reportOverride);
        reportOverride = null;
        const passedAll = true;
        scoreHost.innerHTML = '';
        void passedAll;
        return;
      }
      log.set([
        { k: L('模板', 'template'), v: state.tpl + (state.fixed ? L(' · 修复后 v2', ' · fixed v2') : L(' · v1 病态写法', ' · broken v1')), cls: state.fixed ? 'ok' : 'bad' },
        { k: L('破坏条件', 'stress applied'), v: active.length ? active.map((s) => L(s.label.zh, s.label.en)).join(' + ') : L('无（基准状态）', 'none (baseline)') },
        '',
        ...checks.map((c) => ({
          k: L(CHECK_LABEL[c.key].zh, CHECK_LABEL[c.key].en),
          v: (c.ok ? '✓ ' : '✗ ') + c.value,
          cls: c.ok ? 'ok' : 'bad'
        }))
      ]);
      const passed = checks.filter((c) => c.ok).length;
      scoreHost.innerHTML = '';
      scoreHost.append(el('div', { class: 'flex items-center gap-2' },
        el('span', { class: 'text-sm', text: L('本次检查：', 'This check: ') }),
        el('span', { class: 'pill ' + (passed === checks.length ? 'ok' : 'bad'), text: passed + ' / ' + checks.length + L(' 项通过', ' passed') })
      ));
    });
  }

  async function runAllTests() {
    const results = [];
    const original = JSON.parse(JSON.stringify(state.stresses));
    const baseFixed = state.fixed;
    // 每套写法分别跑 5 个破坏条件
    for (const fixed of [false, true]) {
      state.fixed = fixed;
      fixToggle.set(fixed);
      for (const s of STRESS) {
        state.stresses = { [s.key]: true };
        frameHost.innerHTML = '';
        const frame = build();
        frameHost.append(frame);
        await nextFrame();
        const checks = inspect(frame);
        results.push({ fixed, stress: s, passed: checks.filter((c) => c.ok).length, total: checks.length, checks });
      }
    }
    state.fixed = baseFixed;
    fixToggle.set(baseFixed);
    state.stresses = original;

    const v1 = results.filter((r) => !r.fixed);
    const v2 = results.filter((r) => r.fixed);
    const sum = (arr) => arr.reduce((a, r) => a + r.passed, 0);
    const tot = (arr) => arr.reduce((a, r) => a + r.total, 0);

    reportOverride = [
      { text: L('破坏性测试报告（5 个条件 × 2 套写法）', 'Stress test report (5 conditions × 2 versions)'), cls: 'hl' },
      '',
      { k: L('v1 病态写法', 'v1 broken'), v: sum(v1) + ' / ' + tot(v1) + L(' 项通过', ' checks passed'), cls: 'bad' },
      { k: L('v2 修复写法', 'v2 fixed'), v: sum(v2) + ' / ' + tot(v2) + L(' 项通过', ' checks passed'), cls: 'ok' },
      '',
      ...STRESS.map((s) => {
        const a = results.find((r) => !r.fixed && r.stress.key === s.key);
        const b = results.find((r) => r.fixed && r.stress.key === s.key);
        return {
          k: L(s.label.zh, s.label.en),
          v: 'v1 ' + a.passed + '/' + a.total + '   →   v2 ' + b.passed + '/' + b.total,
          cls: b.passed === b.total ? 'ok' : 'hl'
        };
      }),
      '',
      L('结论：同一份文案，v1 的写法在 ' + v1.filter((r) => r.passed < r.total).length + ' / 5 个破坏条件下破版，修复后为 ' + v2.filter((r) => r.passed < r.total).length + ' / 5。这就是"布局语法会背不等于能用"的具体含义。',
        'Conclusion: with identical copy, the v1 CSS breaks under ' + v1.filter((r) => r.passed < r.total).length + ' / 5 stress conditions, and the fixed version under ' + v2.filter((r) => r.passed < r.total).length + ' / 5. This is what "knowing the syntax is not the same as being able to use it" means in practice.')
    ];
    draw();
  }

  draw();
});
