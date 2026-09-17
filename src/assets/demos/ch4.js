/* =============================================================
 * demos/ch4.js — 第 4 章的三个交互演示
 *   d-4-1 网格叠层与吸附（12 栏 + 拖动吸附 + 对齐误差）
 *   d-4-2 自适应卡片墙调参（minmax / auto-fit / auto-fill）
 *   d-4-3 区域画布（编辑 grid-template-areas + 拖拽区域 + 三档预览）
 * ============================================================= */

import {
  el, L, register, slider, seg, toggle, buttons, readout, tableMini, panel, preview,
  nextFrame, num, clamp, area
} from '../lab.js';

/* =============================================================
 * d-4-1 网格叠层与吸附
 * ============================================================= */
register('d-4-1', (mount) => {
  const state = { overlay: true, lines: true, fake: false };
  const blocks = [
    { span: 4, cls: '', label: { zh: '课程卡 A', en: 'Card A' } },
    { span: 4, cls: 'b', label: { zh: '课程卡 B', en: 'Card B' } },
    { span: 4, cls: 'c', label: { zh: '课程卡 C', en: 'Card C' } },
    { span: 6, cls: '', label: { zh: '重点课程（跨 6 栏）', en: 'Featured (span 6)' } }
  ];
  const starts = [0, 4, 8, 0];

  const wrap = el('div', { class: 'g12-wrap' });
  const grid = el('div', { class: 'g12', style: '--g:10px' });
  const overlay = el('div', { class: 'g12-overlay' });
  grid.append(overlay);
  wrap.append(grid);

  const nodes = blocks.map((b, i) => {
    const n = el('div', { class: 'g12-block ' + b.cls, dataset: { i: String(i) } },
      el('span', { text: L(b.label.zh, b.label.en) }),
      el('span', { class: 'span-tag', text: b.span + '' })
    );
    grid.append(n);
    return n;
  });

  const log = readout();
  const linesHost = el('div', { style: 'position:absolute;inset:0;pointer-events:none' });

  const tOverlay = toggle({ label: L('叠加 12 栏叠层', 'Overlay the 12 columns'), checked: true, onChange: (v) => { state.overlay = v; draw(); } });
  const tLines = toggle({ label: L('显示栏位分界线', 'Show column lines'), checked: true, onChange: (v) => { state.lines = v; draw(); } });
  const tFake = toggle({ label: L('用 padding 假装网格（v1 写法）', 'Fake grid with padding (the v1 way)'), checked: false, onChange: (v) => { state.fake = v; draw(); } });

  const spanSliders = blocks.map((b, i) => slider({
    label: L('块 ', 'Block ') + (i + 1) + ' 跨栏数',
    min: 1, max: 12, step: 1, value: b.span,
    onChange: (v) => { b.span = v; draw(); }
  }));

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('叠层与拖动', 'Overlay and dragging'), tOverlay.node, tLines.node, tFake.node,
      el('div', { style: 'display:grid;gap:6px;margin-top:4px' }, spanSliders.map((s) => s.node)),
      el('p', { class: 'text-xs mt-0 muted', text: L('直接拖动色块，它会吸附到最近的栏位分界线；右侧显示它的偏移与对齐误差。', 'Drag a block: it snaps to the nearest column line, and the panel reports its offset and alignment error.') })),
    el('div', {}, wrap, el('div', { class: 'mt-4' }, log.node))
  ));

  // 拖动吸附
  let dragging = null;
  nodes.forEach((n, i) => {
    n.addEventListener('pointerdown', (e) => {
      if (state.fake) return;
      dragging = { i, node: n };
      n.classList.add('dragging');
      n.setPointerCapture(e.pointerId);
    });
    n.addEventListener('pointermove', (e) => {
      if (!dragging || dragging.i !== i) return;
      const gr = grid.getBoundingClientRect();
      const cs = getComputedStyle(grid);
      const padL = parseFloat(cs.paddingLeft);
      const padR = parseFloat(cs.paddingRight);
      const gap = parseFloat(cs.columnGap);
      const inner = gr.width - padL - padR;
      const track = (inner - gap * 11) / 12;
      const x = e.clientX - gr.left - padL;
      const idx = clamp(Math.round(x / (track + gap)), 0, 12 - blocks[i].span);
      starts[i] = idx;
      draw();
    });
    const end = () => { dragging = null; n.classList.remove('dragging'); };
    n.addEventListener('pointerup', end);
    n.addEventListener('pointercancel', end);
  });

  function draw() {
    grid.classList.toggle('fake', state.fake);
    overlay.style.display = state.overlay && !state.fake ? '' : 'none';

    nodes.forEach((n, i) => {
      n.querySelector('.span-tag').textContent = String(blocks[i].span);
      if (state.fake) {
        n.style.gridColumn = '';
      } else {
        n.style.gridColumn = (starts[i] + 1) + ' / span ' + blocks[i].span;
      }
    });

    nextFrame().then(() => {
      const gr = grid.getBoundingClientRect();
      const cs = getComputedStyle(grid);
      const padL = parseFloat(cs.paddingLeft);
      const gap = parseFloat(cs.columnGap);
      const inner = gr.width - padL * 2;
      const track = (inner - gap * 11) / 12;

      // 栏位分界线
      linesHost.innerHTML = '';
      if (state.lines && !state.fake) {
        for (let k = 0; k <= 12; k += 1) {
          const ln = el('div', { class: 'g12-line' });
          ln.style.left = (padL + k * (track + gap)) + 'px';
          linesHost.append(ln);
        }
      }
      grid.append(linesHost);

      const rows = nodes.map((n, i) => {
        const nr = n.getBoundingClientRect();
        const offset = nr.left - gr.left - padL;
        // 与最近的栏位分界线比：误差 = 到最近 (k*(track+gap)) 的距离
        const k = Math.round(offset / (track + gap));
        const err = Math.abs(offset - k * (track + gap));
        return {
          name: L('块 ', 'Block ') + (i + 1),
          col: state.fake ? '—' : (starts[i] + 1) + ' / span ' + blocks[i].span,
          offset: Math.round(offset),
          err: Math.round(err),
          width: Math.round(nr.width),
          span: blocks[i].span
        };
      });

      const maxErr = Math.max(...rows.map((r) => r.err));
      log.set([
        { k: L('布局方式', 'layout'), v: state.fake ? L('padding 假装网格（float + 5% padding）', 'fake grid (float + 5% padding)') : 'display: grid + repeat(12, minmax(0, 1fr))', cls: state.fake ? 'bad' : 'ok' },
        { k: L('轨道宽 / 水槽', 'track / gutter'), v: Math.round(track) + 'px / ' + gap + 'px' },
        { k: L('内容区宽度', 'content width'), v: Math.round(inner) + 'px = 12 × ' + Math.round(track) + ' + 11 × ' + gap },
        '',
        { k: L('最大对齐误差', 'max alignment error'), v: maxErr + 'px  ' + (maxErr <= 1 ? '✓ 全部落在栏位上' : '✗ 有元素没落在栏位上'), cls: maxErr <= 1 ? 'ok' : 'bad' },
        ''
      ]);

      log.node.append(el('table', { class: 'mini' },
        el('thead', {}, el('tr', {},
          el('th', { text: '' }),
          el('th', { text: 'grid-column' }),
          el('th', { text: L('左偏移', 'offset') }),
          el('th', { text: L('误差', 'error') }),
          el('th', { text: L('实测宽', 'width') })
        )),
        el('tbody', {}, rows.map((r) => el('tr', { class: r.err > 1 ? 'issue' : null },
          el('td', { text: r.name }),
          el('td', { class: 'num', text: r.col }),
          el('td', { class: 'num', text: r.offset + 'px' }),
          el('td', { class: 'num', text: r.err + 'px' }),
          el('td', { class: 'num', text: r.width + 'px' })
        )))
      ));
    });
  }

  draw();
});

