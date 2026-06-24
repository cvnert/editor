import { describe, expect, it } from "vitest"
import { Doc } from "yjs"

import {
  getCollaborationUser,
  getStarterKitUndoRedo,
  isCollaborationEnabled,
  shouldSyncExternalContent,
} from "@/lib/editor-collaboration"

describe("editor collaboration options", () => {
  it("keeps collaboration disabled when no collaboration config is passed", () => {
    expect(isCollaborationEnabled(undefined)).toBe(false)
    expect(isCollaborationEnabled(false)).toBe(false)
    expect(shouldSyncExternalContent(undefined)).toBe(true)
    expect(getStarterKitUndoRedo(undefined)).toBeUndefined()
  })

  it("enables collaboration only when a document is passed", () => {
    const collaboration = { document: new Doc() }

    expect(isCollaborationEnabled(collaboration)).toBe(true)
    expect(shouldSyncExternalContent(collaboration)).toBe(false)
    expect(getStarterKitUndoRedo(collaboration)).toBe(false)
  })

  it("uses a stable fallback collaboration user for remote carets", () => {
    expect(getCollaborationUser({ document: new Doc() })).toEqual({
      color: "#958df1",
      name: "Anonymous",
    })

    expect(
      getCollaborationUser(
        {
          document: new Doc(),
        },
        { color: "#ffcc00", id: "alice", name: "Alice" }
      )
    ).toEqual({ color: "#ffcc00", id: "alice", name: "Alice" })

    expect(
      getCollaborationUser({
        document: new Doc(),
        user: { color: "#ffcc00", name: "Alice" },
      })
    ).toEqual({ color: "#ffcc00", name: "Alice" })
  })
})
