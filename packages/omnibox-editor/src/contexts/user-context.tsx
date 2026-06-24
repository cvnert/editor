import {
  dedupeEditorUsers,
  getOrCreateEditorUser,
  toEditorUser,
  toEditorUsers,
  type EditorUser,
} from "@/lib/editor-users"
import type {
  OmniboxEditorCollaborationUser,
  OmniboxEditorMentionUser,
} from "@/types"
import { createContext, useCallback, useContext, useMemo, useState } from "react"

export type User = EditorUser

export type UserContextValue = {
  user: User
  mentionUsers: User[]
  onlineUsers: User[]
  setOnlineUsers: (users: User[]) => void
}

export const UserContext = createContext<UserContextValue>({
  user: { color: "", id: "", name: "", avatar: "" },
  mentionUsers: [],
  onlineUsers: [],
  setOnlineUsers: () => {},
})

function areSameUsers(previousUsers: User[], nextUsers: User[]) {
  if (previousUsers.length !== nextUsers.length) {
    return false
  }

  return previousUsers.every((previousUser, index) => {
    const nextUser = nextUsers[index]

    return (
      nextUser &&
      previousUser.id === nextUser.id &&
      previousUser.name === nextUser.name &&
      previousUser.color === nextUser.color &&
      previousUser.avatar === nextUser.avatar &&
      previousUser.position === nextUser.position
    )
  })
}

export function UserProvider({
  children,
  mentionUsers,
  user: providedUser,
}: {
  children: React.ReactNode
  mentionUsers?: OmniboxEditorMentionUser[]
  user?: OmniboxEditorCollaborationUser
}) {
  const [generatedUser] = useState<User>(() => getOrCreateEditorUser())
  const [onlineUsers, setOnlineUsersState] = useState<User[]>([])
  const user = useMemo(
    () => toEditorUser(providedUser) ?? generatedUser,
    [generatedUser, providedUser]
  )
  const configuredMentionUsers = useMemo(
    () => toEditorUsers(mentionUsers),
    [mentionUsers]
  )
  const setOnlineUsers = useCallback((users: User[]) => {
    const uniqueUsers = dedupeEditorUsers(users)

    setOnlineUsersState((previousUsers) => {
      if (areSameUsers(previousUsers, uniqueUsers)) {
        return previousUsers
      }

      return uniqueUsers
    })
  }, [])
  const value = useMemo(
    () => ({
      user,
      onlineUsers,
      setOnlineUsers,
      mentionUsers: dedupeEditorUsers([
        user,
        ...onlineUsers,
        ...configuredMentionUsers,
      ]),
    }),
    [configuredMentionUsers, onlineUsers, setOnlineUsers, user]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
