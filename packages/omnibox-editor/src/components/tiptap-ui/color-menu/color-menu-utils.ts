import type { ColorType } from "@/components/tiptap-ui/color-text-popover"
import type { OmniboxEditorI18n } from "@/lib/i18n"

type ColorItem = {
  label: string
  value: string
}

const colorLabelKeys = {
  text: {
    "Default text": "defaultTextColor",
    "Gray text": "grayTextColor",
    "Brown text": "brownTextColor",
    "Orange text": "orangeTextColor",
    "Yellow text": "yellowTextColor",
    "Green text": "greenTextColor",
    "Blue text": "blueTextColor",
    "Purple text": "purpleTextColor",
    "Pink text": "pinkTextColor",
    "Red text": "redTextColor",
  },
  highlight: {
    "Default background": "defaultBackgroundColor",
    "Gray background": "grayBackgroundColor",
    "Brown background": "brownBackgroundColor",
    "Orange background": "orangeBackgroundColor",
    "Yellow background": "yellowBackgroundColor",
    "Green background": "greenBackgroundColor",
    "Blue background": "blueBackgroundColor",
    "Purple background": "purpleBackgroundColor",
    "Pink background": "pinkBackgroundColor",
    "Red background": "redBackgroundColor",
  },
} satisfies Record<ColorType, Record<string, keyof OmniboxEditorI18n>>

const colorLabelKeyMap: Record<ColorType, Record<string, keyof OmniboxEditorI18n>> =
  colorLabelKeys

export function localizeColorItems<T extends ColorItem>(
  colors: T[],
  type: ColorType,
  i18n: OmniboxEditorI18n
): T[] {
  return colors.map((color) => {
    const key = colorLabelKeyMap[type][color.label]

    if (!key) {
      return color
    }

    return {
      ...color,
      label: i18n[key],
    }
  })
}
