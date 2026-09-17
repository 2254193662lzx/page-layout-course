/* =============================================================
 * lab.js — 演示工具箱 / demo toolkit
 *
 * 18 个演示共用这一层，保证交互手感与视觉一致：
 *   控件：slider / seg / toggle / textarea / btn
 *   输出：readout（等宽终端风格）/ tableMini / pill
 *   可视化：split（before-after 拖拽对比）/ 网格叠层 / 溢出检测
 *
 * 演示约定：每个演示就是一个 render(mount) 函数，注册到 registry。
 * 语言切换时运行时会把演示整个重渲染，所以演示内部用 L(zh, en) 写文案即可双语。
 * ============================================================= */

import { L as _L, getLocale, t, onChange } from './lang.js';

export const L = _L;
export { getLocale, t, onChange };

/** 迷你 DOM 构造器 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class' || k === 'className') node.className = Array.isArray(v) ? v.filter(Boolean).join(' ') : v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'style') {
      if (typeof v === 'string') node.setAttribute('style', v);
      else Object.assign(node.style, v);
    } else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'on') for (const [ev, fn] of Object.entries(v)) node.addEventListener(ev, fn);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, String(v));
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** 片段：把多个节点拼成一个容器 */
export function frag(...children) {
  return el('div', { class: 'lab-frag', style: 'display:contents' }, ...children);
}

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const num = (n, d = 0) => Number(n).toFixed(d).replace(/\.0+$/, '');

export function debounce(fn, ms = 120) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}

/* ---------------------------------------------------------------
 * 控件
 * ------------------------------------------------------------- */

/** 滑杆：slider({ label, min, max, step, value, unit, fmt, onChange }) */
export function slider(opts) {
  const { label, min = 0, max = 100, step = 1, value = 50, unit = '', fmt, onChange: cb } = opts;
  const valueEl = el('span', { class: 'ctrl-value' });
  const input = el('input', { type: 'range', min, max, step, value, 'aria-label': label });
  const paint = () => { valueEl.textContent = (fmt ? fmt(Number(input.value)) : num(input.value)) + unit; };
  input.addEventListener('input', () => { paint(); cb && cb(Number(input.value)); });
  paint();
  const node = el('label', { class: 'ctrl' },
    el('span', { class: 'ctrl-head' }, el('span', { class: 'ctrl-label', text: label }), valueEl),
    input
  );
  return { node, input, set(v) { input.value = v; paint(); }, get value() { return Number(input.value); } };
}

/** 分段选择器：seg({ label, options:[{value,label}], value, onChange }) */
export function seg(opts) {
  const { label, options, value, onChange: cb } = opts;
  let cur = value ?? (options[0] && options[0].value);
  const box = el('div', { class: 'seg', role: 'group', 'aria-label': label || 'options' });
  const buttons = options.map((o) => {
    const b = el('button', { type: 'button', text: o.label, title: o.title || o.label });
    b.classList.toggle('active', o.value === cur);
    b.addEventListener('click', () => {
      cur = o.value;
      buttons.forEach((x, i) => x.classList.toggle('active', options[i].value === cur));
      cb && cb(cur);
    });
    return b;
  });
  box.append(...buttons);
  const node = label ? el('div', { class: 'ctrl' }, el('span', { class: 'ctrl-head' }, el('span', { class: 'ctrl-label', text: label })), box) : box;
  return { node, get value() { return cur; }, set(v) { cur = v; buttons.forEach((x, i) => x.classList.toggle('active', options[i].value === v)); } };
}

/** 开关：toggle({ label, checked, onChange }) */
export function toggle(opts) {
  const { label, checked = false, onChange: cb } = opts;
  const input = el('input', { type: 'checkbox' });
  input.checked = checked;
  input.addEventListener('change', () => cb && cb(input.checked));
  const node = el('label', { class: 'switch' }, input, el('span', { text: label }));
  return { node, input, get checked() { return input.checked; }, set(v) { input.checked = v; } };
}

/** 多行输入：area({ label, value, rows, mono, onChange }) */
export function area(opts) {
  const { label, value = '', rows = 5, onChange: cb } = opts;
  const ta = el('textarea', { rows, spellcheck: 'false', 'aria-label': label || 'input' });
  ta.value = value;
  ta.addEventListener('input', () => cb && cb(ta.value));
  const node = label
    ? el('div', { class: 'ctrl' }, el('span', { class: 'ctrl-head' }, el('span', { class: 'ctrl-label', text: label })), ta)
    : ta;
  return { node, ta, get value() { return ta.value; } };
}

/** 按钮行：buttons([{label, kind, onClick}]) */
export function buttons(list) {
  return el('div', { class: 'btn-row' }, list.map((b) =>
    el('button', { type: 'button', class: ['btn', b.kind].filter(Boolean).join(' '), text: b.label, on: { click: b.onClick } })
  ));
}

/** 终端风格读数：readout() → { node, set(items) }
 *  items: (string | {text, cls} | {k, v, cls} | ''（空行）)[]
 *  用 {k, v} 时左侧标签与右侧数值分栏对齐（中英文混排也不会错位）
 */
export function readout(initial = []) {
  const node = el('div', { class: 'readout', role: 'log', 'aria-live': 'polite' });
  const set = (items) => {
    node.textContent = '';
    const arr = Array.isArray(items) ? items : [items];
    arr.forEach((item) => {
      if (item == null) return;
      if (typeof item === 'string') {
        if (item === '') node.append(el('div', { class: 'ro-gap' }));
        else node.append(el('div', { class: 'ro' }, el('span', { class: 'v', text: item })));
        return;
      }
      if (item.k != null) {
        node.append(el('div', { class: 'ro' },
          el('span', { class: 'k', text: item.k }),
          el('span', { class: 'v ' + (item.cls || ''), text: item.v })
        ));
        return;
      }
      node.append(el('div', { class: 'ro' }, el('span', { class: 'v ' + (item.cls || ''), text: item.text })));
    });
  };
  set(initial);
  return { node, set };
}

