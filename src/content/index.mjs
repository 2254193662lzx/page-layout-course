/* =============================================================
 * 课程门户内容 / course portal content
 * 中英同源：每个字段都是 { zh, en }，构建期成对输出
 * ============================================================= */

export default {
  /* 章节顺序（对应 src/content/ch{N}.mjs） */
  chapters: [1, 2, 3, 4, 5, 6],

  meta: {
    title: {
      zh: '《页面布局之道》',
      en: 'The Art of Page Layout'
    },
    subtitle: {
      zh: '从「摆盒子」到「设计信息」：6 章 18 节，讲解 · 关键代码 · 动态演示三合一，围绕同一个案例把布局讲透。',
      en: 'From "pushing boxes around" to designing information: 6 chapters, 18 sections, each pairing explanation, key code and a live interactive demo — all built around one running case.'
    },
    meta: {
      zh: '零依赖静态站点（纯 HTML/CSS/ESM）· 中英双语 · 全部演示可离线运行 · 可直接部署到 GitHub Pages',
      en: 'Zero-dependency static site (HTML/CSS/ESM) · Bilingual · Every demo runs offline · Deploys straight to GitHub Pages'
    },
    lead: {
      zh: '每个小节含 3 个 tab：📖 讲解（理论 + 案例诊断）/ ⌨️ 关键代码（带 ⭐ 关键行与踩坑说明）/ ▶️ 演示（可拖拽、可调参、可破坏性测试的实时沙盒）。点击任一卡片进入章节。',
      en: 'Every section has 3 tabs: 📖 Explain (theory + case diagnosis) / ⌨️ Key Code (with ⭐ marked lines and pitfall notes) / ▶️ Demo (a live sandbox you can drag, tune and stress-test). Click any card to enter.'
    },
    stats: [
      { n: '6', zh: '章 / chapters', en: 'chapters' },
      { n: '18', zh: '节 / sections', en: 'sections' },
      { n: '18', zh: '个交互演示 / live demos', en: 'live demos' },
      { n: '2', zh: '种语言 / languages', en: 'languages' },
      { n: '0', zh: '运行时依赖 / runtime deps', en: 'runtime deps' }
    ]
  },

  caseIntro: {
    title: {
      zh: 'CourseHub 课程主页，从 v1 到 v2',
      en: 'The CourseHub landing page, v1 → v2'
    },
    lead: {
      zh: '整门课只做一个案例：一门在线课程的主页 CourseHub。它的 v1 版本「能跑」，但在真实使用中暴露了 8 个布局问题。每一章先诊断其中几条，讲清背后的理论与浏览器规则，再用可交互的演示把它修好；第 6 章给出完整的 v1 → v2 对比与布局评审清单。',
      en: 'The whole course works on a single case: the landing page of an online course, CourseHub. Its v1 "works" — yet real usage exposed eight layout defects. Each chapter diagnoses a few of them, explains the underlying theory and browser rules, then fixes them in an interactive demo. Chapter 6 delivers the full v1 → v2 comparison and a layout review checklist.'
    },
    defects: [
      { n: '①', zh: '<b>层次缺失</b>：标题、正文、按钮统统 16px，用户 3 秒内找不到「立即报名」。', en: '<b>No hierarchy</b>: headings, body text and the CTA button are all 16px, so users cannot find "Enroll" within 3 seconds.' },
      { n: '②', zh: '<b>间距无系统</b>：21px / 13px / 37px 随手写，节奏混乱，元素间对不齐。', en: '<b>Arbitrary spacing</b>: 21px, 13px, 37px written by hand; the rhythm is chaotic and edges stop lining up.' },
      { n: '③', zh: '<b>用绝对定位摆盒子</b>：header 高度写死 120px，课程标题一长就压住下面的内容。', en: '<b>Absolute positioning</b>: the header is hard-coded to 120px tall, so a longer course title overlaps the content below.' },
      { n: '④', zh: '<b>靠空格对齐导航</b>：菜单项之间用 <code>&amp;nbsp;</code> 和固定宽度撑开，文案一改就错位。', en: '<b>Space-hacked navigation</b>: menu items are spaced with <code>&amp;nbsp;</code> and fixed widths, so any copy change breaks the alignment.' },
      { n: '⑤', zh: '<b>卡片高度不齐</b>：三张课程卡长短不一，图片和小屏下的长标题还会撑破容器。', en: '<b>Uneven cards</b>: the three course cards differ in height, and images or long titles overflow their containers on small screens.' },
      { n: '⑥', zh: '<b>用 padding 假装网格</b>：三栏靠左右 padding 凑出来，内容与网格对不齐，也无法跨列。', en: '<b>Fake grid</b>: the three columns are faked with left/right padding, so content never lines up with the grid and items cannot span columns.' },
      { n: '⑦', zh: '<b>只做桌面端</b>：320px 宽度下出现横向滚动条，点击目标小于 24px。', en: '<b>Desktop only</b>: at 320px the page scrolls horizontally and tap targets fall below 24px.' },
      { n: '⑧', zh: '<b>DOM 顺序与视觉顺序不一致</b>：用 <code>order</code> 把侧栏挪到前面，键盘 Tab 顺序乱跳、屏幕阅读器读错。', en: '<b>DOM order ≠ visual order</b>: <code>order</code> moves the sidebar first visually, so keyboard Tab order jumps around and screen readers read the wrong sequence.' }
    ],
    note: {
      zh: '<b>为什么要用案例贯穿？</b>布局知识最大的问题是「语法都会，一到真项目就用错」。把每个知识点都挂到同一个案例的具体症状上，你记住的就不是 <code>display:flex</code> 这个语法，而是「这种症状→这种布局算法→这种写法」的对应关系。',
      en: '<b>Why one running case?</b> The real problem with layout knowledge is that people know the syntax but misapply it in real projects. By attaching every concept to a concrete symptom in one case, what you remember is not the syntax <code>display:flex</code> but the mapping "symptom → layout algorithm → idiom".'
    }
  },

  usage: [
    {
      icon: '🎓',
      title: { zh: '课堂讲解', en: 'In class' },
      body: {
        zh: '打开任一章节，左侧选小节，顶部切换 <b>讲解 / 关键代码 / 演示</b>，可以一边讲一边现场拖参数。快捷键：<code>[</code> <code>]</code> 切小节，<code>1</code> <code>2</code> <code>3</code> 切 tab。',
        en: 'Open a chapter, pick a section on the left, switch <b>Explain / Key Code / Demo</b> on top — you can drag the demo parameters live while lecturing. Shortcuts: <code>[</code> <code>]</code> for sections, <code>1</code> <code>2</code> <code>3</code> for tabs.'
      }
    },
    {
      icon: '📖',
      title: { zh: '学生自学', en: 'Self study' },
      body: {
        zh: '每节的讲解 tab 都按「案例症状 → 理论依据 → 浏览器规则」推进；关键代码 tab 的 ⭐ 行就是必须记住的那几行，下面配「为什么这么写」与「有什么坑」。',
        en: 'The Explain tab always moves from case symptom → theoretical basis → browser rule. The ⭐ lines in Key Code are the ones to remember, each followed by "why write it this way" and "what breaks otherwise".'
      }
    },
    {
      icon: '🔬',
      title: { zh: '演示即实验', en: 'Demos as experiments' },
      body: {
        zh: '演示不是录屏，而是可操作的沙盒：调参、拖拽、注入超长文案做破坏性测试，并且实时显示浏览器的真实计算值（计算宽度、是否溢出、对齐偏差）。',
        en: 'Demos are not screencasts but operable sandboxes: tune parameters, drag things, inject absurdly long text to stress-test, and watch the browser’s real computed values (widths, overflow, alignment drift).'
      }
    },
    {
      icon: '🌐',
      title: { zh: '中英双语', en: 'Bilingual' },
      body: {
        zh: '右上角切换语言，或加 <code>?lang=en</code> 直达英文。两种语言来自同一份结构化内容，因此内容严格一致（含代码注释）。',
        en: 'Switch languages at the top right, or append <code>?lang=en</code>. Both languages are generated from the same structured source, so they stay strictly consistent — including code comments.'
      }
    }
  ],

  about: [
    {
      icon: '🧠',
      title: { zh: '理论来源', en: 'Sources' },
      body: {
        zh: '格式塔知觉组织原则（Wertheimer 1923）· Robin Williams《写给大家看的设计书》CRAP 四原则 · Müller-Brockmann《Grid Systems in Graphic Design》· WCAG 2.2（1.4.10 Reflow / 1.4.4 Resize Text / 2.4.3 Focus Order）· Jen Simmons「内在布局」· Heydon Pickering & Andy Bell《Every Layout》· MDN 与 CSS 规范中关于格式化上下文、弹性盒与网格的定义。',
        en: 'Gestalt principles of perceptual organisation (Wertheimer 1923) · Robin Williams, <i>The Non-Designer’s Design Book</i> (CRAP) · Müller-Brockmann, <i>Grid Systems in Graphic Design</i> · WCAG 2.2 (1.4.10 Reflow, 1.4.4 Resize Text, 2.4.3 Focus Order) · Jen Simmons on intrinsic layout · Heydon Pickering & Andy Bell, <i>Every Layout</i> · MDN and the CSS specifications on formatting contexts, flexbox and grid.'
      }
    },
    {
      icon: '🎯',
      title: { zh: '设计原则', en: 'Design principles' },
      body: {
        zh: '<b>案例为中心，不是语法为中心</b>。不单独罗列 API，而是每个知识点都回答一个问题：案例里的这个症状，用哪条浏览器规则来解决？为什么要这么做？不做会怎样？',
        en: '<b>Case-first, not syntax-first.</b> No API dumps: every concept answers one question — which browser rule fixes this symptom in the case, why this way, and what happens otherwise.'
      }
    },
    {
      icon: '🛠️',
      title: { zh: '技术栈', en: 'Tech stack' },
      body: {
        zh: '纯 HTML + CSS + 原生 ES Modules，<b>零运行时依赖</b>；内容写在结构化 JS 里，<code>node build.mjs</code> 生成 <code>docs/</code> 静态站点。演示全部是原生 DOM 操作，没有任何图表库。',
        en: 'Plain HTML + CSS + native ES modules with <b>zero runtime dependencies</b>. Content lives in structured JS and <code>node build.mjs</code> emits the static site into <code>docs/</code>. Demos are pure DOM code — no charting or UI library.'
      }
    },
    {
      icon: '📦',
      title: { zh: '如何发布', en: 'How to publish' },
      body: {
        zh: '把仓库推到 GitHub，在 Settings → Pages 里选择 <code>main</code> 分支的 <code>/docs</code> 目录即可得到 <code>https://&lt;用户名&gt;.github.io/&lt;仓库名&gt;/</code>；也可以直接用附带的 GitHub Actions 工作流自动发布。',
        en: 'Push the repo to GitHub, then in Settings → Pages pick the <code>/docs</code> folder on <code>main</code> to get <code>https://&lt;user&gt;.github.io/&lt;repo&gt;/</code>. An included GitHub Actions workflow can also publish automatically.'
      }
    }
  ],

  footer: {
    zh: '© 2026 《页面布局之道》· 中英双语交互教学网站 · 6 章 18 节 · 18 个可交互演示 · 零依赖静态站点',
    en: '© 2026 The Art of Page Layout · bilingual interactive course · 6 chapters, 18 sections, 18 live demos · zero-dependency static site'
  }
};
