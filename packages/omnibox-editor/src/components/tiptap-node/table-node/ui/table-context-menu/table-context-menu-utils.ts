import type { MouseEvent as ReactMouseEvent } from "react"
import type { Editor } from "@tiptap/react"
import { Selection } from "@tiptap/pm/state"
import {
  CellSelection,
  TableMap,
  findTable,
  selectedRect,
} from "@tiptap/pm/tables"

export interface TableMenuPosition {
  x: number
  y: number
}

export interface TableContextTarget {
  rowIndex: number
  columnIndex: number
  tablePos: number
}

type EditableTableContextEditor = Pick<Editor, "isEditable">

const MENU_MARGIN = 8
const MENU_WIDTH = 184

export function isTableCellTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("td, th"))
}

export function getMenuPosition(event: ReactMouseEvent): TableMenuPosition {
  return {
    x: Math.max(
      MENU_MARGIN,
      Math.min(event.clientX, window.innerWidth - MENU_WIDTH - MENU_MARGIN)
    ),
    y: Math.max(MENU_MARGIN, event.clientY),
  }
}

export function clampMenuPosition(
  position: TableMenuPosition,
  menuRect: Pick<DOMRect, "height" | "width">
): TableMenuPosition {
  return {
    x: Math.max(
      MENU_MARGIN,
      Math.min(position.x, window.innerWidth - menuRect.width - MENU_MARGIN)
    ),
    y: Math.max(
      MENU_MARGIN,
      Math.min(position.y, window.innerHeight - menuRect.height - MENU_MARGIN)
    ),
  }
}

export function canDeleteTableFromContext(
  editor: EditableTableContextEditor | null,
  target: TableContextTarget | null
) {
  return Boolean(editor?.isEditable && target)
}

export function getContextTarget(
  editor: Editor,
  event: ReactMouseEvent
): TableContextTarget | null {
  const positionAtCoords = editor.view.posAtCoords({
    left: event.clientX,
    top: event.clientY,
  })

  if (!positionAtCoords) {
    return null
  }

  const $pos = editor.state.doc.resolve(positionAtCoords.pos)
  const table = findTable($pos)
  if (!table) return null

  const tableMap = TableMap.get(table.node)

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth)
    if (node.type.name !== "tableCell" && node.type.name !== "tableHeader") {
      continue
    }

    const cellPos = $pos.before(depth)
    const rect = tableMap.findCell(cellPos - table.start)

    return {
      rowIndex: rect.top,
      columnIndex: rect.left,
      tablePos: table.pos,
    }
  }

  return null
}

export function focusCellAtEvent(editor: Editor, event: ReactMouseEvent) {
  const positionAtCoords = editor.view.posAtCoords({
    left: event.clientX,
    top: event.clientY,
  })

  if (!positionAtCoords) {
    editor.view.focus()
    return
  }

  const selection = Selection.near(
    editor.state.doc.resolve(positionAtCoords.pos)
  )
  editor.view.dispatch(editor.state.tr.setSelection(selection))
  editor.view.focus()
}

export function focusTableContextTarget(
  editor: Editor,
  target: TableContextTarget,
  event: ReactMouseEvent
) {
  const { selection } = editor.state

  if (selection instanceof CellSelection) {
    const rect = selectedRect(editor.state)
    const isInsideCurrentSelection =
      target.rowIndex >= rect.top &&
      target.rowIndex < rect.bottom &&
      target.columnIndex >= rect.left &&
      target.columnIndex < rect.right

    if (isInsideCurrentSelection) {
      editor.view.focus()
      return
    }
  }

  focusCellAtEvent(editor, event)
}
