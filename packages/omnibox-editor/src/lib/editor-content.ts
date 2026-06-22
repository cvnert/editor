import type { Content, JSONContent } from "@tiptap/core"

import {
  contentToTiptapJson,
  type MarkdownParseOptions,
  type TiptapJsonContent,
} from "./markdown"

export type ExternalEditorContent = Content | string

function isJsonContent(value: unknown): value is JSONContent {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof (value as JSONContent).type === "string"
  )
}

export function normalizeEditorContent(
  content: ExternalEditorContent,
  options?: MarkdownParseOptions
): TiptapJsonContent {
  if (typeof content === "string") {
    return contentToTiptapJson(content, options)
  }

  if (Array.isArray(content)) {
    return { type: "doc", content }
  }

  if (isJsonContent(content) && content.type === "doc") {
    return content
  }

  if (isJsonContent(content)) {
    return { type: "doc", content: [content] }
  }

  return contentToTiptapJson("", options)
}

export function getExternalContentUpdate(
  previousContent: TiptapJsonContent | null,
  nextContent: ExternalEditorContent,
  options?: MarkdownParseOptions
) {
  const normalizedContent = normalizeEditorContent(nextContent, options)

  if (
    previousContent &&
    JSON.stringify(previousContent) === JSON.stringify(normalizedContent)
  ) {
    return null
  }

  return normalizedContent
}
