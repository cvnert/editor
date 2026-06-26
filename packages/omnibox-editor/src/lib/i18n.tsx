import { createContext, useContext } from "react"

export type OmniboxEditorLocale = "en" | "zh-CN" | (string & {})

type OmniboxEditorTranslationMap = {
  addCaption: string
  add: string
  ai: string
  aiIsWriting: string
  aiReviewPrompt: string
  aiTone: string
  apply: string
  askAi: string
  askAiPrompt: string
  askAiSubtext: string
  blockquote: string
  blockquoteBlock: string
  bulletList: string
  bold: string
  clearAllContents: string
  clickForOptions: string
  code: string
  codeBlock: string
  codeBlockWithSyntaxHighlighting: string
  color: string
  continueWriting: string
  continueWritingPrompt: string
  continueWritingSubtext: string
  copyAnchorLink: string
  copyToClipboard: string
  close: string
  delete: string
  discard: string
  duplicateNode: string
  applyFormula: string
  closeFormulaEditor: string
  editFormula: string
  emoji: string
  emojiSubtext: string
  failedToRenderChart: string
  failedToRenderDiagram: string
  heading: string
  heading1: string
  heading2: string
  heading3: string
  heading4: string
  heading5: string
  heading6: string
  highlightColor: string
  holdForDrag: string
  hideSource: string
  image: string
  imageSubtext: string
  addImage: string
  replaceImage: string
  increaseIndent: string
  insert: string
  italic: string
  linkEditor: string
  link: string
  listItem: string
  listWithOrderedItems: string
  listWithTasks: string
  listWithUnorderedItems: string
  loading: string
  mention: string
  mentionSubtext: string
  node: string
  orderedList: string
  placeholder: string
  pasteLink: string
  openLinkInNewWindow: string
  recentColors: string
  recentTextColor: string
  recentHighlightColor: string
  regularTextParagraph: string
  resetFormatting: string
  separator: string
  separatorSubtext: string
  showSource: string
  style: string
  subsectionAndGroupHeading: string
  table: string
  rowActions: string
  columnActions: string
  tableCellsOption: string
  insertRowAbove: string
  insertRowBelow: string
  deleteRow: string
  clearRowContents: string
  insertColumnLeft: string
  insertColumnRight: string
  duplicateRow: string
  duplicateColumn: string
  moveRowUp: string
  moveRowDown: string
  moveColumnLeft: string
  moveColumnRight: string
  sortRowAsc: string
  sortRowDesc: string
  sortColumnAsc: string
  sortColumnDesc: string
  deleteColumn: string
  clearColumnContents: string
  headerRow: string
  headerColumn: string
  mergeCells: string
  splitCell: string
  alignLeft: string
  alignCenter: string
  alignRight: string
  alignTop: string
  alignMiddle: string
  alignBottom: string
  alignment: string
  backgroundColor: string
  defaultTextColor: string
  grayTextColor: string
  brownTextColor: string
  orangeTextColor: string
  yellowTextColor: string
  greenTextColor: string
  blueTextColor: string
  purpleTextColor: string
  pinkTextColor: string
  redTextColor: string
  defaultBackgroundColor: string
  grayBackgroundColor: string
  brownBackgroundColor: string
  orangeBackgroundColor: string
  yellowBackgroundColor: string
  greenBackgroundColor: string
  blueBackgroundColor: string
  purpleBackgroundColor: string
  pinkBackgroundColor: string
  redBackgroundColor: string
  clearContents: string
  fitToWidth: string
  deleteTable: string
  tableOfContents: string
  tableOfContentsSubtext: string
  tableSubtext: string
  taskList: string
  text: string
  textColor: string
  textColorOptions: string
  textHighlighter: string
  highlightColors: string
  removeHighlight: string
  moreOptions: string
  removeLink: string
  strike: string
  underline: string
  alignJustify: string
  applyLink: string
  superscript: string
  subscript: string
  decreaseIndent: string
  submitAiPrompt: string
  stopAiGeneration: string
  topLevelHeading: string
  turnInto: string
  turnIntoCurrent: string
  tryAgain: string
  upload: string
  uploadFailed: string
}

export type OmniboxEditorTranslations = Partial<OmniboxEditorTranslationMap>

