import { describe, expect, it } from "vitest"

import { getAiComposerPromptValue } from "./ai-composer"

describe("getAiComposerPromptValue", () => {
  it("trims prompt text before submit", () => {
    expect(getAiComposerPromptValue("  write a summary  ")).toBe(
      "write a summary"
    )
  })

  it("returns an empty string for blank prompt text", () => {
    expect(getAiComposerPromptValue("   ")).toBe("")
  })
})
