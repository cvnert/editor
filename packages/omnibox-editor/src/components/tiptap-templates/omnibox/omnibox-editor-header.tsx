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
    <header className="omnibox-editor-header">
      <Spacer />
      <div className="omnibox-editor-header__actions">
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
