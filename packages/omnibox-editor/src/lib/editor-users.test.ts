import { describe, expect, it } from "vitest"

import {
  awarenessUserToEditorUser,
  dedupeEditorUsers,
  getMentionUsers,
  getOrCreateEditorUser,
} from "@/lib/editor-users"

function createStorage(values: Record<string, string> = {}) {
  const store = new Map(Object.entries(values))

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

describe("editor users", () => {
  it("reuses the locally stored editor user", () => {
    const storage = createStorage({
      _tiptap_username: "Alice Smith",
      _tiptap_color: "#ffcc00",
      _tiptap_user_id: "alice",
    })

    expect(getOrCreateEditorUser(storage)).toMatchObject({
      color: "#ffcc00",
      id: "alice",
      name: "Alice Smith",
    })
  })

  it("normalizes awareness users into mentionable users", () => {
    expect(
      awarenessUserToEditorUser({
        clientId: 12,
        color: "#958df1",
        id: "alice",
        name: "Alice Smith",
      })
    ).toMatchObject({
      color: "#958df1",
      id: "alice",
      name: "Alice Smith",
    })

    expect(awarenessUserToEditorUser({ clientId: 12 })).toBeNull()
  })

  it("dedupes and filters mention users", () => {
    const users = dedupeEditorUsers([
      {
        avatar: "/avatars/memoji_01.png",
        color: "#ffcc00",
        id: "alice",
        name: "Alice Smith",
      },
      {
        avatar: "/avatars/memoji_02.png",
        color: "#958df1",
        id: "alice",
        name: "Alice Smith",
      },
      {
        avatar: "/avatars/memoji_03.png",
        color: "#9ae6b4",
        id: "bob",
        name: "Bob Jones",
      },
    ])

    expect(users).toHaveLength(2)
    expect(getMentionUsers("bo", users)).toEqual([users[1]])
  })
})
