import { useEffect, useId, useRef, useState } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import * as echarts from "echarts"
import mermaid from "mermaid"

import {
  getDisplayEchartsOption,
  getDiagramRendererType,
  normalizeDiagramCode,
  parseEchartsOption,
} from "./diagram-render"
import { getEditorTranslations, type OmniboxEditorI18n } from "@/lib/i18n"

function getLanguageLabel(language: unknown, i18n: OmniboxEditorI18n) {
  if (typeof language !== "string" || !language.trim()) {
    return i18n.code
  }

  return language.trim()
}

type DiagramPreviewProps = {
  code: string
  i18n: OmniboxEditorI18n
  language: string
}

function EchartsPreview({
  code,
  i18n,
}: {
  code: string
  i18n: OmniboxEditorI18n
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    let chart: echarts.ECharts | null = null
    let resizeObserver: ResizeObserver | null = null

    try {
      const option = parseEchartsOption(code)
      chart = echarts.init(container)
      chart.setOption(getDisplayEchartsOption(option))
      setError(null)

      resizeObserver = new ResizeObserver(() => chart?.resize())
      resizeObserver.observe(container)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : i18n.failedToRenderChart)
    }

    return () => {
      resizeObserver?.disconnect()
      chart?.dispose()
    }
  }, [code, i18n.failedToRenderChart])

  return (
    <div className="code-block-node__diagram-body" contentEditable={false}>
      <div className="code-block-node__echarts" ref={containerRef} />
      {error ? <div className="code-block-node__diagram-error">{error}</div> : null}
    </div>
  )
}

function DiagramPreview({ code, i18n, language }: DiagramPreviewProps) {
  const rendererType = getDiagramRendererType(language)

  if (rendererType === "echarts") {
    return <EchartsPreview code={code} i18n={i18n} />
  }

  if (rendererType === "mermaid") {
    return <MermaidPreview code={code} i18n={i18n} />
  }

  return null
}

function MermaidPreview({
  code,
  i18n,
}: {
  code: string
  i18n: OmniboxEditorI18n
}) {
  const renderId = useId()
  const [svg, setSvg] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function renderDiagram() {
      try {
        const result = await mermaid.render(
          `code-block-diagram-${renderId.replace(/:/g, "")}`,
          normalizeDiagramCode(code)
        )

        if (!cancelled) {
          setSvg(result.svg)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setSvg("")
          setError(cause instanceof Error ? cause.message : i18n.failedToRenderDiagram)
        }
      }
    }

    renderDiagram()

    return () => {
      cancelled = true
    }
  }, [code, i18n.failedToRenderDiagram, renderId])

  return (
    <div className="code-block-node__diagram-body" contentEditable={false}>
      {svg ? (
        <div
          className="code-block-node__mermaid"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : null}
      {error ? <div className="code-block-node__diagram-error">{error}</div> : null}
    </div>
  )
}

export function CodeBlockNodeView(props: NodeViewProps) {
  const i18n =
    (props.extension.options as { i18n?: OmniboxEditorI18n }).i18n ??
    getEditorTranslations()
  const language = getLanguageLabel(props.node.attrs.language, i18n)
  const rendererType = getDiagramRendererType(language)
  const isDiagram = Boolean(rendererType)
  const [collapsed, setCollapsed] = useState(isDiagram)
  const code = props.node.textContent
  const showSourceToggle = isDiagram && props.editor.isEditable

  useEffect(() => {
    setCollapsed(isDiagram)
  }, [isDiagram, language])

  return (
    <NodeViewWrapper
      className="code-block-node"
      data-collapsed={collapsed ? "true" : "false"}
      data-diagram={isDiagram ? "true" : "false"}
      data-language={language}
    >
      <div className="code-block-node__header" contentEditable={false}>
        <span className="code-block-node__language">{language}</span>
        {showSourceToggle ? (
          <button
            type="button"
            className="code-block-node__toggle"
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? i18n.showSource : i18n.hideSource}
          </button>
        ) : null}
      </div>
      {isDiagram ? (
        <DiagramPreview code={code} i18n={i18n} language={language} />
      ) : null}
      <pre className="code-block-node__pre">
        <NodeViewContent className="code-block-node__content" />
      </pre>
    </NodeViewWrapper>
  )
}
