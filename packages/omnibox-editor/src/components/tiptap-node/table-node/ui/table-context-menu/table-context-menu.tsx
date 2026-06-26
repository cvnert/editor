"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { MouseEvent as ReactMouseEvent } from "react"
import type { Editor } from "@tiptap/react"

// --- Lib ---
import { useEditorI18n, type OmniboxEditorI18n } from "@/lib/i18n"
import type { Orientation } from "@/components/tiptap-node/table-node/lib/tiptap-table-utils"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Table Actions ---
import { useTableAddRowColumn } from "@/components/tiptap-node/table-node/ui/table-add-row-column-button"
import { useTableAlignCell } from "@/components/tiptap-node/table-node/ui/table-align-cell-button"
import { useTableClearRowColumnContent } from "@/components/tiptap-node/table-node/ui/table-clear-row-column-content-button"
import { useTableDeleteRowColumn } from "@/components/tiptap-node/table-node/ui/table-delete-row-column-button"
import { useTableFitToWidth } from "@/components/tiptap-node/table-node/ui/table-fit-to-width-button"
import { useTableHeaderRowColumn } from "@/components/tiptap-node/table-node/ui/table-header-row-column-button"
import { useTableMergeSplitCell } from "@/components/tiptap-node/table-node/ui/table-merge-split-cell-button"

// --- Icons ---
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"

import {
  clampMenuPosition,
  canDeleteTableFromContext,
  focusTableContextTarget,
  getContextTarget,
  getMenuPosition,
  isTableCellTarget,
  type TableContextTarget,
  type TableMenuPosition,
} from "./table-context-menu-utils"

import "./table-context-menu.css"

interface TableContextMenuProps {
  editor: Editor | null
}

interface TableContextAction {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  onClick: () => boolean
  disabled?: boolean
  isVisible?: boolean
  isActive?: boolean
}

function runAndClose(action: () => boolean, closeMenu: () => void) {
  const success = action()
  closeMenu()
  return success
}

function TableContextMenuItem({
  action,
  closeMenu,
}: {
  action: TableContextAction
  closeMenu: () => void
}) {
  const { icon: Icon, label, onClick, disabled, isActive } = action

  return (
    <Button
      type="button"
      variant="ghost"
      data-active-state={isActive ? "on" : "off"}
      disabled={disabled}
      className="tiptap-table-context-menu__item"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => runAndClose(onClick, closeMenu)}
    >
      <Icon className="tiptap-button-icon" />
      <span className="tiptap-button-text">{label}</span>
    </Button>
  )
}

function TableContextMenuGroup({
  actions,
  closeMenu,
}: {
  actions: TableContextAction[]
  closeMenu: () => void
}) {
  const visibleActions = actions.filter((action) => action.isVisible !== false)

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <div className="tiptap-table-context-menu__group">
      {visibleActions.map((action) => (
        <TableContextMenuItem
          key={action.label}
          action={action}
          closeMenu={closeMenu}
        />
      ))}
    </div>
  )
}

