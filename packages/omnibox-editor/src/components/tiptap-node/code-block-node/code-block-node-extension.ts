import { CodeBlock as TiptapCodeBlock } from "@tiptap/extension-code-block"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { CodeBlockNodeView } from "@/components/tiptap-node/code-block-node/code-block-node-view"
import {
  getEditorTranslations,
  type OmniboxEditorI18n,
} from "@/lib/i18n"

export interface CodeBlockOptions {
  i18n: OmniboxEditorI18n
}

export const CodeBlock = TiptapCodeBlock.extend<CodeBlockOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      i18n: getEditorTranslations(),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView)
  },
})

export default CodeBlock