/* =============================================================
 * d-4-2 自适应卡片墙调参
 * ============================================================= */
register('d-4-2', (mount) => {
  const state = { width: 620, limit: 170, count: 4, fit: 'auto-fit', featured: false, fallback: false };

  const wrap = el('div', { class: 'wall-wrap' });
  const wall = el('div', { class: 'wall' });
  wrap.append(wall);

  const log = readout();
  const trackHost = el('div');

  const wSlider = slider({ label: L('容器宽度', 'container width'), min: 240, max: 760, step: 10, value: state.width, unit: 'px', onChange: (v) => { state.width = v; draw(); } });
  const lSlider = slider({ label: L('minmax 下限', 'minmax lower bound'), min: 90, max: 300, step: 10, value: state.limit, unit: 'px', onChange: (v) => { state.limit = v; draw(); } });
  const cSlider = slider({ label: L('卡片数量', 'card count'), min: 1, max: 8, step: 1, value: state.count, onChange: (v) => { state.count = v; draw(); } });

  const fitSeg = seg({
    label: 'repeat(auto-fit / auto-fill, minmax(…, 1fr))',
    options: [{ value: 'auto-fit', label: 'auto-fit' }, { value: 'auto-fill', label: 'auto-fill' }],
    value: 'auto-fit',
    onChange: (v) => { state.fit = v; draw(); }
  });

  const tFeatured = toggle({ label: L('第 2 张卡片跨两列（span 2）', 'Card 2 spans two columns'), checked: false, onChange: (v) => { state.featured = v; draw(); } });
  const tFallback = toggle({ label: L('窄容器下重置跨栏（兜底修复）', 'Reset the span on narrow containers (fallback fix)'), checked: false, onChange: (v) => { state.fallback = v; draw(); } });

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('参数', 'Parameters'), wSlider.node, lSlider.node, cSlider.node, fitSeg.node, tFeatured.node, tFallback.node,
      el('p', { class: 'text-xs mt-0 muted', text: L('观察：容器宽度不变时切换 auto-fit / auto-fill，看最后一行是否被"折叠"。', 'Watch: with the container width fixed, switch auto-fit / auto-fill and see whether the last row collapses.') })),
    el('div', {}, wrap, el('div', { class: 'mt-3' }, trackHost), el('div', { class: 'mt-3' }, log.node))
  ));

  function draw() {
    wall.style.width = state.width + 'px';
    wall.style.gridTemplateColumns = 'repeat(' + state.fit + ', minmax(min(100%, ' + state.limit + 'px), 1fr))';
    wall.classList.toggle('overflowing', false);
    wall.innerHTML = '';
    for (let i = 0; i < state.count; i += 1) {
      const isFeatured = state.featured && i === 1;
      wall.append(el('div', {
        class: 'wall-card' + (isFeatured ? ' featured' : ''),
        dataset: { featured: isFeatured ? '1' : '0' }
      }, el('b', { text: isFeatured ? L('重点课程（span 2）', 'Featured (span 2)') : L('课程 ', 'Course ') + (i + 1) }),
        L('12 课时 · 项目驱动', '12 lessons · project-driven')));
    }

    nextFrame().then(() => {
      const cs = getComputedStyle(wall);
      const tracks = cs.gridTemplateColumns.split(' ').map((s) => parseFloat(s));
      const cards = Array.from(wall.querySelectorAll('.wall-card'));
      const featuredEl = wall.querySelector('[data-featured="1"]');
      const cols = tracks.length;

      // 兜底：容器太窄（放不下两列）时把 span 复位
      if (featuredEl) {
        const tooNarrow = cols < 2;
        if (state.fallback && tooNarrow) featuredEl.style.gridColumn = 'auto';
        else featuredEl.style.gridColumn = 'span 2';
      }

      const overflow = wall.scrollWidth > wall.clientWidth + 1;
      wall.classList.toggle('overflowing', overflow);

      const rowCount = new Set(cards.map((c) => Math.round(c.getBoundingClientRect().top))).size;
      const widths = cards.map((c) => Math.round(c.getBoundingClientRect().width));

      trackHost.innerHTML = '';
      trackHost.append(el('div', { class: 'text-xs muted', style: 'margin-bottom:4px', text: L('解析出的轨道（每个柱 = 一条 1fr 轨道）', 'Resolved tracks (one bar per 1fr track)') }));
      trackHost.append(el('div', { class: 'track-bar', style: 'height:34px' }, tracks.map((t) => el('i', { style: 'flex:1', title: Math.round(t) + 'px' }))));
      trackHost.append(el('div', { class: 'text-xs muted', style: 'margin-top:4px', text: tracks.map((t) => Math.round(t)).join(' · ') + ' px' }));

      log.set([
        { k: 'grid-template-columns', v: 'repeat(' + state.fit + ', minmax(min(100%, ' + state.limit + 'px), 1fr))', cls: 'hl' },
        { k: L('解析出的列数', 'resolved columns'), v: String(cols), cls: cols >= 2 ? 'ok' : 'hl' },
        { k: L('每列宽度', 'track width'), v: cols ? Math.round(tracks[0]) + 'px' : '—' },
        { k: L('卡片数量 / 占用行数', 'cards / rows'), v: state.count + ' / ' + rowCount },
        '',
        { k: L('首张卡片实测宽', 'first card width'), v: widths[0] + 'px' },
        { k: autoFitNote(), v: '', cls: 'hl' },
        '',
        overflow
          ? { text: L('✗ 容器出现横向溢出：跨栏元素在轨道数不足时会撑破网格。', '✗ The container overflows horizontally: a spanning item breaks the grid when there are too few tracks.'), cls: 'bad' }
          : { text: L('✓ 内容都在容器内。', '✓ Everything fits inside the container.'), cls: 'ok' },
        state.featured && !state.fallback && cols < 2
          ? { text: L('→ 修复：窄容器下把跨栏改回 auto（本演示的兜底开关），或用 @container 查询。', '→ Fix: reset the span to auto on narrow containers (the fallback toggle) or use an @container query.'), cls: 'ok' }
          : null
      ].filter(Boolean));
    });
  }

  function autoFitNote() {
    return state.fit === 'auto-fit'
      ? L('auto-fit：空轨道会被折叠，卡片被拉伸铺满整行', 'auto-fit: empty tracks collapse and the cards stretch to fill the row')
      : L('auto-fill：空轨道保留，卡片不拉伸（右侧留白）', 'auto-fill: empty tracks remain, so cards do not stretch (empty space at the right)');
  }

  draw();
});

