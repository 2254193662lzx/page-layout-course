/* =============================================================
 * lang.js — 中英双语运行时 / bilingual runtime
 *
 * 机制（与参考样例一致，便于对照学习）：
 *   1) 界面固定文案：HTML 上写 data-i18n="key"，运行时替换 textContent
 *   2) 正文双语：成对写两个节点 <p data-lang="zh-CN">…</p><p data-lang="en-US" hidden>…</p>
 *      运行时通过 hidden 属性切换（i18n.css 里用 [data-lang][hidden] 保证 display:none）
 *   3) 语言状态：localStorage('plc-locale') 持久化；支持 ?lang=en 直达；navigator.language 兜底
 *   4) 演示模块：订阅 onChange 后重渲染，保证演示内部文字也随之切换
 *
 * 因为两种语言来自同一份结构化内容的两个字段，构建期成对生成，
 * 所以"两种语言内容一致"是机制保证的，而不是靠人工同步。
 * ============================================================= */

const STORAGE_KEY = 'plc-locale';
const SUPPORTED = ['zh-CN', 'en-US'];

/** 界面固定文案字典 */
const DICT = {
  'zh-CN': {
    'site.title': '《页面布局之道》',
    'nav.home': '课程门户',
    'nav.ch1': '第 1 章 · 布局是信息设计',
    'nav.ch2': '第 2 章 · 文档流与盒模型',
    'nav.ch3': '第 3 章 · 一维布局 Flexbox',
    'nav.ch4': '第 4 章 · 二维布局 Grid',
    'nav.ch5': '第 5 章 · 响应式与内在布局',
    'nav.ch6': '第 6 章 · 可访问性与综合案例',
    'nav.toc': '本章小节',
    'nav.lang.zh': '中文',
    'nav.lang.en': 'EN',
    'nav.lang.label': '切换语言',
    'tab.explain': '📖 讲解',
    'tab.code': '⌨️ 关键代码',
    'tab.demo': '▶️ 演示',
    'common.prev': '← 上一章',
    'common.next': '下一章 →',
    'common.enter': '进入章节 →',
    'common.live': '✅ 已上线',
    'common.copy': '复制',
    'common.copied': '已复制 ✓',
    'common.demo-index': '↗ 全部 18 个演示索引',
    'common.portal': '课程门户',
    'common.key-point': '关键点解释',
    'common.why': '为什么这么写',
    'common.pitfall': '有什么坑',
    'common.before': '改造前 v1',
    'common.after': '改造后 v2',
    'tip.keyboard': '快捷键：[ ] 切换小节 · 1 2 3 切换讲解/代码/演示',
    'tip.sections': '左侧选小节 · 顶部切换讲解 / 关键代码 / 演示',
    'footer.copy': '© 2026 《页面布局之道》· 中英双语交互教学网站 · 零依赖 · 可直接部署到 GitHub Pages'
  },
  'en-US': {
    'site.title': 'The Art of Page Layout',
    'nav.home': 'Course Portal',
    'nav.ch1': 'Ch 1 · Layout Is Information Design',
    'nav.ch2': 'Ch 2 · Flow & Box Model',
    'nav.ch3': 'Ch 3 · Flexbox (1D)',
    'nav.ch4': 'Ch 4 · Grid (2D)',
    'nav.ch5': 'Ch 5 · Responsive & Intrinsic',
    'nav.ch6': 'Ch 6 · Accessibility & Case Study',
    'nav.toc': 'Sections',
    'nav.lang.zh': '中文',
    'nav.lang.en': 'EN',
    'nav.lang.label': 'Switch language',
    'tab.explain': '📖 Explain',
    'tab.code': '⌨️ Key Code',
    'tab.demo': '▶️ Demo',
    'common.prev': '← Previous',
    'common.next': 'Next →',
    'common.enter': 'Enter chapter →',
    'common.live': '✅ Live',
    'common.copy': 'Copy',
    'common.copied': 'Copied ✓',
    'common.demo-index': '↗ All 18 demos',
    'common.portal': 'Course Portal',
    'common.key-point': 'Why it works this way',
    'common.why': 'Why write it this way',
    'common.pitfall': 'Pitfalls',
    'common.before': 'Before (v1)',
    'common.after': 'After (v2)',
    'tip.keyboard': 'Shortcuts: [ ] sections · 1 2 3 explain/code/demo',
    'tip.sections': 'Pick a section on the left · switch Explain / Key Code / Demo on top',
    'footer.copy': '© 2026 The Art of Page Layout · Bilingual interactive course · Zero dependencies · GitHub Pages ready'
  }
};

