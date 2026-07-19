export type Priority = 'P0' | 'P1' | 'P2';
export type Category =
  | '文本统计'
  | 'Markdown'
  | '文本处理'
  | '编码转换'
  | '格式转换'
  | '文本变换';

export interface FaqItem {
  q: string;
  a: string;
}

export interface Tool {
  slug: string;
  name: string;
  shortName: string;
  desc: string;
  priority: Priority;
  category: Category;
  keywords: string[];
  icon: string;
  /** 搜索热度（百度日搜索量估算） */
  volume: number;
  /** SEO 长尾说明 */
  seoNote: string;
  /** 优化后的 <title>，主关键词前置 + 长尾修饰词 */
  seoTitle: string;
  /** 优化后的 meta description，140-160 字符 */
  seoDescription: string;
  /** FAQ 问答，用于 FAQPage Schema + 页面自动渲染 */
  faq: FaqItem[];
  /** 相关工具 slug 列表，用于内链卡片 */
  related: string[];
}

/**
 * 16 个文本处理工具元数据，按优先级排序。
 * P0 核心（6）→ P1 常用（6）→ P2 扩展（4）
 */
export const tools: Tool[] = [
  // ============ P0 核心 ============
  {
    slug: 'word-count',
    name: '字数统计',
    shortName: '字数',
    desc: '实时统计中英文字符数、单词数、行数、段落数，支持排除空白与标点，写作论文 SEO 必备。',
    priority: 'P0',
    category: '文本统计',
    keywords: ['字数统计', '单词计数', '字符统计', '在线字数', 'count words', '字数计算', '字数查询'],
    icon: '字',
    volume: 850,
    seoNote: '论文/写作/SEO 高频刚需，长尾词稳定',
    seoTitle: '字数统计 - 在线中英文字符/单词/行数统计工具 | HyperGrad',
    seoDescription: '免费在线字数统计工具，实时计算中英文字符数、单词数、行数、段落数，支持排除空白与标点。纯浏览器本地处理，论文写作、SEO 优化、自媒体排版必备。',
    faq: [
      { q: '中文字数怎么算？算字符还是算字？', a: '中文字数一般按「汉字字数」计算，每个汉字算 1 个字，标点和空白是否计入视场景而定。本工具同时给出「含标点字符数」「不含标点字符数」「纯汉字数」「英文单词数」多个指标，可自行选用。论文查重和投稿通常看「含空格字符数」或「不含空格字符数」。' },
      { q: 'Word 的字数统计和这里为什么不同？', a: 'Word 默认统计「字符数（含空格）」和「字数」两个指标。中文环境下「字数」会把每个英文单词算 1 个字、每个中文汉字算 1 个字。本工具按更细的维度统计（汉字、英文单词、标点、空白分开），可对得上 Word 多数指标。' },
      { q: '会保存我粘贴的文本吗？', a: '不会。所有统计在浏览器本地完成，文本不离开你的设备、不上传服务器，关闭页面即清除。适合统计合同、论文、商业文档等敏感内容。' },
      { q: ' SEO 描述为什么限制 140-160 字符？', a: 'Google 中文搜索结果摘要约展示 75-80 个汉字，百度略多。140-160 字符（约 70-80 汉字）既能完整描述页面内容，又不会被搜索引擎截断。本工具提供精确字符计数，方便你控制 meta description 长度。' },
    ],
    related: ['text-dedup', 'text-sort', 'char-clean', 'case-convert'],
  },
  {
    slug: 'markdown-editor',
    name: 'Markdown 编辑器',
    shortName: 'MD 编辑',
    desc: '左右分栏实时预览 Markdown，支持 GFM 扩展语法、代码高亮、自动保存到本地。',
    priority: 'P0',
    category: 'Markdown',
    keywords: ['markdown编辑器', 'md编辑器', 'markdown在线', 'markdown预览', 'md预览', '实时预览'],
    icon: 'MD',
    volume: 720,
    seoNote: '开发者写文档高频，与 md-to-html 区分',
    seoTitle: 'Markdown 编辑器 - 在线实时预览 MD 编辑工具 | HyperGrad',
    seoDescription: '免费在线 Markdown 编辑器，左右分栏实时预览，支持 GFM 扩展语法、代码高亮、表格、任务列表，内容自动保存到本地。纯浏览器实现，无需登录。',
    faq: [
      { q: '支持哪些 Markdown 语法？', a: '默认支持 CommonMark 标准和 GFM（GitHub Flavored Markdown）扩展，包括表格、任务列表（- [x]）、删除线、自动链接、代码围栏（```）、代码高亮等。脚注、数学公式、Mermaid 图表等扩展语法暂不支持。' },
      { q: '内容会自动保存吗？', a: '会。编辑器使用浏览器 localStorage 实时保存你的输入，刷新或意外关闭页面后再次打开会自动恢复。但 localStorage 仅限当前浏览器，不跨设备同步。如需跨设备，请用「导出 .md」按钮保存文件。' },
      { q: '能导出 HTML 或 PDF 吗？', a: '本编辑器支持复制 HTML 源码。如需导出独立 HTML 文件，建议用本站的「Markdown 转 HTML」工具，生成的 HTML 自带基础样式，可直接保存。PDF 导出请用浏览器的打印功能（Ctrl/Cmd+P），选择「另存为 PDF」。' },
      { q: '和 Typora / Obsidian 有什么区别？', a: 'Typora、Obsidian 是本地编辑器，功能更完整（含插件、文件管理、双向链接），适合长期写作。本工具是浏览器轻量编辑器，无需安装、即用即走，适合临时编辑、快速预览、复制 HTML 到博客或文档系统。' },
    ],
    related: ['md-to-html', 'html-to-md', 'html-escape', 'word-count'],
  },
  {
    slug: 'text-diff',
    name: '文本对比 / Diff',
    shortName: '文本对比',
    desc: '并排对比两段文本，逐行高亮新增、删除、修改，支持忽略空白与大小写。',
    priority: 'P0',
    category: '文本处理',
    keywords: ['文本对比', '文本diff', '在线对比', '文本比较', '差异对比', '代码对比'],
    icon: '≠',
    volume: 480,
    seoNote: '代码/合同/文档对比刚需',
    seoTitle: '文本对比 - 在线文本 Diff 工具（并排高亮增删改）| HyperGrad',
    seoDescription: '免费在线文本对比工具，并排显示两段文本，逐行高亮新增、删除、修改内容，支持忽略空白与大小写。纯浏览器本地处理，适合代码、合同、文档版本对比。',
    faq: [
      { q: '对比算法是什么？', a: '本工具基于 LCS（最长公共子序列）算法计算行级差异，再用 Myers 差分算法优化输出。这是 Git diff 的同源算法，对绝大多数代码与文档场景精度足够。字符级差异在改动的行内用红色/绿色高亮显示。' },
      { q: '能忽略空白和大小写差异吗？', a: '能。工具栏有「忽略行尾空白」「忽略空白行」「忽略大小写」三个开关。开启后对比时这些差异不计入变更。但开关只影响 diff 计算，显示仍保留原始空白，方便你查看真实内容。' },
      { q: '会保存我对比的文本吗？', a: '不会。所有对比在浏览器本地完成，原始和修改后的文本都不会上传服务器，关闭页面即清除。适合对比合同、协议、未公开代码等敏感内容。' },
      { q: '对比大文件会卡吗？', a: '基于 LCS 的算法复杂度是 O(n×m)，对几万行的文本仍能秒级返回。超过 10 万行可能卡顿，建议先用「文本去重」或按段落切分后再对比。' },
    ],
    related: ['text-dedup', 'text-sort', 'char-clean', 'word-count'],
  },
  {
    slug: 'case-convert',
    name: '大小写转换',
    shortName: '大小写',
    desc: '一键转大写、小写、首字母大写、Title Case、camelCase、snake_case、kebab-case 等 7 种风格。',
    priority: 'P0',
    category: '文本变换',
    keywords: ['大小写转换', '大写转换', '小写转换', '首字母大写', 'camelCase', 'snake_case', 'kebab-case'],
    icon: 'Aa',
    volume: 620,
    seoNote: '英文标题/变量名转换刚需',
    seoTitle: '大小写转换 - 在线英文大小写/驼峰/下划线/连字符工具 | HyperGrad',
    seoDescription: '免费在线大小写转换工具，支持 UPPER、lower、Title Case、Sentence case、camelCase、snake_case、CONSTANT_CASE、kebab-case 等 8 种风格。纯浏览器本地处理，开发者与编辑必备。',
    faq: [
      { q: 'camelCase 和 PascalCase 怎么区分？', a: 'camelCase（小驼峰）首字母小写，如 myUserName；PascalCase（大驼峰）首字母大写，如 MyUserName。前者用于 Java/JS 变量名、函数名；后者用于 C# 类名、React 组件名、TypeScript 接口名。本工具同时提供两种。' },
      { q: 'snake_case 和 kebab-case 用在哪？', a: 'snake_case（下划线连接）用于 Python 变量/函数名、Ruby、Rust、SQL 字段名；kebab-case（连字符连接）用于 CSS 类名、HTML 自定义元素、URL 路径、HTTP Header。选择遵循团队规范即可。' },
      { q: 'CONSTANT_CASE 是什么？', a: 'CONSTANT_CASE（全大写下划线）也叫 SCREAMING_SNAKE_CASE，专用于常量定义。如 const MAX_RETRY_COUNT = 3。所有语言都用此风格定义常量，与变量区分。' },
      { q: '中文会被转大小写吗？', a: '不会。中文没有大小写概念，工具只处理 ASCII 字母。但工具会把中文当作「词边界」处理，方便中英混合文本（如 网站title SEO优化）转换为 Title Case 时正确大写每个英文单词。' },
    ],
    related: ['word-count', 'text-dedup', 'char-clean', 'reverse-text'],
  },
  {
    slug: 'char-clean',
    name: '隐形字符清理',
    shortName: '字符清理',
    desc: '清除零宽字符、BOM、不可见控制符、连续空白，可检测 AIGC 水印与异常字符。',
    priority: 'P0',
    category: '文本处理',
    keywords: ['零宽字符', '不可见字符', 'BOM清理', '文本清理', 'AIGC水印', '隐形字符'],
    icon: '∅',
    volume: 280,
    seoNote: 'AIGC 水印检测、防粘贴泄露刚需',
    seoTitle: '隐形字符清理 - 检测/清除零宽字符 BOM AIGC 水印工具 | HyperGrad',
    seoDescription: '免费在线隐形字符清理工具，检测并清除零宽字符（U+200B/200C/200D/FEFF）、BOM、不可见控制符、连续空白，可识别 AIGC 文本水印。纯浏览器本地处理，保护隐私。',
    faq: [
      { q: '什么是零宽字符？', a: '零宽字符（Zero-Width Space）是 Unicode 中宽度为 0 的不可见字符，包括 U+200B（零宽空格）、U+200C（零宽非连接符）、U+200D（零宽连接符）、U+FEFF（BOM/零宽不换行空格）。肉眼看不到，但会影响字符串比较、长度计算和程序解析。' },
      { q: 'AIGC 水印是什么？', a: '部分 AI 生成文本会在内容中插入零宽字符作为「水印」，用于后续识别这段文字出自 AI。清理这些字符后，文本功能不变但水印被抹除。本工具会标记找到的零宽字符数量，方便你判断文本是否含水印。' },
      { q: '会改变可见内容吗？', a: '不会。本工具只移除不可见字符和（可选）合并连续空白。默认不删除换行、不删可见空格——只删除真正不可见的字符。开启「合并连续空白」可以把多个空格合并为一个，可选「删除行尾空白」。' },
      { q: '为什么我复制的代码运行报错？', a: '很可能是从网页/聊天工具复制的代码里有零宽字符或全角空格。代码编辑器看不到这些字符，但解释器/编译器会因非法字符报错。把代码粘贴到本工具清理后再运行，问题通常消失。' },
    ],
    related: ['text-dedup', 'text-diff', 'word-count', 'text-sort'],
  },
  {
    slug: 'text-dedup',
    name: '文本去重',
    shortName: '去重',
    desc: '按行/段落去重，保留首次出现顺序，可选大小写不敏感与去前后空白。',
    priority: 'P0',
    category: '文本处理',
    keywords: ['文本去重', '行去重', '在线去重', '重复行删除', '段落去重', '去除重复'],
    icon: '⟲',
    volume: 540,
    seoNote: '名单/数据清洗高频刚需',
    seoTitle: '文本去重 - 在线按行/段落去除重复工具 | HyperGrad',
    seoDescription: '免费在线文本去重工具，按行或段落去除重复内容，保留首次出现顺序，可选大小写不敏感与去前后空白。纯浏览器本地处理，适合名单、邮箱、URL、商品 ID 清洗。',
    faq: [
      { q: '去重后顺序会变吗？', a: '不会。本工具默认保留首次出现顺序，即「先进先出」——删除后续重复的，保留第一次出现的行。这是大多数去重场景期望的行为，方便你对照原数据查看哪些被去掉了。如需排序后去重，请先用「文本排序」工具。' },
      { q: '空行会算重复吗？', a: '会，多个连续空行会被去重为一个空行（因为它们内容相同）。如需完全删除空行，请开启「忽略空行」选项——空行将在去重前先全部移除，不参与比较。' },
      { q: '大小写敏感是什么意思？', a: '默认情况下 Apple 和 apple 是不同的两行，都保留。开启「大小写不敏感」后，它们被视为重复，只保留首次出现的 Apple。处理不区分大小写的列表时建议开启。' },
      { q: '会保存我粘贴的数据吗？', a: '不会。所有去重在浏览器本地完成，原始数据和结果都不会上传服务器。关闭页面即清除。适合处理手机号、邮箱、客户名单等敏感数据。' },
    ],
    related: ['text-sort', 'text-diff', 'char-clean', 'word-count'],
  },

  // ============ P1 常用 ============
  {
    slug: 'lorem',
    name: 'Lorem Ipsum 生成',
    shortName: '假文',
    desc: '生成 Lorem ipsum 占位假文，支持段落、句子、单词级别，含中文假文与中文乱文本。',
    priority: 'P1',
    category: '文本处理',
    keywords: ['lorem ipsum', '占位文本', '假文生成', '乱数假文', '填充文字', 'placeholder text'],
    icon: '¶',
    volume: 380,
    seoNote: '设计师/前端做原型高频',
    seoTitle: 'Lorem Ipsum 生成器 - 中文/英文占位假文工具 | HyperGrad',
    seoDescription: '免费在线 Lorem Ipsum 假文生成器，支持段落、句子、单词级别，提供经典英文版、中文假文、中文乱数假文三种风格。纯浏览器本地生成，UI 原型与排版测试必备。',
    faq: [
      { q: 'Lorem Ipsum 是什么？', a: 'Lorem ipsum 是 16 世纪印刷业创造的占位文本，源自西塞罗《善恶之极》的拉丁文段落，经过加工使语义无意义但视觉上像正常文字。印刷、UI 设计、网页原型用它填充版式，避免观者关注内容而非排版。' },
      { q: '为什么不用真实文字做原型？', a: '真实文字会让人聚焦内容（"这措辞不对"），而不是排版。Lorem ipsum 既保留拉丁字母的视觉密度和词长分布，又因语义不可读而让人只看视觉结构——这是版式设计的最佳测试素材。' },
      { q: '支持中文假文吗？', a: '支持。本工具提供「中文假文」（用真实汉字组合但无意义句子）和「中文乱文」（用拉丁字母混排的伪中文风格）两种模式。中文假文的字宽、标点分布更接近真实中文，方便测中文 UI 的行间距、断行表现。' },
      { q: '能指定生成多少段吗？', a: '能。在工具栏选择生成单位（段落/句子/单词）和数量后点击生成。段落默认 3-8 句，句子默认 8-20 词，单词按指定数量输出。生成结果可直接复制使用。' },
    ],
    related: ['word-count', 'case-convert', 'text-sort', 'reverse-text'],
  },
  {
    slug: 'text-sort',
    name: '文本排序',
    shortName: '排序',
    desc: '按行排序文本，支持升序/降序/随机打乱/反转，含自然排序、数值排序、长度排序。',
    priority: 'P1',
    category: '文本处理',
    keywords: ['文本排序', '行排序', '在线排序', '字母排序', '数字排序', '自然排序'],
    icon: '⇅',
    volume: 320,
    seoNote: '名单/数据整理常用',
    seoTitle: '文本排序 - 在线按行字母/数字/自然排序工具 | HyperGrad',
    seoDescription: '免费在线文本排序工具，按行升序/降序/随机打乱/反序，支持字母排序、数值排序、自然排序（file2 在 file10 之后）、长度排序、大小写敏感可选。纯浏览器本地处理。',
    faq: [
      { q: '为什么 file10 排在 file2 前面？', a: '默认按 ASCII 字符串排序，逐字符比较，因为 "1" < "2"，所以 file10 排在 file2 前面。开启「自然排序」后，工具会识别数字部分按数值大小排序，file2 会正确排在 file10 之前。文件名、版本号排序务必用自然排序。' },
      { q: '能按数字大小排序吗？', a: '能。开启「数值排序」后，工具会提取每行开头或包含的数字按数值排序。如果一行没有数字，按 0 处理。适合排序销售额、版本号、统计数据等表格行。' },
      { q: '能按行长度排序吗？', a: '能。本工具支持「按字符长度排序」选项，可升序（短行在前）或降序（长行在前）。常用于找出异常长行（可能是数据错误）或排序短消息列表。' },
      { q: '随机打乱是真正随机的吗？', a: '是。本工具使用 Fisher-Yates 洗牌算法（O(n) 时间复杂度），配合浏览器的 crypto.getRandomValues 真随机源，结果具有良好均匀性。每次点击都会得到不同的顺序，适合抽奖、随机抽样场景。' },
    ],
    related: ['text-dedup', 'case-convert', 'word-count', 'reverse-text'],
  },
  {
    slug: 'md-to-html',
    name: 'Markdown 转 HTML',
    shortName: 'MD→HTML',
    desc: 'Markdown 一键转 HTML，支持 GFM 表格/代码块/任务列表，自带简洁样式或纯净 HTML。',
    priority: 'P1',
    category: 'Markdown',
    keywords: ['markdown转html', 'md转html', 'markdown to html', 'md转换', 'markdown编译'],
    icon: '→',
    volume: 410,
    seoNote: '博客/文档系统发布刚需',
    seoTitle: 'Markdown 转 HTML - 在线 MD 转 HTML（带 GFM 表格代码块）| HyperGrad',
    seoDescription: '免费在线 Markdown 转 HTML 工具，支持 GFM 扩展（表格、代码块、任务列表、删除线），可选自带样式或纯净 HTML，一键复制。纯浏览器本地转换，博客发布与文档系统对接必备。',
    faq: [
      { q: '支持表格吗？', a: '支持。本工具兼容 GFM（GitHub Flavored Markdown）表格语法，包括对齐标记（:---、---:、:---:）。生成的 HTML 表格带 <thead><tbody> 结构，方便 CSS 样式化。' },
      { q: '代码高亮会自动加颜色吗？', a: '默认输出带 class="language-xxx" 的 <code> 标签，便于后续接 highlight.js / Prism.js 高亮。如需直接生成带颜色的 HTML（内联 style），可开启「内联高亮」选项，工具会用基础调色板给关键字、字符串、注释着色。' },
      { q: '能输出纯净 HTML（不带 class）吗？', a: '能。默认模式输出带语义 class 的 HTML，便于二次样式化；开启「纯净 HTML」后会移除所有 class 和 data 属性，只保留结构标签，适合直接粘贴到限制 class 的 CMS 或邮件模板。' },
      { q: '能转脚注和数学公式吗？', a: '本工具暂不支持脚注 [^1] 和 LaTeX 数学公式 $...$。这两个语法需要额外插件（如 markdown-it-footnote、markdown-it-katex），转换后还需要引脚注 CSS 和 KaTeX 库才能正确渲染。建议用专门的文档系统处理这两种语法。' },
    ],
    related: ['markdown-editor', 'html-to-md', 'html-escape', 'table-convert'],
  },
  {
    slug: 'html-to-md',
    name: 'HTML 转 Markdown',
    shortName: 'HTML→MD',
    desc: 'HTML 一键转 Markdown，支持复杂表格、列表、代码块、链接图片的语义保留。',
    priority: 'P1',
    category: 'Markdown',
    keywords: ['html转markdown', 'html to markdown', 'html转md', '网页转md', 'html转换器'],
    icon: '←',
    volume: 280,
    seoNote: '博客搬家、网页归档常用',
    seoTitle: 'HTML 转 Markdown - 在线网页转 MD 工具 | HyperGrad',
    seoDescription: '免费在线 HTML 转 Markdown 工具，支持复杂表格、嵌套列表、代码块、链接图片语义保留，自动清理 inline style 与 script。纯浏览器本地转换，博客搬家、网页归档必备。',
    faq: [
      { q: '嵌套列表能正确转换吗？', a: '能。本工具基于 Turndown 算法，递归处理 <ul><ol> 嵌套，根据缩进生成正确的子列表层级（每级 2 或 4 空格缩进）。深度超过 6 级的部分 Markdown 渲染器可能不支持，但工具仍会输出可读结构。' },
      { q: '复杂表格（合并单元格）怎么办？', a: 'Markdown 表格语法不支持 colspan/rowspan 合并单元格。遇到合并单元格的表格，工具会把合并单元格拆开重复内容，保证数据不丢失但视觉结构改变。建议复杂表格保留原文 HTML 段落嵌入 Markdown。' },
      { q: '会保留 inline style 吗？', a: '不会。Markdown 不支持 inline style，工具会移除所有 style 属性。如需保留视觉差异，可通过加粗/斜体/标题等 Markdown 语义近似还原；颜色、字体、背景等无法对应的样式会丢弃。' },
      { q: 'script 和 iframe 会被保留吗？', a: '不会。出于安全考虑，工具默认移除 <script>、<iframe>、<object>、<embed> 等可执行/嵌入标签及其内容。<img>、<a>、<video> 等内容标签保留。这样转出的 Markdown 文档可直接放入静态生成器或博客系统不会引入 XSS 风险。' },
    ],
    related: ['md-to-html', 'markdown-editor', 'html-escape', 'char-clean'],
  },
  {
    slug: 'table-convert',
    name: '表格格式互转',
    shortName: '表格转换',
    desc: 'CSV、TSV、JSON、Markdown 表格四种格式互转，自动识别表头与字段类型。',
    priority: 'P1',
    category: '格式转换',
    keywords: ['csv转json', 'json转csv', 'csv转markdown', '表格转换', 'tsv转csv', 'excel转json'],
    icon: '⊟',
    volume: 520,
    seoNote: '数据迁移、文档表格化高频',
    seoTitle: 'CSV / TSV / JSON / Markdown 表格互转工具 | HyperGrad',
    seoDescription: '免费在线表格格式转换工具，CSV、TSV、JSON、Markdown 表格四种格式互转，自动识别表头与字段类型，支持引号转义与嵌套 JSON。纯浏览器本地处理，数据迁移与文档表格化必备。',
    faq: [
      { q: 'CSV 字段里有逗号怎么办？', a: 'CSV 标准要求含逗号、换行、双引号的字段用双引号包围，字段内的双引号转义为两个连续双引号。本工具完整实现 RFC 4180 标准，能正确解析 "字段,含逗号" 这样的字段并保留原值。导入 Excel 导出的 CSV 也无问题。' },
      { q: 'JSON 转换支持嵌套对象吗？', a: '支持。JSON 转 CSV/TSV 时，嵌套对象会被展开为多列（用 . 连接键名，如 user.address.city）。数组字段会按数组长度展开为多行，每行对应一个数组元素。这样保证不丢失数据，但列数会增多。' },
      { q: 'Markdown 表格的列对齐怎么设置？', a: 'Markdown 表格支持 :---（左对齐）、---:（右对齐）、:---:（居中对齐）。默认全左对齐。如果你提供 Excel/CSV 数据，可手动在结果中改对齐标记。本工具暂不自动推断列类型设置对齐。' },
      { q: '会保存我转换的数据吗？', a: '不会。所有转换在浏览器本地完成，CSV、JSON、表格数据都不会上传服务器。适合转换客户名单、产品数据、销售记录等敏感数据。' },
    ],
    related: ['md-to-html', 'html-to-md', 'word-count', 'text-dedup'],
  },
  {
    slug: 'html-escape',
    name: 'HTML 实体转义',
    shortName: 'HTML 转义',
    desc: 'HTML/JSX/JS 字符串/URL 实体互转，自动处理 & < > " \' / 与所有命名实体。',
    priority: 'P1',
    category: '编码转换',
    keywords: ['html转义', 'html实体', 'html encode', 'html decode', 'html escape', '字符转义'],
    icon: '&',
    volume: 290,
    seoNote: '前端/模板开发常驻',
    seoTitle: 'HTML 实体转义 - HTML/JSX/JS 字符串转义工具 | HyperGrad',
    seoDescription: "免费在线 HTML 实体转义工具，支持 HTML/JSX/JS 字符串双向转义，处理 & < > \" ' / 以及所有命名实体。纯浏览器本地处理，前端开发与模板编写必备。",
    faq: [
      { q: 'HTML 转义和编码（URL Encode）有什么区别？', a: "HTML 转义把 < > & \" ' / 等转为 &lt; &gt; &amp; &quot; &#39; &#47;，目的是让浏览器把这些字符当文本而非 HTML 标签解析，防 XSS。URL 编码把空格/中文/特殊字符转为 %20/%E4%B8%AD 等，目的是让字符安全出现在 URL 中。两者场景完全不同，工具内可切换。" },
      { q: '为什么 <script> 显示成 &lt;script&gt;？', a: '这是正确的转义结果。当你想在网页上展示「<script>」这段文字（如写教程），必须转义为 &lt;script&gt;，否则浏览器会把它当作真的 script 标签执行。展示代码片段时务必转义。' },
      { q: 'JSX 转义和 HTML 转义有什么不同？', a: "JSX 比 HTML 多转义两个字符：{ 和 }（因为 JSX 用大括号表示表达式）。本工具的「JSX 模式」会把 { 转为 {'{'} 或 &#123;，} 转为 {'}'} 或 &#125;，避免 JSX 解析器把模板中的大括号当表达式。" },
      { q: '会自动识别已转义的内容吗？', a: '反向转义（decode）时工具会智能识别已有实体。例如输入 &lt;a&gt;&amp;b 会还原为 <a>&b 而非 &amp;lt;a&amp;gt;。但正向转义（encode）不识别，会再次转义——这是安全默认行为，避免漏转。' },
    ],
    related: ['char-clean', 'ascii-convert', 'unicode-convert', 'html-to-md'],
  },

  // ============ P2 扩展 ============
  {
    slug: 'ascii-convert',
    name: 'ASCII 编码转换',
    shortName: 'ASCII',
    desc: '文本与 ASCII 码（十进制/十六进制/二进制）互转，支持查询字符 ASCII 码值表。',
    priority: 'P2',
    category: '编码转换',
    keywords: ['ascii转换', 'ascii码', '字符转ascii', 'ascii to char', 'ascii编码', 'ASCII码表'],
    icon: '⌥',
    volume: 220,
    seoNote: '教学、调试、嵌入式开发场景',
    seoTitle: 'ASCII 编码转换 - 文本与 ASCII 码互转工具 | HyperGrad',
    seoDescription: '免费在线 ASCII 编码转换工具，文本与 ASCII 码（十进制/十六进制/二进制）双向互转，支持查询字符 ASCII 码值表。纯浏览器本地处理，教学、调试、嵌入式开发必备。',
    faq: [
      { q: 'ASCII 和 Unicode 是什么关系？', a: 'ASCII 是 7 位字符集（0-127），定义了英文字母、数字、标点和控制字符；Unicode 是全球统一字符集，前 128 个码点与 ASCII 完全一致。所以 ASCII 是 Unicode 的子集。本工具处理 0-255 的扩展 ASCII（含 Latin-1），中文字符请用 Unicode 转换工具。' },
      { q: '为什么中文转 ASCII 出现乱码？', a: '中文不在 ASCII 字符集内（ASCII 只到 127），无法用单字节 ASCII 表示。一些工具会用「每个字节的十进制」展示中文 UTF-8 编码（一个中文字 → 3 个数字），本工具支持此模式但提示「扩展 ASCII」。建议中文用 Unicode 编码转换工具，更直观。' },
      { q: '0-31 的控制字符是什么？', a: 'ASCII 0-31 和 127 是不可打印控制字符，包括 NUL（0）、LF（10，换行）、CR（13，回车）、ESC（27，转义）、DEL（127，删除）等。这些字符在终端/串口通信、嵌入式协议中常见。本工具会在转换结果中标注控制字符名称，方便识别。' },
      { q: '能批量转换吗？', a: '能。粘贴任意长度文本，工具会逐字符转换并按指定分隔符（空格/逗号/换行）输出。如输入 Hello，输出 72 101 108 108 111（十进制）或 48 65 6C 6C 6F（十六进制）。反向转换时输入以分隔符分隔的数字即可。' },
    ],
    related: ['unicode-convert', 'html-escape', 'char-clean', 'case-convert'],
  },
  {
    slug: 'unicode-convert',
    name: 'Unicode 编码转换',
    shortName: 'Unicode',
    desc: '文本与 Unicode 互转（\\uXXXX、U+XXXX、UTF-8/16/32 字节序列、HTML 实体），支持 emoji。',
    priority: 'P2',
    category: '编码转换',
    keywords: ['unicode转换', 'unicode编码', '中文字符转unicode', 'utf-8转换', 'emoji转义', 'u4e00'],
    icon: 'U+',
    volume: 240,
    seoNote: '国际化、emoji、源码中文字段常驻',
    seoTitle: 'Unicode 编码转换 - \\uXXXX / UTF-8 / emoji 转义工具 | HyperGrad',
    seoDescription: '免费在线 Unicode 编码转换工具，文本与 Unicode 互转，支持 \\uXXXX 转义、U+XXXX 码点、UTF-8/UTF-16/UTF-32 字节序列、HTML 实体，完整处理 emoji 与代理对。纯浏览器本地处理。',
    faq: [
      { q: '\\uXXXX 和 U+XXXX 有什么区别？', a: '\\uXXXX 是 JavaScript/Java/Python 字符串中的转义序列，4 位十六进制，只能表示基本多文种平面（BMP，0-65535）的字符。U+XXXX 是 Unicode 码点表示法，可表示所有码点（含扩展平面，用 5-6 位十六进制，如 U+1F600）。emoji 等扩展字符需用 U+XXXX 或代理对。' },
      { q: 'emoji 怎么转换？', a: '本工具完整支持 emoji。😀（U+1F600）超出 BMP，UTF-16 用代理对 \\uD83D\\uDE00 表示，UTF-8 是 4 字节 F0 9F 98 80。本工具会同时显示码点、UTF-8 字节、UTF-16 单元、JS 转义、HTML 实体五种表示，方便开发者选择。' },
      { q: '为什么有些中文是 4 位 \\u，有些是 5 位？', a: '基本汉字（U+4E00—U+9FFF）能放进 4 位 \\u，如 中 是 \\u4E2D。但扩展汉字（CJK Extension B/C/D/E，古籍生僻字）超出 BMP，码点如 U+20000—U+2A6DF，需用代理对（两个 4 位 \\u）或 U+XXXXX 表示。' },
      { q: '能转代理对（surrogate pair）吗？', a: '能。本工具自动识别代理对：输入 \\uD83D\\uDE00 会正确还原为 😀。反向转换 emoji 时会输出代理对（JavaScript 风格）和码点（U+1F600 风格）两种表示，方便你按语言规范选用。' },
    ],
    related: ['ascii-convert', 'html-escape', 'char-clean', 'case-convert'],
  },
  {
    slug: 'text-extract',
    name: '正则提取',
    shortName: '提取',
    desc: '从文本中批量提取邮箱、URL、手机号、IP、日期、身份证号等 12 种常见模式。',
    priority: 'P2',
    category: '文本变换',
    keywords: ['文本提取', '正则提取', '提取邮箱', '提取url', '提取手机号', '正则匹配'],
    icon: '∑',
    volume: 190,
    seoNote: '数据清洗、爬虫结果整理刚需',
    seoTitle: '正则提取 - 批量提取邮箱/URL/手机号/IP 工具 | HyperGrad',
    seoDescription: '免费在线正则提取工具，从文本中批量提取邮箱、URL、手机号、IP、日期、身份证号等 12 种常见模式，支持自定义正则、去重、计数。纯浏览器本地处理。',
    faq: [
      { q: '支持哪些预设模式？', a: '内置 12 种常用模式：邮箱、URL（http/https）、手机号（中国大陆 1[3-9]\\d{9}）、固定电话、IP v4、IP v6、日期（多种格式）、时间、身份证号（18 位含校验）、QQ 号、邮编、MAC 地址。每种模式都使用了经过验证的正则，准确率为业内主流水平。' },
      { q: '能用自定义正则吗？', a: '能。切到「自定义模式」选项卡，输入任意 JavaScript 正则表达式（带或不带 // 包裹），工具会执行 global 匹配并高亮所有命中位置。支持 flags（g/i/m/s/u/y）。语法错误时会给出错误提示与定位。' },
      { q: '为什么我的手机号没匹配上？', a: '预设手机号正则为 1[3-9]\\d{9}，要求前后是边界（空白或非数字）。如果手机号紧贴其他数字（如订单号 2021013812345678）会被吞掉一部分匹配。建议先用「文本清理」工具把数字字段用空格分隔，再提取。此外 170/171/165 等虚拟运营商号段已包含。' },
      { q: '邮箱正则覆盖范围多大？', a: '本工具使用 RFC 5322 简化版，覆盖 99% 常见邮箱（gmail/outlook/qq/163/企业邮箱）。少数极端邮箱（含 +、含注释、含 IP 域名）可能漏匹配。如需更严格匹配请用自定义正则，如 ^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$。' },
    ],
    related: ['text-dedup', 'text-sort', 'word-count', 'case-convert'],
  },
  {
    slug: 'reverse-text',
    name: '文本翻转',
    shortName: '翻转',
    desc: '逐字符翻转、逐词翻转、逐行翻转、逆序输出，可选保留标点位置。',
    priority: 'P2',
    category: '文本变换',
    keywords: ['文本翻转', '文字翻转', '倒序输出', '字符串翻转', 'reverse text', '逆序'],
    icon: '⇄',
    volume: 160,
    seoNote: '趣味 + 古文研究 + 镜像文字场景',
    seoTitle: '文本翻转 - 逐字/逐词/逐行倒序输出工具 | HyperGrad',
    seoDescription: '免费在线文本翻转工具，支持逐字符翻转、逐词翻转、逐行翻转、整段逆序，可选保留标点位置。纯浏览器本地处理，可用于镜像文字、古文研究、趣味排版、字符串测试。',
    faq: [
      { q: '中文翻转后会乱码吗？', a: '不会。本工具使用 ES6 的 [...str] 扩展运算符按 Unicode 码点分割，正确处理代理对（emoji）和组合字符（如带音标的字母）。中英文、emoji 都能正确翻转，如 你好😀 → 😀好你。' },
      { q: '能保留标点位置吗？', a: '能。开启「保留标点位置」后，标点（中英文逗号、句号、问号、感叹号、引号）的位置不变，只翻转字母与汉字。适合翻转句子而又保持阅读节奏：Hello, World! → olleH, dlroW! 而非 !dlroW ,olleH。' },
      { q: '逐词翻转和逐字符翻转区别？', a: '逐字符翻转把 "Hello World" 变成 "dlroW olleH"；逐词翻转把词序倒过来变成 "World Hello"，词内字母顺序不变。前者多用于加密/镜像字、后者多用于语法分析或诗歌手法研究（如诗词倒装）。' },
      { q: '能翻转多行文本的行序吗？', a: '能。选择「逐行翻转」模式，工具会按换行符分割后把行序整体倒置：第 1 行变成最后一行。常用于把时间线倒序、把 CSS 选择器优先级倒置、把日志最新行放最上面。' },
    ],
    related: ['case-convert', 'text-sort', 'text-dedup', 'char-clean'],
  },
];

