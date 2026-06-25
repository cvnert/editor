import type { JSONContent } from "@tiptap/core"
import type { Slice } from "@tiptap/pm/model"

import { tiptapJsonToMarkdown } from "./markdown"

export type TiptapClipboardJsonContent = JSONContent

export function tiptapJsonToClipboardText(
  json: TiptapClipboardJsonContent
): string {
  return tiptapJsonToMarkdown(json, { debug: false })
}

export function clipboardSliceToTiptapJson(
  slice: Slice
): TiptapClipboardJsonContent {
  return {
    type: "doc",
    content: slice.content.toJSON() as JSONContent[],
  }
}

export function clipboardSliceToText(slice: Slice): string {
  return tiptapJsonToClipboardText(clipboardSliceToTiptapJson(slice))
}
