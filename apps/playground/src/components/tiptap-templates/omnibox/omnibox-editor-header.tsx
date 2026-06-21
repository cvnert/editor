"use client"

import { ThemeToggle } from "@/components/tiptap-templates/omnibox/omnibox-editor-theme-toggle"

// --- Tiptap UI ---
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- UI Primitives ---
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button-group"

export function OmniboxEditorHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-12 w-full items-center border-b border-[var(--tt-border-color)] bg-[var(--tt-bg-color)] px-3 py-2">
      <Spacer />
      <div className="flex flex-row items-center gap-2">
        <ButtonGroup>
          <ButtonGroup>
            <UndoRedoButton action="undo" />
          </ButtonGroup>
          <ButtonGroup>
            <UndoRedoButton action="redo" />
          </ButtonGroup>
        </ButtonGroup>

        <Separator />

        <ThemeToggle />
      </div>
    </header>
  )
}