function useRowColumnActions({
  editor,
  index,
  orientation,
  tablePos,
  i18n,
}: {
  editor: Editor | null
  index?: number
  orientation: Orientation
  tablePos?: number
  i18n: OmniboxEditorI18n
}) {
  const firstSide = orientation === "row" ? "above" : "left"
  const secondSide = orientation === "row" ? "below" : "right"

  const addBefore = useTableAddRowColumn({
    editor,
    index,
    orientation,
    side: firstSide,
    tablePos,
    hideWhenUnavailable: true,
  })
  const addAfter = useTableAddRowColumn({
    editor,
    index,
    orientation,
    side: secondSide,
    tablePos,
    hideWhenUnavailable: true,
  })
  const deleteAction = useTableDeleteRowColumn({
    editor,
    index,
    orientation,
    tablePos,
    hideWhenUnavailable: true,
  })
  const clearAction = useTableClearRowColumnContent({
    editor,
    index,
    orientation,
    tablePos,
    resetAttrs: true,
    hideWhenUnavailable: true,
  })
  const headerAction = useTableHeaderRowColumn({
    editor,
    index,
    orientation,
    tablePos,
    hideWhenUnavailable: true,
  })

  return useMemo<TableContextAction[]>(
    () => [
      {
        icon: addBefore.Icon,
        label:
          orientation === "row" ? i18n.insertRowAbove : i18n.insertColumnLeft,
        onClick: addBefore.handleAdd,
        disabled: !addBefore.canAddRowColumn,
        isVisible: addBefore.isVisible,
      },
      {
        icon: addAfter.Icon,
        label:
          orientation === "row" ? i18n.insertRowBelow : i18n.insertColumnRight,
        onClick: addAfter.handleAdd,
        disabled: !addAfter.canAddRowColumn,
        isVisible: addAfter.isVisible,
      },
      {
        icon: headerAction.Icon,
        label: orientation === "row" ? i18n.headerRow : i18n.headerColumn,
        onClick: headerAction.handleToggle,
        disabled: !headerAction.canToggleHeader,
        isVisible: headerAction.isVisible,
        isActive: headerAction.isActive,
      },
      {
        icon: clearAction.Icon,
        label:
          orientation === "row"
            ? i18n.clearRowContents
            : i18n.clearColumnContents,
        onClick: clearAction.handleClear,
        disabled: !clearAction.canClearRowColumnContent,
        isVisible: clearAction.isVisible,
      },
      {
        icon: deleteAction.Icon,
        label: orientation === "row" ? i18n.deleteRow : i18n.deleteColumn,
        onClick: deleteAction.handleDelete,
        disabled: !deleteAction.canDeleteRowColumn,
        isVisible: deleteAction.isVisible,
      },
    ],
    [
      addAfter,
      addBefore,
      clearAction,
      deleteAction,
      headerAction,
      i18n,
      orientation,
    ]
  )
}

function useCellActions(editor: Editor | null, i18n: OmniboxEditorI18n) {
  const mergeAction = useTableMergeSplitCell({
    editor,
    action: "merge",
    hideWhenUnavailable: true,
  })
  const splitAction = useTableMergeSplitCell({
    editor,
    action: "split",
    hideWhenUnavailable: true,
  })
  const clearAction = useTableClearRowColumnContent({
    editor,
    resetAttrs: true,
    hideWhenUnavailable: true,
  })
  const alignLeft = useTableAlignCell({
    editor,
    alignmentType: "text",
    alignment: "left",
    hideWhenUnavailable: true,
  })
  const alignCenter = useTableAlignCell({
    editor,
    alignmentType: "text",
    alignment: "center",
    hideWhenUnavailable: true,
  })
  const alignRight = useTableAlignCell({
    editor,
    alignmentType: "text",
    alignment: "right",
    hideWhenUnavailable: true,
  })
  const alignMiddle = useTableAlignCell({
    editor,
    alignmentType: "vertical",
    alignment: "middle",
    hideWhenUnavailable: true,
  })

  return useMemo<TableContextAction[]>(
    () => [
      {
        icon: mergeAction.Icon,
        label: i18n.mergeCells,
        onClick: mergeAction.handleExecute,
        disabled: !mergeAction.canExecute,
        isVisible: mergeAction.isVisible,
      },
      {
        icon: splitAction.Icon,
        label: i18n.splitCell,
        onClick: splitAction.handleExecute,
        disabled: !splitAction.canExecute,
        isVisible: splitAction.isVisible,
      },
      {
        icon: alignLeft.Icon,
        label: i18n.alignLeft,
        onClick: alignLeft.handleAlign,
        disabled: !alignLeft.canAlignCell(),
        isVisible: alignLeft.isVisible,
        isActive: alignLeft.isActive,
      },
      {
        icon: alignCenter.Icon,
        label: i18n.alignCenter,
        onClick: alignCenter.handleAlign,
        disabled: !alignCenter.canAlignCell(),
        isVisible: alignCenter.isVisible,
        isActive: alignCenter.isActive,
      },
      {
        icon: alignRight.Icon,
        label: i18n.alignRight,
        onClick: alignRight.handleAlign,
        disabled: !alignRight.canAlignCell(),
        isVisible: alignRight.isVisible,
        isActive: alignRight.isActive,
      },
      {
        icon: alignMiddle.Icon,
        label: i18n.alignMiddle,
        onClick: alignMiddle.handleAlign,
        disabled: !alignMiddle.canAlignCell(),
        isVisible: alignMiddle.isVisible,
        isActive: alignMiddle.isActive,
      },
      {
        icon: clearAction.Icon,
        label: i18n.clearContents,
        onClick: clearAction.handleClear,
        disabled: !clearAction.canClearRowColumnContent,
        isVisible: clearAction.isVisible,
      },
    ],
    [
      alignCenter,
      alignLeft,
      alignMiddle,
      alignRight,
      clearAction,
      i18n,
      mergeAction,
      splitAction,
    ]
  )
}

