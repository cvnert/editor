import type { TiptapJsonContent } from "./markdown"

interface HtmlTableCell {
  tagName: "td" | "th"
  text: string
  colspan: number
  rowspan: number
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: "\"",
}

export function htmlTableToTiptapNode(
  tableHtml: string
): TiptapJsonContent | null {
  const rows = parseRows(tableHtml)

  if (!rows.length) {
    return null
  }

  const headerRows = getHeaderRowCount(rows)
  const tableRows = rows.map((row, rowIndex) => ({
    type: "tableRow",
    content: row.map((cell) => cellToTiptapNode(cell, rowIndex < headerRows)),
  }))

  return {
    type: "table",
    content: tableRows,
  }
}

export function containsMergedTable(node: TiptapJsonContent): boolean {
  return Boolean(
    (node.type === "table" && isMergedTable(node)) ||
      node.content?.some((child) => containsMergedTable(child))
  )
}

export function isMergedTable(node: TiptapJsonContent): boolean {
  if (node.type !== "table") {
    return false
  }

  return Boolean(
    node.content?.some((row) =>
      row.content?.some((cell) => {
        const colspan = Number(cell.attrs?.colspan ?? 1)
        const rowspan = Number(cell.attrs?.rowspan ?? 1)
        return colspan > 1 || rowspan > 1
      })
    )
  )
}

export function tableToHtml(
  table: TiptapJsonContent,
  serializeBlockNode: (node: TiptapJsonContent) => string
): string {
  const rows = (table.content || [])
    .filter((row) => row.type === "tableRow")
    .map((row) => {
      const cells = (row.content || [])
        .filter((cell) => cell.type === "tableCell" || cell.type === "tableHeader")
        .map((cell) => tableCellToHtml(cell, serializeBlockNode))
        .join("")

      return `<tr>${cells}</tr>`
    })
    .join("")

  return `<table>${rows}</table>`
}

function parseRows(tableHtml: string): HtmlTableCell[][] {
  return Array.from(tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi))
    .map((match) => parseCells(match[1]))
    .filter((row) => row.length > 0)
}

function parseCells(rowHtml: string): HtmlTableCell[] {
  return Array.from(rowHtml.matchAll(/<(t[dh])\b([^>]*)>([\s\S]*?)<\/\1>/gi))
    .map((match) => ({
      tagName: match[1].toLowerCase() as "td" | "th",
      text: htmlToText(match[3]),
      colspan: getSpan(match[2], "colspan"),
      rowspan: getSpan(match[2], "rowspan"),
    }))
}

function getHeaderRowCount(rows: HtmlTableCell[][]): number {
  const explicitHeaderRows = rows.findIndex((row) =>
    row.some((cell) => cell.tagName !== "th")
  )

  if (explicitHeaderRows > 0) {
    return explicitHeaderRows
  }

  const [firstRow] = rows
  const maxHeaderSpan =
    firstRow?.reduce((max, cell) => Math.max(max, cell.rowspan), 1) || 1

  return Math.min(maxHeaderSpan, rows.length)
}

function cellToTiptapNode(
  cell: HtmlTableCell,
  headerRow: boolean
): TiptapJsonContent {
  const content = cell.text
    ? [{ type: "text", text: cell.text }]
    : undefined

  return {
    type: cell.tagName === "th" || headerRow ? "tableHeader" : "tableCell",
    attrs: {
      backgroundColor: null,
      nodeTextAlign: null,
      nodeVerticalAlign: null,
      colspan: cell.colspan,
      rowspan: cell.rowspan,
      colwidth: null,
    },
    content: [
      {
        type: "paragraph",
        content,
      },
    ],
  }
}

function getSpan(attributeText: string, name: "colspan" | "rowspan") {
  const match = attributeText.match(
    new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>/]+))`, "i")
  )
  const rawValue = match?.[1] ?? match?.[2] ?? match?.[3]
  const value = Number.parseInt(rawValue || "1", 10)

  return Number.isFinite(value) && value > 0 ? value : 1
}

function htmlToText(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/[ \t\f\v]+/g, " ")
      .replace(/\s*\n\s*/g, "\n")
      .trim()
  )
}

function decodeHtmlEntities(value: string) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    const normalized = String(entity).toLowerCase()

    if (normalized.startsWith("#x")) {
      return codePointToString(Number.parseInt(normalized.slice(2), 16), match)
    }

    if (normalized.startsWith("#")) {
      return codePointToString(Number.parseInt(normalized.slice(1), 10), match)
    }

    return NAMED_ENTITIES[normalized] || match
  })
}

function codePointToString(codePoint: number, fallback: string) {
  if (!Number.isFinite(codePoint)) {
    return fallback
  }

  try {
    return String.fromCodePoint(codePoint)
  } catch {
    return fallback
  }
}

function tableCellToHtml(
  cell: TiptapJsonContent,
  serializeBlockNode: (node: TiptapJsonContent) => string
): string {
  const tagName = cell.type === "tableHeader" ? "th" : "td"
  const attrs = [
    htmlAttribute("colspan", cell.attrs?.colspan, 1),
    htmlAttribute("rowspan", cell.attrs?.rowspan, 1),
    colwidthAttribute(cell.attrs?.colwidth),
  ]
    .filter(Boolean)
    .join("")
  const content = serializeCellContent(cell, serializeBlockNode)

  return `<${tagName}${attrs}>${content}</${tagName}>`
}

function htmlAttribute(name: string, value: unknown, defaultValue: number) {
  const normalized = Number(value ?? defaultValue)

  if (!Number.isFinite(normalized) || normalized === defaultValue) {
    return ""
  }

  return ` ${name}="${escapeHtmlAttribute(String(normalized))}"`
}

function colwidthAttribute(value: unknown) {
  if (!Array.isArray(value) || !value.length) {
    return ""
  }

  return ` colwidth="${escapeHtmlAttribute(value.join(","))}"`
}

function serializeCellContent(
  cell: TiptapJsonContent,
  serializeBlockNode: (node: TiptapJsonContent) => string
) {
  const blocks = cell.content || []

  if (
    blocks.length === 1 &&
    blocks[0].type === "paragraph" &&
    blocks[0].content
  ) {
    return blocks[0].content.map((node) => serializeInlineNode(node)).join("")
  }

  return blocks
    .map((block) => serializeBlockNode(block).trim())
    .filter(Boolean)
    .map(escapeHtmlText)
    .join("<br>")
}

function serializeInlineNode(node: TiptapJsonContent): string {
  if (node.type === "text") {
    let text = escapeHtmlText(node.text || "")

    for (const mark of node.marks || []) {
      if (mark.type === "bold") {
        text = `<strong>${text}</strong>`
      } else if (mark.type === "italic") {
        text = `<em>${text}</em>`
      } else if (mark.type === "code") {
        text = `<code>${text}</code>`
      } else if (mark.type === "strike") {
        text = `<s>${text}</s>`
      } else if (mark.type === "link" && mark.attrs?.href) {
        text = `<a href="${escapeHtmlAttribute(String(mark.attrs.href))}">${text}</a>`
      }
    }

    return text
  }

  return escapeHtmlText(node.text || "")
}

function escapeHtmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function escapeHtmlAttribute(value: string) {
  return escapeHtmlText(value).replace(/"/g, "&quot;")
}
