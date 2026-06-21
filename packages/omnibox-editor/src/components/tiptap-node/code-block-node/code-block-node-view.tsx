import { useState } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"

const diagramLanguages = new Set([
  "abc",
  "echarts",
  "flowchart",
  "graphviz",
  "markmap",
  "mermaid",
  "mindmap",
  "plantuml",
  "smiles",
])

function getLanguageLabel(language: unknown) {
  if (typeof language !== "string" || !language.trim()) {
    return "Code"
  }

  return language.trim()
}

export function CodeBlockNodeView(props: NodeViewProps) {
  const language = getLanguageLabel(props.node.attrs.language)
  const isDiagram = diagramLanguages.has(language.toLowerCase())
  const [collapsed, setCollapsed] = useState(isDiagram)

  return (
    <NodeViewWrapper
      className="code-block-node"
      data-collapsed={collapsed ? "true" : "false"}
      data-language={language}
    >
      <div className="code-block-node__header" contentEditable={false}>
        <span className="code-block-node__language">{language}</span>
        <button
          type="button"
          className="code-block-node__toggle"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? "Show source" : "Hide source"}
        </button>
      </div>
      <pre className="code-block-node__pre">
        <NodeViewContent className="code-block-node__content" />
      </pre>
    </NodeViewWrapper>
  )
}
