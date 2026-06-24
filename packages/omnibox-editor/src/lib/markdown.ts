import type { AnyExtension, JSONContent } from "@tiptap/core"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Mathematics } from "@tiptap/extension-mathematics"
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table"
import { MarkdownManager } from "@tiptap/markdown"
import { StarterKit } from "@tiptap/starter-kit"

export type TiptapJsonContent = JSONContent

export interface MarkdownParseOptions {
  linkBase?: string
}

const markdownExtensions: AnyExtension[] = [
  StarterKit.configure({
    dropcursor: false,
    gapcursor: false,
    undoRedo: false,
  }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Image,
  Mathematics,
  Table.configure({
    resizable: false,
  }),
  TableRow,
  TableHeader,
  TableCell,
]

const markdownManager = new MarkdownManager({
  extensions: markdownExtensions,
})

function isRelativeUrl(url: string) {
  return (
    !!url &&
    !url.startsWith("/") &&
    !url.startsWith("#") &&
    !/^[a-z][a-z\d+.-]*:/i.test(url)
  )
}

function resolveUrl(url: string, options?: MarkdownParseOptions) {
  const linkBase = options?.linkBase?.replace(/\/$/, "")

  if (!linkBase || !isRelativeUrl(url)) {
    return url
  }

  return `${linkBase}/${url.replace(/^\.\//, "")}`
}

function paragraph(): TiptapJsonContent {
  return { type: "paragraph", content: [] }
}

function ensureDocument(json: TiptapJsonContent): TiptapJsonContent {
  if (json.type === "doc") {
    return {
      ...json,
      content: json.content?.length ? json.content : [paragraph()],
    }
  }

  return { type: "doc", content: [json] }
}

function normalizeUrls(
  node: TiptapJsonContent,
  options?: MarkdownParseOptions
): TiptapJsonContent {
  let attrs = node.attrs ? { ...node.attrs } : undefined
  const marks = node.marks?.map((mark) => {
    if (!mark.attrs?.href) {
      return mark
    }

    return {
      ...mark,
      attrs: {
        ...mark.attrs,
        href: resolveUrl(String(mark.attrs.href), options),
      },
    }
  })

  if (attrs?.href) {
    attrs.href = resolveUrl(String(attrs.href), options)
  }

  if (attrs?.src) {
    attrs.src = resolveUrl(String(attrs.src), options)
  }

  if (node.type === "image") {
    attrs = attrs ?? {}
    attrs.showCaption = attrs.showCaption ?? false
  }

  return {
    ...node,
    ...(attrs ? { attrs } : {}),
    ...(marks ? { marks } : {}),
    ...(node.content
      ? { content: node.content.map((child) => normalizeUrls(child, options)) }
      : {}),
  }
}

export function markdownToTiptapJson(
  markdown: string,
  options?: MarkdownParseOptions
): TiptapJsonContent {
  return normalizeUrls(ensureDocument(markdownManager.parse(markdown)), options)
}

export function contentToTiptapJson(
  content: string | TiptapJsonContent,
  options?: MarkdownParseOptions
): TiptapJsonContent {
  if (typeof content !== "string") {
    return content
  }

  const trimmed = content.trim()

  if (!trimmed) {
    return markdownToTiptapJson("", options)
  }

  try {
    const parsed = JSON.parse(trimmed) as string | TiptapJsonContent
    if (typeof parsed === "string") {
      return markdownToTiptapJson(parsed, options)
    }

    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      return parsed
    }
  } catch {
    // Not serialized JSON content. Treat it as Markdown.
  }

  return markdownToTiptapJson(content, options)
}

export function tiptapJsonToMarkdown(json: TiptapJsonContent): string {
  return markdownManager.serialize(json)
}

export function contentToMarkdown(content: string | TiptapJsonContent): string {
  return tiptapJsonToMarkdown(contentToTiptapJson(content))
}
