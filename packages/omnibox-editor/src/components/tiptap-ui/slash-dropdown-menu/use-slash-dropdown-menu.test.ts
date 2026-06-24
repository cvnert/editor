import { describe, expect, it } from "vitest"

import {
  getSlashMenuItemAction,
  getSlashMenuItemTypes,
  type SlashMenuItemType,
} from "./use-slash-dropdown-menu"

const allItemTypes = [
  "ai_continue_writing",
  "ai_ask",
  "text",
  "image",
] as SlashMenuItemType[]

describe("getSlashMenuItemTypes", () => {
  it("hides AI actions when AI is not enabled", () => {
    expect(getSlashMenuItemTypes(allItemTypes)).toEqual(["text", "image"])
  })

  it("shows AI actions when AI is enabled", () => {
    expect(getSlashMenuItemTypes(allItemTypes, { aiEnabled: true })).toEqual([
      "ai_continue_writing",
      "ai_ask",
      "text",
      "image",
    ])
  })
})

describe("getSlashMenuItemAction", () => {
  it("maps AI menu items to AI composer actions", () => {
    expect(getSlashMenuItemAction("ai_continue_writing")).toBe(
      "continue_writing"
    )
    expect(getSlashMenuItemAction("ai_ask")).toBe("ask")
  })
})
