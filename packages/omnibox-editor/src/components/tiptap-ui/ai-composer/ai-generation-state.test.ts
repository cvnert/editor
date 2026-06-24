import { describe, expect, it } from "vitest"

import {
  shouldAbortAiGeneration,
  shouldShowAiReview,
} from "./ai-generation-state"

describe("shouldAbortAiGeneration", () => {
  it("does not abort when a closed indicator reports closed", () => {
    expect(
      shouldAbortAiGeneration({
        isWriting: false,
        nextOpen: false,
      })
    ).toBe(false)
  })

  it("aborts when an active writing indicator closes", () => {
    expect(
      shouldAbortAiGeneration({
        isWriting: true,
        nextOpen: false,
      })
    ).toBe(true)
  })
})

describe("shouldShowAiReview", () => {
  it("shows review controls only after text has been generated", () => {
    expect(shouldShowAiReview("reviewing", true)).toBe(true)
    expect(shouldShowAiReview("reviewing", false)).toBe(false)
    expect(shouldShowAiReview("writing", true)).toBe(false)
  })
})
