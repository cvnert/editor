import type { Content, JSONContent } from "@tiptap/core"
import type { Editor } from "@tiptap/react"
import type {
  OmniboxEditorLocale,
  OmniboxEditorTranslations,
} from "@/lib/i18n"

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>

export type OmniboxEditorUpdatePayload = {
  editor: Editor
  json: JSONContent
  html: string
  markdown: string
}

export type OmniboxEditorVariant = "page" | "embedded"
export type OmniboxEditorTheme = "light" | "dark"

export interface OmniboxEditorProps {
  editable?: boolean
  placeholder?: string
  content?: Content | string
  linkBase?: string
  locale?: OmniboxEditorLocale
  translations?: OmniboxEditorTranslations
  theme?: OmniboxEditorTheme
  contentWidth?: number | string
  variant?: OmniboxEditorVariant
  showHeader?: boolean
  showToc?: boolean
  onUpdate?: (payload: OmniboxEditorUpdatePayload) => void
  imageUpload?: UploadFunction
  imageUploadMaxSize?: number
  imageUploadLimit?: number
  onImageUploadError?: (error: Error) => void
  onImageUploadSuccess?: (url: string) => void
}

export type CvnertEditorUpdatePayload = OmniboxEditorUpdatePayload
export type CvnertEditorProps = OmniboxEditorProps

export type EditorProviderProps = OmniboxEditorProps
