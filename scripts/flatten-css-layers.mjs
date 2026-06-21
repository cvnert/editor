import { readFileSync, writeFileSync } from "node:fs"

const packageJsonUrl = new URL(
  "../packages/omnibox-editor/package.json",
  import.meta.url
)
const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8"))
const cssPath = new URL(
  packageJson.exports["./style.css"],
  new URL("../packages/omnibox-editor/", import.meta.url)
)
const rootScopeSelectors = [
  ".omnibox-editor-root",
  ".tiptap-dropdown-menu-content",
  ".tiptap-dropdown-menu-sub-content",
  ".tiptap-popover",
  ".tiptap-combobox-popover",
  ".tiptap-menu-content",
  ".tiptap-tooltip",
  ".tiptap-cta",
]
const rootScope = rootScopeSelectors.join(",")
const darkScope = rootScopeSelectors
  .flatMap((selector) => [`.dark ${selector}`, `${selector}.dark`])
  .join(",")
const blockedGlobalUtilities = [
  "absolute",
  "block",
  "container",
  "contents",
  "fixed",
  "flex",
  "grid",
  "hidden",
  "inline",
  "relative",
  "sticky",
  "table",
  "visible",
]
const localScopeSelectors = [
  ".ProseMirror",
  ".drag-handle",
  ".emoji-menu-list",
  ".is-empty",
  ".prosemirror-dropcursor-block",
  ".prosemirror-dropcursor-inline",
  ".toc-sidebar",
]
const localScopeExceptions = [
  ".omnibox-editor-root",
  ".tiptap-dropdown-menu-content",
  ".tiptap-dropdown-menu-sub-content",
  ".tiptap-popover",
  ".tiptap-combobox-popover",
  ".tiptap-menu-content",
  ".tiptap-tooltip",
  ".tiptap-cta",
]

function findBlockEnd(css, openBraceIndex) {
  let depth = 0
  let quote = null

  for (let index = openBraceIndex; index < css.length; index += 1) {
    const char = css[index]
    const previous = css[index - 1]

    if (quote) {
      if (char === quote && previous !== "\\") {
        quote = null
      }
      continue
    }

    if (char === "\"" || char === "'") {
      quote = char
      continue
    }

    if (char === "{") {
      depth += 1
      continue
    }

    if (char === "}") {
      depth -= 1
      if (depth === 0) {
        return index
      }
    }
  }

  throw new Error("Could not find matching CSS block end")
}

function flattenLayerAt(css, layerIndex) {
  const openBraceIndex = css.indexOf("{", layerIndex)
  if (openBraceIndex === -1) {
    return css
  }

  const closeBraceIndex = findBlockEnd(css, openBraceIndex)
  const content = css.slice(openBraceIndex + 1, closeBraceIndex)

  return `${css.slice(0, layerIndex)}${content}${css.slice(closeBraceIndex + 1)}`
}

function flattenCssLayers(css) {
  let output = css
  let layerIndex = output.search(/@layer\s+[-\w]+\s*\{/)

  while (layerIndex !== -1) {
    output = flattenLayerAt(output, layerIndex)
    layerIndex = output.search(/@layer\s+[-\w]+\s*\{/)
  }

  return output
}

function scopeThemeSelectors(css) {
  return css
    .replace(/:root\.dark\s*,\s*\.dark/g, darkScope)
    .replace(/:root\s*,\s*:host/g, rootScope)
    .replace(/:root/g, rootScope)
    .replace(/(^|[{}])\.dark(?=\s*\{)/g, `$1${darkScope}`)
}

function splitSelectors(selectorText) {
  const selectors = []
  let current = ""
  let depth = 0
  let quote = null

  for (let index = 0; index < selectorText.length; index += 1) {
    const char = selectorText[index]
    const previous = selectorText[index - 1]

    if (quote) {
      current += char
      if (char === quote && previous !== "\\") {
        quote = null
      }
      continue
    }

    if (char === "\"" || char === "'") {
      quote = char
      current += char
      continue
    }

    if (char === "(" || char === "[") {
      depth += 1
      current += char
      continue
    }

    if (char === ")" || char === "]") {
      depth -= 1
      current += char
      continue
    }

    if (char === "," && depth === 0) {
      selectors.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  if (current.trim()) {
    selectors.push(current.trim())
  }

  return selectors
}

function shouldScopeSelector(selector) {
  const trimmed = selector.trim()

  if (!trimmed || trimmed.startsWith("@")) {
    return false
  }

  if (localScopeExceptions.some((prefix) => trimmed.startsWith(prefix))) {
    return false
  }

  return localScopeSelectors.some((prefix) => trimmed.includes(prefix))
}

function scopeLocalSelector(selector) {
  const darkMatch = selector.match(/^\.dark\s+(.+)$/)
  if (darkMatch && shouldScopeSelector(darkMatch[1])) {
    return `.dark .omnibox-editor-root ${darkMatch[1]},.omnibox-editor-root.dark ${darkMatch[1]}`
  }

  return shouldScopeSelector(selector) ? `.omnibox-editor-root ${selector}` : selector
}

function scopeLocalSelectors(css) {
  let output = ""
  let cursor = 0

  while (cursor < css.length) {
    const openBraceIndex = css.indexOf("{", cursor)
    if (openBraceIndex === -1) {
      output += css.slice(cursor)
      break
    }

    const selectorText = css.slice(cursor, openBraceIndex)
    const trimmedSelectorText = selectorText.trimStart()
    const closeBraceIndex = findBlockEnd(css, openBraceIndex)

    if (trimmedSelectorText.startsWith("@")) {
      output += css.slice(cursor, openBraceIndex + 1)
      output += scopeLocalSelectors(css.slice(openBraceIndex + 1, closeBraceIndex))
      output += "}"
      cursor = closeBraceIndex + 1
      continue
    }

    const selectors = splitSelectors(selectorText)
    const leadingWhitespace = selectorText.match(/^\s*/)?.[0] ?? ""
    output += `${leadingWhitespace}${selectors.map(scopeLocalSelector).join(",")}{`
    output += css.slice(openBraceIndex + 1, closeBraceIndex)
    output += "}"
    cursor = closeBraceIndex + 1
  }

  return output
}

function assertNoGlobalUtilities(css) {
  const utilityPattern = new RegExp(
    `(^|[{}])\\.(${blockedGlobalUtilities.join("|")})(?=[{:])`
  )
  const match = css.match(utilityPattern)

  if (match) {
    throw new Error(`Found unscoped global utility selector ".${match[2]}" in package CSS`)
  }
}

const css = readFileSync(cssPath, "utf8")
const output = scopeLocalSelectors(scopeThemeSelectors(flattenCssLayers(css)))

assertNoGlobalUtilities(output)
writeFileSync(cssPath, output)
