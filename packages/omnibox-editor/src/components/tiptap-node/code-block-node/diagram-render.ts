import type { EChartsOption } from "echarts"

export type DiagramRendererType = "echarts" | "mermaid"

const mermaidLanguages = new Set(["flowchart", "mermaid", "mindmap"])

export function isMermaidDiagramLanguage(language: string) {
  return mermaidLanguages.has(language.trim().toLowerCase())
}

export function getDiagramRendererType(language: string): DiagramRendererType | null {
  const normalizedLanguage = language.trim().toLowerCase()

  if (normalizedLanguage === "echarts") {
    return "echarts"
  }

  if (isMermaidDiagramLanguage(normalizedLanguage)) {
    return "mermaid"
  }

  return null
}

export function normalizeDiagramCode(code: string) {
  return code
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\(["'`{}\[\](),:])/g, "$1")
    .trim()
}

export function parseEchartsOption(code: string): EChartsOption {
  const normalizedCode = normalizeDiagramCode(code)

  try {
    return JSON.parse(normalizedCode) as EChartsOption
  } catch {
    return Function(`"use strict";return (${normalizedCode})`)() as EChartsOption
  }
}

type EchartsComponentOption = Record<string, unknown>

function isComponentOption(value: unknown): value is EchartsComponentOption {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function hasPosition(value: EchartsComponentOption) {
  return Object.hasOwn(value, "top") || Object.hasOwn(value, "bottom")
}

function hasHorizontalPosition(value: EchartsComponentOption) {
  return Object.hasOwn(value, "left") || Object.hasOwn(value, "right")
}

function hasComponent(value: unknown) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value)
}

function withDefaultPosition(
  value: unknown,
  top: number,
  withHorizontalCenter = false
) {
  const addPosition = (component: EchartsComponentOption) => {
    const next = { ...component }

    if (!hasPosition(next)) {
      next.top = top
    }

    if (withHorizontalCenter && !hasHorizontalPosition(next)) {
      next.left = "center"
    }

    return next
  }

  if (Array.isArray(value)) {
    return value.map((item) => (isComponentOption(item) ? addPosition(item) : item))
  }

  if (isComponentOption(value)) {
    return addPosition(value)
  }

  return value
}

function hasCartesianAxes(option: EChartsOption) {
  return hasComponent(option.xAxis) || hasComponent(option.yAxis)
}

function getDefaultGridTop(option: EChartsOption) {
  const hasTitle = hasComponent(option.title)
  const hasLegend = hasComponent(option.legend)

  if (hasTitle && hasLegend) {
    return 120
  }

  if (hasTitle || hasLegend) {
    return 80
  }

  return null
}

function withDefaultGridTop(value: unknown, top: number) {
  const addTop = (component: EchartsComponentOption) => {
    if (hasPosition(component)) {
      return component
    }

    return { ...component, top }
  }

  if (Array.isArray(value)) {
    return value.map((item) => (isComponentOption(item) ? addTop(item) : item))
  }

  if (isComponentOption(value)) {
    return addTop(value)
  }

  return { top }
}

export function getDisplayEchartsOption(option: EChartsOption): EChartsOption {
  const next: EChartsOption = { ...option }
  const hasTitle = hasComponent(option.title)
  const hasLegend = hasComponent(option.legend)

  if (hasTitle) {
    next.title = withDefaultPosition(option.title, 16, true) as EChartsOption["title"]
  }

  if (hasLegend) {
    next.legend = withDefaultPosition(
      option.legend,
      hasTitle ? 64 : 24,
      true
    ) as EChartsOption["legend"]
  }

  const gridTop = getDefaultGridTop(option)

  if (gridTop !== null && hasCartesianAxes(option)) {
    next.grid = withDefaultGridTop(option.grid, gridTop) as EChartsOption["grid"]
  }

  return next
}
