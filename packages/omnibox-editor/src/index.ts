import "./style.css"

export {
  OmniboxEditor,
  OmniboxEditor as CvnertEditor,
} from "./components/tiptap-templates/omnibox/omnibox-editor"

export {
  contentToMarkdown,
  contentToTiptapJson,
  markdownToTiptapJson,
  tiptapJsonToMarkdown,
} from "./lib/markdown"

export { getEditorTranslations } from "./lib/i18n"

export type {
  CvnertEditorProps,
  CvnertEditorUpdatePayload,
  EditorProviderProps,
  OmniboxEditorTheme,
  OmniboxEditorProps,
  OmniboxEditorUpdatePayload,
  UploadFunction,
} from "./types"

export type {
  MarkdownParseOptions,
  TiptapJsonContent,
} from "./lib/markdown"

export type {
  OmniboxEditorLocale,
  OmniboxEditorTranslations,
} from "./lib/i18n"
