/* =============================================================
 * 第 5 章 · 响应式与内在布局 / Ch 5 · Responsive and Intrinsic Layout
 * 案例病灶：⑦ 只做桌面端
 * ============================================================= */

export default {
  id: 5,
  slug: 'lesson-05',
  num: { zh: '第 5 章', en: 'Chapter 5' },
  title: { zh: '响应式与内在布局', en: 'Responsive and intrinsic layout' },
  subtitle: {
    zh: '断点应该由内容决定，而不是由设备型号决定。更进一步：很多布局根本不需要断点。',
    en: 'Breakpoints should be decided by the content, not by device models. Better still: many layouts need no breakpoints at all.'
  },
  lede: {
    zh: '内容驱动断点、容器查询、内在尺寸与流式排版 —— 从"为 5 种屏幕各写一套"到"写一套、让它自己适应"。',
    en: 'Content-driven breakpoints, container queries, intrinsic sizing and fluid typography — moving from "one layout per screen size" to "one layout that adapts".'
  },
  tags: [
    { zh: '内容驱动断点', en: 'Content-driven breakpoints' },
    { zh: '移动优先', en: 'Mobile first' },
    { zh: '容器查询', en: 'Container queries' },
    { zh: '内在尺寸', en: 'Intrinsic sizing' },
    { zh: 'clamp() 流式排版', en: 'Fluid type with clamp()' },
    { zh: 'Every Layout 原语', en: 'Every Layout primitives' }
  ],
  caseNote: {
    zh: '本章诊断案例的 <b>⑦ 只做桌面端</b>：v1 在 320px 宽度下出现横向滚动条，点击目标小于 24px，字号不随用户缩放变化。',
    en: 'This chapter diagnoses defect <b>⑦ desktop only</b>: at 320px the v1 page scrolls horizontally, tap targets fall below 24px and type does not respond to the user’s zoom setting.'
  },

  sections: [
    /* =========================================================
     * 5.1
     * ======================================================= */
    {
      id: 'ch-5-1',
      num: '5.1',
      title: { zh: '断点由内容决定，而不是由设备决定', en: 'Breakpoints follow the content, not the device' },
      subtitle: {
        zh: '「内容先崩」的那个宽度，才是你真正需要的断点。它可以被测量出来。',
        en: 'The width at which the content breaks is the breakpoint you actually need — and it can be measured.'
      },
      explain: [
        { p: {
          zh: '先看一个有问题的做法：<code>@media (max-width: 375px)</code>、<code>768px</code>、<code>1024px</code>——这是把 iPhone、iPad 的<b>设备宽度</b>写成了断点。问题在于：①同一宽度下的设备千差万别（折叠屏、分屏、浏览器窗口只是被拖窄）；②你的内容<b>不关心</b>设备是什么，它只关心自己有多少空间。',
          en: 'Start with a problematic habit: <code>@media (max-width: 375px)</code>, <code>768px</code>, <code>1024px</code> — device widths turned into breakpoints. Two problems: (1) devices at the same width differ endlessly (foldables, split screens, a desktop window simply dragged narrow); (2) your content <b>does not care</b> what the device is, only how much room it has.'
        } },
        { theory: {
          zh: '<b>内容驱动断点（content-driven breakpoints）</b>：把浏览器从宽到窄慢慢拖，盯着你的组件看，<b>它第一次"看起来不对"的那个宽度</b>就是断点。判断标准是具体的、可观察的：文字行长超过约 90 个字符（东亚文字约 45 个汉字）就难以阅读；卡片窄到标题要断成三行；两个按钮挤在一起；表格出现横向滚动。<br />这套方法把人从"猜设备"变成"测内容"，也自然带来了下一个推论：<b>断点数量应该等于内容失败的次数</b>，而不是约定俗成的 3 个。',
          en: '<b>Content-driven breakpoints</b>: drag the browser from wide to narrow while watching your component. <b>The width at which it first looks wrong</b> is the breakpoint. The criteria are concrete and observable: line length beyond about 90 characters (roughly 45 CJK glyphs) becomes hard to read; a card narrow enough that the title wraps to three lines; two buttons colliding; a table growing a horizontal scrollbar. This turns "guess the device" into "measure the content", which yields the next corollary: <b>the number of breakpoints should equal the number of times the content fails</b>, not a conventional three.',
          cite: {
            zh: 'Andy Bell《Bootcamp》关于内容驱动断点；Ethan Marcotte 2010 提出响应式网页设计',
            en: 'Andy Bell’s writing on content-driven breakpoints in <i>Bootcamp</i>; Ethan Marcotte coined responsive web design in 2010'
          }
        } },
        { h: { zh: '移动优先：为什么顺序不能反过来', en: 'Mobile first: why the order matters' } },
        { p: {
          zh: '<b>移动优先</b>指先写窄屏样式（基础样式），再用 <code>min-width</code> 媒体查询逐步"增强"到宽屏。反过来写（先宽屏、再用 <code>max-width</code> 覆盖成窄屏）会带来三个具体问题：',
          en: '<b>Mobile first</b> means writing narrow-screen styles as the base, then layering wider ones with <code>min-width</code> queries. Writing it the other way (wide first, then overriding down with <code>max-width</code>) causes three concrete problems:'
        } },
        { ul: [
          { zh: '<b>窄屏用户体验最差却写得最晚</b>：最需要照顾的场景反而成为"补丁"。', en: '<b>The worst-served users are written last</b>: the case needing most care becomes the patch.' },
          { zh: '<b>覆盖式 CSS 越写越乱</b>：<code>max-width</code> 规则层层覆盖，最后没人敢删任何一行。', en: '<b>Override CSS rots</b>: <code>max-width</code> rules override one another until nobody dares delete a line.' },
          { zh: '<b>单列布局的性能优势被浪费</b>：窄屏的"单列 + 大间距"往往只需极少 CSS，作为基础样式最省代码。', en: '<b>It wastes the simplicity of single-column</b>: the narrow layout usually needs very little CSS, so it makes the cheapest possible base.' }
        ] },
        { note: {
          zh: '<b>怎么测量自己的断点？</b>打开开发者工具，把视口宽度从 1440 慢慢拖到 320，每次停下来看：①有没有横向滚动条；②每行文字是不是长到读不下去；③有没有元素被压扁到失去可读性；④点击目标是不是小于 24×24px（WCAG 2.5.8）。<b>把这四个"事故点"记下来，它们就是你的断点。</b>5.1 的演示把这件事自动化了：拖动宽度滑杆，它会实时报告"内容在哪些宽度出问题"。',
          en: '<b>How to find your own breakpoints</b>: open devtools and drag the viewport from 1440 down to 320, stopping to check four things: (1) is there a horizontal scrollbar; (2) are any lines too long to read; (3) is anything squashed past legibility; (4) are tap targets below 24×24px (WCAG 2.5.8). <b>Note each failure width — those are your breakpoints.</b> The 5.1 demo automates exactly this: drag the width slider and it reports where the content fails.'
        } },
        { case: {
          title: { zh: '案例诊断：问题 ⑦ 只做桌面端', en: 'Case diagnosis: defect ⑦ desktop only' },
          zh: 'v1 的设计稿只有 1440px 一版，实现时把所有尺寸都写成固定像素：容器 <code>width: 1180px</code>、侧栏 <code>width: 280px</code>、卡片 <code>width: 360px</code>。<b>320px 屏幕上的结果</b>：容器比屏幕宽 860px，出现横向滚动条；卡片被压到 320px 宽但内部 padding 还是 32px，文字只剩很窄一列；导航项之间的点击目标只有 16px 高。用 5.1 的探测器扫描一遍，可以量化地看到这些问题出现在哪些宽度。',
          en: 'The v1 design file has a single 1440px version, implemented with fixed pixels everywhere: container <code>width: 1180px</code>, sidebar <code>width: 280px</code>, cards <code>width: 360px</code>. <b>On a 320px screen</b>: the container is 860px wider than the screen, producing a horizontal scrollbar; cards are squeezed to 320px while keeping 32px of padding, leaving a very narrow column of text; nav targets are only 16px tall. The 5.1 detector quantifies which widths these failures occur at.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 移动优先的骨架', en: 'Key code ① The mobile-first skeleton' },
          purpose: {
            zh: '基础样式 = 最窄屏；媒体查询只做"增强"，不做"修补"。',
            en: 'Base styles are the narrowest layout; queries only enhance, never patch.'
          },
          lang: 'css',
          code: {
            zh: `/* ⭐ 关键点 ①：以下是不带任何媒体查询的基础样式 —— 单列、可伸缩 */
.container {
  width: min(100% - 2 * var(--space-4), 72rem);   /* ⭐ 用 min() 自带两侧留白与最大版心 */
  margin-inline: auto;
}
.card-wall {
  display: grid;
  grid-template-columns: minmax(0, 1fr);         /* 默认单列 */
  gap: var(--space-5);
}

/* ⭐ 关键点 ②：只在"内容需要"时才加断点，且用 min-width 往上增强 */
@media (min-width: 40rem) {                    /* 640px：两列才放得下卡片 */
  .card-wall { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 64rem) {                    /* 1024px：可以容纳侧栏了 */
  .layout { grid-template-areas: "header header" "side main" "footer footer"; }
}

/* ⭐ 关键点 ③：断点值用 em，而不是 px —— 用户放大字号时断点会同步提前 */
@media (min-width: 40em) { /* 在用户字号 20px 时相当于 800px，布局不会"来不及换" */ }`,
            en: `/* ⭐ Key point ①: below is the base, with no media queries at all — single column, fluid */
.container {
  width: min(100% - 2 * var(--space-4), 72rem);   /* ⭐ min() gives side margins and a max width at once */
  margin-inline: auto;
}
.card-wall {
  display: grid;
  grid-template-columns: minmax(0, 1fr);         /* single column by default */
  gap: var(--space-5);
}

/* ⭐ Key point ②: add a breakpoint only when the content asks for it, and enhance upwards with min-width */
@media (min-width: 40rem) {                    /* 640px: two columns now fit */
  .card-wall { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 64rem) {                    /* 1024px: a sidebar fits now */
  .layout { grid-template-areas: "header header" "side main" "footer footer"; }
}

/* ⭐ Key point ③: express breakpoints in em, not px — with a 20px user font size the breakpoint
   arrives earlier in pixels, so the layout is never caught out by zoom */
@media (min-width: 40em) { /* equals 800px at a 20px root font size */ }`
          },
          points: {
            zh: '<b>为什么断点用 <code>em</code>？</b>因为 <code>em</code> 在媒体查询里基准<b>根字体大小</b>，而根字体大小会随用户的浏览器字号设置变化。用户把默认字号从 16px 调到 20px 时，<code>40rem</code> 断点从 640px 变成 800px——<b>布局会因为"文字变大、需要更多空间"而更早切换到宽屏方案</b>，这正是我们要的联动。用 <code>px</code> 写断点则完全无视用户的字号选择。<b>坑</b>：<code>rem</code> 在媒体查询里同样基于根字号，效果与 <code>em</code> 一致，两者都可以；但不要混用，否则团队里会争论为什么"看起来一样的断点表现不同"。',
            en: '<b>Why <code>em</code> for breakpoints?</b> Inside a media query <code>em</code> is based on the <b>root font size</b>, which follows the user’s browser font-size setting. When the user moves the default from 16px to 20px, a <code>40rem</code> breakpoint moves from 640px to 800px — <b>the layout switches to the wide variant earlier because the text needs more room</b>, which is the coupling we want. Pixel breakpoints ignore that choice entirely. <b>Pitfall</b>: <code>rem</code> behaves the same as <code>em</code> in media queries, so either is fine — but do not mix them, or the team will argue about why two breakpoints "that look identical" behave differently.'
          }
        },
        {
          title: { zh: '关键代码 ② 让容器自己"知道"有多少空间', en: 'Key code ② Let the container know how much room it has' },
          purpose: {
            zh: '把"我有多宽"这件事从视口转移到容器，组件才能在任何地方复用。',
            en: 'Move "how wide am I" from the viewport to the container so a component can be reused anywhere.'
          },
          lang: 'css',
          code: {
            zh: `.card-slot {
  /* ⭐ 关键点 ④：声明"这个元素要参与容器查询"，浏览器会为它建立尺寸容器 */
  container-type: inline-size;
  container-name: card;
}

/* ⭐ 关键点 ⑤：查询的是容器宽度，不是视口宽度 —— 同一个组件放进侧栏也会变窄版 */
@container card (max-width: 26rem) {
  .card { flex-direction: column; }
  .card__cover { width: 100%; }
}

/* 只在"响应自身宽度"时用容器查询；
   需要"整页换布局"（比如给 body 加一个类）时，媒体查询仍然是对的 */
@media (min-width: 64rem) { .site-nav { display: block; } }`,
            en: `.card-slot {
  /* ⭐ Key point ④: declare that this element participates in container queries */
  container-type: inline-size;
  container-name: card;
}

/* ⭐ Key point ⑤: query the container width, not the viewport — the same component in a
   sidebar picks the narrow variant on its own */
@container card (max-width: 26rem) {
  .card { flex-direction: column; }
  .card__cover { width: 100%; }
}

/* Use container queries to respond to a component’s own width;
   media queries remain correct for page-wide decisions such as adding a class to body */
@media (min-width: 64rem) { .site-nav { display: block; } }`
          },
          points: {
            zh: '<code>container-type: inline-size</code> 会让浏览器为这个元素建立<b>尺寸容器</b>，并且只跟踪行内轴（宽度）——因为跟踪块轴（高度）会导致循环依赖（内容高度影响容器高度，容器高度又影响内容布局）。<b>坑</b>：<code>container-type</code> 会让该元素成为"包含块"并影响其内部绝对定位元素、还会创建新的格式化上下文，所以不要随手加在最外层页面上，而是加在<b>确实需要按自身宽度响应的可复用组件外层</b>。',
            en: '<code>container-type: inline-size</code> makes the browser treat the element as a <b>size container</b> and track only the inline axis (width) — tracking the block axis (height) would create a circular dependency, since content height affects container height which affects layout. <b>Pitfall</b>: <code>container-type</code> also makes the element a containing block for absolutely positioned descendants and creates a new formatting context, so do not sprinkle it on the page wrapper; put it on <b>the outer element of a genuinely reusable component</b>.'
          }
        }
      ],
      demo: {
        key: 'd-5-1',
        hint: {
          zh: '拖动宽度滑杆（320 → 1440），实时检测四类"内容失败"：横向溢出、行长过长、元素被压到不可读、点击目标过小。点"扫描全部宽度"会自动跑完整个区间，给出事故清单与断点建议。',
          en: 'Drag the width slider from 320 to 1440 and watch four kinds of content failure being detected: horizontal overflow, over-long lines, elements squeezed past legibility, and undersized tap targets. "Scan all widths" runs the whole range and returns a failure list with breakpoint suggestions.'
        }
      }
    },

    /* =========================================================
     * 5.2
     * ======================================================= */
    {
      id: 'ch-5-2',
      num: '5.2',
      title: { zh: '容器查询：让组件自己决定', en: 'Container queries: let the component decide' },
      subtitle: {
        zh: '同一个卡片，放进侧栏它就该变成窄版。媒体查询做不到这件事，因为它只看视口。',
        en: 'The same card should take its narrow form inside a sidebar. Media queries cannot do that, because they only look at the viewport.'
      },
      explain: [
        { p: {
          zh: '媒体查询问的是"<b>屏幕</b>有多宽"，容器查询问的是"<b>我有</b>多宽"。这个差别在组件复用时立刻显现：同一个课程卡片，出现在主区（800px）时应该是横排（左图右文），出现在侧栏（240px）时应该变成竖排（上图下文）。用媒体查询写，你只能得到"屏幕窄时全部变竖排"——主区里明明有空间，也跟着变竖排了。',
          en: 'A media query asks "how wide is the <b>screen</b>"; a container query asks "how wide am <b>I</b>". The difference shows up the moment a component is reused: the same course card should be a row (image left, text right) at 800px in the main area and a column (image above text) at 240px in a sidebar. With media queries you can only get "everything becomes a column when the screen is narrow" — including the card in the main area, which had plenty of room.'
        } },
        { theory: {
          zh: '<b>容器查询是"组件级响应式"的技术基础。</b>在它出现之前，设计系统里的组件只能有两种响应方式：①把断点交给使用者以参数形式传入（<code>.card--narrow</code>），②干脆不响应。前者把响应式责任推给了页面作者，后者让组件在窄容器里必然难看。容器查询把"我该用哪种形态"这件事收回给组件自己判断，<b>组件的可移植性因此从"要读文档"变成"放进去就对"</b>。',
          en: '<b>Container queries are the technical basis of component-level responsiveness.</b> Before them a design-system component had two options: pass the breakpoint in as a variant class (<code>.card--narrow</code>), or not respond at all. The first pushes the responsibility onto whoever uses the component; the second guarantees it looks wrong in a narrow container. Container queries return the decision to the component, so <b>portability goes from "read the docs" to "drop it in and it works"</b>.',
          cite: {
            zh: 'CSS Containment Module Level 3 §3「Container Queries」；容器查询于 2023 年在三大引擎全部可用',
            en: 'CSS Containment Module Level 3 §3 "Container Queries"; container queries became available in all three engines in 2023'
          }
        } },
        { h: { zh: '什么时候仍然该用媒体查询', en: 'When media queries remain the right tool' } },
        { ul: [
          { zh: '<b>影响整页的决定</b>：侧栏是显示还是折叠、导航是横向还是抽屉、打印样式。', en: '<b>Page-wide decisions</b>: is the sidebar shown or collapsed, is the nav horizontal or a drawer, print styles.' },
          { zh: '<b>与视口强相关的排版</b>：例如整页标题的 <code>clamp()</code> 上下限（虽然 <code>vw</code> 单位更合适）。', en: '<b>Typography tied to the viewport</b>: page-level heading bounds in <code>clamp()</code> (though <code>vw</code> units are often better).' },
          { zh: '<b>减少动画 / 降低数据用量</b>等基于设备能力的查询（这些本来也不是尺寸问题）。', en: '<b>Device-capability queries</b> such as reduced motion or lower data usage — those were never about size.' }
        ] },
        { note: {
          zh: '<b>一条实用规则</b>：如果一段响应式样式在"把组件搬到另一个容器里"之后仍然成立，那它应该用容器查询；如果它必须随整页变化（比如"手机上收起侧栏"），那它属于媒体查询。<b>判断问题的方式不是问属性，而是问：这个变化是"我自己的空间"决定的，还是"整页环境"决定的？</b>',
          en: '<b>A practical rule</b>: if a responsive rule still makes sense after the component is moved into a different container, it belongs in a container query; if it must follow the whole page (as "collapse the sidebar on phones" does), it belongs in a media query. <b>Ask not which property, but: is this change driven by my own space, or by the page environment?</b>'
        } },
        { case: {
          title: { zh: '案例诊断：同一个卡片，三种容器', en: 'Case diagnosis: one card, three containers' },
          zh: 'CourseHub v2 把课程卡做成了可复用组件，它出现在三个地方：主区卡片墙（每张约 340px）、详情页侧栏（约 260px）、以及页脚推荐位（约 180px）。用媒体查询时，这三个位置只能用同一个形态，因为视口宽度是一样的；换成 <code>@container card (max-width: 26rem)</code> 之后，侧栏与页脚里的卡片自动切换成竖排、封面占满宽度，<b>而主区里的卡片保持横排</b>。这就是"组件级响应式"省下的条件类数量。',
          en: 'CourseHub v2 turns the course card into a reusable component that appears in three places: the main card wall (about 340px each), a detail-page sidebar (about 260px) and a footer recommendation slot (about 180px). With media queries all three must share one form, because the viewport width is identical. With <code>@container card (max-width: 26rem)</code> the sidebar and footer cards switch to a column with a full-width cover <b>while the main-area cards stay as rows</b>. That is the number of variant classes component-level responsiveness removes.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 一个组件，两种形态，零个变体类', en: 'Key code ① One component, two forms, zero variant classes' },
          purpose: {
            zh: '组件自己判断该用哪种形态，调用方不需要知道任何断点信息。',
            en: 'The component decides its own form; the caller needs to know nothing about breakpoints.'
          },
          lang: 'css',
          code: {
            zh: `/* 组件内部：默认横排（宽容器形态） */
.card { display: flex; gap: var(--space-4); align-items: center; }

/* ⭐ 关键点 ①：给"容器"声明尺寸跟踪，名字便于阅读 */
.card-slot { container: card / inline-size; }

/* ⭐ 关键点 ②：窄容器形态 —— 竖排 + 封面占满
   cqw = 容器宽度的 1%，用它做"相对当前容器"的尺寸比 vw 更符合意图 */
@container card (max-width: 26rem) {
  .card { flex-direction: column; align-items: stretch; }
  .card__cover { width: 100%; height: auto; }
  .card__title { font-size: clamp(1rem, 4cqw, 1.25rem); }
}

/* ⭐ 关键点 ③：容器查询也支持范围语法，可读性更好 */
@container card (16rem <= width < 26rem) {
  .card__title { font-size: 1.05rem; }
}`,
            en: `/* inside the component: a row by default (the wide form) */
.card { display: flex; gap: var(--space-4); align-items: center; }

/* ⭐ Key point ①: declare size tracking on the container and name it for readability */
.card-slot { container: card / inline-size; }

/* ⭐ Key point ②: the narrow form — a column with a full-width cover.
   cqw = 1% of the container width: sizing relative to *this container* is more truthful than vw */
@container card (max-width: 26rem) {
  .card { flex-direction: column; align-items: stretch; }
  .card__cover { width: 100%; height: auto; }
  .card__title { font-size: clamp(1rem, 4cqw, 1.25rem); }
}

/* ⭐ Key point ③: container queries support range syntax, which reads better */
@container card (16rem <= width < 26rem) {
  .card__title { font-size: 1.05rem; }
}`
          },
          points: {
            zh: '注意 <code>cqw</code> 这个新单位：它表示<b>容器宽度的 1%</b>（还有 <code>cqh</code>、<code>cqi</code>、<code>cqb</code>、<code>cqmin</code>、<code>cqmax</code>）。用它做组件内部的流式尺寸，比 <code>vw</code> 更符合"相对我自己"的意图——一个放进对话框的卡片，用 <code>vw</code> 算出来的字号会完全跑偏。<b>坑</b>：<code>cqw</code> 必须在<b>有尺寸容器的祖先</b>里才有效，否则会回退到视口尺寸（或用小视口单位），排查时容易被误导。',
            en: 'Note the new <code>cqw</code> unit: 1% of the <b>container’s</b> width (alongside <code>cqh</code>, <code>cqi</code>, <code>cqb</code>, <code>cqmin</code>, <code>cqmax</code>). For fluid sizes inside a component it expresses "relative to me" far better than <code>vw</code> — a card inside a dialog sized with <code>vw</code> would be wildly off. <b>Pitfall</b>: <code>cqw</code> only resolves against a size container ancestor, otherwise it falls back to viewport units, which can mislead you when debugging.'
          }
        },
        {
          title: { zh: '关键代码 ② 迁移路径：从媒体查询到容器查询', en: 'Key code ② Migration path: media query to container query' },
          purpose: {
            zh: '不必一次全改：先加尺寸容器，再把"组件自身的响应"逐条搬过去。',
            en: 'No need to rewrite at once: add the size container first, then move the component’s own responses over one by one.'
          },
          lang: 'css',
          code: {
            zh: `/* ⭐ 关键点 ①：第 1 步 —— 给可能变窄的容器加上尺寸跟踪 */
.card-wall, .detail__aside, .footer__picks { container-type: inline-size; }

/* 第 2 步：把"组件形态"的规则从 @media 搬到 @container */
/* ❌ 旧写法：屏幕窄 → 所有卡片竖排（主区明明还有空间） */
@media (max-width: 40rem) { .card { flex-direction: column; } }

/* ⭐ 关键点 ②：新写法 —— 卡片自己窄，它自己竖排 */
@container (max-width: 24rem) { .card { flex-direction: column; } }

/* ⭐ 关键点 ③：第 3 步 —— 整页级别的规则仍然留在 @media */
@media (max-width: 40rem) { .site-nav { display: none; } }   /* 导航收进抽屉，这是整页决定 */`,
            en: `/* ⭐ Key point ①: step 1 — add size tracking to containers that may become narrow */
.card-wall, .detail__aside, .footer__picks { container-type: inline-size; }

/* Step 2: move the component-shape rules from @media to @container */
/* ❌ old: narrow screen → every card becomes a column (even where there is room) */
@media (max-width: 40rem) { .card { flex-direction: column; } }

/* ⭐ Key point ②: new form — this card is narrow, so this card becomes a column */
@container (max-width: 24rem) { .card { flex-direction: column; } }

/* ⭐ Key point ③: step 3 — page-level rules stay in @media */
@media (max-width: 40rem) { .site-nav { display: none; } }   /* nav into a drawer: a page decision */`
          },
          points: {
            zh: '<b>迁移时的性能与作用域注意点</b>：<code>container-type: inline-size</code> 会让浏览器做额外的尺寸计算，在一个有几百个卡片的列表里全加上可能带来开销，所以<b>只在真正需要按自身宽度变化的层级加</b>（通常是组件外层，而不是每个卡片）。另外，旧浏览器不支持容器查询时会忽略 <code>@container</code> 块，因此要保证<b>没有容器查询时布局也是可用的</b>——这个思路叫渐进增强。',
            en: '<b>Performance and scope when migrating</b>: <code>container-type: inline-size</code> costs the browser extra sizing work, so adding it to hundreds of cards in a list is wasteful — <b>add it only at the level that genuinely needs to respond to its own width</b> (usually the component wrapper, not every card). Also, browsers without container query support ignore <code>@container</code> blocks, so make sure <b>the layout still works without them</b>: that is progressive enhancement.'
          }
        }
      ],
      demo: {
        key: 'd-5-2',
        hint: {
          zh: '同一个卡片组件放进三个不同宽度的容器，切换"媒体查询版 / 容器查询版"，观察只有容器查询版会让每个容器内的卡片各自变形；拖动容器右边缘改变宽度，实时读每个卡片的 flex-direction 与封面宽度。',
          en: 'The same card component is placed in three containers of different widths. Switch between the media-query and container-query versions: only the latter reshapes each card per container. Drag a container edge to resize it and read each card’s flex-direction and cover width live.'
        }
      }
    },

    /* =========================================================
     * 5.3
     * ======================================================= */
    {
      id: 'ch-5-3',
      num: '5.3',
      title: { zh: '内在布局与流式排版', en: 'Intrinsic layout and fluid typography' },
      subtitle: {
        zh: '最强的响应式布局是"没有断点的布局"：尺寸在内容与容器之间协商得出。',
        en: 'The strongest responsive layout is one with no breakpoints at all: sizes negotiated between content and container.'
      },
      explain: [
        { p: {
          zh: '前面两节的断点与容器查询仍然是"在某个尺寸处切换方案"。<b>内在布局（intrinsic layout）</b>走向更进一步：让尺寸<i>连续</i>地随可用空间变化，不需要任何切换点。三个工具：<code>clamp()</code>（连续的尺寸插值）、内在尺寸关键字（<code>min-content</code> / <code>max-content</code> / <code>auto</code>）、以及基于 <code>flex-basis</code> 技巧的<b>原语</b>（primitive）。',
          en: 'Breakpoints and container queries still "switch plans at a size". <b>Intrinsic layout</b> goes further: sizes change <i>continuously</i> with the available space, with no switch point. Three tools: <code>clamp()</code> (continuous interpolation), the intrinsic sizing keywords (<code>min-content</code> / <code>max-content</code> / <code>auto</code>), and <b>primitives</b> built on a <code>flex-basis</code> trick.'
        } },
        { note: {
          zh: '<b>流式排版的正确写法</b>是"中间插值 + 两侧兜底"，而不是纯 <code>vw</code>：',
          en: '<b>The correct fluid-type idiom</b> is "interpolate in the middle, bound both ends", not raw <code>vw</code>:'
        } },
        { code: {
          zh: `/* ❌ font-size: 4vw;  —— 窄屏小到读不了，宽屏大到失控 */
/* ✅ 两侧用 rem 兜底，中间用 vw 插值 */
h1 { font-size: clamp(1.75rem, 1.1rem + 2.4vw, 3rem); }

/* 更直观的写法：告诉浏览器"在 20rem 视口时 1.75rem，在 80rem 视口时 3rem" */
h1 { font-size: clamp(1.75rem, 1.75rem + (3 - 1.75) * (100vw - 20rem) / (80 - 20), 3rem); }`,
          en: `/* ❌ font-size: 4vw;  — unreadably small on phones, absurdly large on wide screens */
/* ✅ bound both ends in rem, interpolate in the middle with vw */
h1 { font-size: clamp(1.75rem, 1.1rem + 2.4vw, 3rem); }

/* A more explicit form: "1.75rem at a 20rem viewport, 3rem at 80rem" */
h1 { font-size: clamp(1.75rem, 1.75rem + (3 - 1.75) * (100vw - 20rem) / (80 - 20), 3rem); }`,
          lang: 'css'
        } },
        { h: { zh: '两难：流式排版 vs 用户缩放', en: 'The conflict: fluid type vs user zoom' } },
        { p: {
          zh: '流式排版有一个真实的冲突：它让字号"随视口变化"，而可访问性要求字号"随用户设置变化"（WCAG 1.4.4 要求文本能放大到 200% 而不丢失内容）。如果标题完全由 <code>vw</code> 决定，用户放大字号时它<b>纹丝不动</b>。解决办法有两个：①<code>clamp()</code> 的两端用 <code>rem</code>（用户字号变大时，上下限一起变大）；②只在<b>装饰性的大标题</b>上用强流式，正文与正文级标题保持纯粹的可缩放单位。',
          en: 'Fluid type has a genuine conflict: it makes size follow the viewport, while accessibility requires size to follow the user’s setting (WCAG 1.4.4 requires text to scale to 200% without loss of content). If a heading is governed purely by <code>vw</code>, increasing the user font size <b>does nothing to it</b>. Two fixes: (1) express the <code>clamp()</code> bounds in <code>rem</code> so the limits grow with the user’s font size; (2) use strong fluid scaling only for <b>decorative large headings</b> and keep body text and body-level headings in purely scalable units.'
        } },
        { h: { zh: '原语（primitive）：把布局写成可组合的小积木', en: 'Primitives: layout as composable building blocks' } },
        { p: {
          zh: '<b>Every Layout</b> 提出了一组极小的布局原语，每个原语只解决一个问题，并且<b>不用断点</b>：',
          en: '<b>Every Layout</b> proposes a small set of layout primitives, each solving one problem and <b>using no breakpoints at all</b>:'
        } },
        { table: {
          head: [{ zh: '原语', en: 'Primitive' }, { zh: '解决的问题', en: 'Solves' }, { zh: '关键技巧', en: 'Key trick' }],
          rows: [
            [{ zh: 'Stack', en: 'Stack' }, { zh: '纵向堆叠的统一间距', en: 'Consistent vertical spacing' }, { zh: '<code>&gt; * + * { margin-block-start: var(--space) }</code>', en: '<code>&gt; * + * { margin-block-start: var(--space) }</code>' }],
            [{ zh: 'Sidebar', en: 'Sidebar' }, { zh: '主区 + 侧栏，窄了就自动换行', en: 'Main plus sidebar; wraps when narrow' }, { zh: '<code>flex-wrap: wrap</code> + 主区 <code>flex-basis: 60%</code>', en: '<code>flex-wrap: wrap</code> plus main <code>flex-basis: 60%</code>' }],
            [{ zh: 'Switcher', en: 'Switcher' }, { zh: '横排 ↔ 竖排，无断点切换', en: 'Row ↔ column with no breakpoint' }, { zh: '子项 <code>flex-basis: calc((var(--threshold) - 100%) * 999)</code>', en: 'children at <code>flex-basis: calc((var(--threshold) - 100%) * 999)</code>' }],
            [{ zh: 'Cover', en: 'Cover' }, { zh: '一个区块占满视口高度并居中', en: 'A block fills the viewport height, centred' }, { zh: '<code>min-height: 100dvh</code> + <code>margin: auto</code>', en: '<code>min-height: 100dvh</code> plus <code>margin: auto</code>' }],
            [{ zh: 'Cluster', en: 'Cluster' }, { zh: '标签云 / 按钮组自动换行', en: 'Wrapping tag or button groups' }, { zh: '<code>flex-wrap: wrap</code> + <code>gap</code>', en: '<code>flex-wrap: wrap</code> plus <code>gap</code>' }]
          ]
        } },
        { theory: {
          zh: '<b>原语化为什么能减少代码？</b>因为每个原语把"某一类布局问题的解法"固化成一段不会错的 CSS，页面就变成原语的组合（<code>&lt;div class="stack switcher"&gt;</code>）。这既减少了 CSS 总量，也让"布局"和"外观"分离：原语只管位置与间距，卡片外观由另一套类负责。<b>判据</b>：如果一个原语需要"根据屏幕宽度改变行为"，那它已经不是一个原语了——原语应当靠内在尺寸自然适应。',
          en: '<b>Why do primitives reduce code?</b> Because each one freezes the solution to a class of layout problem into CSS that cannot go wrong, so pages become combinations of primitives (<code>&lt;div class="stack switcher"&gt;</code>). That shortens the stylesheet and separates layout from appearance: primitives handle position and spacing, while another set of classes handles how the card looks. <b>Test</b>: if a primitive needs to change behaviour by screen width, it is no longer a primitive — primitives adapt through intrinsic sizing.'
        } },
        { case: {
          title: { zh: '案例诊断：从 3 套媒体查询到 2 个原语', en: 'Case diagnosis: from three media queries to two primitives' },
          zh: 'CourseHub v2 的课程区原本有 3 套媒体查询。改用 <code>Switcher</code>（主区+侧栏在容器窄于 40rem 时自动竖排）与 <code>Stack</code>（纵向统一间距）之后，媒体查询只剩 1 处（导航抽屉，属于整页决定）。更关键的是：把课程区<b>整体搬进一个对话框</b>时，它依然正确——因为它响应的是自己的宽度，不是屏幕宽度。',
          en: 'The v2 course area had three media queries. After moving to the <code>Switcher</code> primitive (main plus sidebar stacking when the container is narrower than 40rem) and <code>Stack</code> (uniform vertical spacing), only one media query remains (the nav drawer, a page-level decision). More importantly, when the whole area is <b>moved into a dialog</b> it still behaves correctly, because it responds to its own width rather than the screen.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① Switcher 原语：不写断点的横竖切换', en: 'Key code ① The Switcher primitive: row to column without a breakpoint' },
          purpose: {
            zh: '用一个 flex-basis 计算式，让"够宽就横排、不够就竖排"变成纯内在尺寸行为。',
            en: 'A single flex-basis computation turns "side by side when there is room, stacked when there is not" into pure intrinsic behaviour.'
          },
          lang: 'css',
          code: {
            zh: `.switcher {
  display: flex;
  flex-wrap: wrap;                 /* ⭐ 允许换行，这是切换发生的地方 */
  gap: var(--space-4);
}

.switcher > * {
  /* ⭐ 关键点 ①：容器的"宽度阈值"参与计算。
     当容器宽度 > 阈值时为 -999×阈值（负值 → 被压缩成一行）
     当容器宽度 < 阈值时变为正的大值 → 每个子项独占一行（换行） */
  flex-grow: 1;
  flex-basis: calc((var(--switcher-threshold, 40rem) - 100%) * 999);
  min-width: 0;
}

/* 用法： <div class="switcher" style="--switcher-threshold: 34rem"> … </div>

/* ⭐ 关键点 ②：只对"四个以上"子项按需限制宽度，避免一行放太多 */
.switcher > :nth-last-child(n + 5),
.switcher > :nth-last-child(n + 5) ~ * { flex-basis: 100%; }`,
            en: `.switcher {
  display: flex;
  flex-wrap: wrap;                 /* ⭐ wrapping is where the switch happens */
  gap: var(--space-4);
}

.switcher > * {
  /* ⭐ Key point ①: the container width participates in the calculation.
     When the container is wider than the threshold this is a huge negative value, so items
     stay on one line; when it is narrower the value is large and positive, so each item
     takes a full line */
  flex-grow: 1;
  flex-basis: calc((var(--switcher-threshold, 40rem) - 100%) * 999);
  min-width: 0;
}

/* usage: <div class="switcher" style="--switcher-threshold: 34rem"> … </div>

/* ⭐ Key point ②: for five or more children, force extra items onto their own lines */
.switcher > :nth-last-child(n + 5),
.switcher > :nth-last-child(n + 5) ~ * { flex-basis: 100%; }`
          },
          points: {
            zh: '这个 <code>calc()</code> 技巧的关键在于"乘 999"：它把<b>0 或 1 的二值判断放大成数值上不可忽略的量</b>，从而让 flex 的换行机制去做"是否换行"的决定。<b>坑</b>：如果子项数量超过 4 个且不加以限制，flex 会把它们全部塞进一行（因为 <code>flex-grow: 1</code> 会收缩每一列），所以需要第二条规则限制每行数量。<b>可读性</b>：建议把阈值做成自定义属性（<code>--switcher-threshold</code>），让使用者一眼看出"这道线在哪里"。',
            en: 'The essential part of this <code>calc()</code> trick is multiplying by 999: it turns a <b>binary yes/no into a numerically decisive value</b>, letting the flex wrapping mechanism make the "wrap or not" decision. <b>Pitfall</b>: with more than four children and no limit, flex will cram them all onto one line (because <code>flex-grow: 1</code> shrinks every column), which is why the second rule caps items per row. <b>Readability</b>: expose the threshold as a custom property (<code>--switcher-threshold</code>) so users can see where the line is.'
          }
        },
        {
          title: { zh: '关键代码 ② Stack 原语与流式版面宽度', en: 'Key code ② The Stack primitive and fluid measure' },
          purpose: {
            zh: '两个小原语，替代大量零散的 margin 与 width 声明。',
            en: 'Two small primitives replacing a pile of scattered margin and width declarations.'
          },
          lang: 'css',
          code: {
            zh: `.stack > * + * {
  /* ⭐ 关键点 ③：相邻兄弟统一间距 —— 不用给每个子元素写 margin，
     也不会像 margin-bottom+margin-top 那样被折叠 */
  margin-block-start: var(--stack-space, var(--space-4));
}

/* ⭐ 关键点 ④：流式版心 —— 最小 100% - 两侧留白，最大 72rem，中间连续变化 */
.wrap {
  width: min(100% - 2 * var(--space-5), 72rem);
  margin-inline: auto;
}

/* ⭐ 关键点 ⑤：用 ch 单位限制行长，而不是限制宽度。
   65ch 是排版学里公认的舒适行宽（拉丁文），中英混排也适用 */
.prose { max-inline-size: 65ch; }

/* ⭐ 关键点 ⑥：内边距也参与流式，用 clamp 保持"小屏不挤、大屏不空" */
.section { padding-block: clamp(var(--space-6), 5vw, var(--space-9)); }`,
            en: `.stack > * + * {
  /* ⭐ Key point ③: one spacing for adjacent siblings — no margin on each child, and
     unlike margin-bottom plus margin-top it cannot collapse */
  margin-block-start: var(--stack-space, var(--space-4));
}

/* ⭐ Key point ④: fluid content width — at least 100% - side margins, at most 72rem */
.wrap {
  width: min(100% - 2 * var(--space-5), 72rem);
  margin-inline: auto;
}

/* ⭐ Key point ⑤: constrain the measure with ch, not with width.
   65ch is the conventional comfortable line length and works for mixed CJK/Latin too */
.prose { max-inline-size: 65ch; }

/* ⭐ Key point ⑥: padding can be fluid as well, keeping small screens tight and large ones roomy */
.section { padding-block: clamp(var(--space-6), 5vw, var(--space-9)); }`
          },
          points: {
            zh: '<code>max-inline-size: 65ch</code> 是"限制行长"的正解：<b>宽度不是目的，行长才是</b>。用固定 <code>max-width: 720px</code> 的做法在字号变化时行长就变了（用户放大字号 → 每行字数变少 → 反而更舒服；缩小字号 → 每行字数过多 → 难读）。用 <code>ch</code> 表达后，无论字号如何变化，行长都保持在舒适区间。<b>坑</b>：<code>ch</code> 基于 "0" 字形的宽度，中日韩字体的"0"与汉字宽度不同，所以中文排版习惯上用 <code>max-inline-size: 40em</code> 之类的写法更可控——但思路是一致的：<b>约束行长，而不是约束像素宽度</b>。',
            en: '<code>max-inline-size: 65ch</code> is the correct way to constrain line length: <b>the goal is the measure, not the width</b>. A fixed <code>max-width: 720px</code> changes the measure whenever the font size changes (zoom in and the line gets fewer characters, which is comfortable; zoom out and the line gets too many, which is not). Expressing it in <code>ch</code> keeps the measure in the comfortable range at any size. <b>Pitfall</b>: <code>ch</code> is the width of the "0" glyph, and in CJK fonts that differs from the ideograph advance, so for Chinese text <code>max-inline-size: 40em</code> is often more predictable — but the principle is identical: <b>constrain the measure, not a pixel width</b>.'
          }
        }
      ],
      demo: {
        key: 'd-5-3',
        hint: {
          zh: '左上是 clamp() 生成器：调最小/中间/最大三个值，实时看到当前宽度下的实际字号，并生成可复制的代码；下方是 Switcher 原语实验台，拖动容器宽度看它如何在阈值处"无断点"地横竖切换，并可注入 320px、200% 字号、长单词做压力测试。',
          en: 'Top left is a clamp() generator: tune the min, preferred and max values, read the actual font size at the current width, and copy the generated code. Below is the Switcher primitive lab: drag the container width to watch it flip between row and column with no breakpoint, and stress it with 320px, 200% text and a long word.'
        }
      }
    }
  ]
};
