import { CodeBlock as TiptapCodeBlock } from "@tiptap/extension-code-block"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { CodeBlockNodeView } from "@/components/tiptap-node/code-block-node/code-block-node-view"

export const CodeBlock = TiptapCodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView)
  },
})

export default CodeBlock
