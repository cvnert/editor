import { describe, expect, it } from "vitest"

import { getEditorTranslations } from "@/lib/i18n"

describe("getEditorTranslations", () => {
  it("provides zh-CN labels for editor menus and actions", () => {
    const i18n = getEditorTranslations("zh-CN")

    expect(i18n.text).toBe("文本")
    expect(i18n.heading1).toBe("一级标题")
    expect(i18n.bulletList).toBe("无序列表")
    expect(i18n.turnInto).toBe("转换为")
    expect(i18n.turnIntoCurrent).toBe("转换为（当前：{{current}}）")
    expect(i18n.copyToClipboard).toBe("复制到剪贴板")
    expect(i18n.resetFormatting).toBe("清除格式")
    expect(i18n.clickForOptions).toBe("点击打开选项")
    expect(i18n.holdForDrag).toBe("按住拖动")
  })

  it("allows consumers to override built-in menu labels", () => {
    const i18n = getEditorTranslations("zh-CN", {
      turnInto: "改成",
      delete: "移除",
    })

    expect(i18n.turnInto).toBe("改成")
    expect(i18n.delete).toBe("移除")
    expect(i18n.text).toBe("文本")
  })
})
