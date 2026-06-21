import type { Content, JSONContent } from "@tiptap/core"
import type { Editor } from "@tiptap/react"

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>

export type OmniboxEditorUpdatePayload = {
  editor: Editor
  json: JSONContent
  html: string
}

export interface OmniboxEditorProps {
  editable?: boolean
  placeholder?: string
  content?: Content
  onUpdate?: (payload: OmniboxEditorUpdatePayload) => void
  imageUpload?: UploadFunction
  imageUploadMaxSize?: number
  imageUploadLimit?: number
  onImageUploadError?: (error: Error) => void
  onImageUploadSuccess?: (url: string) => void
}

export type EditorProviderProps = OmniboxEditorProps