const zhCNTranslations: OmniboxEditorTranslationMap = {
  addCaption: "添加图片说明...",
  add: "添加",
  ai: "AI",
  aiIsWriting: "AI 正在写作",
  aiReviewPrompt: "告诉 AI 还需要改什么...",
  aiTone: "语气",
  apply: "应用",
  askAi: "询问 AI",
  askAiPrompt: "告诉 AI 你想做什么...",
  askAiSubtext: "让 AI 帮你生成或编辑内容",
  blockquote: "引用",
  blockquoteBlock: "引用块",
  bulletList: "无序列表",
  bold: "加粗",
  clearAllContents: "清空所有内容",
  clickForOptions: "点击打开选项",
  code: "代码",
  codeBlock: "代码块",
  codeBlockWithSyntaxHighlighting: "带语法高亮的代码块",
  color: "颜色",
  continueWriting: "继续写作",
  continueWritingPrompt: "让 AI 继续写下去...",
  continueWritingSubtext: "让 AI 继续当前内容",
  close: "关闭",
  copyAnchorLink: "复制锚点链接",
  copyToClipboard: "复制到剪贴板",
  delete: "删除",
  discard: "丢弃",
  duplicateNode: "复制节点",
  applyFormula: "应用公式",
  closeFormulaEditor: "关闭公式编辑器",
  editFormula: "编辑公式",
  emoji: "表情",
  emojiSubtext: "插入表情",
  failedToRenderChart: "图表渲染失败",
  failedToRenderDiagram: "流程图渲染失败",
  heading: "标题",
  heading1: "一级标题",
  heading2: "二级标题",
  heading3: "三级标题",
  heading4: "四级标题",
  heading5: "五级标题",
  heading6: "六级标题",
  highlightColor: "高亮颜色",
  holdForDrag: "按住拖动",
  hideSource: "隐藏源码",
  image: "图片",
  imageSubtext: "可调整大小并支持说明的图片",
  addImage: "添加图片",
  replaceImage: "替换图片",
  increaseIndent: "增加缩进",
  insert: "插入",
  italic: "斜体",
  linkEditor: "链接编辑",
  link: "链接",
  listItem: "列表项",
  listWithOrderedItems: "有序项目列表",
  listWithTasks: "任务列表",
  listWithUnorderedItems: "无序项目列表",
  loading: "正在加载...",
  mention: "提及",
  mentionSubtext: "提及用户或项目",
  node: "节点",
  orderedList: "有序列表",
  placeholder: "开始输入...",
  pasteLink: "粘贴链接...",
  openLinkInNewWindow: "在新窗口打开",
  recentColors: "最近使用的颜色",
  recentTextColor: "最近使用的文字颜色",
  recentHighlightColor: "最近使用的高亮颜色",
  regularTextParagraph: "普通文本段落",
  resetFormatting: "清除格式",
  separator: "分隔线",
  separatorSubtext: "用于分隔内容的水平线",
  showSource: "显示源码",
  style: "样式",
  subsectionAndGroupHeading: "小节和分组标题",
  table: "表格",
  rowActions: "行操作",
  columnActions: "列操作",
  tableCellsOption: "单元格选项",
  insertRowAbove: "在上方插入行",
  insertRowBelow: "在下方插入行",
  deleteRow: "删除行",
  clearRowContents: "清空行内容",
  insertColumnLeft: "在左侧插入列",
  insertColumnRight: "在右侧插入列",
  duplicateRow: "复制行",
  duplicateColumn: "复制列",
  moveRowUp: "上移行",
  moveRowDown: "下移行",
  moveColumnLeft: "左移列",
  moveColumnRight: "右移列",
  sortRowAsc: "行升序排序",
  sortRowDesc: "行降序排序",
  sortColumnAsc: "列升序排序",
  sortColumnDesc: "列降序排序",
  deleteColumn: "删除列",
  clearColumnContents: "清空列内容",
  headerRow: "表头行",
  headerColumn: "表头列",
  mergeCells: "合并单元格",
  splitCell: "拆分单元格",
  alignLeft: "左对齐",
  alignCenter: "居中对齐",
  alignRight: "右对齐",
  alignTop: "顶部对齐",
  alignMiddle: "垂直居中",
  alignBottom: "底部对齐",
  alignment: "对齐",
  backgroundColor: "背景颜色",
  defaultTextColor: "默认文字",
  grayTextColor: "灰色文字",
  brownTextColor: "棕色文字",
  orangeTextColor: "橙色文字",
  yellowTextColor: "黄色文字",
  greenTextColor: "绿色文字",
  blueTextColor: "蓝色文字",
  purpleTextColor: "紫色文字",
  pinkTextColor: "粉色文字",
  redTextColor: "红色文字",
  defaultBackgroundColor: "默认背景",
  grayBackgroundColor: "灰色背景",
  brownBackgroundColor: "棕色背景",
  orangeBackgroundColor: "橙色背景",
  yellowBackgroundColor: "黄色背景",
  greenBackgroundColor: "绿色背景",
  blueBackgroundColor: "蓝色背景",
  purpleBackgroundColor: "紫色背景",
  pinkBackgroundColor: "粉色背景",
  redBackgroundColor: "红色背景",
  clearContents: "清空内容",
  fitToWidth: "适应宽度",
  deleteTable: "删除表格",
  tableOfContents: "目录",
  tableOfContentsSubtext: "插入目录",
  tableSubtext: "插入表格",
  taskList: "待办列表",
  text: "文本",
  textColor: "文字颜色",
  textColorOptions: "文字颜色选项",
  textHighlighter: "文字高亮",
  highlightColors: "高亮颜色",
  removeHighlight: "移除高亮",
  moreOptions: "更多选项",
  removeLink: "移除链接",
  strike: "删除线",
  underline: "下划线",
  alignJustify: "两端对齐",
  applyLink: "应用链接",
  superscript: "上标",
  subscript: "下标",
  decreaseIndent: "减少缩进",
  submitAiPrompt: "发送 AI 提示词",
  stopAiGeneration: "停止 AI 生成",
  topLevelHeading: "顶级标题",
  turnInto: "转换为",
  turnIntoCurrent: "转换为（当前：{{current}}）",
  tryAgain: "重试",
  upload: "上传",
  uploadFailed: "上传失败",
}

