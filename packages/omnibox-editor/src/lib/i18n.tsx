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
  insert: string
  linkEditor: string
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
  recentColors: string
  regularTextParagraph: string
  resetFormatting: string
  separator: string
  separatorSubtext: string
  showSource: string
  style: string
  subsectionAndGroupHeading: string
  table: string
  tableOfContents: string
  tableOfContentsSubtext: string
  tableSubtext: string
  taskList: string
  text: string
  textColor: string
  textHighlighter: string
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
  insert: "插入",
  linkEditor: "链接编辑",
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
  recentColors: "最近使用的颜色",
  regularTextParagraph: "普通文本段落",
  resetFormatting: "清除格式",
  separator: "分隔线",
  separatorSubtext: "用于分隔内容的水平线",
  showSource: "显示源码",
  style: "样式",
  subsectionAndGroupHeading: "小节和分组标题",
  table: "表格",
  tableOfContents: "目录",
  tableOfContentsSubtext: "插入目录",
  tableSubtext: "插入表格",
  taskList: "待办列表",
  text: "文本",
  textColor: "文字颜色",
  textHighlighter: "文字高亮",
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
  insert: "Insert",
  linkEditor: "Link Editor",
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
  recentColors: "Recent colors",
  regularTextParagraph: "Regular text paragraph",
  resetFormatting: "Reset formatting",
  separator: "Separator",
  separatorSubtext: "Horizontal line to separate content",
  showSource: "Show source",
  style: "Style",
  subsectionAndGroupHeading: "Subsection and group heading",
  table: "Table",
  tableOfContents: "Table of contents",
  tableOfContentsSubtext: "Insert a table of contents",
  tableSubtext: "Insert a table",
  taskList: "Task List",
  text: "Text",
  textColor: "Text color",
  textHighlighter: "Text Highlighter",
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
  return locale?.toLowerCase().startsWith("zh")
    ? zhCNTranslations
    : enTranslations
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
