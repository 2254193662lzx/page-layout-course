/* =============================================================
 * 第 3 章 · 一维布局：Flexbox / Ch 3 · One-Dimensional Layout: Flexbox
 * 案例病灶：④ 靠空格对齐导航  ⑤ 卡片高度不齐、图片撑破容器
 * ============================================================= */

export default {
  id: 3,
  slug: 'lesson-03',
  num: { zh: '第 3 章', en: 'Chapter 3' },
  title: { zh: '一维布局：Flexbox', en: 'One-dimensional layout: flexbox' },
  subtitle: {
    zh: 'Flexbox 解决的是"一行/一列里，元素怎么分配空间、怎么对齐"。它的难点不在语法，而在主轴与交叉轴的心智模型。',
    en: 'Flexbox answers one question: inside a single row or column, how do items share space and line up? The difficulty is not syntax but the mental model of main axis versus cross axis.'
  },
  lede: {
    zh: '主轴与交叉轴、justify 与 align 的语义、<code>flex-grow/shrink/basis</code> 的空间分配算法、<code>min-width:auto</code> 溢出陷阱，以及四个能覆盖 80% 场景的一维模板。',
    en: 'Main and cross axis, the semantics of justify vs align, the space-distribution algorithm behind <code>flex-grow/shrink/basis</code>, the <code>min-width:auto</code> overflow trap, and four one-dimensional templates that cover 80% of real cases.'
  },
  tags: [
    { zh: '主轴与交叉轴', en: 'Main / cross axis' },
    { zh: '弹性空间分配', en: 'Flexible space' },
    { zh: 'min-width:auto 陷阱', en: 'min-width:auto trap' },
    { zh: '媒体对象', en: 'Media object' },
    { zh: '等高卡片', en: 'Equal-height cards' },
    { zh: '推与挤', en: 'Push and squeeze' }
  ],
  caseNote: {
    zh: '本章诊断案例的 <b>④ 靠空格对齐导航</b>（菜单项之间用 <code>&amp;nbsp;</code> 与固定宽度撑开）与 <b>⑤ 卡片高度不齐</b>（三张课程卡长短不一、图片撑破容器）。',
    en: 'This chapter diagnoses defect <b>④ space-hacked navigation</b> (menu items padded with <code>&amp;nbsp;</code> and fixed widths) and defect <b>⑤ uneven cards</b> (three course cards of different heights, with images breaking out of their containers).'
  },

  sections: [
    /* =========================================================
     * 3.1
     * ======================================================= */
    {
      id: 'ch-3-1',
      num: '3.1',
      title: { zh: '主轴与交叉轴：一个可以旋转的坐标系', en: 'Main and cross axis: a coordinate system that rotates' },
      subtitle: {
        zh: 'justify-content 和 align-items「谁管哪个方向」的问题，答案取决于 flex-direction。',
        en: 'Which direction do justify-content and align-items control? The answer depends on flex-direction.'
      },
      explain: [
        { p: {
          zh: '把 flex 容器想成一个<b>局部坐标系</b>：容器定义一个<b>主轴</b>（main axis）和一个与它垂直的<b>交叉轴</b>（cross axis）。所有对齐属性都是相对这两个轴说的，而不是相对"上下左右"说的。',
          en: 'Think of a flex container as a <b>local coordinate system</b>: it defines a <b>main axis</b> and a perpendicular <b>cross axis</b>. Every alignment property refers to those two axes, not to "up, down, left, right".'
        } },
        { table: {
          head: [{ zh: '属性', en: 'Property' }, { zh: '作用方向', en: 'Acts on' }, { zh: '备注', en: 'Note' }],
          rows: [
            [{ zh: '<code>justify-content</code>', en: '<code>justify-content</code>' }, { zh: '<b>主轴</b>上的对齐与空间分配', en: 'Alignment and space on the <b>main axis</b>' }, { zh: '行（row）时管水平，列（column）时管垂直', en: 'Horizontal for row, vertical for column' }],
            [{ zh: '<code>align-items</code>', en: '<code>align-items</code>' }, { zh: '<b>交叉轴</b>上的对齐', en: 'Alignment on the <b>cross axis</b>' }, { zh: '<code>stretch</code>（默认）会拉伸元素，常导致"卡片莫名变高"', en: '<code>stretch</code> (the default) stretches items, which often causes "why is my card taller"' }],
            [{ zh: '<code>flex-direction</code>', en: '<code>flex-direction</code>' }, { zh: '决定主轴方向', en: 'Decides the main axis' }, { zh: '<b>改它等于旋转整个坐标系</b>', en: '<b>Changing it rotates the whole coordinate system</b>' }],
            [{ zh: '<code>gap</code>', en: '<code>gap</code>' }, { zh: '沿主轴 / 交叉轴的项目间距', en: 'Spacing between items on both axes' }, { zh: '比给子元素加 margin 更干净，不会有折叠', en: 'Cleaner than margins on children, and never collapses' }]
          ]
        } },
        { theory: {
          zh: '<b>为什么用"轴"而不是"上下左右"？</b>因为 CSS 的书写模式可能改变（横排、竖排，从左到右、从右到左）。如果属性叫 <code>align-horizontal</code>，在竖排文字里就没有意义了。用主轴/交叉轴，同一套属性可以在任何书写方向和任何 <code>flex-direction</code> 下保持一致的<b>语义</b>：justify 管"沿内容流动方向"，align 管"垂直于流动方向"。这也是逻辑属性（<code>margin-inline-start</code>）背后的同一套思路。',
          en: '<b>Why axes rather than up/down/left/right?</b> Because writing modes change (horizontal or vertical, left-to-right or right-to-left). A property named <code>align-horizontal</code> would be meaningless in vertical text. With main and cross axes the same properties keep one consistent <b>meaning</b> across writing modes and <code>flex-direction</code> values: justify acts along the direction content flows, align acts across it. The same idea underlies logical properties such as <code>margin-inline-start</code>.',
          cite: {
            zh: 'CSS Flexible Box Layout Module Level 1 §2「Flex Layout Box Model and Terminology」',
            en: 'CSS Flexible Box Layout Module Level 1 §2 "Flex Layout Box Model and Terminology"'
          }
        } },
        { h: { zh: '三条最容易记错的规则', en: 'Three rules people most often get wrong' } },
        { ul: [
          { zh: '<b><code>align-items</code> 默认值是 <code>stretch</code></b>，不是 <code>flex-start</code>。所以一行 flex 子元素默认会被拉成等高——这既是"等高卡片"的免费实现，也是"为什么我的按钮被拉长了"的原因。', en: '<b><code>align-items</code> defaults to <code>stretch</code></b>, not <code>flex-start</code>. Children in a flex row are therefore stretched to equal height by default — both the free way to get equal-height cards and the reason "why is my button stretched".' },
          { zh: '<b>子元素的 <code>margin: auto</code> 会把剩余空间吃掉</b>。这是实现"左边 logo、右边菜单"最简单的方法：给菜单 <code>margin-inline-start: auto</code>，它就被推到最右边，不需要 justify-content: space-between。', en: '<b><code>margin: auto</code> on a child absorbs the leftover space.</b> This is the simplest way to get "logo left, menu right": give the menu <code>margin-inline-start: auto</code> and it is pushed to the far end without needing justify-content: space-between.' },
          { zh: '<b>flex 容器会忽略子元素的 <code>float</code></b>，并且子元素的 <code>display</code> 会被"块化"（<code>display: inline</code> 的 span 变成可设宽高的 flex item）。', en: '<b>A flex container ignores <code>float</code> on its children</b> and blockifies their <code>display</code>: a <code>display: inline</code> span becomes a flex item that accepts width and height.' }
        ] },
        { case: {
          title: { zh: '案例诊断：问题 ④ 靠空格对齐导航', en: 'Case diagnosis: defect ④ space-hacked navigation' },
          zh: 'v1 的导航是这样写的：<code>&lt;span&gt;课程&lt;/span&gt;&amp;nbsp;&amp;nbsp;&amp;nbsp;&lt;span&gt;讲师&lt;/span&gt;</code>，并且给"课程"加了 <code>width: 60px</code>。"讲师"两个字和"价格"两个字的宽度只差几像素，但对齐是靠空格凑的，所以：<b>①改成英文（Courses / Instructors）立刻错位</b>；②用户放大字号后空格宽度不变但文字变宽，再次错位；③键盘用户看不出焦点在哪。改用 flex 之后，<code>gap</code> 负责间距、<code>align-items: center</code> 负责垂直居中，<b>文案改成任何语言、任何长度都不会错位</b>。',
          en: 'The v1 nav reads <code>&lt;span&gt;Courses&lt;/span&gt;&amp;nbsp;&amp;nbsp;&amp;nbsp;&lt;span&gt;Instructors&lt;/span&gt;</code> with <code>width: 60px</code> on the first item. Spaces, not layout, hold the alignment, so: <b>(1) switching the copy to another language instantly breaks it</b>; (2) when a user increases the font size the spaces stay the same width while the text grows, breaking it again; (3) keyboard users cannot see where focus is. With flex, <code>gap</code> owns the spacing and <code>align-items: center</code> owns vertical centring, so <b>no copy change in any language can misalign it</b>.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 导航栏：五行 CSS 替代所有空格', en: 'Key code ① A navbar: five lines instead of every spacer' },
          purpose: {
            zh: '用布局属性表达结构关系，而不是用空格"画"出结构。',
            en: 'Express structure with layout properties instead of "drawing" it with spaces.'
          },
          lang: 'css',
          code: {
            zh: `.nav {
  /* ⭐ 关键点 ①：先声明"这是一个一维排布" */
  display: flex;
  align-items: center;              /* 交叉轴居中：文字与按钮的中线对齐 */
  gap: var(--space-5);              /* ⭐ 关键点 ②：间距由容器统一管理，不写在子元素上 */
}

/* ⭐ 关键点 ③：把某一部分推到另一端（logo 左、菜单右）
   比 justify-content: space-between 更精确：中间的元素不会被"平均拉散" */
.nav__menu { margin-inline-start: auto; }

/* 子元素不再需要 width / 空格 */
.nav a { padding: var(--space-2) var(--space-3); }`,
            en: `.nav {
  /* ⭐ Key point ①: first declare "this lays out in one dimension" */
  display: flex;
  align-items: center;              /* cross-axis centring: text and buttons share a midline */
  gap: var(--space-5);              /* ⭐ Key point ②: spacing is owned by the container, not the children */
}

/* ⭐ Key point ③: push one part to the far end (logo left, menu right).
   More precise than justify-content: space-between, which spreads middle items apart */
.nav__menu { margin-inline-start: auto; }

/* children no longer need widths or spacer characters */
.nav a { padding: var(--space-2) var(--space-3); }`
          },
          points: {
            zh: '<code>gap</code> 是 flex 布局里"最像设计意图"的属性：它描述的是<b>元素之间的关系</b>，而不是某个元素的个体属性。这与第 1 章讲的"把间距命名成关系"是同一件事。<b>坑</b>：<code>gap</code> 只作用于 flex/grid 容器<b>直接子元素</b>之间，不会穿透到更深层；另外它不会像 margin 那样"折叠"，所以从 margin 迁到 gap 时数值通常要调小一些。',
            en: '<code>gap</code> is the property that best matches design intent in a flex layout: it describes a <b>relationship between items</b> rather than a property of one item — the same idea as "naming spacing by relationship" in Chapter 1. <b>Pitfall</b>: <code>gap</code> only applies between the <b>direct children</b> of a flex or grid container and does not reach deeper; and since it never collapses like margins do, values usually need to shrink slightly when migrating from margin to gap.'
          }
        },
        {
          title: { zh: '关键代码 ② align-items 与 align-self：什么时候需要"反悔"', en: 'Key code ② align-items and align-self: when to opt out' },
          purpose: {
            zh: '父元素默认 stretch 会拉伸所有子元素；个别子元素想"不参与拉伸"时用 align-self。',
            en: 'The parent’s default stretch pulls every child to full height; a child that wants out uses align-self.'
          },
          lang: 'css',
          code: {
            zh: `.card-row {
  display: flex;
  gap: var(--space-5);
  align-items: stretch;   /* 默认值：三张卡片等高 —— 这就是"等高卡片"的实现方式 */
}

/* ⭐ 关键点 ④：单个元素退出拉伸，例如一行里的"了解更多"链接按钮 */
.card__link { align-self: center; }

/* ⭐ 关键点 ⑤：卡片内部用 column + flex:1 让"页脚贴底" */
.card {
  display: flex;
  flex-direction: column;   /* 主轴变成垂直方向，justify 也随之变成"管垂直" */
  gap: var(--space-2);
}
.card__body { flex: 1; }    /* 正文吃掉剩余高度，把按钮推到卡片底部 */
.card__cta { margin-block-start: auto; }   /* 或者用 auto margin，效果等价 */`,
            en: `.card-row {
  display: flex;
  gap: var(--space-5);
  align-items: stretch;   /* the default: three cards of equal height — that is equal-height cards for free */
}

/* ⭐ Key point ④: a single item opts out of stretching, e.g. a "learn more" link inside a row */
.card__link { align-self: center; }

/* ⭐ Key point ⑤: inside a card, column + flex:1 makes the footer sit at the bottom */
.card {
  display: flex;
  flex-direction: column;   /* the main axis becomes vertical, so justify now acts vertically too */
  gap: var(--space-2);
}
.card__body { flex: 1; }    /* the body absorbs the leftover height, pushing the button down */
.card__cta { margin-block-start: auto; }   /* an auto margin does the same job */`
          },
          points: {
            zh: '<code>flex-direction: column</code> 之后，<code>justify-content</code> 就变成"垂直方向"了——这是 3.1 的核心。很多人在卡片里写 <code>justify-content: center</code> 想水平居中，结果发现内容上下居中了，就是因为主轴已经转成了纵向。<b>记忆法</b>：justify 永远跟着内容流动的方向，align 永远垂直于它。',
            en: 'After <code>flex-direction: column</code>, <code>justify-content</code> acts <b>vertically</b> — the core point of 3.1. Many people write <code>justify-content: center</code> inside a card expecting horizontal centring and find the content centred vertically instead, precisely because the main axis rotated. <b>Mnemonic</b>: justify always follows the direction content flows; align is always across it.'
          }
        }
      ],
      demo: {
        key: 'd-3-1',
        hint: {
          zh: '交互切换 flex-direction / wrap / justify-content / align-items，右侧实时画出主轴（蓝色箭头）与交叉轴，并显示每个项目的实际位置与尺寸；点"截断文案"可以看容器变窄时元素的收缩行为。',
          en: 'Toggle flex-direction, wrap, justify-content and align-items; the stage draws the main axis (blue arrow) and cross axis live, with each item’s real position and size. Use "cut the copy" to watch how items shrink as the container narrows.'
        }
      }
    },

    /* =========================================================
     * 3.2
     * ======================================================= */
    {
      id: 'ch-3-2',
      num: '3.2',
      title: { zh: '空间分配：grow / shrink / basis 与溢出陷阱', en: 'Space distribution: grow, shrink, basis and the overflow trap' },
      subtitle: {
        zh: 'flex 的"弹性"到底是怎么算的？以及那个让无数人踩坑的 min-width: auto。',
        en: 'How exactly does flex compute "flexibility"? And the min-width: auto that has tripped up everyone.'
      },
      explain: [
        { p: {
          zh: '当所有项目的基准尺寸加起来的和<b>小于</b>容器宽度时，多出来的空间叫<b>剩余空间</b>（free space），按 <code>flex-grow</code> 的比例分配；当它们<b>大于</b>容器宽度时，超出量按 <code>flex-shrink</code> 的加权比例收缩。这条"先算剩余空间，再按比例分"的逻辑，就是 flex 弹性分配的完整规则。',
          en: 'When the sum of the items’ base sizes is <b>less</b> than the container, the surplus is <b>free space</b>, distributed in proportion to <code>flex-grow</code>. When the sum is <b>greater</b>, the excess is removed in proportion to <code>flex-shrink</code> (weighted). "Compute the leftover, then share it by ratio" is the whole rule.'
        } },
        { table: {
          head: [{ zh: '写法', en: 'Shorthand' }, { zh: '等价于', en: 'Equals' }, { zh: '语义', en: 'Meaning' }],
          rows: [
            [{ zh: '<code>flex: 1</code>', en: '<code>flex: 1</code>' }, { zh: '<code>1 1 0%</code>', en: '<code>1 1 0%</code>' }, { zh: '<b>忽略内容宽度</b>，所有同级元素<b>平均</b>分配容器宽度', en: '<b>Ignores content width</b>; all siblings share the container <b>equally</b>' }],
            [{ zh: '<code>flex: auto</code>', en: '<code>flex: auto</code>' }, { zh: '<code>1 1 auto</code>', en: '<code>1 1 auto</code>' }, { zh: '以<b>内容宽度</b>为基准，再把剩余空间平均分掉；内容长的更宽', en: 'Starts from <b>content width</b>, then shares the leftover; longer content ends up wider' }],
            [{ zh: '<code>flex: none</code>', en: '<code>flex: none</code>' }, { zh: '<code>0 0 auto</code>', en: '<code>0 0 auto</code>' }, { zh: '不伸不缩，完全按内容尺寸（图标、头像常用）', en: 'Neither grows nor shrinks: purely content-sized (icons, avatars)' }],
            [{ zh: '<code>flex: 2</code>', en: '<code>flex: 2</code>' }, { zh: '<code>2 1 0%</code>', en: '<code>2 1 0%</code>' }, { zh: '与 <code>flex: 1</code> 的兄弟按 <b>2:1</b> 分配宽度', en: 'Takes <b>2:1</b> of the width against a <code>flex: 1</code> sibling' }]
          ]
        } },
        { note: {
          zh: '<b>最容易搞错的一点</b>：<code>flex: 1</code>（basis 为 0）和 <code>flex: auto</code>（basis 为内容宽）在"内容长度不均匀"时结果完全不同。做三栏等宽布局要用 <code>flex: 1</code>；做"侧栏固定、主区自适应"要用 <code>flex: 1</code> 配 <code>flex: none</code>。<b>不要用 <code>flex: auto</code> 做等宽</b>——只要有一栏文字多，它就会更宽。',
          en: '<b>The most common mistake</b>: <code>flex: 1</code> (basis 0) and <code>flex: auto</code> (basis = content width) behave completely differently when content lengths differ. Use <code>flex: 1</code> for equal columns; use <code>flex: 1</code> plus <code>flex: none</code> for a fixed sidebar with a fluid main area. <b>Never use <code>flex: auto</code> for equal widths</b> — one longer column will take more space.'
        } },
        { h: { zh: '溢出陷阱：min-width: auto', en: 'The overflow trap: min-width: auto' } },
        { p: {
          zh: '规定里，flex 项目有一个<b>隐含的最小尺寸限制</b>：<code>min-width: auto</code>，含义是"不能小于内容的最小尺寸（min-content）"。所以当一个 flex 项目里有超长单词、长 URL、或者一个宽的 <code>&lt;pre&gt;</code> 时，<b>它不会收缩到容器以内，而是把容器撑破</b>，整页出现横向滚动条。',
          en: 'Per spec a flex item has an <b>implicit minimum size</b>: <code>min-width: auto</code>, meaning "never smaller than the content’s min-content size". So when an item contains a long unbreakable word, a long URL or a wide <code>&lt;pre&gt;</code>, <b>it refuses to shrink below that and blows the container open</b>, producing a page-wide horizontal scrollbar.'
        } },
        { code: {
          zh: `/* 修复：显式把最小尺寸归零，允许收缩到比内容更窄 */
.flex-child { min-width: 0; }      /* 横向布局 */
.flex-child { min-height: 0; }     /* 纵向布局（比如内部要滚动的列表） */
/* 之后再配合 overflow: hidden / text-overflow: ellipsis / overflow-wrap: anywhere */`,
          en: `/* Fix: zero out the minimum explicitly so it may shrink narrower than its content */
.flex-child { min-width: 0; }      /* horizontal layout */
.flex-child { min-height: 0; }     /* vertical layout (e.g. a scrollable inner list) */
/* then add overflow: hidden / text-overflow: ellipsis / overflow-wrap: anywhere */`,
          lang: 'css'
        } },
        { theory: {
          zh: '<b>为什么会有这个"反直觉"的默认值？</b>因为对绝大多数内容来说，"被压到看不见"比"撑开容器"更糟：文字被裁掉是信息丢失，而横向滚动至少内容还在。所以规范选择了"宁可溢出也不压扁文字"。理解了这个取舍，就知道 <code>min-width: 0</code> 不是"hack"，而是<b>明确告诉浏览器"这里被裁掉是可以接受的"</b>。',
          en: '<b>Why this counter-intuitive default?</b> For most content, "squeezed out of sight" is worse than "overflows the box": clipped text is information loss, whereas a horizontal scrollbar at least keeps the content. The spec chose to overflow rather than crush text. Once you see that trade-off, <code>min-width: 0</code> is not a hack — it is <b>explicitly telling the browser that clipping is acceptable here</b>.',
          cite: {
            zh: 'CSS Flexbox §4.5「Automatic Minimum Size of Flex Items」',
            en: 'CSS Flexbox §4.5 "Automatic Minimum Size of Flex Items"'
          }
        } },
        { case: {
          title: { zh: '案例诊断：卡片被一个长单词撑破', en: 'Case diagnosis: one long word breaks a card' },
          zh: 'v1 的课程卡里有课程英文名 <code>LayoutConsistencyChecklist</code>，卡片一行三张。窄屏时这一张卡片里的长单词不肯收缩，把整个卡片行撑到 780px，<b>整页出现横向滚动条</b>（这正是第 ⑦ 号病灶的来源之一）。修复只要三行：<code>.card { min-width: 0 }</code>、标题用 <code>overflow-wrap: anywhere</code>、配合 <code>text-overflow: ellipsis</code> 截断。<b>记住：只要用了 flex/grid，就要给"可能装长内容"的子元素加 <code>min-width: 0</code>。</b>',
          en: 'A v1 course card contains the long course code <code>LayoutConsistencyChecklist</code>, three cards to a row. On narrow screens that word refuses to shrink and pushes the row to 780px, so <b>the whole page grows a horizontal scrollbar</b> — one of the sources of defect ⑦. The fix is three lines: <code>.card { min-width: 0 }</code>, <code>overflow-wrap: anywhere</code> on the title, and <code>text-overflow: ellipsis</code> to truncate. <b>Remember: whenever you use flex or grid, add <code>min-width: 0</code> to any child that might hold long content.</b>'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 三行写出"三栏等宽 + 侧栏固定"', en: 'Key code ① Three lines for equal columns plus a fixed sidebar' },
          purpose: {
            zh: '把"谁伸缩、谁固定"写成一行声明，而不是靠百分比猜。',
            en: 'Declare who flexes and who stays fixed in one line each instead of guessing percentages.'
          },
          lang: 'css',
          code: {
            zh: `.sidebar { flex: none; width: 16rem; }   /* ⭐ 关键点 ①：不伸不缩，尺寸明确 */
.main    { flex: 1; min-width: 0; }     /* ⭐ 关键点 ②：吃掉剩余宽度，并允许收缩 */

/* 三栏等宽（忽略内容长度的差异） */
.col { flex: 1 1 0; min-width: 0; }
/* ❌ .col { flex: 1 1 auto }  → 文字多的那一栏会明显更宽 */

/* 固定比例：主区 2 份，侧区 1 份 */
.main { flex: 2 1 0; }
.aside { flex: 1 1 0; }`,
            en: `.sidebar { flex: none; width: 16rem; }   /* ⭐ Key point ①: no flexing, explicit size */
.main    { flex: 1; min-width: 0; }     /* ⭐ Key point ②: takes the leftover width and may shrink */

/* three equal columns (content length ignored) */
.col { flex: 1 1 0; min-width: 0; }
/* ❌ .col { flex: 1 1 auto }  → the column with more text ends up visibly wider */

/* fixed ratio: main area takes 2 shares, aside 1 */
.main { flex: 2 1 0; }
.aside { flex: 1 1 0; }`
          },
          points: {
            zh: '注意 <code>flex: none; width: 16rem</code> 这种"固定栏"的写法：用 <code>rem</code> 而不是 <code>px</code> 让它在用户缩放字号时同步变化（WCAG 1.4.4）。<b>坑</b>：固定宽度栏在 320px 屏幕上会吃掉全部宽度，所以必须配合断点或内在布局（第 5 章）把它改成纵向堆叠——这也是"响应式不能只靠 flex 弹性"的原因。',
            en: 'Note the <code>flex: none; width: 16rem</code> pattern for a fixed column: <code>rem</code> rather than <code>px</code> so it scales with the user’s font size (WCAG 1.4.4). <b>Pitfall</b>: a fixed-width column eats the whole screen at 320px, so it must be paired with a breakpoint or with intrinsic layout (Chapter 5) to stack vertically. This is why "responsiveness cannot rely on flex alone".'
          }
        },
        {
          title: { zh: '关键代码 ② 修复被长内容撑破的 flex 项目', en: 'Key code ② Fixing a flex item that long content blows open' },
          purpose: {
            zh: '这是 flex 布局最常被搜索的一个问题，答案就是三行。',
            en: 'This is the single most-searched flexbox problem, and the answer is three lines.'
          },
          lang: 'css',
          code: {
            zh: `.card {
  flex: 1 1 0;
  /* ⭐ 关键点 ③：解除"最小尺寸 = 内容最小尺寸"的限制，允许收缩 */
  min-width: 0;
  /* 纵向 flex 或 grid 里要写 min-height: 0，原因完全相同 */
}

.card__title {
  /* ⭐ 关键点 ④：长英文单词/URL 允许在任意位置断行 */
  overflow-wrap: anywhere;
  /* 想要单行省略号的话： */
  /* white-space: nowrap; overflow: hidden; text-overflow: ellipsis; */
}

/* 用一个长单词做回归测试，避免以后再踩 */
/* <h4 class="card__title">LayoutConsistencyChecklist</h4> */`,
            en: `.card {
  flex: 1 1 0;
  /* ⭐ Key point ③: lift the "minimum size = content minimum" restriction so it can shrink */
  min-width: 0;
  /* inside a column flex or grid, write min-height: 0 — exactly the same reason */
}

.card__title {
  /* ⭐ Key point ④: allow long words and URLs to break anywhere */
  overflow-wrap: anywhere;
  /* for a single-line ellipsis instead: */
  /* white-space: nowrap; overflow: hidden; text-overflow: ellipsis; */
}

/* keep a long word around as a regression test so this never comes back */
/* <h4 class="card__title">LayoutConsistencyChecklist</h4> */`
          },
          points: {
            zh: '<code>overflow-wrap: anywhere</code> 与 <code>word-break: break-all</code> 的区别值得记住：前者<b>只在必要时断词</b>（优先按空格断行，最后手段才切断单词），后者会把所有单词都切碎。中文排版里因为汉字本身可断，两者差别不明显；但只要页面里有英文单词、URL、代码标识符，就该用 <code>anywhere</code>。另外 <code>overflow-wrap: anywhere</code> 会参与最小尺寸计算，这是它比 <code>break-word</code> 更适合 flex 场景的原因。',
            en: 'Worth remembering the difference between <code>overflow-wrap: anywhere</code> and <code>word-break: break-all</code>: the former <b>breaks words only when necessary</b> (preferring spaces, splitting a word as a last resort), while the latter shreds every word. In Chinese typography the difference is subtle because characters break naturally, but as soon as a page contains English words, URLs or code identifiers, use <code>anywhere</code>. It also participates in minimum-size computation, which is why it suits flex better than <code>break-word</code>.'
          }
        }
      ],
      demo: {
        key: 'd-3-2',
        hint: {
          zh: '拖动容器宽度滑杆，调整每个项目的 flex-grow / flex-shrink / flex-basis，右侧显示"剩余空间 → 每项分到多少"的完整计算过程；打开"注入长单词"和 min-width: 0 开关，看溢出如何发生与被修复。',
          en: 'Drag the container width and adjust each item’s flex-grow, flex-shrink and flex-basis; the panel shows the full arithmetic from free space to each item’s final width. Toggle "inject a long word" and min-width: 0 to see the overflow appear and get fixed.'
        }
      }
    },

    /* =========================================================
     * 3.3
     * ======================================================= */
    {
      id: 'ch-3-3',
      num: '3.3',
      title: { zh: '四个经典模板与破坏性测试', en: 'Four classic templates and a stress test' },
      subtitle: {
        zh: '媒体对象、等高卡片、页脚贴底、经典双栏——这四类布局覆盖了绝大多数真实需求。',
        en: 'The media object, equal-height cards, the sticky footer and the classic two-column layout cover the great majority of real requirements.'
      },
      explain: [
        { p: {
          zh: '与其背属性，不如记<b>模板</b>。下面四个模板是 flex 布局的"成语"：一旦认出场景属于哪个模板，代码几乎不需要思考。更重要的是，每个模板都要经过<b>破坏性测试</b>——注入超长文案、长单词、超宽图片，看它是否还成立。',
          en: 'Rather than memorising properties, memorise <b>templates</b>. The four below are flexbox idioms: once you recognise which template a situation is, the code needs almost no thought. More importantly, every template must survive a <b>stress test</b> — inject very long copy, a long word, an oversized image, and see whether it still holds.'
        } },
        { h: { zh: '模板 1：媒体对象（Media Object）', en: 'Template 1: the media object' } },
        { p: {
          zh: '左边一个固定尺寸的图/头像，右边自适应文字。<b>要点</b>：图用 <code>flex: none</code>（不许被压缩），文字容器用 <code>flex: 1; min-width: 0</code>。这是最古老也最常用的布局模式之一，Nicole Sullivan 在 2010 年把它命名为 "media object"。',
          en: 'A fixed-size image or avatar on one side, fluid text on the other. <b>The key</b>: the image gets <code>flex: none</code> (never squeezed), the text container gets <code>flex: 1; min-width: 0</code>. One of the oldest and most reused patterns, named the "media object" by Nicole Sullivan in 2010.'
        } },
        { h: { zh: '模板 2：等高卡片（Equal-height cards）', en: 'Template 2: equal-height cards' } },
        { p: {
          zh: '一行 N 张卡片，高度自动对齐，且卡片内的按钮都在底部对齐。<b>要点</b>：外层 <code>align-items: stretch</code>（默认值，不用写），每张卡片是 <code>flex-direction: column</code>，卡片的正文区 <code>flex: 1</code>。这样即使某张卡片文字多两行，按钮也能"贴"在底部。',
          en: 'N cards in a row, equalised in height, with each card’s button aligned to its bottom. <b>The key</b>: the row uses <code>align-items: stretch</code> (the default, so no need to write it), each card is <code>flex-direction: column</code>, and the card body is <code>flex: 1</code>. A card with two extra lines of text still keeps its button pinned to the bottom.'
        } },
        { h: { zh: '模板 3：页脚贴底（Sticky footer）', en: 'Template 3: sticky footer' } },
        { p: {
          zh: '页面内容不足一屏时，页脚贴着视口底部而不是"浮在中间"。<b>要点</b>：<code>body { min-height: 100dvh; display: flex; flex-direction: column }</code>，主体区 <code>flex: 1</code>。用 <code>dvh</code> 而不是 <code>vh</code>，因为移动端浏览器地址栏收起/展开时 <code>vh</code> 不会跟着变，会出现"底部被地址栏盖住"的经典问题。',
          en: 'When the page is shorter than the viewport, the footer sits at the bottom instead of floating in the middle. <b>The key</b>: <code>body { min-height: 100dvh; display: flex; flex-direction: column }</code> with the main area at <code>flex: 1</code>. Use <code>dvh</code> rather than <code>vh</code>, because on mobile browsers <code>vh</code> does not update as the address bar hides and shows, which produces the classic "footer hidden behind the address bar" bug.'
        } },
        { h: { zh: '模板 4：经典双栏（圣杯/双飞翼的现代写法）', en: 'Template 4: the classic two-column layout, modernised' } },
        { p: {
          zh: '过去用浮动 + 负边距实现，现在三行 flex 就够：侧栏 <code>flex: none</code>、主区 <code>flex: 1; min-width: 0</code>。窄屏时改成纵向堆叠（<code>flex-direction: column</code> 或换用 grid，见第 5 章）。',
          en: 'Once built with floats and negative margins, now three lines of flex: sidebar <code>flex: none</code>, main <code>flex: 1; min-width: 0</code>. On narrow screens it becomes a column (via <code>flex-direction: column</code> or by switching to grid — see Chapter 5).'
        } },
        { note: {
          zh: '<b>破坏性测试清单</b>（每个模板都该过一遍）：①文案换成英文/德语（词更长）；②标题里塞一个 30 字符的长单词；③放一张 2000px 宽的图片；④容器宽度压到 320px；⑤用户把字号放大到 200%。<b>能同时通过这五项的模板才算可用</b>——这也是 3.3 演示里那片"破坏按钮"存在的意义。',
          en: '<b>Stress-test checklist</b> (run it on every template): (1) switch the copy to English or German (longer words); (2) put a 30-character word in the title; (3) add a 2000px-wide image; (4) squeeze the container to 320px; (5) zoom text to 200%. <b>Only a template that survives all five is usable</b> — which is what the "break it" buttons in the 3.3 demo are for.'
        } },
        { case: {
          title: { zh: '案例诊断：问题 ⑤ 卡片高度不齐、图片撑破容器', en: 'Case diagnosis: defect ⑤ uneven cards and breaking images' },
          zh: 'v1 的三张课程卡用 <code>float: left; width: 32%</code> 排布，问题有三个：①浮动元素高度不齐，卡片底部参差；②卡片内的"查看详情"按钮位置随文字长度上下浮动；③卡片里的课程封面图没有 <code>max-width</code>，一张 1200px 的图直接撑破卡片。改用 flex 之后：等高由 <code>align-items</code> 免费获得，按钮用 <code>margin-block-start: auto</code> 贴底，图片用 <code>max-width: 100%; height: auto</code> 收进容器。',
          en: 'The three v1 cards use <code>float: left; width: 32%</code>, which causes three problems: (1) floated items have unequal heights, so the card bottoms are ragged; (2) the "view details" button drifts up and down with the length of the text; (3) the course cover image has no <code>max-width</code>, so a 1200px image bursts the card open. With flex: equal heights come free from <code>align-items</code>, the button is pinned with <code>margin-block-start: auto</code>, and the image is contained by <code>max-width: 100%; height: auto</code>.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 等高卡片 + 按钮贴底', en: 'Key code ① Equal-height cards with bottom-pinned buttons' },
          purpose: {
            zh: '一次写好，之后无论卡片里加多少字，版面都不会乱。',
            en: 'Write it once and the layout survives any amount of added copy.'
          },
          lang: 'css',
          code: {
            zh: `.card-row {
  display: flex;
  gap: var(--space-6);
  /* align-items 默认就是 stretch，所以三张卡片自动等高 —— 不用写 */
}

.card {
  flex: 1 1 0;
  min-width: 0;                 /* ⭐ 防长内容撑破（见 3.2） */
  display: flex;
  flex-direction: column;       /* ⭐ 关键点 ①：卡片内部走纵向主轴 */
  gap: var(--space-3);
}

.card__body { flex: 1; }        /* ⭐ 关键点 ②：正文吃掉剩余高度 */
.card__cta  { margin-block-start: auto; }   /* 双保险：按钮永远贴底 */
.card__cover { max-width: 100%; height: auto; display: block; }  /* ⭐ 关键点 ③：图片不撑破容器 */`,
            en: `.card-row {
  display: flex;
  gap: var(--space-6);
  /* align-items defaults to stretch, so the three cards equalise automatically — no need to write it */
}

.card {
  flex: 1 1 0;
  min-width: 0;                 /* ⭐ prevents long content from blowing it open (see 3.2) */
  display: flex;
  flex-direction: column;       /* ⭐ Key point ①: the card lays out along a vertical main axis */
  gap: var(--space-3);
}

.card__body { flex: 1; }        /* ⭐ Key point ②: the body absorbs the leftover height */
.card__cta  { margin-block-start: auto; }   /* belt and braces: the button always sits at the bottom */
.card__cover { max-width: 100%; height: auto; display: block; }  /* ⭐ Key point ③: images cannot break out */`
          },
          points: {
            zh: '<b>坑</b>：如果卡片里放了 <code>position: absolute</code> 的装饰元素，它不会参与 flex 的高度计算，"等高"会在视觉上失效（卡片看着还是不等高）。另外 <code>flex: 1 1 0</code> 的 <code>0</code> 是 <code>flex-basis</code>，写成 <code>flex: 1</code> 时浏览器会自动补成 <code>1 1 0%</code>，两者等价；但显式写出来更适合教学与代码审查。',
            en: '<b>Pitfall</b>: if a card contains an absolutely positioned decoration, that decoration takes no part in flex height computation and the "equal height" look breaks. Also note that in <code>flex: 1 1 0</code> the <code>0</code> is <code>flex-basis</code>; <code>flex: 1</code> expands to <code>1 1 0%</code>, which is equivalent — but writing it explicitly reads better in reviews and teaching material.'
          }
        },
        {
          title: { zh: '关键代码 ② 页脚贴底：100dvh 而不是 100vh', en: 'Key code ② Sticky footer: 100dvh, not 100vh' },
          purpose: {
            zh: '内容不满一屏时页脚贴底；内容超过一屏时页脚自然跟随文档流。',
            en: 'The footer sticks to the bottom when the page is short, and follows the document normally when it is long.'
          },
          lang: 'css',
          code: {
            zh: `body {
  /* ⭐ 关键点 ④：dvh = 动态视口高度，移动端地址栏收放时会同步更新 */
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.site-main { flex: 1; }        /* 主体吃掉剩余高度，把页脚压到底部 */
.site-footer { margin-block-start: auto; }   /* 或者在这里也用 auto margin */

/* 兼容旧浏览器时可以写成两行：
   min-height: 100vh;
   min-height: 100dvh;   后者覆盖前者，不支持的浏览器自动忽略 */`,
            en: `body {
  /* ⭐ Key point ④: dvh = dynamic viewport height, updated as mobile address bars show and hide */
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.site-main { flex: 1; }        /* the main area absorbs the leftover height and pushes the footer down */
.site-footer { margin-block-start: auto; }   /* or use an auto margin here instead */

/* For older browsers, write both lines:
   min-height: 100vh;
   min-height: 100dvh;   the second overrides the first; unsupporting browsers ignore it */`
          },
          points: {
            zh: '<code>100vh</code> 在 iOS Safari 上长期偏大（等于"地址栏收起时"的高度），所以内容底部会被地址栏盖住，用户得滚一下才能看到。视口单位家族现在的分工是：<code>vh</code> 大视口、<code>svh</code> 小视口、<code>dvh</code> 动态跟随、<code>lvh</code> 大视口。做"满屏"布局用 <code>dvh</code>；做"绝不溢出"的布局（比如全屏对话）用 <code>svh</code> 更安全。',
            en: 'On iOS Safari <code>100vh</code> was long measured as the "address bar hidden" height, so content at the bottom sat behind the address bar until the user scrolled. The viewport-unit family now divides the work: <code>vh</code> large viewport, <code>svh</code> small viewport, <code>dvh</code> dynamic, <code>lvh</code> large. Use <code>dvh</code> for full-screen layouts; for layouts that must never overflow (a full-screen dialog, say), <code>svh</code> is the safer choice.'
          }
        }
      ],
      demo: {
        key: 'd-3-3',
        hint: {
          zh: '四个模板一键切换，然后按下"破坏按钮"：注入超长文案、30 字符长单词、2000px 宽图片、压到 320px、放大字号到 200%。每组测试都会实测并报告"是否溢出 / 是否仍然对齐"，最后给出该模板的健壮性评分。',
          en: 'Switch between the four templates, then hit the "break it" buttons: long copy, a 30-character word, a 2000px image, a 320px container and 200% text. Each test measures and reports whether the template overflows or stays aligned, and scores its robustness.'
        }
      }
    }
  ]
};
