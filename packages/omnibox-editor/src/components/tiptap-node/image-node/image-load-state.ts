export type ImageRenderState = "loading" | "loaded"

export type ImageRenderEvent = "load" | "error" | "reset"

export function getNextImageRenderState(
  _currentState: ImageRenderState,
  event: ImageRenderEvent
): ImageRenderState {
  if (event === "load") {
    return "loaded"
  }

  return "loading"
}
