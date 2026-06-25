export type ImageRenderState = "loading" | "loaded" | "error"

export type ImageRenderEvent = "load" | "error" | "reset"

export interface ImageRenderSnapshot {
  src: string
  state: ImageRenderState
}

export function getNextImageRenderState(
  _currentState: ImageRenderState,
  event: ImageRenderEvent
): ImageRenderState {
  if (event === "load") {
    return "loaded"
  }

  if (event === "error") {
    return "loading"
  }

  return "loading"
}

export function getImageRenderStateForSrc(
  snapshot: ImageRenderSnapshot,
  src: string
): ImageRenderState {
  return snapshot.src === src ? snapshot.state : "loading"
}

export function getNextImageRenderSnapshot(
  snapshot: ImageRenderSnapshot,
  src: string,
  event: ImageRenderEvent
): ImageRenderSnapshot {
  return {
    src,
    state: getNextImageRenderState(
      getImageRenderStateForSrc(snapshot, src),
      event
    ),
  }
}
