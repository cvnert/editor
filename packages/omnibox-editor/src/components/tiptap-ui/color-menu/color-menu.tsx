import type { Editor } from "@tiptap/react"
import { useMemo } from "react"

// Primitive UI Components
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuGroupLabel,
  MenuButton,
} from "@/components/tiptap-ui-primitive/menu"
import { ComboboxList } from "@/components/tiptap-ui-primitive/combobox"
import { Separator } from "@/components/tiptap-ui-primitive/separator"

// Tiptap UI
import {
  TEXT_COLORS,
  useColorText,
} from "@/components/tiptap-ui/color-text-button"
import {
  HIGHLIGHT_COLORS,
  canColorHighlight,
  useColorHighlight,
} from "@/components/tiptap-ui/color-highlight-button"
import type { RecentColor } from "@/components/tiptap-ui/color-text-popover"
import {
  getColorByValue,
  useRecentColors,
} from "@/components/tiptap-ui/color-text-popover"

// Icons
import { PaintBucketIcon } from "@/components/tiptap-icons/paint-bucket-icon"
import { ChevronRightIcon } from "@/components/tiptap-icons/chevron-right-icon"
import { TextColorSmallIcon } from "@/components/tiptap-icons/text-color-small-icon"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useEditorI18n } from "@/lib/i18n"
import { localizeColorItems } from "./color-menu-utils"

interface ColorMenuItemProps {
  editor?: Editor | null
  color: { value: string; label: string }
}

const TextColorMenuItem: React.FC<ColorMenuItemProps> = ({ editor, color }) => {
  const { addRecentColor } = useRecentColors()
  const { isActive, handleColorText, label } = useColorText({
    editor,
    label: color.label,
    textColor: color.value,
    onApplied: ({ color, label }) =>
      addRecentColor({ type: "text", label, value: color }),
  })

  return (
    <MenuItem
      render={
        <Button variant="ghost" data-active-state={isActive ? "on" : "off"} />
      }
      onClick={handleColorText}
    >
      <span className="tiptap-button-color-text" style={{ color: color.value }}>
        <TextColorSmallIcon
          className="tiptap-button-icon"
          style={{ color: color.value, flexGrow: 1 }}
        />
      </span>
      <span className="tiptap-button-text">{label}</span>
    </MenuItem>
  )
}

const HighlightColorMenuItem: React.FC<ColorMenuItemProps> = ({
  editor,
  color,
}) => {
  const { addRecentColor } = useRecentColors()
  const { isActive, handleColorHighlight, label } = useColorHighlight({
    editor,
    label: color.label,
    highlightColor: color.value,
    mode: "node",
    onApplied: ({ color, label }) =>
      addRecentColor({ type: "highlight", label, value: color }),
  })

  return (
    <MenuItem
      render={
        <Button variant="ghost" data-active-state={isActive ? "on" : "off"} />
      }
      onClick={handleColorHighlight}
    >
      <span
        className="tiptap-button-highlight"
        style={{ "--highlight-color": color.value } as React.CSSProperties}
      />
      <span className="tiptap-button-text">{label}</span>
    </MenuItem>
  )
}

const RecentColorMenuItem: React.FC<{
  editor?: Editor | null
  colorObj: RecentColor
  textColors: typeof TEXT_COLORS
  highlightColors: typeof HIGHLIGHT_COLORS
}> = ({ editor, colorObj, textColors, highlightColors }) => {
  const colorSet = colorObj.type === "text" ? textColors : highlightColors
  const color = getColorByValue(colorObj.value, colorSet)

  const ColorComponent =
    colorObj.type === "text" ? TextColorMenuItem : HighlightColorMenuItem

  return <ColorComponent editor={editor} color={color} />
}

export interface ColorMenuProps {
  editor?: Editor | null
  /**
   * Custom trigger component. If not provided, uses default paint bucket button.
   */
  trigger?: React.ReactNode
  /**
   * Label for the color menu trigger
   * @default "Color"
   */
  label?: string
  /**
   * Menu placement relative to trigger
   * @default "right"
   */
  placement?: React.ComponentProps<typeof Menu>["placement"]
}

/**
 * Reusable color menu component that provides text and highlight color options.
 * Includes recent colors, text colors, and highlight colors sections.
 */
export const ColorMenu: React.FC<ColorMenuProps> = ({
  editor: providedEditor,
  trigger,
  label,
  placement = "right",
}) => {
  const { editor } = useTiptapEditor(providedEditor)
  const i18n = useEditorI18n()
  const { recentColors, isInitialized } = useRecentColors()
  const menuLabel = label ?? i18n.color
  const textColors = useMemo(
    () => localizeColorItems(TEXT_COLORS, "text", i18n),
    [i18n]
  )
  const highlightColors = useMemo(
    () => localizeColorItems(HIGHLIGHT_COLORS, "highlight", i18n),
    [i18n]
  )

  const hasColorActions: boolean =
    !!editor?.can().setMark("textStyle") ||
    !!editor?.can().setMark("highlight") ||
    // Guarded helper: toggleNodeBackgroundColor is undefined (and throws when
    // called) if the nodeBackground extension isn't registered.
    canColorHighlight(editor, "node") ||
    false

  if (!editor || !hasColorActions) {
    return null
  }

  const defaultTrigger = (
    <MenuItem
      render={
        <MenuButton
          render={
            <Button variant="ghost">
              <PaintBucketIcon className="tiptap-button-icon" />
              <span className="tiptap-button-text">{menuLabel}</span>
              <Spacer />
              <ChevronRightIcon className="tiptap-button-icon" />
            </Button>
          }
        />
      }
    />
  )

  return (
    <Menu placement={placement} trigger={trigger || defaultTrigger}>
      <MenuContent portal>
        <ComboboxList>
          {/* Recent Colors */}
          {isInitialized && recentColors.length > 0 && (
            <MenuGroup>
              <MenuGroupLabel>{i18n.recentColors}</MenuGroupLabel>
              {recentColors.map((colorObj) => (
                <RecentColorMenuItem
                  key={colorObj.value}
                  editor={editor}
                  colorObj={colorObj}
                  textColors={textColors}
                  highlightColors={highlightColors}
                />
              ))}
              <Separator orientation="horizontal" />
            </MenuGroup>
          )}

          {/* Text Colors */}
          <MenuGroup>
            <MenuGroupLabel>{i18n.textColor}</MenuGroupLabel>
            {textColors.map((textColor) => (
              <TextColorMenuItem
                key={textColor.value}
                editor={editor}
                color={textColor}
              />
            ))}
          </MenuGroup>

          <Separator orientation="horizontal" />

          {/* Background Colors */}
          <MenuGroup>
            <MenuGroupLabel>{i18n.backgroundColor}</MenuGroupLabel>
            {highlightColors.map((highlightColor) => (
              <HighlightColorMenuItem
                key={highlightColor.value}
                editor={editor}
                color={highlightColor}
              />
            ))}
          </MenuGroup>
        </ComboboxList>
      </MenuContent>
    </Menu>
  )
}

export { TextColorMenuItem, HighlightColorMenuItem, RecentColorMenuItem }
