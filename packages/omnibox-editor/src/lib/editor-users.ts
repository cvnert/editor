import { getAvatar } from "@/lib/tiptap-collab-utils"
import type {
  OmniboxEditorCollaborationUser,
  OmniboxEditorMentionUser,
} from "@/types"

export type EditorUser = {
  id: string
  name: string
  color: string
  avatar: string
  position?: string
}

type StorageLike = Pick<Storage, "getItem" | "setItem">

const USERNAME_STORAGE_KEY = "_tiptap_username"
const USER_COLOR_STORAGE_KEY = "_tiptap_color"
const USER_ID_STORAGE_KEY = "_tiptap_user_id"

export const FIRST_NAMES = [
  "John",
  "Jane",
  "Alice",
  "Bob",
  "Eve",
  "Charlie",
  "David",
  "Frank",
  "Grace",
  "Helen",
  "Rob Lowe",
  "Rob",
]

export const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Lowe",
]

export const USER_COLORS = [
  "#fb7185",
  "#fdba74",
  "#d9f99d",
  "#a7f3d0",
  "#a5f3fc",
  "#a5b4fc",
  "#f0abfc",
  "#fda58d",
  "#f2cc8f",
  "#9ae6b4",
]

const uuid = (): string => {
  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
  return template.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const getRandomArrayItem = (array: string[]) => {
  if (array.length === 0) {
    throw new Error("Cannot get random item from empty array")
  }
  return array[Math.floor(Math.random() * array.length)]!
}

const generateRandomUsername = (): string => {
  const names = [getRandomArrayItem(FIRST_NAMES)]

  if (Math.random() > 0.85) {
    names.push(getRandomArrayItem(FIRST_NAMES))
  }
  names.push(getRandomArrayItem(LAST_NAMES))

  return names.join(" ")
}

const generateRandomColor = (): string => {
  return getRandomArrayItem(USER_COLORS) ?? "#9ae6b4"
}

const getBrowserStorage = (): StorageLike | null => {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage
}

export function getOrCreateEditorUser(
  storage: StorageLike | null = getBrowserStorage()
): EditorUser {
  const name = storage?.getItem(USERNAME_STORAGE_KEY) || generateRandomUsername()
  const color = storage?.getItem(USER_COLOR_STORAGE_KEY) || generateRandomColor()
  const id = storage?.getItem(USER_ID_STORAGE_KEY) || uuid()
  const user = {
    id,
    name,
    color,
    avatar: getAvatar(name),
  }

  storage?.setItem(USERNAME_STORAGE_KEY, user.name)
  storage?.setItem(USER_COLOR_STORAGE_KEY, user.color)
  storage?.setItem(USER_ID_STORAGE_KEY, user.id)

  return user
}

export function toEditorUser(
  user?: OmniboxEditorCollaborationUser | OmniboxEditorMentionUser | null
): EditorUser | null {
  if (!user?.name) {
    return null
  }

  const id = "id" in user && user.id ? user.id : user.name

  return {
    id,
    name: user.name,
    color: user.color || "#958df1",
    avatar: user.avatar || getAvatar(user.name),
    position: "position" in user ? user.position : undefined,
  }
}

export function toEditorUsers(
  users?: Array<
    OmniboxEditorCollaborationUser | OmniboxEditorMentionUser | null | undefined
  >
) {
  return users?.map(toEditorUser).filter((user): user is EditorUser => !!user) ?? []
}

type AwarenessUser = {
  clientId?: number
  id?: unknown
  name?: unknown
  color?: unknown
  avatar?: unknown
  position?: unknown
}

export function awarenessUserToEditorUser(user: AwarenessUser): EditorUser | null {
  if (typeof user.name !== "string" || !user.name) {
    return null
  }

  const id =
    typeof user.id === "string" && user.id
      ? user.id
      : user.clientId != null
        ? String(user.clientId)
        : user.name

  return {
    id,
    name: user.name,
    color: typeof user.color === "string" && user.color ? user.color : "#958df1",
    avatar:
      typeof user.avatar === "string" && user.avatar
        ? user.avatar
        : getAvatar(user.name),
    position:
      typeof user.position === "string" && user.position
        ? user.position
        : undefined,
  }
}

function getUserKey(user: EditorUser) {
  return user.id || user.name
}

export function dedupeEditorUsers(users: EditorUser[]) {
  const seen = new Set<string>()
  const uniqueUsers: EditorUser[] = []

  users.forEach((user) => {
    const key = getUserKey(user)
    if (seen.has(key)) {
      return
    }

    seen.add(key)
    uniqueUsers.push(user)
  })

  return uniqueUsers
}

export function getMentionUsers(
  query: string,
  users: EditorUser[],
  limit = 20
) {
  const normalizedQuery = query.trim().toLowerCase()
  const uniqueUsers = dedupeEditorUsers(users)

  if (!normalizedQuery) {
    return uniqueUsers.slice(0, limit)
  }

  return uniqueUsers
    .filter((user) => {
      return (
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.position?.toLowerCase().includes(normalizedQuery)
      )
    })
    .slice(0, limit)
}
