/* =============================================================
 * lesson.js — 章节页运行时 / lesson page runtime
 *
 * 1) 小节切换（左侧导航 + URL hash）
 * 2) 讲解 / 关键代码 / 演示 三 tab 切换
 * 3) 演示按需渲染（切到演示 tab 才跑），语言切换时整体重渲染
 * 4) 代码块一键复制、阅读进度条、键盘快捷键
 * ============================================================= */

import { DEMOS, renderDemo } from './lab.js';
import { t, onChange } from './lang.js';

const body = document.body;
const chapterKey = body.dataset.chapter || '1';
const qs = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------------- 小节 + tab ---------------- */
const sections = qs('.chapter');
let currentSection = sections[0] || null;
// 当前偏好 tab：切小节时保持，便于连续看演示；也支持 ?tab=demo#ch-1-1 深链
let preferredTab = new URLSearchParams(location.search).get('tab') || 'explain';
if (!['explain', 'code', 'demo'].includes(preferredTab)) preferredTab = 'explain';

function setTab(chapter, tab, { silent = false } = {}) {
  if (!chapter) return;
  preferredTab = tab;
  qs('.tab-btn', chapter).forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  qs('.tab-panel', chapter).forEach((p) => p.classList.toggle('active', p.dataset.panel === tab));
  if (tab === 'demo') ensureDemo(chapter);
  if (!silent) {
    const btn = chapter.querySelector('.tab-btn[data-tab="' + tab + '"]');
    if (btn) btn.setAttribute('aria-selected', 'true');
  }
}

function ensureDemo(chapter) {
  const mount = chapter.querySelector('.demo-mount');
  if (!mount || mount.dataset.rendered === '1') return;
  const key = mount.dataset.demo;
  if (renderDemo(key, mount)) {
    mount.dataset.rendered = '1';
    chapter.classList.add('demo-ready');
  }
}

function activateSection(id, { scroll = true, push = true } = {}) {
  const target = id ? document.getElementById(id) : null;
  const chapter = target && target.classList.contains('chapter') ? target : sections[0];
  if (!chapter) return;
  currentSection = chapter;
  sections.forEach((c) => c.classList.toggle('active', c === chapter));
  qs('.chapter-nav a[data-chapter]').forEach((a) => a.classList.toggle('active', a.dataset.chapter === chapter.id));
  setTab(chapter, preferredTab);
  if (push && location.hash !== '#' + chapter.id) history.replaceState(null, '', '#' + chapter.id);
  if (scroll) {
    const top = chapter.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

qs('.chapter-nav a[data-chapter]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    activateSection(a.dataset.chapter);
  });
});

qs('.chapter .tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const chapter = btn.closest('.chapter');
    setTab(chapter, btn.dataset.tab);
  });
});

window.addEventListener('hashchange', () => {
  const id = location.hash.replace(/^#/, '');
  if (id) activateSection(id, { scroll: true, push: false });
});

/* ---------------- 演示加载与语言联动 ---------------- */
const demoReady = import('./demos/ch' + chapterKey + '.js').catch((err) => {
  console.error('[lesson] demo bundle failed to load', err);
});

demoReady.then(() => {
  const active = currentSection;
  renderActive(active);
});

function renderActive(chapter) {
  if (!chapter) return;
  const activeTab = (chapter.querySelector('.tab-btn.active') || {}).dataset?.tab;
  if (activeTab === 'demo') ensureDemo(chapter);
}

// 语言切换 → 演示必须整体重渲染（演示内部文案也随之切换）
onChange(() => {
  qs('.demo-mount').forEach((m) => { delete m.dataset.rendered; m.innerHTML = ''; });
  renderActive(currentSection);
  requestAnimationFrame(() => syncCopyLabels());
});

/* ---------------- 代码块复制 ---------------- */
function syncCopyLabels() {
  qs('.copy-btn').forEach((b) => {
    if (b.dataset.copied === '1') return;
    b.textContent = t('common.copy');
  });
}

function addCopyButtons() {
  qs('.tab-panel pre').forEach((pre) => {
    if (pre.dataset.copyReady) return;
    pre.dataset.copyReady = '1';
    const code = pre.querySelector('code');
    const text = code ? code.innerText : pre.innerText;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn copy-btn';
    btn.textContent = t('common.copy');
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
      } catch (_) {
        const r = document.createRange();
        r.selectNodeContents(code || pre);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        document.execCommand && document.execCommand('copy');
        sel.removeAllRanges();
      }
      btn.textContent = t('common.copied');
      btn.dataset.copied = '1';
      setTimeout(() => { delete btn.dataset.copied; btn.textContent = t('common.copy'); }, 1600);
    });
    pre.append(btn);
  });
}

/* ---------------- 阅读进度 ---------------- */
function initProgress() {
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  document.body.append(bar);
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------------- 键盘快捷键 ---------------- */
function initKeys() {
  window.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const idx = sections.indexOf(currentSection);
    if (e.key === '[' && idx > 0) { activateSection(sections[idx - 1].id); }
    else if (e.key === ']' && idx < sections.length - 1) { activateSection(sections[idx + 1].id); }
    else if (['1', '2', '3'].includes(e.key)) {
      setTab(currentSection, ['explain', 'code', 'demo'][Number(e.key) - 1]);
    } else return;
    e.preventDefault();
  });
}

/* ---------------- 初始化 ---------------- */
addCopyButtons();
initProgress();
initKeys();

const initialId = location.hash.replace(/^#/, '');
activateSection(initialId || (sections[0] && sections[0].id), { scroll: Boolean(initialId), push: false });

window.__lesson = { activateSection, setTab, DEMOS };
