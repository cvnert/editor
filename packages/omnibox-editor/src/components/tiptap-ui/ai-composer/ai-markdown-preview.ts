import type { JSONContent } from "@tiptap/core"

import { markdownToTiptapJson } from "@/lib/markdown"

export type AiTiptapJsonContent = JSONContent | JSONContent[]

export function getAiMarkdownPreviewContent(markdown: string): JSONContent[] {
  return markdownToTiptapJson(markdown).content ?? []
}

export function getAiTiptapJsonPreviewContent(
  content: AiTiptapJsonContent
): JSONContent[] {
  if (Array.isArray(content)) {
    return normalizeAiTiptapJsonPreviewNodes(content)
  }

  if (content.type === "doc") {
    return normalizeAiTiptapJsonPreviewNodes(content.content ?? [])
  }

  return normalizeAiTiptapJsonPreviewNode(content)
}

function normalizeAiTiptapJsonPreviewNodes(nodes: JSONContent[]): JSONContent[] {
  return nodes.flatMap(normalizeAiTiptapJsonPreviewNode)
}

function normalizeAiTiptapJsonPreviewNode(node: JSONContent): JSONContent[] {
  if (node.type === "blockquote") {
    return normalizeAiTiptapJsonPreviewNodes(node.content ?? [])
  }

  if (!node.content?.length) {
    return [node]
  }

  return [
    {
      ...node,
      content: normalizeAiTiptapJsonPreviewNodes(node.content),
    },
  ]
}
