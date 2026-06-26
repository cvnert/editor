import type { Orientation } from "@/components/tiptap-node/table-node/lib/tiptap-table-utils"
import { useEditorI18n } from "@/lib/i18n"

// --- UI ---
import { useTableAlignCell } from "@/components/tiptap-node/table-node/ui/table-align-cell-button"

// --- Icons ---
import { AlignmentIcon } from "@/components/tiptap-icons/alignment-icon"
import { ChevronRightIcon } from "@/components/tiptap-icons/chevron-right-icon"

// --- UI Primitives ---
import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuContent,
  MenuGroup,
  MenuItem,
} from "@/components/tiptap-ui-primitive/menu"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { ComboboxList } from "@/components/tiptap-ui-primitive/combobox"
import { Separator } from "@/components/tiptap-ui-primitive/separator"

export interface ActionItemProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  onClick: () => void
  disabled?: boolean
  isActive?: boolean
  shortcutBadge?: React.ReactNode
}

export const TableAlignMenu = ({
  index,
  orientation,
}: {
  index?: number
  orientation?: Orientation
}) => {
  const i18n = useEditorI18n()
  const textAlign = {
    left: useTableAlignCell({
      alignmentType: "text",
      alignment: "left",
      index,
      orientation,
    }),
    center: useTableAlignCell({
      alignmentType: "text",
      alignment: "center",
      index,
      orientation,
    }),
    right: useTableAlignCell({
      alignmentType: "text",
      alignment: "right",
      index,
      orientation,
    }),
  }

  const verticalAlign = {
    top: useTableAlignCell({
      alignmentType: "vertical",
      alignment: "top",
      index,
      orientation,
    }),
    middle: useTableAlignCell({
      alignmentType: "vertical",
      alignment: "middle",
      index,
      orientation,
    }),
    bottom: useTableAlignCell({
      alignmentType: "vertical",
      alignment: "bottom",
      index,
      orientation,
    }),
  }

  if (!textAlign.left.canAlignCell()) {
    return null
  }

  const textAlignLabels = [i18n.alignLeft, i18n.alignCenter, i18n.alignRight]
  const verticalAlignLabels = [
    i18n.alignTop,
    i18n.alignMiddle,
    i18n.alignBottom,
  ]

  return (
    <Menu
      placement="right"
      trigger={
        <MenuButton
          render={
            <MenuItem
              render={
                <Button variant="ghost">
                  <AlignmentIcon className="tiptap-button-icon" />
                  <span className="tiptap-button-text">{i18n.alignment}</span>
                  <MenuButtonArrow render={<ChevronRightIcon />} />
                </Button>
              }
            />
          }
        />
      }
    >
      <MenuContent portal>
        <ComboboxList>
          <MenuGroup>
            {Object.values(textAlign).map((align, i) => (
              <ActionItem
                key={`text-${i}`}
                icon={align.Icon}
                label={textAlignLabels[i]}
                disabled={!align.canAlignCell}
                isActive={align.isActive}
                onClick={align.handleAlign}
              />
            ))}
            <Separator orientation="horizontal" />
            {Object.values(verticalAlign).map((align, i) => (
              <ActionItem
                key={`vertical-${i}`}
                icon={align.Icon}
                label={verticalAlignLabels[i]}
                disabled={!align.canAlignCell}
                isActive={align.isActive}
                onClick={align.handleAlign}
              />
            ))}
          </MenuGroup>
        </ComboboxList>
      </MenuContent>
    </Menu>
  )
}

const ActionItem = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  isActive = false,
  shortcutBadge,
}: ActionItemProps) => (
  <MenuItem
    render={
      <Button variant="ghost" data-active-state={isActive ? "on" : "off"} />
    }
    onClick={onClick}
    disabled={disabled}
  >
    <Icon className="tiptap-button-icon" />
    <span className="tiptap-button-text">{label}</span>
    {shortcutBadge}
  </MenuItem>
)

ActionItem.displayName = "ActionItem"
