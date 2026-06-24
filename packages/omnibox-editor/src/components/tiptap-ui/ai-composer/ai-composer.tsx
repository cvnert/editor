"use client"

import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"

import { FloatingElement } from "@/components/tiptap-ui-utils/floating-element"
import { ArrowUpIcon } from "@/components/tiptap-icons/arrow-up-icon"
import { MicAiIcon } from "@/components/tiptap-icons/mic-ai-icon"
import { XIcon } from "@/components/tiptap-icons/x-icon"
import { useEditorI18n } from "@/lib/i18n"
import type { SlashMenuAiAction } from "@/components/tiptap-ui/slash-dropdown-menu"

import "@/components/tiptap-ui/ai-composer/ai-composer.css"

type AiComposerProps = {
  action: SlashMenuAiAction | null
  editor: Editor
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (payload: AiComposerSubmitPayload) => void | Promise<void>
  signal?: AbortSignal
}

export type AiComposerSubmitPayload = {
  action: SlashMenuAiAction
  editor: Editor
  prompt: string
  signal?: AbortSignal
  onChunk?: (chunk: string) => void
}

export function getAiComposerPromptValue(prompt: string) {
  return prompt.trim()
}

export function AiComposer({
  action,
  editor,
  open,
  onOpenChange,
  onSubmit,
  signal,
}: AiComposerProps) {
  const i18n = useEditorI18n()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [prompt, setPrompt] = useState("")

  useEffect(() => {
    if (!open) {
      setPrompt("")
      return
    }

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })
  }, [open])

  const placeholder =
    action === "continue_writing"
      ? i18n.continueWritingPrompt
      : i18n.askAiPrompt
  const promptValue = getAiComposerPromptValue(prompt)

  const handleSubmit = async () => {
    if (!action || !promptValue) {
      return
    }

    if (onSubmit) {
      await onSubmit({ action, editor, prompt: promptValue, signal })
    }

    onOpenChange(false)
  }

  return (
    <FloatingElement
      editor={editor}
      shouldShow={open}
      onOpenChange={onOpenChange}
      closeOnEscape={true}
      resetTextSelectionOnClose={false}
      zIndex={1001}
      floatingOptions={{
        placement: "bottom-start",
      }}
      className="tiptap-ai-composer"
      role="dialog"
      aria-label={i18n.ai}
    >
      <div className="tiptap-ai-composer__body">
        <textarea
          ref={textareaRef}
          className="tiptap-ai-composer__textarea"
          placeholder={placeholder}
          value={prompt}
          rows={1}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              onOpenChange(false)
            }

            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              void handleSubmit()
            }
          }}
        />

        <div className="tiptap-ai-composer__footer">
          <button
            type="button"
            className="tiptap-ai-composer__tone"
            aria-label={i18n.aiTone}
          >
            <MicAiIcon className="tiptap-ai-composer__icon" />
            <span>{i18n.aiTone}</span>
          </button>

          <div className="tiptap-ai-composer__actions">
            <button
              type="button"
              className="tiptap-ai-composer__icon-button"
              aria-label={i18n.close}
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="tiptap-ai-composer__icon" />
            </button>
            <button
              type="button"
              className="tiptap-ai-composer__submit"
              aria-label={i18n.submitAiPrompt}
              disabled={!promptValue}
              onClick={() => void handleSubmit()}
            >
              <ArrowUpIcon className="tiptap-ai-composer__icon" />
            </button>
          </div>
        </div>
      </div>
    </FloatingElement>
  )
}