/* =============================================================
 * d-4-3 区域画布
 * ============================================================= */
register('d-4-3', (mount) => {
  const DEVICES = {
    phone: {
      label: { zh: '手机 320px', en: 'Phone 320px' }, width: 260,
      areas: 'header\nmain\nside\nfooter'
    },
    tablet: {
      label: { zh: '平板 768px', en: 'Tablet 768px' }, width: 480,
      areas: 'header header\nmain   side\nfooter footer'
    },
    desktop: {
      label: { zh: '桌面 1200px', en: 'Desktop 1200px' }, width: 700,
      areas: 'header header header\ntoc    main   side\nfooter footer footer'
    }
  };
  const state = { device: 'desktop', draft: DEVICES.desktop.areas };
  const REGIONS = ['header', 'main', 'side', 'toc', 'footer', '.'];

  const previewHost = el('div', { style: 'background:#fff;border-radius:8px;padding:12px;overflow:auto' });
  const log = readout();

  const devSeg = seg({
    label: L('预览档位', 'Preview size'),
    options: Object.entries(DEVICES).map(([k, v]) => ({ value: k, label: L(v.label.zh, v.label.en) })),
    value: 'desktop',
    onChange: (v) => { state.device = v; state.draft = DEVICES[v].areas; ta.ta.value = state.draft; draw(); }
  });

  const ta = area({
    label: 'grid-template-areas',
    value: state.draft,
    rows: 5,
    onChange: (v) => { state.draft = v; DEVICES[state.device].areas = v; draw(); }
  });

  const presetBtns = buttons([
    { label: L('载入手机布局', 'Load phone layout'), onClick: () => { state.draft = DEVICES.phone.areas; ta.ta.value = state.draft; state.device = 'phone'; devSeg.set('phone'); draw(); } },
    { label: L('载入桌面布局', 'Load desktop layout'), onClick: () => { state.draft = DEVICES.desktop.areas; ta.ta.value = state.draft; state.device = 'desktop'; devSeg.set('desktop'); draw(); } },
    { label: L('故意写错（非矩形）', 'Break it (non-rectangle)'), onClick: () => { state.draft = 'header header\nside   main\nmain   footer'; ta.ta.value = state.draft; draw(); } }
  ]);

  const palette = el('div', { class: 'region-palette' }, REGIONS.map((r) => {
    const chip = el('span', { class: 'region-chip', draggable: 'true', dataset: { region: r }, text: r === '.' ? L('空 .', 'empty .') : r });
    chip.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', r); });
    return chip;
  }));

  mount.append(el('div', { class: 'demo-stage wide-controls' },
    panel(L('布局契约', 'Layout contract'), devSeg.node, ta.node, presetBtns,
      el('div', { class: 'text-xs muted', text: L('把下面的区域名拖到右侧格子即可改布局：', 'Drag a region name onto a cell to rearrange the layout:') }),
      palette,
      el('p', { class: 'text-xs mt-0 muted', text: L('区域必须是矩形，且每行的列数要一致。拖出非法形状时观察浏览器如何处理。', 'Every region must be a rectangle and all rows must have the same number of cells. Drag something illegal to see how the browser reacts.') })),
    el('div', {}, previewHost, el('div', { class: 'mt-3' }, log.node))
  ));

  /** 解析并校验 areas 文本 */
  function parse(text) {
    const rows = text.split('\n').map((r) => r.trim()).filter((r) => r.length);
    const errors = [];
    if (!rows.length) return { ok: false, errors: [{ zh: '内容为空', en: 'Empty' }], rows: [], cols: 0, matrix: [] };
    const matrix = rows.map((r) => r.split(/\s+/));
    const cols = matrix[0].length;
    matrix.forEach((r, i) => {
      if (r.length !== cols) {
        errors.push({ zh: '第 ' + (i + 1) + ' 行有 ' + r.length + ' 格，第一行是 ' + cols + ' 格（列数必须一致）', en: 'Row ' + (i + 1) + ' has ' + r.length + ' cells but row 1 has ' + cols + ' (column counts must match)' });
      }
    });
    // 区域名合法性
    const names = new Set();
    matrix.forEach((r) => r.forEach((c) => { if (c !== '.') names.add(c); }));
    names.forEach((n) => {
      if (!/^[A-Za-z_][\w-]*$/.test(n)) errors.push({ zh: '非法区域名 "' + n + '"', en: 'Invalid region name "' + n + '"' });
    });
    // 矩形校验
    names.forEach((n) => {
      const cells = [];
      matrix.forEach((r, y) => r.forEach((c, x) => { if (c === n) cells.push([x, y]); }));
      if (!cells.length) return;
      const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const expect = (maxX - minX + 1) * (maxY - minY + 1);
      if (expect !== cells.length) {
        errors.push({
          zh: '区域 "' + n + '" 不是矩形（它被拆成了 ' + cells.length + ' 格，但矩形应有 ' + expect + ' 格）',
          en: 'Region "' + n + '" is not a rectangle (' + cells.length + ' cells but a rectangle would need ' + expect + ')'
        });
      }
    });
    return { ok: errors.length === 0, errors, rows, cols, matrix };
  }

  function draw() {
    const text = state.draft;
    const p = parse(text);
    const dev = DEVICES[state.device];

    const grid = el('div', { class: 'areas-grid' });
    grid.style.width = dev.width + 'px';
    grid.style.maxWidth = '100%';
    if (p.ok) {
      grid.style.gridTemplateAreas = p.matrix.map((r) => '"' + r.join(' ') + '"').join(' ');
      grid.style.gridTemplateColumns = 'repeat(' + p.cols + ', minmax(0, 1fr))';
      p.matrix.forEach((row, y) => row.forEach((cell, x) => {
        const isFirstOfRegion = cell !== '.' && p.matrix.slice(0, y).every((rr) => rr[x] !== cell) && (x === 0 || row[x - 1] !== cell);
        const node = el('div', {
          class: 'areas-cell' + (cell === '.' ? ' empty' : ''),
          dataset: { region: cell, x: String(x), y: String(y) },
          text: cell === '.' ? L('空', 'empty') : cell,
          style: isFirstOfRegion ? '' : 'font-size:0'
        });
        // 每个格子都能接收拖放
        node.addEventListener('dragover', (e) => { e.preventDefault(); node.classList.add('drop-hover'); });
        node.addEventListener('dragleave', () => node.classList.remove('drop-hover'));
        node.addEventListener('drop', (e) => {
          e.preventDefault();
          node.classList.remove('drop-hover');
          const region = e.dataTransfer.getData('text/plain');
          if (!region) return;
          const m = p.matrix.map((r) => r.slice());
          m[y][x] = region;
          state.draft = m.map((r) => r.join(' ')).join('\n');
          ta.ta.value = state.draft;
          DEVICES[state.device].areas = state.draft;
          draw();
        });
        // 合并区域：同名的后续格子不显示文字，但仍占用格子
        if (cell !== '.' && !isFirstOfRegion) {
          node.style.background = 'transparent';
          node.style.borderColor = 'transparent';
        }
        grid.append(node);
      }));
    } else {
      // 非法：浏览器会丢弃整条 areas 声明 → 子元素自动放置
      grid.classList.add('invalid');
      grid.style.gridTemplateColumns = 'repeat(' + Math.max(1, p.cols) + ', minmax(0, 1fr))';
      Array.from(new Set(p.matrix.flat())).filter((c) => c !== '.').forEach((c) => {
        grid.append(el('div', { class: 'areas-cell', dataset: { region: c }, text: c }));
      });
    }

    previewHost.innerHTML = '';
    previewHost.append(el('div', { class: 'areas-device', style: 'margin-bottom:6px' },
      el('span', { text: L(dev.label.zh, dev.label.en) }), el('span', { class: 'muted', text: '· width: ' + dev.width + 'px' })));
    previewHost.append(grid);

    const lines = [
      { k: L('档位', 'size'), v: L(dev.label.zh, dev.label.en), cls: 'hl' },
      { k: L('解析结果', 'parsed'), v: p.rows.length + L(' 行 × ', ' rows × ') + p.cols + L(' 列', ' columns') },
      { k: L('区域', 'regions'), v: Array.from(new Set(p.matrix.flat())).filter((c) => c !== '.').join(', ') || '—' },
      { k: L('校验', 'validation'), v: p.ok ? '✓ 全部是合法矩形，声明生效' : '✗ ' + p.errors.length + ' 个问题，声明被浏览器丢弃', cls: p.ok ? 'ok' : 'bad' },
      ''
    ];
    if (!p.ok) {
      p.errors.forEach((e) => lines.push({ text: '✗ ' + L(e.zh, e.en), cls: 'bad' }));
      lines.push('');
      lines.push({ text: L('浏览器行为：整条 grid-template-areas 声明被丢弃（不是局部报错），子元素退回自动放置 —— 右侧预览就是这个结果。', 'Browser behaviour: the entire grid-template-areas declaration is dropped (not a local error) and children fall back to auto placement — that is what the preview shows.'), cls: 'hl' });
    } else {
      lines.push({ text: L('✓ 声明合法。试着把 areas 换成手机版（单列），你会看到 DOM 一行都不用改。', '✓ The declaration is valid. Try the phone version (single column) — not a single line of DOM changes.'), cls: 'ok' });
    }
    log.set(lines);
  }

  draw();
});