const enTranslations: OmniboxEditorTranslationMap = {
  addCaption: "Add a caption...",
  add: "Add",
  ai: "AI",
  aiIsWriting: "AI is writing",
  aiReviewPrompt: "Tell AI what else needs to be changed...",
  aiTone: "Tone",
  apply: "Apply",
  askAi: "Ask AI",
  askAiPrompt: "Ask AI what you want...",
  askAiSubtext: "Ask AI to generate or edit content",
  blockquote: "Blockquote",
  blockquoteBlock: "Blockquote block",
  bulletList: "Bullet List",
  bold: "Bold",
  clearAllContents: "Clear all contents",
  clickForOptions: "Click for options",
  code: "Code",
  codeBlock: "Code Block",
  codeBlockWithSyntaxHighlighting: "Code block with syntax highlighting",
  color: "Color",
  continueWriting: "Continue Writing",
  continueWritingPrompt: "Ask AI to continue writing...",
  continueWritingSubtext: "Continue writing from the current content",
  close: "Close",
  copyAnchorLink: "Copy anchor link",
  copyToClipboard: "Copy to clipboard",
  delete: "Delete",
  discard: "Discard",
  duplicateNode: "Duplicate node",
  applyFormula: "Apply formula",
  closeFormulaEditor: "Close formula editor",
  editFormula: "Edit formula",
  emoji: "Emoji",
  emojiSubtext: "Insert an emoji",
  failedToRenderChart: "Failed to render chart",
  failedToRenderDiagram: "Failed to render diagram",
  heading: "Heading",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  heading4: "Heading 4",
  heading5: "Heading 5",
  heading6: "Heading 6",
  highlightColor: "Highlight color",
  holdForDrag: "Hold for drag",
  hideSource: "Hide source",
  image: "Image",
  imageSubtext: "Resizable image with caption",
  addImage: "Add image",
  replaceImage: "Replace image",
  increaseIndent: "Increase indent",
  insert: "Insert",
  italic: "Italic",
  linkEditor: "Link Editor",
  link: "Link",
  listItem: "List Item",
  listWithOrderedItems: "List with ordered items",
  listWithTasks: "List with tasks",
  listWithUnorderedItems: "List with unordered items",
  loading: "Connecting...",
  mention: "Mention",
  mentionSubtext: "Mention a user or item",
  node: "Node",
  orderedList: "Ordered List",
  placeholder: "Start writing...",
  pasteLink: "Paste a link...",
  openLinkInNewWindow: "Open in new window",
  recentColors: "Recent colors",
  recentTextColor: "Recent text color",
  recentHighlightColor: "Recent highlight color",
  regularTextParagraph: "Regular text paragraph",
  resetFormatting: "Reset formatting",
  separator: "Separator",
  separatorSubtext: "Horizontal line to separate content",
  showSource: "Show source",
  style: "Style",
  subsectionAndGroupHeading: "Subsection and group heading",
  table: "Table",
  rowActions: "Row actions",
  columnActions: "Column actions",
  tableCellsOption: "Table cells option",
  insertRowAbove: "Insert row above",
  insertRowBelow: "Insert row below",
  deleteRow: "Delete row",
  clearRowContents: "Clear row contents",
  insertColumnLeft: "Insert column left",
  insertColumnRight: "Insert column right",
  duplicateRow: "Duplicate row",
  duplicateColumn: "Duplicate column",
  moveRowUp: "Move row up",
  moveRowDown: "Move row down",
  moveColumnLeft: "Move column left",
  moveColumnRight: "Move column right",
  sortRowAsc: "Sort row A-Z",
  sortRowDesc: "Sort row Z-A",
  sortColumnAsc: "Sort column A-Z",
  sortColumnDesc: "Sort column Z-A",
  deleteColumn: "Delete column",
  clearColumnContents: "Clear column contents",
  headerRow: "Header row",
  headerColumn: "Header column",
  mergeCells: "Merge cells",
  splitCell: "Split cell",
  alignLeft: "Align left",
  alignCenter: "Align center",
  alignRight: "Align right",
  alignTop: "Align top",
  alignMiddle: "Align middle",
  alignBottom: "Align bottom",
  alignment: "Alignment",
  backgroundColor: "Background color",
  defaultTextColor: "Default text",
  grayTextColor: "Gray text",
  brownTextColor: "Brown text",
  orangeTextColor: "Orange text",
  yellowTextColor: "Yellow text",
  greenTextColor: "Green text",
  blueTextColor: "Blue text",
  purpleTextColor: "Purple text",
  pinkTextColor: "Pink text",
  redTextColor: "Red text",
  defaultBackgroundColor: "Default background",
  grayBackgroundColor: "Gray background",
  brownBackgroundColor: "Brown background",
  orangeBackgroundColor: "Orange background",
  yellowBackgroundColor: "Yellow background",
  greenBackgroundColor: "Green background",
  blueBackgroundColor: "Blue background",
  purpleBackgroundColor: "Purple background",
  pinkBackgroundColor: "Pink background",
  redBackgroundColor: "Red background",
  clearContents: "Clear contents",
  fitToWidth: "Fit to width",
  deleteTable: "Delete table",
  tableOfContents: "Table of contents",
  tableOfContentsSubtext: "Insert a table of contents",
  tableSubtext: "Insert a table",
  taskList: "Task List",
  text: "Text",
  textColor: "Text color",
  textColorOptions: "Text color options",
  textHighlighter: "Text Highlighter",
  highlightColors: "Highlight colors",
  removeHighlight: "Remove highlight",
  moreOptions: "More options",
  removeLink: "Remove link",
  strike: "Strikethrough",
  underline: "Underline",
  alignJustify: "Align justify",
  applyLink: "Apply link",
  superscript: "Superscript",
  subscript: "Subscript",
  decreaseIndent: "Decrease indent",
  submitAiPrompt: "Submit AI prompt",
  stopAiGeneration: "Stop AI generation",
  topLevelHeading: "Top-level heading",
  turnInto: "Turn into",
  turnIntoCurrent: "Turn into (current: {{current}})",
  tryAgain: "Try again",
  upload: "Upload",
  uploadFailed: "Upload failed",
}

function getDefaultTranslations(
  locale?: OmniboxEditorLocale
): OmniboxEditorTranslationMap {
  if (!locale) {
    return zhCNTranslations
  }

  return locale.toLowerCase().startsWith("zh") ? zhCNTranslations : enTranslations
}

export function getEditorTranslations(
  locale?: OmniboxEditorLocale,
  translations?: OmniboxEditorTranslations
): OmniboxEditorTranslationMap {
  return {
    ...getDefaultTranslations(locale),
    ...translations,
  }
}

export type OmniboxEditorI18n = OmniboxEditorTranslationMap

export const EditorI18nContext = createContext<OmniboxEditorI18n>(
  getEditorTranslations()
)

export function useEditorI18n() {
  return useContext(EditorI18nContext)
}
