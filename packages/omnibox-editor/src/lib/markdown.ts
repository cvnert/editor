import type { JSONContent } from "@tiptap/core"
import { fromMarkdown } from "mdast-util-from-markdown"
import { gfmFromMarkdown } from "mdast-util-gfm"
import { mathFromMarkdown } from "mdast-util-math"
import { gfm } from "micromark-extension-gfm"
import { math } from "micromark-extension-math"

export type TiptapJsonContent = JSONContent

export interface MarkdownParseOptions {
  linkBase?: string
}

type MdastNode = {
  type: string
  value?: string
  depth?: number
  url?: string
  alt?: string
  title?: string | null
  lang?: string | null
  ordered?: boolean
  start?: number | null
  checked?: boolean | null
  children?: MdastNode[]
}

type TiptapMark = NonNullable<TiptapJsonContent["marks"]>[number]

const diagramLanguages = new Set([
  "abc",
  "echarts",
  "flowchart",
  "graphviz",
  "markmap",
  "mermaid",
  "mindmap",
  "plantuml",
  "smiles",
])

function normalizeCodeBlockLanguage(language: string | null | undefined) {
  return language?.trim().toLowerCase() || ""
}

function unescapeDiagramCode(code: string) {
  let normalized = code

  for (let index = 0; index < 10; index += 1) {
    const next = normalized
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\+(["'`{}[\](),:])/g, "$1")

    if (next === normalized) {
      break
    }

    normalized = next
  }

  return normalized
}

function normalizeCodeBlockContent(language: string, code: string) {
  return diagramLanguages.has(normalizeCodeBlockLanguage(language))
    ? unescapeDiagramCode(code)
    : code
}

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

function textNode(text: string, marks?: TiptapMark[]): TiptapJsonContent {
  return marks?.length ? { type: "text", text, marks } : { type: "text", text }
}

function paragraph(content: TiptapJsonContent[] = []): TiptapJsonContent {
  return { type: "paragraph", content }
}

function imageNode(
  attrs: {
    src?: string | null
    alt?: string | null
    title?: string | null
  },
  options?: MarkdownParseOptions
): TiptapJsonContent {
  return {
    type: "image",
    attrs: {
      src: resolveUrl(attrs.src || "", options),
      alt: attrs.alt || null,
      title: attrs.title || null,
      showCaption: false,
    },
  }
}

function isImageNode(node: TiptapJsonContent) {
  return node.type === "image"
}

function appendInlineBlocks(
  blocks: TiptapJsonContent[],
  inlineNodes: TiptapJsonContent[]
) {
  let paragraphContent: TiptapJsonContent[] = []

  inlineNodes.forEach((node) => {
    if (!isImageNode(node)) {
      paragraphContent.push(node)
      return
    }

    if (paragraphContent.length) {
      blocks.push(paragraph(paragraphContent))
      paragraphContent = []
    }

    blocks.push(node)
  })

  if (paragraphContent.length) {
    blocks.push(paragraph(paragraphContent))
  }
}

function getCellAttrs() {
  return {
    backgroundColor: null,
    nodeTextAlign: null,
    nodeVerticalAlign: null,
    colspan: 1,
    rowspan: 1,
    colwidth: null,
  }
}

function mergeMarks(current: TiptapMark[], mark: TiptapMark) {
  return [...current, mark]
}

function inlineNodes(
  nodes: MdastNode[] = [],
  options?: MarkdownParseOptions,
  marks: TiptapMark[] = []
): TiptapJsonContent[] {
  return nodes.flatMap((node): TiptapJsonContent[] => {
    switch (node.type) {
      case "text":
        return node.value ? [textNode(node.value, marks)] : []
      case "break":
        return [{ type: "hardBreak" }]
      case "inlineCode":
        return node.value ? [textNode(node.value, mergeMarks(marks, { type: "code" }))] : []
      case "strong":
        return inlineNodes(node.children, options, mergeMarks(marks, { type: "bold" }))
      case "emphasis":
        return inlineNodes(node.children, options, mergeMarks(marks, { type: "italic" }))
      case "delete":
        return inlineNodes(node.children, options, mergeMarks(marks, { type: "strike" }))
      case "link":
        return inlineNodes(
          node.children,
          options,
          mergeMarks(marks, {
            type: "link",
            attrs: { href: resolveUrl(node.url || "", options) },
          })
        )
      case "image":
        return [
          imageNode(
            {
              src: node.url,
              alt: node.alt || null,
              title: node.title || null,
            },
            options
          ),
        ]
      case "inlineMath":
        return [{ type: "inlineMath", attrs: { latex: node.value || "" } }]
      case "html":
        return htmlToTiptapJson(node.value || "", options)
      default:
        return node.children
          ? inlineNodes(node.children, options, marks)
          : node.value
            ? [textNode(node.value, marks)]
            : []
    }
  })
}

function tableCellContent(
  cell: MdastNode,
  options?: MarkdownParseOptions
): TiptapJsonContent {
  return {
    type: "tableCell",
    attrs: getCellAttrs(),
    content: [paragraph(inlineNodes(cell.children, options))],
  }
}

function blockNodes(
  nodes: MdastNode[] = [],
  options?: MarkdownParseOptions
): TiptapJsonContent[] {
  return nodes.flatMap((node, index): TiptapJsonContent[] => {
    switch (node.type) {
      case "heading":
        return [
          {
            type: "heading",
            attrs: { level: node.depth || 1 },
            content: inlineNodes(node.children, options),
          },
        ]
      case "paragraph": {
        const blocks: TiptapJsonContent[] = []
        appendInlineBlocks(blocks, inlineNodes(node.children, options))
        return blocks.length ? blocks : [paragraph()]
      }
      case "blockquote":
        return [
          {
            type: "blockquote",
            content: blockNodes(node.children, options),
          },
        ]
      case "code": {
        const language = node.lang || ""
        const codeText = normalizeCodeBlockContent(language, node.value || "")
        return [
          {
            type: "codeBlock",
            attrs: { language: language || null },
            content: codeText ? [textNode(codeText)] : undefined,
          },
        ]
      }
      case "math":
        return [{ type: "blockMath", attrs: { latex: node.value || "" } }]
      case "thematicBreak":
        return [{ type: "horizontalRule" }]
      case "list": {
        const checkedList = (node.children || []).some(
          (child) => child.checked !== null && child.checked !== undefined
        )
        const listType = checkedList
          ? "taskList"
          : node.ordered
            ? "orderedList"
            : "bulletList"

        const listNode: TiptapJsonContent = {
          type: listType,
          content: (node.children || []).map((child) =>
            listItemNode(child, checkedList, options)
          ),
        }

        if (node.ordered) {
          listNode.attrs = { start: node.start || 1 }
        }

        return [listNode]
      }
      case "table": {
        const rows = node.children || []
        return [
          {
            type: "table",
            content: rows.map((row, rowIndex) => ({
              type: "tableRow",
              content: (row.children || []).map((cell) => ({
                ...tableCellContent(cell, options),
                type: rowIndex === 0 ? "tableHeader" : "tableCell",
              })),
            })),
          },
        ]
      }
      case "html":
        return htmlToTiptapJson(node.value || "", options)
      default:
        if (node.children) {
          return blockNodes(node.children, options)
        }
        return node.value && index === 0 ? [paragraph([textNode(node.value)])] : []
    }
  })
}

function listItemNode(
  node: MdastNode,
  isTaskItem: boolean,
  options?: MarkdownParseOptions
): TiptapJsonContent {
  const content = blockNodes(node.children, options)

  return {
    type: isTaskItem ? "taskItem" : "listItem",
    attrs: isTaskItem ? { checked: Boolean(node.checked) } : undefined,
    content: content.length ? content : [paragraph()],
  }
}

function parseHtmlAttrs(html: string) {
  const attrs: Record<string, string> = {}
  const attrPattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
  let match: RegExpExecArray | null

  while ((match = attrPattern.exec(html))) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? ""
  }

  return attrs
}

function stripHtmlTags(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .trim()
}

function htmlToTiptapJson(
  html: string,
  options?: MarkdownParseOptions
): TiptapJsonContent[] {
  const blocks: TiptapJsonContent[] = []
  const imgPattern = /<img\b[^>]*>/gi
  let index = 0
  let match: RegExpExecArray | null

  while ((match = imgPattern.exec(html))) {
    const before = stripHtmlTags(html.slice(index, match.index))
    if (before) {
      blocks.push(paragraph([textNode(before)]))
    }

    const attrs = parseHtmlAttrs(match[0])
    blocks.push(
      imageNode(
        {
          src: attrs.src,
          alt: attrs.alt || null,
          title: attrs.title || null,
        },
        options
      )
    )
    index = imgPattern.lastIndex
  }

  const after = stripHtmlTags(html.slice(index))
  if (after) {
    blocks.push(paragraph([textNode(after)]))
  }

  if (blocks.length) {
    return blocks
  }

  const text = stripHtmlTags(html)
  return text ? [paragraph([textNode(text)])] : []
}

export function markdownToTiptapJson(
  markdown: string,
  options?: MarkdownParseOptions
): TiptapJsonContent {
  const tree = fromMarkdown(markdown.replace(/\r\n?/g, "\n"), {
    extensions: [gfm(), math()],
    mdastExtensions: [gfmFromMarkdown(), mathFromMarkdown()],
  }) as MdastNode
  const content = blockNodes(tree.children, options)

  return { type: "doc", content: content.length ? content : [paragraph()] }
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
    // Not a serialized Tiptap document. Treat it as Markdown.
  }

  return markdownToTiptapJson(content, options)
}