export const priorityMeta: Record<Priority, { label: string; desc: string; color: string; bg: string }> = {
  P0: { label: '核心工具', desc: '写作编辑高频使用', color: '#2D5A4F', bg: '#EEF5F1' },
  P1: { label: '常用工具', desc: '日常格式互转', color: '#8B5A2B', bg: '#F7F0E8' },
  P2: { label: '扩展工具', desc: '编码与字符变换', color: '#7A4FB8', bg: '#F4EFFA' },
};

export const categoryMeta: Record<Category, { icon: string; color: string }> = {
  '文本统计': { icon: '♯', color: '#2D5A4F' },
  'Markdown': { icon: 'M↓', color: '#1E3A5F' },
  '文本处理': { icon: '¶', color: '#2D7A4F' },
  '编码转换': { icon: '&', color: '#C8862E' },
  '格式转换': { icon: '⇄', color: '#1E3A5F' },
  '文本变换': { icon: '↻', color: '#7A4FB8' },
};

export function getTool(slug: string): Tool | undefined {
  return tools.find(t => t.slug === slug);
}

export function toolsByPriority(p: Priority): Tool[] {
  return tools.filter(t => t.priority === p);
}

export function toolsByCategory(c: Category): Tool[] {
  return tools.filter(t => t.category === c);
}
