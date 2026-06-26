import "./style.css"

export {
  OmniboxEditor,
} from "./components/tiptap-templates/omnibox/omnibox-editor"

export {
  contentToMarkdown,
  contentToTiptapJson,
  htmlTableToTiptapNode,
  markdownWithHtmlTablesToTiptapJson,
  markdownToTiptapJson,
  tiptapJsonToMarkdown,
} from "./lib/markdown"

export { getEditorTranslations } from "./lib/i18n"

export type {
  OmniboxEditorAiAction,
  OmniboxEditorCollaborationConfig,
  OmniboxEditorCollaborationProvider,
  OmniboxEditorCollaborationUser,
  OmniboxEditorMentionUser,
  EditorProviderProps,
  OmniboxEditorAiConfig,
  OmniboxEditorAiFeature,
  OmniboxEditorAiSubmitPayload,
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
