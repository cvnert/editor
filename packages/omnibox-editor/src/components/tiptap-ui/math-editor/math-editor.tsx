"use client"

import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"

import { CheckIcon } from "@/components/tiptap-icons/check-icon"
import { XIcon } from "@/components/tiptap-icons/x-icon"
import { Input } from "@/components/tiptap-ui-primitive/input"
import { FloatingElement } from "@/components/tiptap-ui-utils/floating-element"
import {
  type MathNodeEditTarget,
  updateMathNodeLatex,
} from "@/lib/math-editor"
import { useEditorI18n } from "@/lib/i18n"

import "@/components/tiptap-ui/math-editor/math-editor.css"

type MathEditorProps = {
  editor: Editor
  target: MathNodeEditTarget | null
  onOpenChange: (open: boolean) => void
}

export function MathEditor({ editor, target, onOpenChange }: MathEditorProps) {
  const i18n = useEditorI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [latex, setLatex] = useState("")

  useEffect(() => {
    if (!target) {
      setLatex("")
      return
    }

    setLatex(target.latex)
    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [target])

  const latexValue = latex.trim()
  const handleClose = () => onOpenChange(false)
  const handleSubmit = () => {
    if (!target || !latexValue) {
      return
    }

    updateMathNodeLatex(editor, target, latexValue)
    handleClose()
  }

  return (
    <FloatingElement
      editor={editor}
      shouldShow={Boolean(target)}
      onOpenChange={onOpenChange}
      closeOnEscape={true}
      resetTextSelectionOnClose={false}
      zIndex={1002}
      floatingOptions={{
        placement: "bottom",
      }}
      className="tiptap-math-editor"
      role="dialog"
      aria-label={i18n.editFormula}
    >
      <div className="tiptap-math-editor__body">
        <Input
          ref={inputRef}
          className="tiptap-math-editor__input"
          value={latex}
          placeholder="LaTeX"
          onChange={(event) => setLatex(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              handleClose()
            }

            if (event.key === "Enter") {
              event.preventDefault()
              handleSubmit()
            }
          }}
        />
        <div className="tiptap-math-editor__actions">
          <button
            type="button"
            className="tiptap-math-editor__button"
            aria-label={i18n.closeFormulaEditor}
            onClick={handleClose}
          >
            <XIcon className="tiptap-math-editor__icon" />
          </button>
          <button
            type="button"
            className="tiptap-math-editor__button"
            aria-label={i18n.applyFormula}
            disabled={!latexValue}
            onClick={handleSubmit}
          >
            <CheckIcon className="tiptap-math-editor__icon" />
          </button>
        </div>
      </div>
    </FloatingElement>
  )
}
