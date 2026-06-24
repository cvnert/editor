"use client"

import { useState } from "react"
import type { Editor } from "@tiptap/react"

import { FloatingElement } from "@/components/tiptap-ui-utils/floating-element"
import { ArrowUpIcon } from "@/components/tiptap-icons/arrow-up-icon"
import { CheckAiIcon } from "@/components/tiptap-icons/check-ai-icon"
import { RefreshAiIcon } from "@/components/tiptap-icons/refresh-ai-icon"
import { XIcon } from "@/components/tiptap-icons/x-icon"
import { useEditorI18n } from "@/lib/i18n"

import "@/components/tiptap-ui/ai-composer/ai-composer.css"

type AiReviewControlsProps = {
  editor: Editor
  open: boolean
  onApply: () => void
  onDiscard: () => void
  onRetry: () => void
  onSubmitInstruction?: (instruction: string) => void
  getBoundingClientRect?: (editor: Editor) => DOMRect | null
}

export function AiReviewControls({
  editor,
  open,
  onApply,
  onDiscard,
  onRetry,
  onSubmitInstruction,
  getBoundingClientRect,
}: AiReviewControlsProps) {
  const i18n = useEditorI18n()
  const [instruction, setInstruction] = useState("")

  return (
    <FloatingElement
      editor={editor}
      shouldShow={open}
      closeOnEscape={false}
      resetTextSelectionOnClose={false}
      getBoundingClientRect={getBoundingClientRect}
      zIndex={1001}
      floatingOptions={{
        placement: "bottom-start",
      }}
      className="tiptap-ai-review"
      role="dialog"
      aria-label={i18n.ai}
    >
      <div className="tiptap-ai-review__prompt-row">
        <textarea
          className="tiptap-ai-review__textarea"
          placeholder={i18n.aiReviewPrompt}
          rows={1}
          value={instruction}
          onChange={(event) => {
            setInstruction(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) return

            event.preventDefault()
            const value = instruction.trim()
            if (!value) return

            onSubmitInstruction?.(value)
            setInstruction("")
          }}
        />
        <button
          type="button"
          className="tiptap-ai-review__submit"
          aria-label={i18n.submitAiPrompt}
          onClick={() => {
            const value = instruction.trim()
            if (!value) return

            onSubmitInstruction?.(value)
            setInstruction("")
          }}
        >
          <ArrowUpIcon className="tiptap-ai-review__icon" />
        </button>
      </div>
      <div className="tiptap-ai-review__actions">
        <button
          type="button"
          className="tiptap-ai-review__action"
          onClick={onRetry}
        >
          <RefreshAiIcon className="tiptap-ai-review__icon" />
          <span>{i18n.tryAgain}</span>
        </button>
        <div className="tiptap-ai-review__spacer" />
        <button
          type="button"
          className="tiptap-ai-review__action"
          onClick={onDiscard}
        >
          <XIcon className="tiptap-ai-review__icon" />
          <span>{i18n.discard}</span>
        </button>
        <button
          type="button"
          className="tiptap-ai-review__apply"
          onClick={onApply}
        >
          <CheckAiIcon className="tiptap-ai-review__icon" />
          <span>{i18n.apply}</span>
        </button>
      </div>
    </FloatingElement>
  )
}
