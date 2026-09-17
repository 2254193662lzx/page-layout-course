/* =============================================================
 * 第 4 章 · 二维布局：Grid 与网格系统 / Ch 4 · Grid and Grid Systems
 * 案例病灶：⑥ 用 padding 假装网格
 * ============================================================= */

export default {
  id: 4,
  slug: 'lesson-04',
  num: { zh: '第 4 章', en: 'Chapter 4' },
  title: { zh: '二维布局：Grid 与网格系统', en: 'Two-dimensional layout: grid and grid systems' },
  subtitle: {
    zh: 'Flexbox 管一行一列，Grid 同时管行和列。它不只是新语法，更是把"网格系统"这个几百年的排版思想变成代码。',
    en: 'Flexbox manages one row or one column; grid manages rows and columns at once. It is not just new syntax — it turns a centuries-old idea, the grid system, into code.'
  },
  lede: {
    zh: '瑞士网格系统、栏栅与水槽、<code>fr</code> 的本质是"分配剩余空间"、<code>minmax/auto-fit/auto-fill</code> 的差别、以及用 <code>grid-template-areas</code> 把布局写成一份可读的契约。',
    en: 'The Swiss grid system, columns and gutters, why <code>fr</code> really means "share the leftover space", the difference between <code>minmax/auto-fit/auto-fill</code>, and writing layout as a readable contract with <code>grid-template-areas</code>.'
  },
  tags: [
    { zh: '瑞士网格系统', en: 'Swiss grid system' },
    { zh: '栏栅与水槽', en: 'Columns & gutters' },
    { zh: 'fr 单位', en: 'The fr unit' },
    { zh: 'auto-fit / auto-fill', en: 'auto-fit / auto-fill' },
    { zh: 'grid-template-areas', en: 'grid-template-areas' },
    { zh: 'min-content / max-content', en: 'min- / max-content' }
  ],
  caseNote: {
    zh: '本章诊断案例的 <b>⑥ 用 padding 假装网格</b>：CourseHub v1 的三栏课程区靠 <code>padding-left: 5%</code> 凑出来，内容与页头对不齐，也无法让"重点课程"跨两列。',
    en: 'This chapter diagnoses defect <b>⑥ fake grid</b>: the v1 three-column area is faked with <code>padding-left: 5%</code>, so its content never lines up with the header and a featured course cannot span two columns.'
  },

  sections: [
    /* =========================================================
     * 4.1
     * ======================================================= */
    {
      id: 'ch-4-1',
      num: '4.1',
      title: { zh: '从瑞士网格到 CSS Grid', en: 'From the Swiss grid to CSS grid' },
      subtitle: {
        zh: '网格不是「对齐辅助线」，而是一种把版面变成可预测系统的设计方法。',
        en: 'A grid is not a set of alignment guides; it is a method for turning a page into a predictable system.'
      },
      explain: [
        { p: {
          zh: '1950 年代，Josef Müller-Brockmann 等瑞士设计师把网格系统确立为现代排版的基础方法：把版面切成<b>等宽的栏</b>，栏之间留固定的<b>水槽</b>（gutter），所有内容必须落在栏的边界上或跨整数栏。<b>关键不在于"整齐好看"，而在于"可复用的决策"</b>——一旦网格定了，任何人在任何时候放入新内容，位置都是确定的。',
          en: 'In the 1950s Josef Müller-Brockmann and other Swiss designers established the grid system as the basis of modern typography: slice the page into <b>equal columns</b> separated by fixed <b>gutters</b>, and require all content to align to column edges or span a whole number of columns. <b>The point is not tidiness but reusable decisions</b> — once the grid is set, anyone placing new content at any time gets a determinate position.'
        } },
        { theory: {
          zh: '<b>网格系统解决的是"协作与一致性"问题，不是"美学"问题。</b>在多人协作里，如果没有网格，"这个卡片该多宽"每次都要重新讨论；有了 12 栏网格，答案变成"跨 4 栏"，沟通成本趋近于零。这与今天的 <b>design token</b>、<b>组件库</b>是同一个思路：把反复出现的决策固化下来，减少每次的协商。',
          en: '<b>A grid system solves collaboration and consistency, not aesthetics.</b> Without one, "how wide should this card be" is re-negotiated every time. With a 12-column grid the answer becomes "span 4 columns" and the communication cost drops to nearly zero. This is the same idea behind design tokens and component libraries: fix the recurring decisions so they stop being renegotiated.',
          cite: {
            zh: 'Josef Müller-Brockmann《Grid Systems in Graphic Design》(1981)',
            en: 'Josef Müller-Brockmann, <i>Grid Systems in Graphic Design</i> (1981)'
          }
        } },
        { h: { zh: '为什么是 12 栏？', en: 'Why 12 columns?' } },
        { ul: [
          { zh: '<b>可整除性最强</b>：12 可以被 2、3、4、6 整除，于是"一半/三分之一/四分之一/六分之一"都能用整数栏表达。10 栏做不到三等分，16 栏做不到三等分。', en: '<b>Best divisibility</b>: 12 divides by 2, 3, 4 and 6, so halves, thirds, quarters and sixths are all whole column spans. 10 columns cannot express thirds; 16 cannot either.' },
          { zh: '<b>与间距尺度配合</b>：12 栏 + 8pt 水槽，能让栏宽自动落在整数像素上，减少半像素模糊。', en: '<b>Pairs with a spacing scale</b>: 12 columns plus an 8pt gutter keeps column widths on whole pixels, avoiding half-pixel blur.' },
          { zh: '<b>够用而不繁琐</b>：24 栏更灵活但读代码时"跨 13 栏"就已经很难想象了。', en: '<b>Flexible without being unwieldy</b>: 24 columns allow more precision, but "span 13" is already hard to picture when reading code.' }
        ] },
        { h: { zh: 'CSS Grid 与设计网格的对应关系', en: 'How CSS grid maps onto a design grid' } },
        { table: {
          head: [{ zh: '设计概念', en: 'Design concept' }, { zh: 'CSS 实现', en: 'CSS' }, { zh: '说明', en: 'Note' }],
          rows: [
            [{ zh: '栏（column）', en: 'Column' }, { zh: '<code>grid-template-columns: repeat(12, 1fr)</code>', en: '<code>grid-template-columns: repeat(12, 1fr)</code>' }, { zh: '12 条等宽轨道', en: 'Twelve equal tracks' }],
            [{ zh: '水槽（gutter）', en: 'Gutter' }, { zh: '<code>gap: 24px</code>', en: '<code>gap: 24px</code>' }, { zh: '只在轨道之间产生，两端没有', en: 'Exists only between tracks, not at the edges' }],
            [{ zh: '跨栏', en: 'Span' }, { zh: '<code>grid-column: span 4</code>', en: '<code>grid-column: span 4</code>' }, { zh: '比计算宽度更可读', en: 'Far more readable than computing widths' }],
            [{ zh: '版心', en: 'Content width' }, { zh: '<code>max-width</code> + <code>margin-inline: auto</code>', en: '<code>max-width</code> + <code>margin-inline: auto</code>' }, { zh: '限制每行字数，提升可读性', en: 'Bounds the line length for readability' }]
          ]
        } },
        { note: {
          zh: '<b>一个常见误解</b>：Grid 不是"更强大的 Flex"。它们的<b>适用维度不同</b>：内容需要"沿一个方向流动、尺寸由内容决定"时用 Flex（导航、标签、按钮组）；需要"行列同时对齐、尺寸由网格决定"时用 Grid（页面骨架、卡片墙、表单）。判断方法：<b>如果对齐要求只在一条线上，用 Flex；如果要求横竖两条线同时对，用 Grid。</b>',
          en: '<b>A common misconception</b>: grid is not "more powerful flexbox". They work in <b>different dimensions</b>: use flex when content flows along one direction and sizes come from the content (nav bars, tags, button groups); use grid when rows and columns must align together and sizes come from the grid (page skeletons, card walls, forms). Test: <b>if alignment matters on one line only, use flex; if it must hold on both axes at once, use grid.</b>'
        } },
        { case: {
          title: { zh: '案例诊断：问题 ⑥ 用 padding 假装网格', en: 'Case diagnosis: defect ⑥ a grid faked with padding' },
          zh: 'v1 的三栏课程区写成：<code>.col { float: left; width: 30%; padding-left: 5% }</code>。三个后果：①栏与栏的视觉边界不等距（padding 参与盒模型计算，实际内容宽只有 25%）；②课程区的内容左边缘与页头、与页脚<b>对不齐</b>，因为 <code>5%</code> 是相对各自父元素算的；③想让"重点课程"横跨两栏，只能再写一条 <code>width: 65%</code>，然后所有百分比都要跟着改。换成 Grid 后，"跨栏"变成 <code>grid-column: span 2</code>，对齐由网格统一保证。',
          en: 'The v1 three-column area reads <code>.col { float: left; width: 30%; padding-left: 5% }</code>. Three consequences: (1) the visual gap between columns is uneven (padding is inside the box, so the content is only 25% wide); (2) the left edge of that area <b>does not line up</b> with the header or footer, because <code>5%</code> resolves against different parents; (3) making one "featured" course span two columns means writing another <code>width: 65%</code> and updating every percentage. With grid, spanning becomes <code>grid-column: span 2</code> and alignment is guaranteed by the grid.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 12 栏网格骨架', en: 'Key code ① A 12-column grid skeleton' },
          purpose: {
            zh: '把网格定义成一个容器的属性，页面里所有"跨栏"都变成可读的声明。',
            en: 'Define the grid as a property of one container, and every span in the page becomes a readable declaration.'
          },
          lang: 'css',
          code: {
            zh: `.page-grid {
  display: grid;
  /* ⭐ 关键点 ①：12 条等宽轨道（1fr = 剩余空间的一份） */
  grid-template-columns: repeat(12, minmax(0, 1fr));
  /* ⭐ 关键点 ②：水槽用 gap 表达，只出现在轨道之间，
     不会像 padding 那样把首尾也挤进来，因此内容左边缘永远与版心对齐 */
  gap: var(--space-5);
  max-width: 1180px;
  margin-inline: auto;         /* 版心居中 */
  padding-inline: var(--space-4);
}

/* ⭐ 关键点 ③：跨栏用 span，而不是算百分比 */
.hero        { grid-column: 1 / -1; }   /* 整行（1 到最后一栏） */
.course-card { grid-column: span 4; }   /* 4 栏 ≈ 三分之一 */
.featured    { grid-column: span 8; }   /* 8 栏 ≈ 三分之二 */`,
            en: `.page-grid {
  display: grid;
  /* ⭐ Key point ①: twelve equal tracks (1fr = one share of the leftover space) */
  grid-template-columns: repeat(12, minmax(0, 1fr));
  /* ⭐ Key point ②: the gutter is expressed by gap, which exists only between tracks.
     Unlike padding it does not eat into the first and last column, so the content’s left
     edge always lines up with the content width */
  gap: var(--space-5);
  max-width: 1180px;
  margin-inline: auto;         /* centre the content width */
  padding-inline: var(--space-4);
}

/* ⭐ Key point ③: spans, not computed percentages */
.hero        { grid-column: 1 / -1; }   /* full row (from line 1 to the last line) */
.course-card { grid-column: span 4; }   /* 4 columns ≈ one third */
.featured    { grid-column: span 8; }   /* 8 columns ≈ two thirds */`
          },
          points: {
            zh: '注意 <code>minmax(0, 1fr)</code> 里的 <code>0</code>：这是第 3 章讲过的 <code>min-width: auto</code> 问题在 Grid 里的对应版本。写成 <code>1fr</code> 时隐含最小值是 <code>auto</code>（即 min-content），长单词一样会撑破轨道；写成 <code>minmax(0, 1fr)</code> 才能让轨道真正可以收缩。<b>这是 12 栏网格最容易被忽略的一行。</b>',
            en: 'Note the <code>0</code> in <code>minmax(0, 1fr)</code>: it is the grid counterpart of the <code>min-width: auto</code> problem from Chapter 3. Written as plain <code>1fr</code> the implicit minimum is <code>auto</code> (i.e. min-content), so long words still blow the track open; <code>minmax(0, 1fr)</code> is what lets a track actually shrink. <b>This is the most commonly missed line in a 12-column grid.</b>'
          }
        },
        {
          title: { zh: '关键代码 ② 把网格对齐"暴露"成可检查的东西', en: 'Key code ② Make grid alignment something you can check' },
          purpose: {
            zh: '网格的价值是"对齐可验证"。开发时打开一条调试辅助线，就能发现越界的元素。',
            en: 'The value of a grid is that alignment becomes verifiable. A debug overlay during development exposes anything off-grid.'
          },
          lang: 'css',
          code: {
            zh: `/* ⭐ 关键点 ④：把栏栅画出来（只在开发时开启） */
.page-grid { position: relative; }
.debug-grid .page-grid::before {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline: var(--space-4);      /* 与内容区对齐 */
  pointer-events: none;
  z-index: 3;
  /* 用 repeating-linear-gradient 画出 12 栏：轨道宽 + 水槽 */
  background-image: repeating-linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.14) 0 calc((100% - 11 * var(--space-5)) / 12),
    transparent 0 calc((100% - 11 * var(--space-5)) / 12 + var(--space-5))
  );
}

/* ⭐ 关键点 ⑤：越界检查 —— 任何元素宽度超出轨道都会被看画成红色 */
.debug-grid .page-grid > * { outline: 1px solid rgba(225, 29, 72, 0.35); }`,
            en: `/* ⭐ Key point ④: draw the columns (development only) */
.page-grid { position: relative; }
.debug-grid .page-grid::before {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline: var(--space-4);      /* match the content area */
  pointer-events: none;
  z-index: 3;
  /* paint twelve columns with a repeating gradient: track width + gutter */
  background-image: repeating-linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.14) 0 calc((100% - 11 * var(--space-5)) / 12),
    transparent 0 calc((100% - 11 * var(--space-5)) / 12 + var(--space-5))
  );
}

/* ⭐ Key point ⑤: out-of-bounds check — anything wider than its track shows up in red */
.debug-grid .page-grid > * { outline: 1px solid rgba(225, 29, 72, 0.35); }`
          },
          points: {
            zh: '这条"把网格画出来"的技巧在实践中非常有用：<b>网格的价值只有在能被看见、被检查时才成立</b>。很多团队号称有 12 栏网格，但页面上到处是 <code>margin-left: 13px</code>，实际并没有对齐——因为没有可视化检查手段。把调试层做成一个开关（如 4.1 演示里的"叠加 12 栏"），评审时可以直接打开看。',
            en: 'This "draw the grid" trick is genuinely useful in practice: <b>a grid only delivers value when it can be seen and checked</b>. Many teams claim a 12-column grid while the page is full of <code>margin-left: 13px</code>, so nothing actually aligns — because there is no way to see it. Make the overlay a switch (like "overlay 12 columns" in the 4.1 demo) so it can be flipped on in review.'
          }
        }
      ],
      demo: {
        key: 'd-4-1',
        hint: {
          zh: '叠加 12 栏网格与水槽叠层，拖动内容块让它吸附到轨道上，实时显示"偏移了多少 px、跨了几栏"；打开"用 padding 假装网格"对比 v1 的对齐误差。',
          en: 'Overlay the 12-column grid and gutters, drag blocks so they snap to tracks, and read how many pixels off and how many columns they span. Toggle "fake grid with padding" to compare the v1 alignment error.'
        }
      }
    },

    /* =========================================================
     * 4.2
     * ======================================================= */
    {
      id: 'ch-4-2',
      num: '4.2',
      title: { zh: '轨道、fr 与内在尺寸', en: 'Tracks, fr and intrinsic sizing' },
      subtitle: {
        zh: 'fr 不是百分比，minmax 不是区间，auto-fit 与 auto-fill 差一个关键字但结果完全不同。',
        en: 'fr is not a percentage, minmax is not a range in the everyday sense, and auto-fit vs auto-fill differ by one keyword with completely different results.'
      },
      explain: [
        { h: { zh: 'fr 到底是什么', en: 'What fr actually is' } },
        { p: {
          zh: '<code>fr</code> 的官方定义是"网格容器中剩余空间的一份"。注意两个关键词：<b>剩余</b>（先扣掉固定尺寸轨道和 gap）和<b>一份</b>（按 fr 数值的比例分配）。所以 <code>1fr 2fr</code> 并不是"33% 和 66%"——如果同时存在一个 <code>200px</code> 的固定轨道，那么 fr 分的是剩下那部分空间。',
          en: '<code>fr</code> is defined as "a share of the leftover space in the grid container". Two keywords matter: <b>leftover</b> (fixed-size tracks and gaps come out first) and <b>share</b> (distributed in proportion to the fr values). So <code>1fr 2fr</code> does not mean 33% and 66% — if a <code>200px</code> track is also present, the frs divide only what remains.'
        } },
        { table: {
          head: [{ zh: '值', en: 'Value' }, { zh: '含义', en: 'Meaning' }, { zh: '何时用', en: 'When to use' }],
          rows: [
            [{ zh: '<code>1fr</code>', en: '<code>1fr</code>' }, { zh: '剩余空间的一份，隐含最小值 auto（= min-content）', en: 'One share of leftover space; implicit minimum is auto (= min-content)' }, { zh: '常规等分', en: 'Ordinary equal splits' }],
            [{ zh: '<code>minmax(0, 1fr)</code>', en: '<code>minmax(0, 1fr)</code>' }, { zh: '同上，但允许收缩到比内容更窄', en: 'Same, but allowed to shrink narrower than its content' }, { zh: '<b>内容可能很长的等分轨道（几乎总是该写这个）</b>', en: '<b>Equal tracks that may hold long content — almost always what you want</b>' }],
            [{ zh: '<code>min-content</code>', en: '<code>min-content</code>' }, { zh: '最窄不溢出的宽度（最长单词的宽度）', en: 'Narrowest width without overflow (the widest word)' }, { zh: '"绝不换行地放下内容"', en: 'Fit content without wrapping' }],
            [{ zh: '<code>max-content</code>', en: '<code>max-content</code>' }, { zh: '完全不换行所需的宽度', en: 'Width needed to never wrap' }, { zh: '表格列、标签', en: 'Table columns, tags' }],
            [{ zh: '<code>auto</code>', en: '<code>auto</code>' }, { zh: '介于 min-content 与 max-content 之间，由可用空间决定', en: 'Between min-content and max-content, decided by available space' }, { zh: '"能大则大，该小则小"', en: '"As big as possible, as small as necessary"' }]
          ]
        } },
        { h: { zh: 'auto-fit 与 auto-fill：一行之差，两种布局', en: 'auto-fit vs auto-fill: one keyword, two layouts' } },
        { p: {
          zh: '<code>repeat(auto-fit, minmax(240px, 1fr))</code>：容器能放几列就放几列；<b>如果放不满，多余的空轨道会被"折叠"</b>，现有项目被拉伸填满整行。',
          en: '<code>repeat(auto-fit, minmax(240px, 1fr))</code>: fit as many columns as the container allows; <b>if the row is not full, the empty tracks collapse</b> and the existing items stretch to fill the row.'
        } },
        { p: {
          zh: '<code>repeat(auto-fill, minmax(240px, 1fr))</code>：同样能放几列就放几列，<b>但会保留空轨道</b>，所以只有两张卡片时，它们只占最左边两列，右边留白。',
          en: '<code>repeat(auto-fill, minmax(240px, 1fr))</code>: also fits as many columns as possible, <b>but keeps the empty tracks</b>, so with only two cards they occupy the two leftmost columns and the right side stays empty.'
        } },
        { note: {
          zh: '<b>怎么选</b>：卡片墙一般用 <code>auto-fit</code>（想让最后一行铺满）；需要"每列固定宽度、数量不足时不要拉伸"时用 <code>auto-fill</code>（比如日期选择器、缩略图，拉伸会显得奇怪）。另外注意 <code>minmax(min(100%, 17rem), 1fr)</code> 这个写法：<code>min(100%, 17rem)</code> 保证<b>容器比 17rem 还窄时，轨道下限跟着容器缩小</b>，否则 320px 屏幕上就会出现横向滚动条。',
          en: '<b>How to choose</b>: card walls usually want <code>auto-fit</code> (so the last row fills); use <code>auto-fill</code> when each column must keep a fixed width and must not stretch when there are few items (a date picker or a thumbnail strip looks wrong stretched). Also note the idiom <code>minmax(min(100%, 17rem), 1fr)</code>: <code>min(100%, 17rem)</code> makes the lower bound shrink with the container when it is narrower than 17rem, which is what prevents a horizontal scrollbar at 320px.'
        } },
        { theory: {
          zh: '这套思路叫做<b>内在布局</b>（intrinsic layout）：让布局尺寸由<b>内容与容器双方共同协商</b>决定，而不是由设计稿上的固定像素决定。<code>minmax()</code>、<code>min-content</code>、<code>auto-fit</code>、<code>flex-wrap</code> 都是这个思想的产物。它的直接收益是：<b>不需要为每种屏幕宽度写断点</b>，因为布局本身就会"自己适应"。第 5 章会把这条线索继续展开。',
          en: 'This approach is called <b>intrinsic layout</b>: sizes are negotiated between the content and the container instead of being fixed by pixels in a design file. <code>minmax()</code>, <code>min-content</code>, <code>auto-fit</code> and <code>flex-wrap</code> all come from that idea. Its direct payoff is that <b>you do not need a breakpoint per screen width</b>, because the layout adapts on its own. Chapter 5 follows this thread further.',
          cite: {
            zh: 'Jen Simmons 关于内在网页设计的系列演讲；CSS Grid Layout §7「Sizing」',
            en: 'Jen Simmons’ talks on intrinsic web design; CSS Grid Layout §7 "Sizing"'
          }
        } },
        { case: {
          title: { zh: '案例诊断：一行 CSS 替代三个断点', en: 'Case diagnosis: one line replacing three breakpoints' },
          zh: 'v1 的课程卡片区写了三套媒体查询：>1024px 三列、>640px 两列、其余一列。用 <code>repeat(auto-fit, minmax(min(100%, 17rem), 1fr))</code> 之后，这三套查询全部可以删掉——无论容器多宽，卡片数都会自动调整，<b>而且是根据容器宽度而不是视口宽度</b>，所以把同一个卡片区放进侧栏或对话框里也照样正确。',
          en: 'The v1 card area carries three media queries: three columns above 1024px, two above 640px, one below. With <code>repeat(auto-fit, minmax(min(100%, 17rem), 1fr))</code> all three can be deleted — the column count adapts to any container width, and it responds to <b>the container, not the viewport</b>, so the same card area also behaves correctly inside a sidebar or a dialog.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 一行实现自适应卡片墙', en: 'Key code ① Adaptive card wall in one line' },
          purpose: {
            zh: '这是 CSS Grid 里"性价比最高"的一行：替代了几乎所有卡片墙的媒体查询。',
            en: 'The single best-value line in CSS grid: it replaces almost every media query a card wall would need.'
          },
          lang: 'css',
          code: {
            zh: `.card-wall {
  display: grid;
  /* ⭐ 关键点 ①：能放几列放几列；min() 让容器极窄时下限跟着缩，避免横向滚动 */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: var(--space-6);
}

/* ⭐ 关键点 ②：某张卡片横跨两列（重点课程） */
.card-wall .featured { grid-column: span 2; }
/* 窄到只剩一列时，span 2 会溢出，所以要兜底： */
@container (max-width: 34rem) { .card-wall .featured { grid-column: auto; } }

/* ❌ 被替代掉的三套媒体查询
@media (min-width: 1024px) { .card-wall { grid-template-columns: repeat(3, 1fr) } }
@media (min-width: 640px)  { .card-wall { grid-template-columns: repeat(2, 1fr) } } */`,
            en: `.card-wall {
  display: grid;
  /* ⭐ Key point ①: as many columns as fit; min() lets the lower bound shrink on narrow containers */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: var(--space-6);
}

/* ⭐ Key point ②: a featured card spans two columns */
.card-wall .featured { grid-column: span 2; }
/* when only one column is left, span 2 would overflow, so provide a fallback: */
@container (max-width: 34rem) { .card-wall .featured { grid-column: auto; } }

/* ❌ the three media queries this replaces
@media (min-width: 1024px) { .card-wall { grid-template-columns: repeat(3, 1fr) } }
@media (min-width: 640px)  { .card-wall { grid-template-columns: repeat(2, 1fr) } } */`
          },
          points: {
            zh: '<b>坑</b>：<code>grid-column: span 2</code> 在只剩一列的情况下会撑破容器（轨道数不够）。所以"跨栏"必须配一个兜底规则——用 <code>@container</code> 或者断点把它改回 <code>auto</code>。这个细节在很多"自适应卡片墙"的教程里被漏掉了，结果移动端出现横向滚动条。<b>可以自己验证</b>：把浏览器窗口拖到很窄，看有 span 2 的那张卡片是否溢出。',
            en: '<b>Pitfall</b>: <code>grid-column: span 2</code> breaks the container when only one column remains (not enough tracks). A span therefore needs a fallback — an <code>@container</code> query or a breakpoint resetting it to <code>auto</code>. Many "adaptive card wall" tutorials omit this and the result is a horizontal scrollbar on mobile. <b>Verify it yourself</b>: drag the window very narrow and watch the spanning card overflow.'
          }
        },
        {
          title: { zh: '关键代码 ② 用 min-content / max-content 表达"内容优先"', en: 'Key code ② Expressing "content first" with min- and max-content' },
          purpose: {
            zh: '有些布局的尺寸应该由内容决定，而不是由容器平均分配。',
            en: 'Sometimes the content, not an even split, should decide the size.'
          },
          lang: 'css',
          code: {
            zh: `.form-row {
  display: grid;
  /* ⭐ 关键点 ③：标签列宽 = 最宽标签的宽度，输入框吃掉剩余空间
     不需要写死 8rem，也不会因为文案变长而换行 */
  grid-template-columns: max-content minmax(0, 1fr);
  gap: var(--space-3) var(--space-4);
  align-items: center;
}

.tag-list {
  display: grid;
  /* ⭐ 关键点 ④：每个标签刚好包住自己的文字（max-content），自动换行 */
  grid-template-columns: repeat(auto-fit, max-content);
  gap: var(--space-2);
}`,
            en: `.form-row {
  display: grid;
  /* ⭐ Key point ③: the label column is as wide as the widest label; the input takes the rest.
     No hard-coded 8rem, and no wrapping when the copy gets longer */
  grid-template-columns: max-content minmax(0, 1fr);
  gap: var(--space-3) var(--space-4);
  align-items: center;
}

.tag-list {
  display: grid;
  /* ⭐ Key point ④: each tag is exactly as wide as its own text (max-content) and wraps */
  grid-template-columns: repeat(auto-fit, max-content);
  gap: var(--space-2);
}`
          },
          points: {
            zh: '<code>max-content</code> 做表单标签列，是"对齐且不写死数值"的经典技巧：标签文案从"姓名"变成"身份证号码"时，列宽自动跟上，不需要改 CSS。对比 <code>grid-template-columns: 8rem 1fr</code> 的写法——后者在英文界面（"Date of birth"）会挤成两行。<b>注意</b>：<code>max-content</code> 列在极端情况下会过宽（比如某个标签特别长），可以改用 <code>minmax(min-content, max-content)</code> 或给容器加 <code>overflow-wrap</code>。',
            en: 'Using <code>max-content</code> for form label columns is the classic way to align without hard-coding: when the label changes from "Name" to "ID number", the column follows automatically. Compare <code>grid-template-columns: 8rem 1fr</code>, which wraps to two lines in a longer language. <b>Note</b>: a <code>max-content</code> column can become very wide if one label is long; use <code>minmax(min-content, max-content)</code> or add <code>overflow-wrap</code> to the container in that case.'
          }
        }
      ],
      demo: {
        key: 'd-4-2',
        hint: {
          zh: '拖动容器宽度与 minmax 上下限，实时看列数变化与每个轨道的计算宽度；切换 auto-fit / auto-fill 看最后一行是否被"折叠"；打开"跨两列"看它在窄容器下如何溢出与修复。',
          en: 'Drag the container width and the minmax bounds to watch the column count and each track’s computed width. Toggle auto-fit / auto-fill to see whether the last row collapses, and enable "span 2" to watch it overflow on narrow containers and get fixed.'
        }
      }
    },

    /* =========================================================
     * 4.3
     * ======================================================= */
    {
      id: 'ch-4-3',
      num: '4.3',
      title: { zh: '用 grid-template-areas 做布局迁移', en: 'Layout migration with grid-template-areas' },
      subtitle: {
        zh: '把整页布局写成一张 ASCII 图，让"桌面 / 平板 / 手机"三套布局可以在一个地方对照着改。',
        en: 'Write the whole page layout as an ASCII picture, so desktop, tablet and phone variants can be compared and edited in one place.'
      },
      explain: [
        { p: {
          zh: '<code>grid-template-areas</code> 允许你用字符串"画"出布局：每个名字代表一个区域，同名区域会合并成一个矩形。它的价值不在语法糖，而在<b>它是一份可读的、可被非作者检查的布局契约</b>——把这段 CSS 给设计师看，他能立刻指出"侧栏应该在右边"。',
          en: '<code>grid-template-areas</code> lets you <b>draw</b> the layout with strings: each name is a region, and repeated names merge into one rectangle. Its value is not syntactic sugar but that <b>it is a readable layout contract anyone can review</b> — show that CSS to a designer and they can immediately say "the sidebar should be on the right".'
        } },
        { code: {
          zh: `.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "side   main"
    "footer footer";
  grid-template-columns: 16rem minmax(0, 1fr);
  gap: var(--space-5);
}
.layout > .site-header { grid-area: header; }
.layout > .site-nav    { grid-area: side; }
.layout > .site-main   { grid-area: main; }
.layout > .site-footer { grid-area: footer; }

/* 窄屏：只改 areas 字符串，DOM 一行都不用动 */
@media (max-width: 640px) {
  .layout {
    grid-template-areas:
      "header"
      "main"
      "side"
      "footer";
    grid-template-columns: minmax(0, 1fr);
  }
}`,
          en: `.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "side   main"
    "footer footer";
  grid-template-columns: 16rem minmax(0, 1fr);
  gap: var(--space-5);
}
.layout > .site-header { grid-area: header; }
.layout > .site-nav    { grid-area: side; }
.layout > .site-main   { grid-area: main; }
.layout > .site-footer { grid-area: footer; }

/* narrow screens: change only the areas strings, not a single node in the DOM */
@media (max-width: 640px) {
  .layout {
    grid-template-areas:
      "header"
      "main"
      "side"
      "footer";
    grid-template-columns: minmax(0, 1fr);
  }
}`,
          lang: 'css'
        } },
        { h: { zh: '三条使用规则', en: 'Three rules for using it' } },
        { ul: [
          { zh: '<b>每个区域必须是矩形</b>。写成 <code>"a b" / "b a"</code> 是非法的，整条声明会被忽略（是"整条失效"，不是"局部报错"，所以很容易被忽略）。', en: '<b>Every region must be a rectangle.</b> <code>"a b" / "b a"</code> is invalid and the whole declaration is dropped — not a local error, which makes it easy to miss.' },
          { zh: '<b>用点号 <code>.</code> 表示空格子</b>：<code>"header header" / ". main"</code> 表示第二行第一列留空。<b>注意</b>：空出来的轨道仍然占宽度，需要配 <code>grid-template-columns</code> 才符合预期。', en: '<b>A dot <code>.</code> is an empty cell</b>: <code>"header header" / ". main"</code> leaves the second row’s first cell empty. <b>Note</b>: the track still takes width, so pair it with an explicit <code>grid-template-columns</code>.' },
          { zh: '<b>网格区域只影响视觉位置，不改变 DOM 顺序</b>。这既是优点（可以自由重排），也是陷阱——见第 6 章：<b>视觉顺序与 DOM 顺序不一致会破坏键盘 Tab 顺序与屏幕阅读器体验</b>。', en: '<b>Grid areas change visual position, not DOM order.</b> That is both the advantage (free reordering) and the trap — see Chapter 6: <b>when visual order diverges from DOM order, keyboard tab order and screen readers break</b>.' }
        ] },
        { note: {
          zh: '<b>和媒体的配合要点</b>：窄屏下单列布局时，<code>areas</code> 里"main 在 side 之前"可以做出"内容优先"的手机版阅读顺序。但如果 DOM 里 side 在 main 前面（桌面版需要），那么移动端的视觉顺序就与 DOM 顺序不一致了。<b>正确做法</b>：让 DOM 顺序按<b>移动端（最重要/最线性）</b>的顺序写，桌面版再用 areas 重排。这样"DOM 顺序 = 手机阅读顺序"，屏幕阅读器在任何屏幕上读到的都是合理的顺序。',
          en: '<b>A key point when pairing with media queries</b>: on a single-column phone layout you may want main before side. But if the DOM has side before main (as desktop needs), the phone’s visual order then diverges from DOM order. <b>The right approach</b>: author DOM order for the <b>mobile / most linear</b> case, then reorder visually with areas for desktop. That way "DOM order = phone reading order" and screen readers get a sensible sequence at every width.'
        } },
        { case: {
          title: { zh: '案例诊断：改一次布局要动三个文件', en: 'Case diagnosis: one layout change touching three files' },
          zh: 'v1 要做"桌面侧栏在左、手机侧栏在下方"的效果，做法是：HTML 里写两遍导航（用 <code>display:none</code> 切换）、CSS 里两套浮动、JS 里同步高亮状态。<b>三处重复描述同一件事</b>。改成 areas 之后：DOM 只写一遍、CSS 只改 areas 字符串、JS 完全不用动。这就是"布局契约"的实际收益。',
          en: 'To get "sidebar left on desktop, below on phones" the v1 approach was: write the nav twice in HTML (toggling with <code>display:none</code>), two sets of floats in CSS, and JS to keep the highlight state in sync. <b>The same fact described in three places.</b> With areas: the DOM is written once, CSS changes only the areas strings, and the JS does not change at all. That is the concrete payoff of a layout contract.'
        } }
      ],
      code: [
        {
          title: { zh: '关键代码 ① 三档布局，一份 areas', en: 'Key code ① Three layouts, one grid definition' },
          purpose: {
            zh: '窄屏、中屏、宽屏的差异集中在同一个地方，评审时一眼能对比。',
            en: 'The narrow, medium and wide differences live in one place and can be compared at a glance in review.'
          },
          lang: 'css',
          code: {
            zh: `.layout {
  display: grid;
  gap: var(--space-5);
  /* ⭐ 关键点 ①：手机优先 —— 单列，DOM 顺序就是阅读顺序 */
  grid-template-areas:
    "header"
    "main"
    "side"
    "footer";
  grid-template-columns: minmax(0, 1fr);
}

/* ⭐ 关键点 ②：中屏把侧栏挪上去（视觉重排，DOM 不动） */
@media (min-width: 40rem) {
  .layout {
    grid-template-areas:
      "header header"
      "main   side"
      "footer footer";
    grid-template-columns: minmax(0, 1fr) 14rem;
  }
}

/* ⭐ 关键点 ③：宽屏再加一列，把目录固定在左侧 */
@media (min-width: 64rem) {
  .layout {
    grid-template-areas:
      "header header header"
      "toc    main   side"
      "footer footer footer";
    grid-template-columns: 13rem minmax(0, 1fr) 15rem;
  }
}`,
            en: `.layout {
  display: grid;
  gap: var(--space-5);
  /* ⭐ Key point ①: mobile first — one column, so DOM order is the reading order */
  grid-template-areas:
    "header"
    "main"
    "side"
    "footer";
  grid-template-columns: minmax(0, 1fr);
}

/* ⭐ Key point ②: at medium width move the sidebar up (visual only; DOM untouched) */
@media (min-width: 40rem) {
  .layout {
    grid-template-areas:
      "header header"
      "main   side"
      "footer footer";
    grid-template-columns: minmax(0, 1fr) 14rem;
  }
}

/* ⭐ Key point ③: add a third column on wide screens and pin the TOC on the left */
@media (min-width: 64rem) {
  .layout {
    grid-template-areas:
      "header header header"
      "toc    main   side"
      "footer footer footer";
    grid-template-columns: 13rem minmax(0, 1fr) 15rem;
  }
}`
          },
          points: {
            zh: '三档布局只用了一个 <code>display: grid</code>，其余都是"重画那张 ASCII 图"。相比三套完全不同的布局方案，这种写法的<b>可维护性差异是量级上的</b>：新增一个 <code>toc</code> 区域时，你只需要在每张图里加一个名字和一条 <code>grid-template-columns</code>。<b>坑</b>：每张图里的列数必须与 <code>grid-template-columns</code> 的轨道数一致，否则浏览器会丢弃整条 <code>areas</code> 声明——在 4.3 的演示里可以故意写错一行，看它如何失效。',
            en: 'Three layouts share one <code>display: grid</code>; the rest is redrawing that ASCII picture. Compared with three unrelated layout implementations, the maintenance difference is an order of magnitude: adding a <code>toc</code> region means one new name per picture plus one <code>grid-template-columns</code>. <b>Pitfall</b>: the number of cells per row must match the number of tracks in <code>grid-template-columns</code>, or the browser drops the entire areas declaration — try writing one bad line in the 4.3 demo to see it fail.'
          }
        },
        {
          title: { zh: '关键代码 ② 用 areas 做"整页骨架"，组件内部继续用 flex', en: 'Key code ② Grid for the skeleton, flex inside components' },
          purpose: {
            zh: '二维对齐交给 Grid，一维流动交给 Flex，各用其所长。',
            en: 'Give two-dimensional alignment to grid and one-dimensional flow to flex — each to its strength.'
          },
          lang: 'css',
          code: {
            zh: `/* ⭐ 关键点 ④：整页骨架 = Grid（行列都要对齐） */
.layout {
  display: grid;
  grid-template-areas: "header header" "side main" "footer footer";
  grid-template-columns: 16rem minmax(0, 1fr);
  gap: var(--space-6);
}

/* ⭐ 关键点 ⑤：组件内部 = Flex（一行内分配与对齐） */
.site-header {
  grid-area: header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

/* ⭐ 关键点 ⑥：网格子项默认 min-width:auto，长内容一样会撑破轨道 */
.site-main { grid-area: main; min-width: 0; }`,
            en: `/* ⭐ Key point ④: the page skeleton is grid (both axes must align) */
.layout {
  display: grid;
  grid-template-areas: "header header" "side main" "footer footer";
  grid-template-columns: 16rem minmax(0, 1fr);
  gap: var(--space-6);
}

/* ⭐ Key point ⑤: inside a component, use flex (distribution and alignment along one line) */
.site-header {
  grid-area: header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

/* ⭐ Key point ⑥: grid items also default to min-width:auto, so long content breaks tracks too */
.site-main { grid-area: main; min-width: 0; }`
          },
          points: {
            zh: '这是本课程最重要的一条"分层原则"：<b>整页/区块级用 Grid 定骨架，组件内部用 Flex 排内容</b>。把两者混用（比如用 Grid 去做一排标签）会让代码变复杂而不获得任何好处；反过来用 Flex 去搭整页骨架，则会遇到"行与行之间无法对齐"的问题——那正是 Grid 存在的理由。',
            en: 'This is the most important layering principle in the course: <b>use grid for the page or section skeleton, use flex inside components</b>. Mixing them the wrong way (using grid for a row of tags) adds complexity for no gain; using flex for the page skeleton runs into "rows cannot align with each other" — which is exactly why grid exists.'
          }
        }
      ],
      demo: {
        key: 'd-4-3',
        hint: {
          zh: '在文本框里直接编辑 grid-template-areas，实时校验"是否都是矩形 / 列数是否匹配"并给出报错；切换手机、平板、桌面三档预览；还可以拖动区域名重排布局。',
          en: 'Edit grid-template-areas in the text box: it validates rectangles and column counts live and reports errors. Switch between phone, tablet and desktop previews, or drag region names to rearrange the layout.'
        }
      }
    }
  ]
};
