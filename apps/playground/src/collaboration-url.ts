export type CollaborationLocation = Pick<Location, "hostname" | "protocol">

const COLLAB_PORT = 1234

export function getCollaborationServerUrl(
  location: CollaborationLocation = window.location
) {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${location.hostname}:${COLLAB_PORT}`
}
