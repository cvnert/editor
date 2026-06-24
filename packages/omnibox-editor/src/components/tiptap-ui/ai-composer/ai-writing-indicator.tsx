"use client"

import type { Editor } from "@tiptap/react"

import { FloatingElement } from "@/components/tiptap-ui-utils/floating-element"
import { StopCircle2Icon } from "@/components/tiptap-icons/stop-circle-2-icon"
import { useEditorI18n } from "@/lib/i18n"

import "@/components/tiptap-ui/ai-composer/ai-composer.css"

type AiWritingIndicatorProps = {
  editor: Editor
  open: boolean
  getBoundingClientRect?: (editor: Editor) => DOMRect | null
  onOpenChange: (open: boolean) => void
}

export function AiWritingIndicator({
  editor,
  getBoundingClientRect,
  open,
  onOpenChange,
}: AiWritingIndicatorProps) {
  const i18n = useEditorI18n()

  return (
    <FloatingElement
      editor={editor}
      shouldShow={open}
      onOpenChange={onOpenChange}
      closeOnEscape={true}
      resetTextSelectionOnClose={false}
      getBoundingClientRect={getBoundingClientRect}
      zIndex={1001}
      floatingOptions={{
        placement: "bottom-start",
      }}
      className="tiptap-ai-writing-indicator"
      role="status"
      aria-live="polite"
    >
      <div className="tiptap-ai-writing-indicator__content">
        <span className="tiptap-ai-writing-indicator__label">
          {i18n.aiIsWriting}
        </span>
        <span className="tiptap-ai-writing-indicator__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
      <button
        type="button"
        className="tiptap-ai-writing-indicator__stop"
        aria-label={i18n.stopAiGeneration}
        onClick={() => onOpenChange(false)}
      >
        <StopCircle2Icon className="tiptap-ai-writing-indicator__icon" />
      </button>
    </FloatingElement>
  )
}