function escapeMarkdownText(text: string) {
  return text.replace(/([\\`*_{}\[\]()#+\-.!|>])/g, "\\$1")
}

function inlineToMarkdown(nodes: TiptapJsonContent[] = []): string {
  return nodes
    .map((node) => {
      if (node.type === "hardBreak") return "\n"
      if (node.type === "inlineMath") {
        return `$${String(node.attrs?.latex || "")}$`
      }
      if (node.type === "image") {
        const src = String(node.attrs?.src || "")
        const alt = String(node.attrs?.alt || "")
        const title = node.attrs?.title ? ` "${String(node.attrs.title)}"` : ""
        return `![${alt}](${src}${title})`
      }
      let value = escapeMarkdownText(node.text || "")
      node.marks?.forEach((mark) => {
        if (mark.type === "bold") value = `**${value}**`
        if (mark.type === "italic") value = `*${value}*`
        if (mark.type === "strike") value = `~~${value}~~`
        if (mark.type === "code") value = `\`${node.text || ""}\``
        if (mark.type === "link") {
          value = `[${value}](${String(mark.attrs?.href || "")})`
        }
      })
      return value
    })
    .join("")
}

function blockToMarkdown(node: TiptapJsonContent, index = 0): string {
  switch (node.type) {
    case "heading":
      return `${"#".repeat(Number(node.attrs?.level || 1))} ${inlineToMarkdown(
        node.content
      )}`
    case "paragraph":
      return inlineToMarkdown(node.content)
    case "blockquote":
      return (node.content || [])
        .map((child) => blockToMarkdown(child))
        .join("\n\n")
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")
    case "codeBlock":
      return `\`\`\`${node.attrs?.language || ""}\n${node.content?.[0]?.text || ""}\n\`\`\``
    case "blockMath":
      return `$$\n${node.attrs?.latex || ""}\n$$`
    case "horizontalRule":
      return "---"
    case "bulletList":
      return (node.content || [])
        .map((item) => `- ${inlineToMarkdown(item.content?.[0]?.content)}`)
        .join("\n")
    case "orderedList":
      return (node.content || [])
        .map((item, itemIndex) => {
          const start = Number(node.attrs?.start || 1)
          return `${start + itemIndex}. ${inlineToMarkdown(
            item.content?.[0]?.content
          )}`
        })
        .join("\n")
    case "taskList":
      return (node.content || [])
        .map((item) => {
          const checked = item.attrs?.checked ? "x" : " "
          return `- [${checked}] ${inlineToMarkdown(item.content?.[0]?.content)}`
        })
        .join("\n")
    case "image": {
      const src = String(node.attrs?.src || "")
      const alt = String(node.attrs?.alt || "")
      const title = node.attrs?.title ? ` "${String(node.attrs.title)}"` : ""
      return `![${alt}](${src}${title})`
    }
    case "table": {
      const rows = node.content || []
      const cells = rows.map((row) =>
        (row.content || []).map((cell) =>
          inlineToMarkdown(cell.content?.[0]?.content)
        )
      )
      if (!cells.length) return ""
      const header = cells[0]
      const separator = header.map(() => "---")
      return [header, separator, ...cells.slice(1)]
        .map((row) => `| ${row.join(" | ")} |`)
        .join("\n")
    }
    default:
      return index === 0 ? inlineToMarkdown(node.content) : ""
  }
}

export function tiptapJsonToMarkdown(json: TiptapJsonContent): string {
  return (json.content || [])
    .map((node, index) => blockToMarkdown(node, index))
    .filter(Boolean)
    .join("\n\n")
}

export function contentToMarkdown(content: string | TiptapJsonContent): string {
  const json = contentToTiptapJson(content)
  return tiptapJsonToMarkdown(json)
}
