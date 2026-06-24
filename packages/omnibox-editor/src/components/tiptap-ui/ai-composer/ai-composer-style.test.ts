import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const currentDir = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(currentDir, "./ai-composer.css"), "utf8")

describe("AI composer styles", () => {
  it("keeps generated AI controls in document flow", () => {
    expect(css).toContain(".tiptap-ai-widget")
    expect(css).toContain("display: block")
    expect(css).toContain("margin: 0.5rem 0 0.75rem")
  })

  it("keeps AI review controls constrained to the editor width", () => {
    expect(css).toContain("width: min(34rem, 100%)")
  })
})
