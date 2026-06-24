import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const currentDir = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(currentDir, "./github-markdown.css"), "utf8")

describe("github markdown editor styles", () => {
  it("inherits the editor theme color for markdown text", () => {
    expect(css).toContain("--fgColor-default: currentColor")
    expect(css).toContain("color: var(--fgColor-default)")
  })

  it("keeps GitHub markdown heading scale and block rhythm", () => {
    expect(css).toContain("margin-top: var(--base-size-24)")
    expect(css).toContain("margin-bottom: var(--base-size-16)")
    expect(css).toContain("font-size: 2em")
    expect(css).toContain("font-size: 1.5em")
    expect(css).toContain("font-size: 1.25em")
    expect(css).toContain("font-size: 0.875em")
    expect(css).toContain("font-size: 0.85em")
    expect(css).toContain("border-bottom: 1px solid var(--borderColor-muted)")
  })

  it("keeps GitHub markdown paragraph list code and table spacing", () => {
    expect(css).toContain("line-height: 1.5")
    expect(css).toContain("padding-left: 2em")
    expect(css).toContain("padding: 0.2em 0.4em")
    expect(css).toContain("padding: var(--base-size-16)")
    expect(css).toContain("padding: 6px 13px")
  })
})
