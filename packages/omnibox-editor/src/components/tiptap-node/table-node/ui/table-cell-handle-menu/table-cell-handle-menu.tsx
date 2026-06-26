"use client"

import { forwardRef, useCallback, useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useEditorI18n, type OmniboxEditorI18n } from "@/lib/i18n"

// --- Lib ---
import { cn, SR_ONLY } from "@/lib/tiptap-utils"

// --- UI ---
import { ColorMenu } from "@/components/tiptap-ui/color-menu"
import { TableAlignMenu } from "@/components/tiptap-node/table-node/ui/table-alignment-menu"
import { useTableClearRowColumnContent } from "@/components/tiptap-node/table-node/ui/table-clear-row-column-content-button"
import { useTableMergeSplitCell } from "@/components/tiptap-node/table-node/ui/table-merge-split-cell-button"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Combobox, ComboboxList } from "@/components/tiptap-ui-primitive/combobox"
import {
  Menu,
  MenuButton,
  MenuContent,
  MenuGroup,
  MenuItem,
} from "@/components/tiptap-ui-primitive/menu"
import { Separator } from "@/components/tiptap-ui-primitive/separator"

// --- Icons ---
import { Grip4Icon } from "@/components/tiptap-icons/grip-4-icon"

import "./table-cell-handle-menu.css"

interface TableAction {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  onClick: () => void
  isAvailable: boolean
  isActive?: boolean
  shortcutBadge?: React.ReactNode
}

export function getTableCellActionLabels(i18n: OmniboxEditorI18n) {
  return {
    merge: i18n.mergeCells,
    split: i18n.splitCell,
    clear: i18n.clearContents,
  }
}

/**
 * Hook to manage all table actions and their availability
 */
function useTableActions(i18n: OmniboxEditorI18n) {
  const labels = getTableCellActionLabels(i18n)
  const mergeCellAction = useTableMergeSplitCell({ action: "merge" })
  const splitCellAction = useTableMergeSplitCell({ action: "split" })
  const clearContentAction = useTableClearRowColumnContent({ resetAttrs: true })

  const mergeAction: TableAction = {
    icon: mergeCellAction.Icon,
    label: labels.merge,
    onClick: mergeCellAction.handleExecute,
    isAvailable: mergeCellAction.canExecute,
  }

  const splitAction: TableAction = {
    icon: splitCellAction.Icon,
    label: labels.split,
    onClick: splitCellAction.handleExecute,
    isAvailable: splitCellAction.canExecute,
  }

  const clearAction: TableAction = {
    icon: clearContentAction.Icon,
    label: labels.clear,
    onClick: clearContentAction.handleClear,
    isAvailable: clearContentAction.canClearRowColumnContent,
  }

  return {
    mergeAction,
    splitAction,
    clearAction,
  }
}

/**
 * Hook to manage table handle menu state and interactions
 */
function useTableCellHandleMenu({ editor }: { editor: Editor | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    editor?.commands.unfreezeHandles()
  }, [editor])

  const handleMenuToggle = useCallback(
    (isOpen: boolean) => {
      setIsMenuOpen(isOpen)

      if (!editor) return

      if (isOpen) {
        editor.commands.freezeHandles()
      } else {
        editor.commands.unfreezeHandles()
      }
    },
    [editor]
  )

  return {
    isMenuOpen,
    handleMenuToggle,
    closeMenu,
  }
}

const TableActionItem = ({ action }: { action: TableAction }) => {
  const { icon: Icon, label, onClick, isActive = false, shortcutBadge } = action

  return (
    <MenuItem
      render={
        <Button variant="ghost" data-active-state={isActive ? "on" : "off"} />
      }
      onClick={onClick}
    >
      <Icon className="tiptap-button-icon" />
      <span className="tiptap-button-text">{label}</span>
      {shortcutBadge}
    </MenuItem>
  )
}

const TableActionMenu = ({
  i18n,
  onClose,
}: {
  i18n: OmniboxEditorI18n
  onClose: () => void
}) => {
  const { mergeAction, splitAction, clearAction } = useTableActions(i18n)

  const hasMergeOrSplit = mergeAction.isAvailable || splitAction.isAvailable

  return (
    <MenuContent
      autoFocusOnShow
      autoFocusOnHide={false}
      modal
      onClose={onClose}
    >
      <Combobox style={SR_ONLY} />
      <ComboboxList style={{ minWidth: "15rem" }}>
        {hasMergeOrSplit && (
          <MenuGroup>
            {mergeAction.isAvailable && (
              <TableActionItem action={mergeAction} />
            )}
            {splitAction.isAvailable && (
              <TableActionItem action={splitAction} />
            )}
            <Separator orientation="horizontal" />
          </MenuGroup>
        )}

        <MenuGroup>
          <ColorMenu />
          <TableAlignMenu />
          {clearAction.isAvailable && <TableActionItem action={clearAction} />}
        </MenuGroup>
      </ComboboxList>
    </MenuContent>
  )
}

interface TableCellHandleMenuProps extends React.ComponentPropsWithoutRef<"button"> {
  editor?: Editor | null
  onOpenChange?: (isOpen: boolean) => void
}

export const TableCellHandleMenu = forwardRef<
  HTMLButtonElement,
  TableCellHandleMenuProps
>(({ editor: providedEditor, onOpenChange, className, ...props }, ref) => {
  const { editor } = useTiptapEditor(providedEditor)
  const i18n = useEditorI18n()
  const { isMenuOpen, handleMenuToggle, closeMenu } = useTableCellHandleMenu({
    editor,
  })

  useEffect(() => {
    onOpenChange?.(isMenuOpen)
  }, [isMenuOpen, onOpenChange])

  return (
    <Menu
      open={isMenuOpen}
      onOpenChange={handleMenuToggle}
      placement="bottom-start"
      trigger={
        <MenuButton
          ref={ref}
          className={cn(
            "expandable-menu-button",
            isMenuOpen && "menu-opened",
            className
          )}
          aria-label={i18n.tableCellsOption}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          {...props}
        >
          <Grip4Icon className="tiptap-button-icon" />
        </MenuButton>
      }
    >
      <TableActionMenu i18n={i18n} onClose={closeMenu} />
    </Menu>
  )
})

TableCellHandleMenu.displayName = "TableCellHandleMenu"

export { TableActionMenu }
