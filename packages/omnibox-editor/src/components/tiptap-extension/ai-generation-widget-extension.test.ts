import { describe, expect, it } from "vitest"

import { getMappedAiGenerationWidgetState } from "./ai-generation-widget-extension"

describe("getMappedAiGenerationWidgetState", () => {
  it("maps the widget position through document changes", () => {
    expect(
      getMappedAiGenerationWidgetState(
        { pos: 12, status: "writing" },
        undefined,
        (pos) => pos + 7
      )
    ).toEqual({ pos: 19, status: "writing" })
  })

  it("sets and clears the widget state from plugin metadata", () => {
    expect(
      getMappedAiGenerationWidgetState(
        { pos: null, status: "idle" },
        { type: "set", pos: 8, status: "reviewing" },
        (pos) => pos
      )
    ).toEqual({ pos: 8, status: "reviewing" })

    expect(
      getMappedAiGenerationWidgetState(
        { pos: 8, status: "reviewing" },
        { type: "clear" },
        (pos) => pos
      )
    ).toEqual({ pos: null, status: "idle" })
  })
})
