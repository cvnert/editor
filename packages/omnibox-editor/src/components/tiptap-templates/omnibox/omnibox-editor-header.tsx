"use client"

import { ThemeToggle } from "@/components/tiptap-templates/omnibox/omnibox-editor-theme-toggle"
import { useUser } from "@/contexts/user-context"

// --- Tiptap UI ---
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- UI Primitives ---
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button-group"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/tiptap-ui-primitive/avatar"

function getUserInitial(name: string) {
  return name[0]?.toUpperCase() ?? ""
}

function EditorUsersBadge() {
  const { mentionUsers, user } = useUser()
  const users = mentionUsers.length ? mentionUsers : [user]
  const onlineCount = users.length

  if (!user.name) {
    return null
  }

  return (
    <div
      className="omnibox-editor-users"
      title={users.map((user) => user.name).join(", ")}
    >
      <AvatarGroup maxVisible={4} className="omnibox-editor-users__avatars">
        {users.map((user) => (
          <Avatar
            key={user.id}
            size="sm"
            userColor={user.color}
            title={user.name}
          >
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getUserInitial(user.name)}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      <span className="omnibox-editor-user__name">{user.name}</span>
      {onlineCount > 1 ? (
        <span className="omnibox-editor-users__count">{onlineCount}</span>
      ) : null}
    </div>
  )
}

export function OmniboxEditorHeader() {
  return (
    <header className="omnibox-editor-header">
      <Spacer />
      <div className="omnibox-editor-header__actions">
        <EditorUsersBadge />

        <Separator />

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
