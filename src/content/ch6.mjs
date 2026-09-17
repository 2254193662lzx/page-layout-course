/* =============================================================
 * 第 6 章 · 可访问性、原语化与综合案例 / Ch 6 · Accessibility, Primitives and the Case Study
 * 案例病灶：⑧ DOM 顺序与视觉顺序不一致
 * ============================================================= */

export default {
  id: 6,
  slug: 'lesson-06',
  num: { zh: '第 6 章', en: 'Chapter 6' },
  title: { zh: '可访问性、原语化与综合案例', en: 'Accessibility, primitives and the case study' },
  subtitle: {
    zh: '布局不只是"看起来对"：它决定了键盘能不能用、屏幕阅读器读到的顺序对不对、放大到 200% 会不会崩。最后把全课收束成一个完整案例。',
    en: 'Layout is not only about looking right: it decides whether the keyboard works, whether a screen reader reads the right order, and whether 200% zoom breaks the page. The chapter ends by drawing the whole course together in one case.'
  },
  lede: {
    zh: '阅读顺序与线性化、WCAG 的几条硬指标（Reflow / Resize Text / Text Spacing / Focus Order / Target Size）、布局与外观分离，以及 CourseHub 从 v1 到 v2 的完整改造与评审清单。',
    en: 'Reading order and linearisation, the hard WCAG criteria (Reflow, Resize Text, Text Spacing, Focus Order, Target Size), separating layout from appearance, and the full CourseHub v1 → v2 rebuild with a review checklist.'
  },
  tags: [
    { zh: '阅读顺序与线性化', en: 'Reading order' },
    { zh: '焦点顺序 WCAG 2.4.3', en: 'Focus order (2.4.3)' },
    { zh: 'Reflow 1.4.10', en: 'Reflow (1.4.10)' },
    { zh: '缩放 200% 1.4.4', en: 'Resize text (1.4.4)' },
    { zh: '文本间距 1.4.12', en: 'Text spacing (1.4.12)' },
    { zh: '布局原语 / 评审清单', en: 'Primitives & checklist' }
  ],
  caseNote: {
    zh: '本章诊断案例的 <b>⑧ DOM 顺序与视觉顺序不一致</b>（用 <code>order</code> 挪动侧栏导致 Tab 顺序错乱），并交付 <b>CourseHub v2</b> 的完整改造与布局评审清单。',
    en: 'This chapter diagnoses defect <b>⑧ DOM order ≠ visual order</b> (using <code>order</code> to move the sidebar, which scrambles tab order) and delivers the complete <b>CourseHub v2</b> rebuild plus a layout review checklist.'
  },

  sections: [
    /* =========================================================
     * 6.1
     * ======================================================= */
    {
      id: 'ch-6-1',
      num: '6.1',
      title: { zh: '阅读顺序 vs 视觉顺序', en: 'Reading order versus visual order' },
      subtitle: {
        zh: 'CSS 能自由改变视觉位置，但键盘用户和屏幕阅读器只看 DOM 顺序。这两者分叉的地方，就是可访问性事故的高发区。',
        en: 'CSS can move anything visually, but keyboard users and screen readers only see DOM order. Where the two diverge, accessibility breaks.'
      },
      explain: [
        { p: {
          zh: '布局技术越强，"视觉顺序"与"DOM 顺序"就越容易分叉。分叉本身不是错误——<b>错误的是把它用在影响阅读或操作顺序的地方</b>。要理解这件事，先要看清三套"顺序"：',
          en: 'The more powerful the layout technique, the easier it is for visual order and DOM order to diverge. Divergence is not itself a mistake — <b>the mistake is using it where it affects reading or operation order</b>. To see why, separate three orders:'
        } },
        { table: {
          head: [{ zh: '顺序', en: 'Order' }, { zh: '由谁决定', en: 'Determined by' }, { zh: '用户如何感知', en: 'How users perceive it' }],
          rows: [
            [{ zh: '<b>DOM 顺序</b>', en: '<b>DOM order</b>' }, { zh: 'HTML 里元素的先后', en: 'The sequence in the HTML' }, { zh: '屏幕阅读器的朗读顺序；Tab 键的切换顺序；复制粘贴的顺序', en: 'Screen-reader narration order, tab order, copy-paste order' }],
            [{ zh: '<b>视觉顺序</b>', en: '<b>Visual order</b>' }, { zh: 'CSS 决定的屏幕位置', en: 'On-screen positions decided by CSS' }, { zh: '视力用户的阅读路径（左上 → 右下）', en: 'The reading path of sighted users (top-left → bottom-right)' }],
            [{ zh: '<b>焦点顺序</b>', en: '<b>Focus order</b>' }, { zh: '默认跟随 DOM 顺序（<code>tabindex</code> 可改）', en: 'Follows DOM order by default (<code>tabindex</code> can change it)' }, { zh: '键盘用户的导航顺序', en: 'Navigation order for keyboard users' }]
          ]
        } },
        { p: {
          zh: '<b>线性化（linearisation）</b>是理解这一切的关键概念：屏幕阅读器会把页面<b>压平成一个一维序列</b>来朗读。所以只要视觉顺序与 DOM 顺序不同，视力用户和屏幕阅读器用户就获得了<b>两份不同的信息</b>——而其中一份是错的。',
          en: '<b>Linearisation</b> is the key concept: a screen reader <b>flattens the page into a one-dimensional sequence</b> to read aloud. So whenever visual order differs from DOM order, sighted users and screen-reader users receive <b>two different documents</b> — and one of them is wrong.'
        } },
        { theory: {
          zh: '<b>WCAG 2.4.3 焦点顺序（AA）</b>要求：如果页面可以被顺序导航，焦点顺序必须<b>保持含义与可操作性</b>。换句话说：视觉上第 1、2、3 个东西，键盘上也应该是第 1、2、3 个。这条标准不禁止视觉重排，它只要求<b>重排不要把语义搞乱</b>。',
          en: '<b>WCAG 2.4.3 Focus Order (AA)</b> requires that if a page can be navigated sequentially, the focus order <b>preserves meaning and operability</b>. In other words: if something is first, second, third visually, it should be first, second, third for the keyboard. The criterion does not forbid visual reordering; it requires that <b>reordering does not scramble meaning</b>.',
          cite: {
            zh: 'WCAG 2.2 · 2.4.3 Focus Order；MDN「CSS and accessibility: ordering」',
            en: 'WCAG 2.2 · 2.4.3 Focus Order; MDN "CSS and accessibility: ordering"'
          }
        } },
        { h: { zh: '三个常见陷阱', en: 'Three common traps' } },
        { ul: [
          { zh: '<b><code>order</code> 挪动交互元素</b>：把"删除"按钮用 <code>order: -1</code> 挪到视觉最前面，键盘用户却要按到最后才碰到它。', en: '<b>Moving interactive elements with <code>order</code></b>: an <code>order: -1</code> delete button appears first visually but keyboard users reach it last.' },
          { zh: '<b><code>row-reverse</code> 处理"从右到左"</b>：视觉上反了，Tab 顺序没反 → 焦点从右侧跳到左侧。正确做法是用 <code>direction: rtl</code> 或直接写对 DOM 顺序。', en: '<b><code>row-reverse</code> for right-to-left layouts</b>: visually reversed but tab order is not, so focus jumps from right to left. Use <code>direction: rtl</code>, or simply write the DOM in the right order.' },
          { zh: '<b>用两套 DOM + <code>display: none</code> 切换布局</b>：v1 的常见做法。它同时带来重复内容、状态不同步、以及"隐藏的那份仍可能被读到"的风险。', en: '<b>Two DOM copies toggled by <code>display: none</code></b>: a common v1 pattern. It brings duplicated content, state that drifts out of sync, and the risk that the hidden copy is still announced.' }
        ] },
        { note: {
          zh: '<b>一条足够用的规则</b>：让 DOM 顺序按<b>最线性的那个版本</b>写（通常是手机单列版，或"最重要优先"的顺序），然后用 Grid / Flex 在宽屏上做<b>视觉重排</b>。这样两个顺序在最重要的场景下天然一致，重排只发生在"空间充裕、肉眼可见"的情形里。第 4 章的 <code>grid-template-areas</code> 之所以被称为"布局契约"，正是因为它的使用方式天然符合这条规则。',
          en: '<b>A rule that is sufficient in practice</b>: author DOM order for <b>the most linear version</b> (usually the phone single-column layout, or "most important first"), then reorder <b>visually</b> with grid or flex on wide screens. The two orders then agree by construction in the most critical scenario, and reordering only happens where there is visible space. This is exactly why <code>grid-template-areas</code> from Chapter 4 deserves the name "layout contract".'
        } },
        { case: {
          title: { zh: '案例诊断：问题 ⑧ 用 order 挪动侧栏', en: 'Case diagnosis: defect ⑧ moving the sidebar with order' },
          zh: 'v1 为了让侧栏在桌面上出现在右边，给侧栏加了 <code>order: 2</code>、给主区加了 <code>order: 1</code>（DOM 里侧栏在前）。结果是：<b>视觉上</b>侧栏在右、主区在左（符合设计稿）；<b>键盘上</b>Tab 会先进入侧栏的搜索框和筛选器，再跳到主区，然后按视觉顺序回到右侧——用户会觉得"焦点在乱跳"，而屏幕阅读器会把侧栏读在正文之前，语义完全颠倒。v2 的做法是<b>把 DOM 顺序改成"主区在前"</b>（也就是手机版的阅读顺序），桌面端用 <code>grid-template-areas</code> 把侧栏放到右侧，两个顺序从此一致。',
          en: 'To put the sidebar on the right on desktop, v1 adds <code>order: 2</code> to the sidebar and <code>order: 1</code> to the main area (while the DOM has the sidebar first). The result: <b>visually</b> the sidebar is right and the main area left (matching the design); <b>on the keyboard</b>, Tab enters the sidebar’s search box and filters first, then jumps to the main area and back to the right — the focus appears to jump randomly — and a screen reader reads the sidebar before the body copy, inverting the semantics. The v2 fix is to <b>put the main area first in the DOM</b> (which is also the phone reading order) and place the sidebar on the right with <code>grid-template-areas</code>, so both orders agree.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 用 Grid 重排，而不是用 order 打乱', en: 'Key code ① Reorder with grid, not with order' },
          purpose: {
            zh: '同样的视觉效果，一种写法破坏可访问性，另一种不会。差别只在于改的是"位置"还是"顺序"。',
            en: 'The same visual result: one implementation breaks accessibility, the other does not. The difference is whether you change position or sequence.'
          },
          lang: 'css',
          code: {
            zh: `/* ❌ v1：DOM 里 side 在前，用 order 把它挤到右边 —— 焦点顺序跟着 DOM 走，于是乱跳 */
.layout { display: flex; }
.layout > .main { order: 1; }
.layout > .side { order: 2; }

/* ✅ v2：DOM 里 main 在前（= 手机阅读顺序），桌面端用 areas 放到右边 */
.layout {
  display: grid;
  grid-template-areas: "main side";
  grid-template-columns: minmax(0, 1fr) 15rem;
  gap: var(--space-6);
}
.layout > .main { grid-area: main; min-width: 0; }
.layout > .side { grid-area: side; }

/* DOM：
   <main class="main">…</main>
   <aside class="side">…</aside>     ← 侧栏在后，键盘在正文之后到达 */

/* ⭐ 关键点：手机单列时无需任何 CSS 改动 —— areas 换成单列即可，
   DOM 顺序始终是"正文 → 侧栏"，两个顺序永远一致 */`,
            en: `/* ❌ v1: side comes first in the DOM and order pushes it right — focus follows the DOM, so it jumps */
.layout { display: flex; }
.layout > .main { order: 1; }
.layout > .side { order: 2; }

/* ✅ v2: main comes first in the DOM (= the phone reading order); areas place the sidebar right on desktop */
.layout {
  display: grid;
  grid-template-areas: "main side";
  grid-template-columns: minmax(0, 1fr) 15rem;
  gap: var(--space-6);
}
.layout > .main { grid-area: main; min-width: 0; }
.layout > .side { grid-area: side; }

/* DOM:
   <main class="main">…</main>
   <aside class="side">…</aside>     ← sidebar later, so the keyboard reaches it after the body */

/* ⭐ Key point: the phone single-column layout needs no extra CSS — just switch the areas,
   and DOM order stays "body → sidebar", so the two orders never diverge */`
          },
          points: {
            zh: '<b>为什么"改位置"比"改顺序"安全？</b>因为 Grid 只改变元素<b>画在哪里</b>，不改变它在文档里的<b>次序</b>；而 <code>order</code> / <code>row-reverse</code> 改变的是<i>布局算法内部的排序</i>，于是视觉顺序与文档顺序同时被改写、彼此脱节。<b>经验法则</b>：需要在多个屏幕尺寸下切换顺序时，用 Grid 的 areas；只为了"微调位置"时，用 <code>margin</code> 或对齐属性，别动顺序。',
            en: '<b>Why is changing position safer than changing sequence?</b> Grid only changes <b>where</b> an element is painted, not <b>when</b> it occurs in the document; <code>order</code> and <code>row-reverse</code> change the ordering <i>inside the layout algorithm</i>, so the visual order is rewritten while the document order is not, and the two come apart. <b>Rule of thumb</b>: switch order across screen sizes with grid areas; for pure positioning use margins or alignment properties and leave sequence alone.'
          }
        },
        {
          title: { zh: '关键代码 ② 让隐藏的内容真的"消失"', en: 'Key code ② Make hidden content actually disappear' },
          purpose: {
            zh: '响应式布局经常要"藏起一部分"，藏的方式决定了它会不会被读到、会不会被 Tab 到。',
            en: 'Responsive layouts constantly hide things; how you hide decides whether it is still announced or still focusable.'
          },
          lang: 'css',
          code: {
            zh: `/* ❌ 位移出屏幕：内容仍然在可访问性树里，Tab 仍能聚焦，屏幕阅读器仍会朗读 */
.offscreen { position: absolute; left: -9999px; }

/* ❌ 高度为 0 + overflow hidden：有些辅助技术仍会读到 */
.collapsed { height: 0; overflow: hidden; }

/* ✅ 真正移除：display: none（从可访问性树中移除，不可聚焦） */
.hidden { display: none; }

/* ✅ 视觉隐藏但保留给屏幕阅读器（用于"跳到主内容"这类链接） */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* ⭐ 关键点：响应式隐藏要"成对"——宽屏藏掉的导航，窄屏必须有等价入口 */
@media (min-width: 64rem) { .nav-drawer-toggle { display: none; } }`,
            en: `/* ❌ Pushed off-screen: still in the accessibility tree, still focusable, still announced */
.offscreen { position: absolute; left: -9999px; }

/* ❌ Zero height with overflow hidden: some assistive tech still reads it */
.collapsed { height: 0; overflow: hidden; }

/* ✅ Truly removed: display: none (out of the accessibility tree, not focusable) */
.hidden { display: none; }

/* ✅ Visually hidden but available to screen readers (for a "skip to content" link) */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* ⭐ Key point: responsive hiding must come in pairs — whatever the wide layout hides,
   the narrow layout must offer an equivalent route to */
@media (min-width: 64rem) { .nav-drawer-toggle { display: none; } }`
          },
          points: {
            zh: '<code>.sr-only</code> 这个模式值得记住：它是"给屏幕阅读器的，不给眼睛的"内容。典型用法是页面开头的"跳到主要内容"链接（键盘用户按 Tab 第一下就能跳过导航），以及图标按钮的文本标签。<b>坑</b>：不要用它来"藏"不应该存在的内容——如果一段内容对辅助技术也毫无意义（比如纯装饰图形），正确的做法是 <code>aria-hidden="true"</code> 加空 <code>alt</code>，而不是视觉隐藏。',
            en: 'The <code>.sr-only</code> pattern is worth remembering: content for screen readers but not for the eyes. Typical uses are a "skip to content" link at the top of the page (one Tab press lets keyboard users bypass the navigation) and text labels for icon buttons. <b>Pitfall</b>: do not use it to hide content that should not exist at all — if something is meaningless to assistive tech too (a purely decorative graphic), the correct answer is <code>aria-hidden="true"</code> with an empty <code>alt</code>, not visual hiding.'
          }
        }
      ],
      demo: {
        key: 'd-6-1',
        hint: {
          zh: '切换"用 order 强改顺序"与"用 grid 重排"，实时对比三套顺序（DOM 顺序 / 视觉顺序 / 焦点顺序）；点"播放 Tab 顺序"会真的依次聚焦每个元素，看焦点是否与视觉顺序一致。',
          en: 'Switch between "reorder with order" and "reorder with grid" and compare three orders live: DOM order, visual order and focus order. "Play tab order" really focuses each element in turn so you can see whether focus follows what you see.'
        }
      }
    },

    /* =========================================================
     * 6.2
     * ======================================================= */
    {
      id: 'ch-6-2',
      num: '6.2',
      title: { zh: '缩放、重排与可访问性的硬指标', en: 'Zoom, reflow and the hard accessibility criteria' },
      subtitle: {
        zh: '四条可以自动化检查的标准：Reflow、Resize Text、Text Spacing、Target Size。它们把"布局好不好"变成"能不能通过"。',
        en: 'Four criteria you can check automatically: Reflow, Resize Text, Text Spacing and Target Size. They turn "is this layout good" into "does it pass".'
      },
      explain: [
        { p: {
          zh: '布局的可访问性问题大多不是"能不能用"，而是<b>在特定条件下能不能用</b>：放大到 200% 字号、把视口压到 320px、用户用了自定义的文本间距、用户强制使用高对比度模式。WCAG 把这些条件写成了可测的标准，于是布局有了明确的验收线。',
          en: 'Layout accessibility problems are rarely about "does it work" and almost always about <b>whether it still works under specific conditions</b>: 200% text, a 320px viewport, a user’s custom text spacing, forced high-contrast mode. WCAG turns those conditions into testable criteria, which gives layout a concrete acceptance line.'
        } },
        { table: {
          head: [{ zh: '标准', en: 'Criterion' }, { zh: '要求', en: 'Requirement' }, { zh: '怎么测', en: 'How to test' }, { zh: '布局上怎么满足', en: 'Layout answer' }],
          rows: [
            [{ zh: '<b>1.4.10 重排</b><br />Reflow (AA)', en: '<b>1.4.10 Reflow</b><br />(AA)' }, { zh: '在 320px 宽度（相当于 400% 缩放）下，内容不需要双向滚动即可阅读', en: 'At 320px wide (equivalent to 400% zoom) content is readable without scrolling in two directions' }, { zh: '把视口设成 320px，检查有没有横向滚动条', en: 'Set the viewport to 320px and check for a horizontal scrollbar' }, { zh: '用相对单位、<code>min(100%, …)</code>、<code>auto-fit</code>、<code>min-width: 0</code>；避免固定宽度与绝对定位', en: 'Relative units, <code>min(100%, …)</code>, <code>auto-fit</code>, <code>min-width: 0</code>; avoid fixed widths and absolute positioning' }],
            [{ zh: '<b>1.4.4 调整文本大小</b><br />Resize Text (AA)', en: '<b>1.4.4 Resize Text</b><br />(AA)' }, { zh: '文本可放大到 200% 而不丢失内容或功能', en: 'Text can be resized to 200% without loss of content or functionality' }, { zh: '浏览器缩放 200%，或把根字号调到 32px', en: 'Zoom the browser to 200%, or set the root font size to 32px' }, { zh: '用 <code>rem</code> / <code>em</code> 而不是 <code>px</code>；<code>clamp()</code> 的上下限也要用 <code>rem</code>', en: 'Use <code>rem</code>/<code>em</code> rather than <code>px</code>; express <code>clamp()</code> bounds in <code>rem</code> too' }],
            [{ zh: '<b>1.4.12 文本间距</b><br />Text Spacing (AA)', en: '<b>1.4.12 Text Spacing</b><br />(AA)' }, { zh: '用户设置行高 1.5×、段距 2×、字距 0.12em、词距 0.16em 时，内容不丢失', en: 'No loss of content when the user sets line height 1.5×, paragraph spacing 2×, letter spacing 0.12em and word spacing 0.16em' }, { zh: '注入这些样式，检查是否截断或重叠', en: 'Inject those styles and check for clipping or overlap' }, { zh: '不用固定高度装文本；容器高度交给内容（第 2 章）', en: 'Never use a fixed height for text containers; let content own the height (Chapter 2)' }],
            [{ zh: '<b>2.5.8 目标尺寸</b><br />Target Size (AA)', en: '<b>2.5.8 Target Size</b><br />(AA)' }, { zh: '指针目标至少 24×24px（2.5.5 AAA 要求 44×44px）', en: 'Pointer targets at least 24×24px (2.5.5 AAA asks for 44×44px)' }, { zh: '量所有按钮/链接的包围盒', en: 'Measure the bounding box of every button and link' }, { zh: '用 padding 而不是只靠文字尺寸撑开目标', en: 'Use padding to grow the target instead of relying on the text size' }]
          ]
        } },
        { theory: {
          zh: '<b>为什么是 320px？</b>因为 1280px 的视口放大到 400% 时，逻辑宽度正好是 320px——也就是说 320px 这一条标准实际上在保护<b>低视力用户使用桌面浏览器放大</b>的场景，而不仅是小屏手机。同理，"200% 字号"保护的是把系统默认字号调大的用户（这在低视力与老年用户中非常普遍）。<b>这些标准的共同点：它们都在测试"当用户改变了某个默认值之后，你的布局还在不在"。</b>',
          en: '<b>Why 320px?</b> Because a 1280px viewport at 400% zoom has a logical width of exactly 320px — so this criterion protects <b>low-vision desktop users who zoom</b>, not just small phones. Likewise, "200% text" protects users who raise their system font size, which is very common among low-vision and older users. <b>What these criteria share: they all test whether your layout survives after the user changes a default.</b>',
          cite: {
            zh: 'WCAG 2.2 1.4.10 / 1.4.4 / 1.4.12 / 2.5.8；W3C《Understanding Success Criterion 1.4.10 Reflow》',
            en: 'WCAG 2.2 1.4.10 / 1.4.4 / 1.4.12 / 2.5.8; W3C "Understanding Success Criterion 1.4.10 Reflow"'
          }
        } },
        { note: {
          zh: '<b>把可访问性检查变成构建流程的一部分。</b>这四条标准都可以自动化：横向溢出用 <code>scrollWidth &gt; clientWidth</code> 检测、点击目标量 <code>getBoundingClientRect()</code>、文本间距用注入样式表检测、放大用根字号变化检测。6.2 的演示把这四条做成了一个"压力测试台"，你可以先在自己的页面上跑一遍，再决定哪里需要改。',
          en: '<b>Make accessibility checks part of the build.</b> All four criteria can be automated: horizontal overflow via <code>scrollWidth &gt; clientWidth</code>, target size via <code>getBoundingClientRect()</code>, text spacing via an injected stylesheet, and zoom via a root font-size change. The 6.2 demo assembles them into a stress-test bench you can run against your own page before deciding what to fix.'
        } },
        { case: {
          title: { zh: '案例诊断：v1 的四条标准全部不合格', en: 'Case diagnosis: v1 fails all four criteria' },
          zh: '用 6.2 的压力测试台跑 CourseHub v1：<b>1.4.10</b> 在 320px 下横向溢出 860px（固定宽度容器）；<b>1.4.4</b> 根字号调到 32px 后卡片标题被两行截断（固定行高）；<b>1.4.12</b> 注入文本间距后导航项重叠（固定高度导航）；<b>2.5.8</b> 导航链接高 18px（只有内边距 2px）。四条全部不合格。v2 用第 2–5 章的手段逐条修复，压力测试台全部通过。',
          en: 'Running the 6.2 bench against CourseHub v1: <b>1.4.10</b> overflows horizontally by 860px at 320px (fixed-width container); <b>1.4.4</b> at a 32px root font size the card titles are clipped to two lines (fixed line height); <b>1.4.12</b> with injected text spacing the nav items overlap (fixed-height nav); <b>2.5.8</b> nav links are 18px tall (only 2px of padding). All four fail. Version 2 fixes them with the techniques from Chapters 2–5 and passes the whole bench.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 一行 CSS：让布局能扛住用户的自定义', en: 'Key code ① One line that makes layouts survive user overrides' },
          purpose: {
            zh: '对抗"用户把我的样式改了"的最好办法，是一开始就不写脆弱的样式。',
            en: 'The best defence against "the user changed my styles" is to avoid brittle styles in the first place.'
          },
          lang: 'css',
          code: {
            zh: `/* ⭐ 关键点 ①：文本容器永远不要写死高度 —— 这是 1.4.4 与 1.4.12 的共同底线 */
.card__title { min-height: 0; }        /* 允许它长高 */
.truncate-2 { -webkit-line-clamp: 2; } /* 如果确实要截断，明确写出来并给出 title 属性 */

/* ⭐ 关键点 ②：字号与间距全部用相对单位，用户的根字号设置才能生效 */
:root { font-size: 100%; }             /* 不要写 font-size: 16px —— 那会锁定用户设置 */
h1 { font-size: clamp(1.75rem, 1.1rem + 2.4vw, 3rem); }
.section { padding-block: clamp(2rem, 5vw, 4rem); }

/* ⭐ 关键点 ③：给所有可点击元素一个"物理下限"的点击区域（2.5.8） */
a.inline-link, .icon-btn {
  display: inline-flex;
  align-items: center;
  min-height: 24px;                    /* AA；移动端建议 44px */
  padding-block: 6px;
}
.icon-btn { min-width: 24px; justify-content: center; }

/* ⭐ 关键点 ④：长内容永远不要撑破容器（1.4.10 的地板） */
* { min-width: 0; }
img, video, table { max-width: 100%; }`,
            en: `/* ⭐ Key point ①: never give a text container a fixed height — the shared floor of 1.4.4 and 1.4.12 */
.card__title { min-height: 0; }        /* let it grow */
.truncate-2 { -webkit-line-clamp: 2; } /* if you really must clip, do it explicitly and add a title attribute */

/* ⭐ Key point ②: express type and spacing in relative units so the user’s root font size applies */
:root { font-size: 100%; }             /* never font-size: 16px — that locks the user’s setting */
h1 { font-size: clamp(1.75rem, 1.1rem + 2.4vw, 3rem); }
.section { padding-block: clamp(2rem, 5vw, 4rem); }

/* ⭐ Key point ③: give every clickable thing a physical minimum target (2.5.8) */
a.inline-link, .icon-btn {
  display: inline-flex;
  align-items: center;
  min-height: 24px;                    /* AA; 44px is recommended on touch */
  padding-block: 6px;
}
.icon-btn { min-width: 24px; justify-content: center; }

/* ⭐ Key point ④: long content must never break the container (the floor of 1.4.10) */
* { min-width: 0; }
img, video, table { max-width: 100%; }`
          },
          points: {
            zh: '<b>关于 <code>* { min-width: 0 }</code></b>：这是一个有争议但有效的全局兜底。它解决的是第 3 章那个 flex/grid 项目的隐含最小尺寸问题，代价是可能让某些确实需要"最小内容宽度"的元素被压得过窄。<b>更精确的做法</b>是只在可能装长内容的容器上加（卡片、列表项、<code>td</code>）。<b>关于 <code>:root { font-size: 100% }</code></b>：它把根字号交还给用户设置；如果你写 <code>16px</code>，用户把系统字号调到 20px 时页面纹丝不动——这正是 1.4.4 想避免的情况。',
            en: '<b>On <code>* { min-width: 0 }</code></b>: a debatable but effective global floor. It solves the implicit minimum size of flex and grid items from Chapter 3, at the cost of letting some elements be squeezed narrower than they need. <b>More precise</b>: apply it only to containers that may hold long content (cards, list items, <code>td</code>). <b>On <code>:root { font-size: 100% }</code></b>: it hands the root size back to the user’s setting. Writing <code>16px</code> means a user who sets 20px sees no change at all — exactly what 1.4.4 exists to prevent.'
          }
        },
        {
          title: { zh: '关键代码 ② 可访问性回归测试脚本（可直接用）', en: 'Key code ② An accessibility regression script you can actually use' },
          purpose: {
            zh: '把四条标准写成可以重复运行的检查，改完代码跑一次就知道有没有退步。',
            en: 'Turn the four criteria into repeatable checks so a change that regresses them is caught immediately.'
          },
          lang: 'js',
          code: {
            zh: `// ⭐ 关键点 ①：横向溢出（WCAG 1.4.10）—— 在 320px 容器里量
function checkReflow(root) {
  const before = root.style.width;
  root.style.width = '320px';
  const doc = root.ownerDocument.scrollingElement;
  const overflow = doc.scrollWidth - doc.clientWidth;   // > 0 即不合格
  root.style.width = before;
  return overflow <= 1;
}

// ⭐ 关键点 ②：点击目标尺寸（WCAG 2.5.8）
function checkTargets(root, min = 24) {
  return Array.from(root.querySelectorAll('a, button, input, select'))
    .filter(el => el.offsetParent !== null)              // 只看可见元素
    .map(el => { const r = el.getBoundingClientRect(); return { el, w: r.width, h: r.height }; })
    .filter(t => t.h < min || t.w < min);                // 返回不合格清单
}

// ⭐ 关键点 ③：文本间距（WCAG 1.4.12）—— 注入样式后看是否溢出
function checkTextSpacing(root) {
  const s = document.createElement('style');
  s.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important;' +
                  '    word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }';
  document.head.append(s);
  const clipped = Array.from(root.querySelectorAll('*'))
    .filter(el => el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflow !== 'visible');
  s.remove();
  return clipped;
}`,
            en: `// ⭐ Key point ①: horizontal overflow (WCAG 1.4.10) — measured inside a 320px container
function checkReflow(root) {
  const before = root.style.width;
  root.style.width = '320px';
  const doc = root.ownerDocument.scrollingElement;
  const overflow = doc.scrollWidth - doc.clientWidth;   // anything > 0 fails
  root.style.width = before;
  return overflow <= 1;
}

// ⭐ Key point ②: target size (WCAG 2.5.8)
function checkTargets(root, min = 24) {
  return Array.from(root.querySelectorAll('a, button, input, select'))
    .filter(el => el.offsetParent !== null)              // visible only
    .map(el => { const r = el.getBoundingClientRect(); return { el, w: r.width, h: r.height }; })
    .filter(t => t.h < min || t.w < min);                // the failing list
}

// ⭐ Key point ③: text spacing (WCAG 1.4.12) — inject the overrides and look for clipping
function checkTextSpacing(root) {
  const s = document.createElement('style');
  s.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important;' +
                  '    word-spacing: 0.16em !important; } p { margin-block-end: 2em !important; }';
  document.head.append(s);
  const clipped = Array.from(root.querySelectorAll('*'))
    .filter(el => el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflow !== 'visible');
  s.remove();
  return clipped;
}`
          },
          points: {
            zh: '这三个函数是"布局的可访问性单测"。把它们接进 CI（比如在 Playwright 里跑一遍），任何"顺手加了个固定高度"的提交都会立刻被发现。<b>坑</b>：<code>checkReflow</code> 里把宽度设成 320px 只对<b>局部容器</b>有意义；如果要测整个页面，应该用浏览器视口（<code>page.setViewportSize</code>），因为媒体查询会参与布局，而在一个 320px 的 div 里媒体查询并不会变。这是 6.2 演示里两种模式的区别（测试的是组件还是整页）。',
            en: 'These three functions are unit tests for layout accessibility. Wiring them into CI (running them in Playwright, say) means a stray fixed height gets caught in the next commit. <b>Pitfall</b>: setting the width to 320px in <code>checkReflow</code> only makes sense for a <b>local container</b>; to test a whole page, resize the browser viewport (<code>page.setViewportSize</code>), because media queries participate in layout and they do not change inside a 320px div. That distinction — testing a component versus a page — is exactly what the two modes in the 6.2 demo contrast.'
          }
        }
      ],
      demo: {
        key: 'd-6-2',
        hint: {
          zh: '一键施加四种可访问性压力（320px 重排 / 200% 字号 / 文本间距增强 / 高对比度），自动检测横向溢出、内容截断、点击目标过小与对比度不足，并给出 WCAG 条目号与修复建议。切换"组件测试 / 整页测试"模式看两者差别。',
          en: 'Apply four accessibility stresses in one click (320px reflow, 200% text, enhanced text spacing, high contrast) and get automatic detection of horizontal overflow, clipped content, undersized targets and low contrast — each labelled with its WCAG criterion and a suggested fix. Switch between component and whole-page test modes to see the difference.'
        }
      }
    },

    /* =========================================================
     * 6.3
     * ======================================================= */
    {
      id: 'ch-6-3',
      num: '6.3',
      title: { zh: '综合案例：CourseHub 从 v1 到 v2', en: 'The full case: CourseHub from v1 to v2' },
      subtitle: {
        zh: '把六章的诊断连起来看一遍：8 个病灶、8 个解法、一份可以直接拿去用的布局评审清单。',
        en: 'All six chapters in one pass: eight defects, eight fixes, and a layout review checklist you can take to work.'
      },
      explain: [
        { p: {
          zh: '这一节不引入新知识，只做一件事：<b>把前面的诊断串成一条完整的改造链</b>。下面的对照表就是 CourseHub 的项目交付说明，每一行都可以点开对应的章节复习。',
          en: 'This section introduces nothing new. It does one thing: <b>chains the earlier diagnoses into a single rebuild narrative</b>. The table below is the delivery note for the CourseHub project, and every row links back to its chapter.'
        } },
        { table: {
          head: [
            { zh: '病灶', en: 'Defect' },
            { zh: 'v1 的写法', en: 'What v1 did' },
            { zh: 'v2 的解法', en: 'What v2 does' },
            { zh: '依据', en: 'Source' }
          ],
          rows: [
            [{ zh: '① 层次缺失', en: '① No hierarchy' }, { zh: '所有文字 16px', en: 'Everything at 16px' }, { zh: '模数尺度 + CTA 块面/字重升级', en: 'Modular scale plus a solid, heavier CTA' }, { zh: '第 1 章', en: 'Ch 1' }],
            [{ zh: '② 间距无系统', en: '② Arbitrary spacing' }, { zh: '21/13/37px 随手写', en: '21/13/37px by hand' }, { zh: '8pt 间距 token（24/32/64）', en: '8pt spacing tokens (24/32/64)' }, { zh: '第 1 章', en: 'Ch 1' }],
            [{ zh: '③ 绝对定位摆盒子', en: '③ Absolute positioning' }, { zh: 'header 写死 120px', en: 'Header fixed at 120px' }, { zh: '正常流 + <code>min-height</code> + flex 居中', en: 'Normal flow, <code>min-height</code>, flex centring' }, { zh: '第 2 章', en: 'Ch 2' }],
            [{ zh: '④ 空格对齐导航', en: '④ Space-hacked nav' }, { zh: '<code>&amp;nbsp;</code> + 固定宽度', en: '<code>&amp;nbsp;</code> plus fixed widths' }, { zh: 'flex + <code>gap</code> + <code>margin-inline-start:auto</code>', en: 'flex, <code>gap</code>, <code>margin-inline-start:auto</code>' }, { zh: '第 3 章', en: 'Ch 3' }],
            [{ zh: '⑤ 卡片不齐 / 图片撑破', en: '⑤ Uneven cards, breaking images' }, { zh: '<code>float</code> + 固定宽度', en: '<code>float</code> plus fixed widths' }, { zh: '等高 flex 卡片 + <code>min-width:0</code> + <code>max-width:100%</code>', en: 'Equal-height flex cards, <code>min-width:0</code>, <code>max-width:100%</code>' }, { zh: '第 3 章', en: 'Ch 3' }],
            [{ zh: '⑥ padding 假装网格', en: '⑥ Fake grid' }, { zh: '<code>padding-left: 5%</code>', en: '<code>padding-left: 5%</code>' }, { zh: '12 栏 Grid + <code>span</code> + 调试叠层', en: '12-column grid, spans, debug overlay' }, { zh: '第 4 章', en: 'Ch 4' }],
            [{ zh: '⑦ 只做桌面端', en: '⑦ Desktop only' }, { zh: '固定 1180px 容器', en: 'Fixed 1180px container' }, { zh: '内容驱动断点 + 容器查询 + <code>clamp()</code>', en: 'Content-driven breakpoints, container queries, <code>clamp()</code>' }, { zh: '第 5 章', en: 'Ch 5' }],
            [{ zh: '⑧ DOM 与视觉顺序不一致', en: '⑧ DOM ≠ visual order' }, { zh: '<code>order</code> 挪侧栏', en: '<code>order</code> moves the sidebar' }, { zh: 'DOM 按阅读顺序 + <code>grid-template-areas</code> 重排', en: 'DOM in reading order plus <code>grid-template-areas</code>' }, { zh: '第 6 章', en: 'Ch 6' }]
          ]
        } },
        { h: { zh: '布局评审清单（可以直接拿去用）', en: 'Layout review checklist (ready to use)' } },
        { ol: [
          { zh: '<b>层次</b>：眯眼看首屏，能不能在 3 秒内说出"第一重要的是什么"？', en: '<b>Hierarchy</b>: squint at the first screen — can you say what is most important within three seconds?' },
          { zh: '<b>间距</b>：页面里是否存在不在间距尺度上的数字？组间距是否明显大于组内间距？', en: '<b>Spacing</b>: is there any value that is not on the spacing scale? Is between-group spacing clearly larger than within-group?' },
          { zh: '<b>弹性</b>：把最长的一段文案换成两倍长度，版面还成立吗？', en: '<b>Flexibility</b>: double the longest piece of copy — does the layout still hold?' },
          { zh: '<b>内容驱动</b>：是否存在写死的容器宽度或高度？把视口拖到 320px 有没有横向滚动条？', en: '<b>Content-driven</b>: are there fixed container widths or heights? Does 320px produce a horizontal scrollbar?' },
          { zh: '<b>二维对齐</b>：同一区块内的元素是否共享对齐线？网格边界能不能被"看见"？', en: '<b>Two-dimensional alignment</b>: do elements in a section share alignment lines? Can you <b>see</b> the grid edges?' },
          { zh: '<b>可访问性</b>：键盘 Tab 一遍，顺序是否与视觉顺序一致？放大到 200% 有没有内容丢失？点击目标是否 ≥ 24px？', en: '<b>Accessibility</b>: tab through — does focus follow visual order? Does 200% zoom lose content? Are targets at least 24px?' },
          { zh: '<b>可维护性</b>：删掉一个元素后，需要改几个地方？如果超过 2 处，说明有信息被重复描述了。', en: '<b>Maintainability</b>: how many places must change when one element is removed? More than two means a fact is described twice.' }
        ] },
        { note: {
          zh: '<b>整套课程的一句话总结</b>：布局的本质是"把信息结构翻译成空间结构"。浏览器提供了两套翻译机制：<b>一维的流动（正常流、Flex）与二维的网格（Grid）</b>；而判断"翻译得好不好"的标准不是好看，而是<b>它在内容变化、屏幕变化、用户状态变化时，是否仍然成立</b>。',
          en: '<b>The whole course in one sentence</b>: layout is the translation of information structure into spatial structure. The browser offers two translation mechanisms — <b>one-dimensional flow (normal flow, flex) and two-dimensional grids (grid)</b> — and the test of a good translation is not beauty but <b>whether it still holds when the content changes, the screen changes, and the user’s condition changes</b>.'
        } },
        { case: {
          title: { zh: 'v1 → v2 的最终对比', en: 'The final v1 → v2 comparison' },
          zh: '演示里的 before/after 拖拽对比用的是<b>同一份 HTML</b>，只有 CSS 不同：文案、卡片数量、结构完全一致。这是本课程最重要的一个证据——<b>版面质量的差异可以完全来自布局决策，而不是内容或设计稿。</b>把分割线从最左拖到最右，可以看到 8 个病灶被逐个消除的过程。',
          en: 'The before/after slider in the demo uses <b>the same HTML</b>; only the CSS differs. The copy, the number of cards and the structure are identical. That is the most important piece of evidence in this course: <b>the entire difference in quality comes from layout decisions, not from content or from the design file.</b> Drag the divider from far left to far right and watch the eight defects disappear one by one.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① v2 的布局样式表（骨架总览）', en: 'Key code ① The v2 layout stylesheet (the whole skeleton)' },
          purpose: {
            zh: '六章的结论合起来其实很短：一套 token、一个 grid 骨架、几个原语。',
            en: 'Six chapters of conclusions compress into something short: one token set, one grid skeleton, a few primitives.'
          },
          lang: 'css',
          code: {
            zh: `/* ⭐ 关键点 ①：设计 token（第 1 章） */
:root {
  --space-1: .5rem; --space-4: 1rem; --space-6: 2rem; --space-8: 4rem;
  --step-1: 1.25rem; --step-3: clamp(1.375rem, 1rem + 1.2vw, 2rem);
}
/* ⭐ 关键点 ②：盒模型与地板（第 2 章） */
*, *::before, *::after { box-sizing: border-box; }
img, video { display: block; max-width: 100%; height: auto; }

/* ⭐ 关键点 ③：整页骨架用 Grid（第 4 章）+ DOM 按阅读顺序（第 6 章） */
.layout {
  display: grid;
  grid-template-areas: "header header" "main side" "footer footer";
  grid-template-columns: minmax(0, 1fr) 15rem;
  gap: var(--space-6);
  max-inline-size: min(100% - 2rem, 72rem);
  margin-inline: auto;
}
.layout > .site-main { grid-area: main; min-width: 0; }
.layout > .site-side { grid-area: side; }

/* ⭐ 关键点 ④：组件内部用 Flex（第 3 章）；自适应数量用 auto-fit（第 4 章）；原语（第 5 章） */
.card-wall { display: grid; gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); }
.card { display: flex; flex-direction: column; gap: var(--space-2); min-width: 0; }
.card__body { flex: 1; }
.card__cta { margin-block-start: auto; }

/* ⭐ 关键点 ⑤：窄屏只需要改 areas（第 4 章） */
@media (max-width: 40rem) {
  .layout { grid-template-areas: "header" "main" "side" "footer";
            grid-template-columns: minmax(0, 1fr); }
}`,
            en: `/* ⭐ Key point ①: design tokens (Ch 1) */
:root {
  --space-1: .5rem; --space-4: 1rem; --space-6: 2rem; --space-8: 4rem;
  --step-1: 1.25rem; --step-3: clamp(1.375rem, 1rem + 1.2vw, 2rem);
}
/* ⭐ Key point ②: box model and the floor (Ch 2) */
*, *::before, *::after { box-sizing: border-box; }
img, video { display: block; max-width: 100%; height: auto; }

/* ⭐ Key point ③: page skeleton in grid (Ch 4), DOM in reading order (Ch 6) */
.layout {
  display: grid;
  grid-template-areas: "header header" "main side" "footer footer";
  grid-template-columns: minmax(0, 1fr) 15rem;
  gap: var(--space-6);
  max-inline-size: min(100% - 2rem, 72rem);
  margin-inline: auto;
}
.layout > .site-main { grid-area: main; min-width: 0; }
.layout > .site-side { grid-area: side; }

/* ⭐ Key point ④: flex inside components (Ch 3); auto-fit (Ch 4); primitives (Ch 5) */
.card-wall { display: grid; gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); }
.card { display: flex; flex-direction: column; gap: var(--space-2); min-width: 0; }
.card__body { flex: 1; }
.card__cta { margin-block-start: auto; }

/* ⭐ Key point ⑤: narrow screens only need different areas (Ch 4) */
@media (max-width: 40rem) {
  .layout { grid-template-areas: "header" "main" "side" "footer";
            grid-template-columns: minmax(0, 1fr); }
}`
          },
          points: {
            zh: '整份骨架没有一个魔法数字、没有一处绝对定位、没有一条"靠 padding 凑"的对齐。<b>这就是这六章想要的终点</b>：布局代码几乎可以当作文档读——你能从 <code>grid-template-areas</code> 看出页面结构，从 <code>--space-*</code> 看出间距系统，从 <code>auto-fit</code> 看出它在任何宽度下都成立。',
            en: 'There is not one magic number, no absolute positioning and no padding-based fake alignment in the whole skeleton. <b>This is the destination the six chapters aim at</b>: layout code that reads like documentation — you can see the page structure in <code>grid-template-areas</code>, the spacing system in <code>--space-*</code>, and the guarantee that it works at any width in <code>auto-fit</code>.'
          }
        },
        {
          title: { zh: '关键代码 ② 布局评审清单的可执行版本', en: 'Key code ② An executable version of the review checklist' },
          purpose: {
            zh: '把清单变成脚本，评审就不再依赖"记得检查"。',
            en: 'Turn the checklist into a script so review no longer depends on remembering to check.'
          },
          lang: 'js',
          code: {
            zh: `// ⭐ 关键点 ①：一次性跑完"布局评审清单"的自动化部分
export function reviewLayout(page) {
  return page.evaluate(() => {
    const issues = [];
    const seen = new Set();

    // (1) 横向溢出（WCAG 1.4.10）
    const doc = document.scrollingElement;
    if (doc.scrollWidth - doc.clientWidth > 1) issues.push('reflow: 横向溢出 ' + (doc.scrollWidth - doc.clientWidth) + 'px');

    // (2) 点击目标（WCAG 2.5.8）
    document.querySelectorAll('a, button, input, select').forEach((el) => {
      if (!el.offsetParent) return;
      const r = el.getBoundingClientRect();
      if (r.height < 24 || r.width < 24) issues.push('target: ' + (el.textContent || el.tagName).trim().slice(0, 18) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
    });

    // (3) 绝对定位的布局元素（第 2 章：只该用于装饰）
    document.querySelectorAll('header, nav, main, aside, section, article').forEach((el) => {
      if (getComputedStyle(el).position === 'absolute') issues.push('absolute: ' + el.tagName.toLowerCase() + ' 用绝对定位参与布局');
    });

    // (4) 不在 8pt 尺度上的间距（第 1 章）
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      ['rowGap', 'columnGap'].forEach((p) => {
        const v = parseFloat(cs[p]);
        if (v > 0 && v % 4 !== 0 && !seen.has(el)) { seen.add(el); issues.push('spacing: gap ' + v + 'px 不在 4pt 尺度上'); }
      });
    });
    return issues;
  });
}`,
            en: `// ⭐ Key point ①: run the automatable part of the layout review checklist in one go
export function reviewLayout(page) {
  return page.evaluate(() => {
    const issues = [];
    const seen = new Set();

    // (1) horizontal overflow (WCAG 1.4.10)
    const doc = document.scrollingElement;
    if (doc.scrollWidth - doc.clientWidth > 1) issues.push('reflow: horizontal overflow ' + (doc.scrollWidth - doc.clientWidth) + 'px');

    // (2) target size (WCAG 2.5.8)
    document.querySelectorAll('a, button, input, select').forEach((el) => {
      if (!el.offsetParent) return;
      const r = el.getBoundingClientRect();
      if (r.height < 24 || r.width < 24) issues.push('target: ' + (el.textContent || el.tagName).trim().slice(0, 18) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    });

    // (3) absolutely positioned layout elements (Ch 2: decoration only)
    document.querySelectorAll('header, nav, main, aside, section, article').forEach((el) => {
      if (getComputedStyle(el).position === 'absolute') issues.push('absolute: ' + el.tagName.toLowerCase() + ' is positioned absolutely in layout');
    });

    // (4) spacing off the 8pt scale (Ch 1)
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      ['rowGap', 'columnGap'].forEach((p) => {
        const v = parseFloat(cs[p]);
        if (v > 0 && v % 4 !== 0 && !seen.has(el)) { seen.add(el); issues.push('spacing: gap ' + v + 'px is off the 4pt scale'); }
      });
    });
    return issues;
  });
}`
          },
          points: {
            zh: '这个脚本是 6.3 演示里"自检清单"的后端逻辑，也是可以放进 CI 的最小可用版本（配合 Playwright 的 <code>page.evaluate</code>）。<b>注意它不是完整审计</b>：层次、可读性、语义正确性无法自动判断。<b>自动化检查负责"守住底线"，人工评审负责"判断上限"</b>——把两者混为一谈是常见的误区。',
            en: 'This script is the logic behind the self-check panel in the 6.3 demo and doubles as a minimal CI version (using Playwright’s <code>page.evaluate</code>). <b>It is not a full audit</b>: hierarchy, readability and semantic correctness cannot be automated. <b>Automated checks hold the floor; human review judges the ceiling</b> — conflating the two is a common mistake.'
          }
        }
      ],
      demo: {
        key: 'd-6-3',
        hint: {
          zh: '拖拽分割线对比 CourseHub v1 / v2（同一份 HTML，只有 CSS 不同）；点击 8 个病灶可跳到对应章节；下方是可交互的布局评审清单，勾选后实时给出分数与"还差哪几项"的提示。',
          en: 'Drag the divider to compare CourseHub v1 and v2 (same HTML, different CSS). Click any of the eight defects to jump to its chapter. Below is an interactive review checklist that scores as you tick, telling you what is still missing.'
        }
      }
    }
  ]
};