export function TableContextMenu({ editor }: TableContextMenuProps) {
  const i18n = useEditorI18n()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<TableMenuPosition | null>(null)
  const [target, setTarget] = useState<TableContextTarget | null>(null)

  const closeMenu = useCallback(() => {
    setPosition(null)
    setTarget(null)
    editor?.commands.unfreezeHandles?.()
  }, [editor])

  const rowActions = useRowColumnActions({
    editor,
    index: target?.rowIndex,
    orientation: "row",
    tablePos: target?.tablePos,
    i18n,
  })
  const columnActions = useRowColumnActions({
    editor,
    index: target?.columnIndex,
    orientation: "column",
    tablePos: target?.tablePos,
    i18n,
  })
  const cellActions = useCellActions(editor, i18n)
  const fitTableActionHook = useTableFitToWidth({
    editor,
    hideWhenUnavailable: true,
  })

  const deleteTableAction = useMemo<TableContextAction>(
    () => ({
      icon: TrashIcon,
      label: i18n.deleteTable,
      onClick: () =>
        editor
          ?.chain()
          .focus(undefined, { scrollIntoView: false })
          .deleteTable()
          .run() ?? false,
      disabled: !canDeleteTableFromContext(editor, target),
      isVisible: Boolean(editor?.isEditable),
    }),
    [editor, i18n.deleteTable, target]
  )

  const fitTableAction = useMemo<TableContextAction>(
    () => ({
      icon: fitTableActionHook.Icon,
      label: i18n.fitToWidth,
      onClick: fitTableActionHook.handleFitToWidth,
      disabled: !fitTableActionHook.canFitToWidth,
      isVisible: fitTableActionHook.isVisible,
    }),
    [fitTableActionHook, i18n.fitToWidth]
  )

  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom

    const handleContextMenu = (event: MouseEvent) => {
      if (!editor.isEditable || !isTableCellTarget(event.target)) {
        closeMenu()
        return
      }

      const reactLikeEvent = event as unknown as ReactMouseEvent
      const nextTarget = getContextTarget(editor, reactLikeEvent)
      if (!nextTarget) {
        closeMenu()
        return
      }

      event.preventDefault()
      event.stopPropagation()

      focusTableContextTarget(editor, nextTarget, reactLikeEvent)
      editor.commands.freezeHandles?.()
      setTarget(nextTarget)
      setPosition(getMenuPosition(reactLikeEvent))
    }

    editorElement.addEventListener("contextmenu", handleContextMenu)

    return () => {
      editorElement.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [closeMenu, editor])

  useLayoutEffect(() => {
    if (!position || !menuRef.current) return

    const nextPosition = clampMenuPosition(
      position,
      menuRef.current.getBoundingClientRect()
    )

    if (nextPosition.x !== position.x || nextPosition.y !== position.y) {
      setPosition(nextPosition)
    }
  }, [position])

  useEffect(() => {
    if (!position) return

    const handleClick = (event: globalThis.MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) {
        return
      }

      closeMenu()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu()
      }
    }

    window.addEventListener("mousedown", handleClick)
    window.addEventListener("scroll", closeMenu, true)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mousedown", handleClick)
      window.removeEventListener("scroll", closeMenu, true)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [closeMenu, position])

  if (!position || !target) {
    return null
  }

  return (
    <div
      ref={menuRef}
      className="tiptap-table-context-menu"
      style={{ left: position.x, top: position.y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <TableContextMenuGroup actions={rowActions} closeMenu={closeMenu} />
      <div className="tiptap-table-context-menu__separator" />
      <TableContextMenuGroup actions={columnActions} closeMenu={closeMenu} />
      <div className="tiptap-table-context-menu__separator" />
      <TableContextMenuGroup actions={cellActions} closeMenu={closeMenu} />
      <div className="tiptap-table-context-menu__separator" />
      <TableContextMenuItem
        action={fitTableAction}
        closeMenu={closeMenu}
      />
      <TableContextMenuItem
        action={deleteTableAction}
        closeMenu={closeMenu}
      />
    </div>
  )
}
