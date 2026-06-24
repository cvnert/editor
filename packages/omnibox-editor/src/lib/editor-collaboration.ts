import type {
  OmniboxEditorCollaborationConfig,
  OmniboxEditorCollaborationUser,
} from "@/types"

export type CollaborationUser = OmniboxEditorCollaborationUser

const DEFAULT_COLLABORATION_USER: CollaborationUser = {
  color: "#958df1",
  name: "Anonymous",
}

export function isCollaborationEnabled(
  collaboration?: OmniboxEditorCollaborationConfig
) {
  return Boolean(
    collaboration &&
      typeof collaboration === "object" &&
      "document" in collaboration &&
      collaboration.document
  )
}

export function shouldSyncExternalContent(
  collaboration?: OmniboxEditorCollaborationConfig
) {
  return !isCollaborationEnabled(collaboration)
}

export function getStarterKitUndoRedo(
  collaboration?: OmniboxEditorCollaborationConfig
) {
  return isCollaborationEnabled(collaboration) ? false : undefined
}

export function getCollaborationUser(
  collaboration: OmniboxEditorCollaborationConfig,
  fallbackUser?: OmniboxEditorCollaborationUser
): CollaborationUser {
  if (!collaboration || typeof collaboration !== "object") {
    return fallbackUser ?? DEFAULT_COLLABORATION_USER
  }

  return collaboration.user ?? fallbackUser ?? DEFAULT_COLLABORATION_USER
}
