import { createContext, useContext } from "react"

export type OmniboxEditorLocale = "en" | "zh-CN" | (string & {})

export type OmniboxEditorTranslations = Partial<{
  addCaption: string
  code: string
  failedToRenderChart: string
  failedToRenderDiagram: string
  hideSource: string
  loading: string
  placeholder: string
  showSource: string
  uploadFailed: string
}>

const zhCNTranslations = {
  addCaption: "添加图片说明...",
  code: "代码",
  failedToRenderChart: "图表渲染失败",
  failedToRenderDiagram: "流程图渲染失败",
  hideSource: "隐藏源码",
  loading: "正在加载...",
  placeholder: "开始输入...",
  showSource: "显示源码",
  uploadFailed: "上传失败",
}

const enTranslations = {
  addCaption: "Add a caption...",
  code: "Code",
  failedToRenderChart: "Failed to render chart",
  failedToRenderDiagram: "Failed to render diagram",
  hideSource: "Hide source",
  loading: "Connecting...",
  placeholder: "Start writing...",
  showSource: "Show source",
  uploadFailed: "Upload failed",
}

function getDefaultTranslations(locale?: OmniboxEditorLocale) {
  return locale?.toLowerCase().startsWith("zh")
    ? zhCNTranslations
    : enTranslations
}

export function getEditorTranslations(
  locale?: OmniboxEditorLocale,
  translations?: OmniboxEditorTranslations
) {
  return {
    ...getDefaultTranslations(locale),
    ...translations,
  }
}

export type OmniboxEditorI18n = ReturnType<typeof getEditorTranslations>

export const EditorI18nContext = createContext<OmniboxEditorI18n>(
  getEditorTranslations()
)

export function useEditorI18n() {
  return useContext(EditorI18nContext)
}