/* 兼容旧 key 别名（样例用过的键名） */
DICT['zh-CN']['common.enter'] = '进入章节 →';

function normalize(input) {
  if (!input) return null;
  const v = String(input).toLowerCase();
  if (v.startsWith('zh')) return 'zh-CN';
  if (v.startsWith('en')) return 'en-US';
  return null;
}

function detect() {
  const fromUrl = normalize(new URLSearchParams(location.search).get('lang'));
  if (fromUrl) return fromUrl;
  try {
    const stored = normalize(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
  } catch (_) { /* 隐私模式忽略 */ }
  return normalize(navigator.language) || 'zh-CN';
}

let locale = detect();
const listeners = new Set();

export function getLocale() { return locale; }

/** 取界面文案 */
export function t(key) {
  return (DICT[locale] && DICT[locale][key]) || (DICT['zh-CN'][key]) || key;
}

/** 双语内联取词：L('中文', 'English') */
export function L(zh, en) {
  return locale === 'en-US' ? en : zh;
}

export function onChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function applyChrome() {
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    const text = (DICT[locale] && DICT[locale][key]);
    if (text != null) node.textContent = text;
  });
  document.querySelectorAll('[data-i18n-html]').forEach((node) => {
    const key = node.getAttribute('data-i18n-html');
    const text = (DICT[locale] && DICT[locale][key]);
    if (text != null) node.innerHTML = text;
  });
  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    const key = node.getAttribute('data-i18n-title');
    const text = (DICT[locale] && DICT[locale][key]);
    if (text != null) node.setAttribute('title', text);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
    const key = node.getAttribute('data-i18n-aria');
    const text = (DICT[locale] && DICT[locale][key]);
    if (text != null) node.setAttribute('aria-label', text);
  });
}

function applyContent() {
  document.querySelectorAll('[data-lang]').forEach((node) => {
    const want = node.getAttribute('data-lang');
    node.hidden = want !== locale;
  });
}

function applySwitcher() {
  document.querySelectorAll('.lang-switch button').forEach((btn) => {
    const isActive = btn.dataset.locale === locale;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

export function setLocale(next, opts = {}) {
  const norm = normalize(next) || 'zh-CN';
  if (norm === locale && !opts.force) return;
  locale = norm;
  try { localStorage.setItem(STORAGE_KEY, locale); } catch (_) { /* ignore */ }
  apply();
  if (!opts.silent) listeners.forEach((cb) => { try { cb(locale); } catch (e) { console.error(e); } });
}

export function toggleLocale() {
  setLocale(locale === 'en-US' ? 'zh-CN' : 'en-US');
}

function apply() {
  document.documentElement.lang = locale;
  document.documentElement.setAttribute('data-locale', locale);
  applyChrome();
  applyContent();
  applySwitcher();
  const titleEl = document.querySelector('title[data-i18n-doc]');
  if (titleEl) {
    const before = locale === 'en-US' ? '' : '';
    titleEl.textContent = titleEl.dataset.zh && locale === 'zh-CN' ? titleEl.dataset.zh
      : (titleEl.dataset.en || titleEl.textContent);
  }
}

/** 注入语言切换按钮（topbar 或浮动） */
export function mountSwitcher() {
  document.querySelectorAll('.lang-switch').forEach((box) => {
    if (box.dataset.ready) return;
    box.dataset.ready = '1';
    box.setAttribute('role', 'group');
    SUPPORTED.forEach((loc) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.locale = loc;
      btn.textContent = DICT[loc]['nav.lang.' + (loc === 'zh-CN' ? 'zh' : 'en')];
      btn.setAttribute('aria-label', t('nav.lang.label'));
      btn.addEventListener('click', () => setLocale(loc));
      box.appendChild(btn);
    });
  });
  applySwitcher();
}

apply();
mountSwitcher();

// 便于在控制台/演示里手动调用
window.__i18n = { setLocale, getLocale, toggle: toggleLocale, t, onChange };