/** 小表格 */
export function tableMini(head, rows, opts = {}) {
  const t = el('table', { class: 'mini' });
  t.append(el('thead', {}, el('tr', {}, head.map((h) => el('th', { text: h })))));
  t.append(el('tbody', {}, rows.map((r) => el('tr', { class: r.__issue ? 'issue' : null },
    r.cells ? r.cells.map((c, i) => el('td', { class: i === 0 ? null : 'num', text: c })) : r.map((c, i) => el('td', { class: i === 0 ? null : 'num', text: c }))
  ))));
  if (opts.caption) return el('div', {}, el('div', { class: 'text-xs muted mt-2', text: opts.caption }), t);
  return t;
}

export function pill(text, kind = 'info') {
  return el('span', { class: 'pill ' + kind, text });
}

/** 控制面板容器 */
export function panel(title, ...children) {
  return el('div', { class: 'demo-controls' }, title ? el('h4', { text: title }) : null, ...children);
}

/** 预览容器 */
export function preview(...children) {
  return el('div', { class: 'demo-preview' }, ...children);
}

/* ---------------------------------------------------------------
 * 可视化
 * ------------------------------------------------------------- */

/** before / after 拖拽对比：split(aNode, bNode) */
export function split(aNode, bNode) {
  const inner = el('div', { class: 'split', style: '--x:50%' });
  const a = el('div', { class: 'split-a' }, aNode);
  const b = el('div', { class: 'split-b' }, bNode);
  const handle = el('div', { class: 'split-handle', role: 'slider', 'aria-label': 'drag to compare', tabindex: '0' });
  inner.append(a, b, handle);
  const setX = (pct) => { inner.style.setProperty('--x', clamp(pct, 0, 100) + '%'); };
  let dragging = false;
  const move = (e) => {
    if (!dragging) return;
    const r = inner.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    setX((x / r.width) * 100);
  };
  handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture?.(e.pointerId); });
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', () => { dragging = false; });
  handle.addEventListener('keydown', (e) => {
    const cur = parseFloat(inner.style.getPropertyValue('--x')) || 50;
    if (e.key === 'ArrowLeft') { setX(cur - 4); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setX(cur + 4); e.preventDefault(); }
  });
  return { node: inner, inner, setX };
}

/** 在容器上叠加网格线（列 + 可选基线） */
export function overlayGrid(host, { cols = 12, gutter = 0, baseline = 0, color } = {}) {
  const width = host.clientWidth || 600;
  const colW = (width - gutter * (cols - 1)) / cols;
  const lines = el('div', { class: 'gridlines' });
  lines.style.setProperty('--col', (colW + gutter) + 'px');
  if (color) lines.style.backgroundImage = `linear-gradient(90deg, ${color} 1px, transparent 1px)`;
  host.style.position = 'relative';
  host.append(lines);
  if (baseline) {
    const bl = el('div', { class: 'baselines' });
    bl.style.setProperty('--bl', baseline + 'px');
    host.append(bl);
  }
  return { lines, colW };
}

/** 溢出检测：把容器压到指定宽度，检查是否出现横向溢出 */
export function probeOverflow(node, widths = [360, 320]) {
  const results = [];
  const parent = node.parentElement;
  const prevWidth = node.style.width;
  const prevParent = parent.style.width;
  widths.forEach((w) => {
    parent.style.width = w + 'px';
    parent.style.maxWidth = 'none';
    node.style.width = '100%';
    // 强制重排后再测量
    void node.offsetWidth;
    const doc = node.ownerDocument;
    const root = doc.scrollingElement;
    results.push({
      width: w,
      overflowX: root.scrollWidth > root.clientWidth + 1,
      scrollW: root.scrollWidth,
      clientW: root.clientWidth,
      internal: node.scrollWidth > node.clientWidth + 1,
      internalScrollW: node.scrollWidth,
      internalClientW: node.clientWidth
    });
  });
  node.style.width = prevWidth;
  parent.style.width = prevParent;
  parent.style.maxWidth = '';
  void node.offsetWidth;
  return results;
}

/** 在演示里量测某个元素的真实计算样式，用于"把看不见的规则显形" */
export function styleOf(node, props) {
  const cs = getComputedStyle(node);
  const out = {};
  props.forEach((p) => { out[p] = cs.getPropertyValue(p); });
  return out;
}

/** 等宽读数：把一组 {k, v} 渲染成对齐的多行文本 */
export function kvLines(pairs, width = 22) {
  return pairs.map(([k, v]) => {
    const key = String(k);
    const pad = ' '.repeat(Math.max(1, width - key.length - String(v).length));
    return key + pad + String(v);
  });
}

/** 等待下一次布局完成（用于动画后测量） */
export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/* ---------------------------------------------------------------
 * 演示注册表
 * ------------------------------------------------------------- */
export const DEMOS = Object.create(null);

export function register(key, render) {
  DEMOS[key] = render;
}

export function renderDemo(key, mount) {
  const fn = DEMOS[key];
  if (!fn) {
    mount.innerHTML = '<p class="pill bad">demo "' + esc(key) + '" not found</p>';
    return false;
  }
  mount.innerHTML = '';
  fn(mount);
  return true;
}
