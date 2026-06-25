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

import {
  containsMergedTable,
  htmlTableToTiptapNode,
  isMergedTable,
  tableToHtml,
} from "./html-table"

export type TiptapJsonContent = JSONContent

export interface MarkdownParseOptions {
  debug?: boolean
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

type MarkdownSegment =
  | { type: "markdown"; value: string }
  | { type: "table"; value: string }

interface SparseHeaderInfo {
  fixedColumnCount: number
  groupColumnCount: number
  logicalColumnCount: number
}

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

function logMarkdownConversion(label: string, input: unknown, output: unknown) {
  console.log(`[cvnert-editor:${label}] input`, input)
  console.log(`[cvnert-editor:${label}] output`, output)
}

function shouldLogMarkdownConversion(options?: MarkdownParseOptions) {
  return options?.debug !== false
}

function isRelativeUrl(url: string) {
  return (
    !!url &&
    !url.startsWith("/") &&
    !url.startsWith("#") &&
    !/^[a-z][a-z\d+.-]*:/i.test(url)
  )
}

function splitPathAndSuffix(url: string) {
  const match = url.match(/^([^?#]*)([?#].*)?$/)
  return {
    path: match?.[1] ?? "",
    suffix: match?.[2] ?? "",
  }
}

function pathSegments(path: string) {
  return path
    .replace(/^(\.\/)+/, "")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
}

function findSegmentOverlap(baseSegments: string[], urlSegments: string[]) {
  const maxOverlap = Math.min(baseSegments.length, urlSegments.length)

  for (let size = maxOverlap; size > 0; size--) {
    const baseTail = baseSegments.slice(-size)
    const urlHead = urlSegments.slice(0, size)

    if (baseTail.every((segment, index) => segment === urlHead[index])) {
      return size
    }
  }

  return 0
}

function mergeRelativePath(linkBase: string, urlPath: string) {
  const baseSegments = pathSegments(linkBase)
  const urlSegments = pathSegments(urlPath)
  const overlap = findSegmentOverlap(baseSegments, urlSegments)

  return [...baseSegments, ...urlSegments.slice(overlap)].join("/")
}

function resolveUrl(url: string, options?: MarkdownParseOptions) {
  const linkBase = options?.linkBase?.trim().replace(/\/$/, "")

  if (!linkBase || !isRelativeUrl(url)) {
    return url
  }

  const { path, suffix } = splitPathAndSuffix(url)

  try {
    const parsedLinkBase = new URL(linkBase)
    parsedLinkBase.pathname = `/${mergeRelativePath(
      parsedLinkBase.pathname,
      path
    )}`
    parsedLinkBase.search = ""
    parsedLinkBase.hash = ""
    return `${parsedLinkBase.toString()}${suffix}`
  } catch {
    const mergedPath = mergeRelativePath(linkBase, path)
    return `${linkBase.startsWith("/") ? "/" : ""}${mergedPath}${suffix}`
  }
}

function paragraph(): TiptapJsonContent {
  return { type: "paragraph", content: [] }
}

function normalizeTaskMarkers(markdown: string) {
  return markdown.replace(
    /^(\s*[-+*]\s+)\\\[([ xX])\\\](?=\s+)/gm,
    "$1[$2]"
  )
}

function normalizeEscapedCodeFences(markdown: string) {
  return markdown.replace(
    /^([ \t]*)(\\```|\\`\\`\\`|\\~~~|\\~\\~\\~)(.*)$/gm,
    (_line, indent: string, marker: string, rest: string) => {
      const fence = marker.includes("`") ? "```" : "~~~"
      return `${indent}${fence}${rest}`
    }
  )
}

function normalizeInlineCodeDiagramBlocks(markdown: string) {
  const lines = markdown.split("\n")
  const output: string[] = []
  let index = 0

  while (index < lines.length) {
    const block: string[] = []
    const startIndex = index

    while (index < lines.length) {
      const code = getWholeLineInlineCode(lines[index])
      if (code === null) {
        break
      }

      block.push(code)
      index += 1
    }

    if (block.length >= 3) {
      const diagram = detectInlineCodeDiagram(block)

      if (diagram) {
        output.push(`\`\`\`${diagram.language}`, diagram.code, "```")
        continue
      }
    }

    if (index === startIndex) {
      output.push(lines[index])
      index += 1
      continue
    }

    output.push(...lines.slice(startIndex, index))
  }

  return output.join("\n")
}

function getWholeLineInlineCode(line: string) {
  const trimmed = line.trim()
  const match = trimmed.match(/^`([^`]*)`$/)

  return match ? match[1] : null
}

function detectInlineCodeDiagram(lines: string[]) {
  const code = lines.join("\n")

  if (isEchartsOptionLike(code)) {
    return { language: "echarts", code }
  }

  if (isMermaidLike(code)) {
    return { language: "mermaid", code }
  }

  return null
}

function isEchartsOptionLike(code: string) {
  const trimmed = code.trim()

  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return false
  }

  return /"?(series|xAxis|yAxis|tooltip|legend|grid|title)"?\s*:/.test(trimmed)
}

function isMermaidLike(code: string) {
  return /^(mindmap|flowchart|graph|sequenceDiagram|stateDiagram|erDiagram)\b/m.test(
    code.trim()
  )
}

function normalizeCodeBlockLanguage(language: unknown) {
  return typeof language === "string" ? language.trim().toLowerCase() : ""
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
  const normalizedMarkdown = normalizeInlineCodeDiagramBlocks(
    normalizeEscapedCodeFences(normalizeTaskMarkers(markdown))
  )
  const json = normalizeUrls(
    normalizeDiagramCodeBlocks(
      normalizeSparseTables(ensureDocument(markdownManager.parse(normalizedMarkdown)))
    ),
    options
  )

  if (shouldLogMarkdownConversion(options)) {
    logMarkdownConversion("markdownToTiptapJson", markdown, json)
  }

  return json
}

export function markdownWithHtmlTablesToTiptapJson(
  markdown: string,
  options?: MarkdownParseOptions
): TiptapJsonContent {
  const segments = splitHtmlTables(markdown)

  if (!segments.some((segment) => segment.type === "table")) {
    return markdownToTiptapJson(markdown, options)
  }

  const content = segments.flatMap((segment) => {
    if (segment.type === "table") {
      const table = htmlTableToTiptapNode(segment.value)
      return table ? [table] : markdownToBlocks(segment.value, options)
    }

    return markdownToBlocks(segment.value, options)
  })

  const json = normalizeUrls(
    {
      type: "doc",
      content: content.length ? content : [paragraph()],
    },
    options
  )

  if (shouldLogMarkdownConversion(options)) {
    logMarkdownConversion("markdownWithHtmlTablesToTiptapJson", markdown, json)
  }

  return json
}

export function contentToTiptapJson(
  content: string | TiptapJsonContent,
  options?: MarkdownParseOptions
): TiptapJsonContent {
  if (typeof content !== "string") {
    return normalizeUrls(ensureDocument(content), options)
  }

  const trimmed = content.trim()

  if (!trimmed) {
    return markdownToTiptapJson("", options)
  }

  try {
    const parsed = JSON.parse(trimmed) as string | TiptapJsonContent
    if (typeof parsed === "string") {
      return markdownWithHtmlTablesToTiptapJson(parsed, options)
    }

    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      return normalizeUrls(parsed, options)
    }
  } catch {
    // Not serialized JSON content. Treat it as Markdown.
  }

  return markdownWithHtmlTablesToTiptapJson(content, options)
}

export function tiptapJsonToMarkdown(
  json: TiptapJsonContent,
  options?: MarkdownParseOptions
): string {
  const markdown = serializeNodeToMarkdown(json)

  if (shouldLogMarkdownConversion(options)) {
    logMarkdownConversion("tiptapJsonToMarkdown", json, markdown)
  }

  return markdown
}

export function contentToMarkdown(
  content: string | TiptapJsonContent,
  options?: MarkdownParseOptions
): string {
  return tiptapJsonToMarkdown(contentToTiptapJson(content, options), options)
}

export { htmlTableToTiptapNode } from "./html-table"

function splitHtmlTables(markdown: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = []
  const tableRegex = /<table\b[\s\S]*?<\/table>/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tableRegex.exec(markdown))) {
    if (match.index > lastIndex) {
      segments.push({
        type: "markdown",
        value: markdown.slice(lastIndex, match.index),
      })
    }

    segments.push({ type: "table", value: match[0] })
    lastIndex = tableRegex.lastIndex
  }

  if (lastIndex < markdown.length) {
    segments.push({ type: "markdown", value: markdown.slice(lastIndex) })
  }

  return segments
}

function markdownToBlocks(
  markdown: string,
  options?: MarkdownParseOptions
): TiptapJsonContent[] {
  if (!markdown.trim()) {
    return []
  }

  return (markdownToTiptapJson(markdown, options).content || []).filter(
    (node) => !isEmptyParagraph(node)
  )
}

function isEmptyParagraph(node: TiptapJsonContent) {
  return node.type === "paragraph" && !node.content?.length
}

function normalizeSparseTables(node: TiptapJsonContent): TiptapJsonContent {
  if (node.type === "table") {
    return normalizeSparseTable(node)
  }

  return {
    ...node,
    ...(node.content
      ? { content: node.content.map((child) => normalizeSparseTables(child)) }
      : {}),
  }
}

function normalizeDiagramCodeBlocks(node: TiptapJsonContent): TiptapJsonContent {
  if (
    node.type === "codeBlock" &&
    diagramLanguages.has(normalizeCodeBlockLanguage(node.attrs?.language))
  ) {
    return {
      ...node,
      ...(node.content
        ? {
            content: node.content.map((child) =>
              child.type === "text" && typeof child.text === "string"
                ? { ...child, text: unescapeDiagramCode(child.text) }
                : child
            ),
          }
        : {}),
    }
  }

  return {
    ...node,
    ...(node.content
      ? { content: node.content.map((child) => normalizeDiagramCodeBlocks(child)) }
      : {}),
  }
}

function normalizeSparseTable(table: TiptapJsonContent): TiptapJsonContent {
  const rows = table.content || []
  const headerInfo = getSparseHeaderInfo(rows)

  if (!headerInfo) {
    return table
  }

  const headerNormalized = normalizeSparseHeaderRows(rows, headerInfo)
  const bodyNormalized = normalizeSparseBodyRows(headerNormalized, headerInfo)

  return {
    ...table,
    content: bodyNormalized,
  }
}

function getSparseHeaderInfo(
  rows: TiptapJsonContent[]
): SparseHeaderInfo | null {
  const [firstRow, secondRow, ...restRows] = rows
  void restRows
  if (!firstRow || !secondRow) {
    return null
  }

  const firstCells = firstRow.content || []
  const secondCells = secondRow.content || []
  if (
    firstCells.length !== secondCells.length ||
    firstCells.some((cell) => cell.type !== "tableHeader") ||
    secondCells.some((cell) => !isTableCellNode(cell))
  ) {
    return null
  }

  const firstEmptyIndex = firstCells.findIndex(isEmptyTableCell)
  if (firstEmptyIndex <= 0) {
    return null
  }

  const hasOnlyTrailingEmptyCells = firstCells
    .slice(firstEmptyIndex)
    .every(isEmptyTableCell)
  if (!hasOnlyTrailingEmptyCells || isEmptyTableCell(firstCells[firstEmptyIndex - 1])) {
    return null
  }

  const secondRowGroupCells = secondCells
    .filter((cell) => !isEmptyTableCell(cell))
  if (secondRowGroupCells.length <= 1) {
    return null
  }

  return {
    fixedColumnCount: firstEmptyIndex - 1,
    groupColumnCount: secondRowGroupCells.length,
    logicalColumnCount: firstCells.length,
  }
}

function normalizeSparseHeaderRows(
  rows: TiptapJsonContent[],
  info: SparseHeaderInfo
) {
  const [firstRow, secondRow, ...restRows] = rows
  const firstCells = firstRow.content || []
  const secondCells = secondRow.content || []
  const secondRowGroupCells = secondCells
    .filter((cell) => !isEmptyTableCell(cell))
    .map((cell) => ({ ...cell, type: "tableHeader" }))

  if (!firstRow || !secondRow) {
    return rows
  }

  const firstHeaderCells = firstCells
    .slice(0, info.fixedColumnCount + 1)
    .map((cell, index) =>
      index === info.fixedColumnCount
        ? withCellAttrs(cell, { colspan: info.groupColumnCount })
        : withCellAttrs(cell, { rowspan: 2 })
    )

  return [
    { ...firstRow, content: firstHeaderCells },
    { ...secondRow, content: secondRowGroupCells },
    ...restRows,
  ]
}

function normalizeSparseBodyRows(
  rows: TiptapJsonContent[],
  info: SparseHeaderInfo
) {
  const output: TiptapJsonContent[] = []
  let group: TiptapJsonContent[] = []

  const flushGroup = () => {
    if (!group.length) {
      return
    }

    const maxOmitted = Math.max(
      ...group.map((row, index) =>
        index === 0 ? 0 : getOmittedLeadingBodyCells(row.content || [], info)
      )
    )

    group.forEach((row, index) => {
      const cells = row.content || []
      if (index === 0 && group.length > 1 && maxOmitted > 0) {
        output.push({
          ...row,
          content: cells.map((cell, cellIndex) =>
            cellIndex < maxOmitted
              ? withCellAttrs(cell, { rowspan: group.length })
              : cell
          ),
        })
        return
      }

      if (index > 0) {
        const omitted = getOmittedLeadingBodyCells(cells, info)
        output.push({
          ...row,
          content: removeTrailingCoveredCells(cells, omitted),
        })
        return
      }

      output.push(row)
    })
    group = []
  }

  rows.forEach((row) => {
    const cells = row.content || []
    if (!cells.length || cells.some((cell) => cell.type === "tableHeader")) {
      flushGroup()
      output.push(row)
      return
    }

    const omitted = getOmittedLeadingBodyCells(cells, info)
    if (!group.length || omitted === 0) {
      flushGroup()
    }

    group.push(row)
  })

  flushGroup()

  return output
}

function getOmittedLeadingBodyCells(
  cells: TiptapJsonContent[],
  info: SparseHeaderInfo
) {
  const explicitEmptyCount = cells.findIndex((cell) => !isEmptyTableCell(cell))
  if (explicitEmptyCount > 0) {
    return Math.min(explicitEmptyCount, info.fixedColumnCount)
  }

  if (isDimensionText(getTableCellText(cells[0]))) {
    return Math.min(2, info.fixedColumnCount)
  }

  if (isDimensionText(getTableCellText(cells[1]))) {
    return Math.min(1, info.fixedColumnCount)
  }

  return 0
}

function removeTrailingCoveredCells(cells: TiptapJsonContent[], count: number) {
  if (count <= 0) {
    return cells
  }

  const next = [...cells]
  for (let index = 0; index < count; index += 1) {
    next.pop()
  }

  return next
}

function withCellAttrs(
  cell: TiptapJsonContent,
  attrs: Record<string, unknown>
): TiptapJsonContent {
  return {
    ...cell,
    attrs: {
      ...cell.attrs,
      ...attrs,
    },
  }
}

function isEmptyTableCell(cell: TiptapJsonContent | undefined) {
  return !getTableCellText(cell).trim()
}

function isTableCellNode(cell: TiptapJsonContent | undefined) {
  return cell?.type === "tableCell" || cell?.type === "tableHeader"
}

function getTableCellText(cell: TiptapJsonContent | undefined) {
  if (!cell) {
    return ""
  }

  return (
    cell.content
      ?.map((block) =>
        block.content?.map((inline) => inline.text || "").join("") || ""
      )
      .join("") || ""
  )
}

function isDimensionText(value: string) {
  return /^\s*\d+(?:\s*[×xX*]\s*\d+){1,}/.test(value)
}

function serializeNodeToMarkdown(node: TiptapJsonContent): string {
  if (!containsMergedTable(node)) {
    return markdownManager.serialize(node)
  }

  if (node.type === "doc") {
    return (node.content || []).map(serializeBlockNode).join("\n\n")
  }

  return serializeBlockNode(node)
}

function serializeBlockNode(node: TiptapJsonContent): string {
  if (node.type === "table" && isMergedTable(node)) {
    return tableToHtml(node, serializeBlockNode)
  }

  return markdownManager.serialize(ensureDocument(node)).trim()
}
