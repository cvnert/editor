import type { Content, JSONContent } from "@tiptap/core"
import type { Editor } from "@tiptap/react"
import type { Doc } from "yjs"
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
export type OmniboxEditorAiAction = "ask" | "continue_writing"
export type OmniboxEditorAiContent = JSONContent | JSONContent[]
export type OmniboxEditorCollaborationUser = {
  id?: string
  name: string
  color: string
  avatar?: string
}
export type OmniboxEditorMentionUser = {
  id: string
  name: string
  color?: string
  avatar?: string
  position?: string
}
export type OmniboxEditorCollaborationProvider = {
  awareness?: unknown
  document?: unknown
}
export type OmniboxEditorCollaborationConfig =
  | false
  | {
      document: Doc
      provider?: OmniboxEditorCollaborationProvider
      user?: OmniboxEditorCollaborationUser
    }
export type OmniboxEditorAiSubmitPayload = {
  action: OmniboxEditorAiAction
  editor: Editor
  prompt: string
  signal?: AbortSignal
  onChunk?: (chunk: string) => void
  onContent?: (content: OmniboxEditorAiContent) => void
  onContentPreview?: (content: OmniboxEditorAiContent) => void
}

export type OmniboxEditorAiConfig = {
  enabled?: boolean
  onSubmit?: (payload: OmniboxEditorAiSubmitPayload) => void | Promise<void>
}

export type OmniboxEditorAiFeature = boolean | OmniboxEditorAiConfig

export interface OmniboxEditorProps {
  ai?: OmniboxEditorAiFeature
  collaboration?: OmniboxEditorCollaborationConfig
  user?: OmniboxEditorCollaborationUser
  mentionUsers?: OmniboxEditorMentionUser[]
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


export type EditorProviderProps = OmniboxEditorProps
