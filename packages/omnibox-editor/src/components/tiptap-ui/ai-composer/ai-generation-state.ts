export type AiGenerationStatus = "idle" | "writing" | "reviewing"

export function shouldAbortAiGeneration({
  isWriting,
  nextOpen,
}: {
  isWriting: boolean
  nextOpen: boolean
}) {
  return isWriting && !nextOpen
}

export function shouldShowAiReview(status: AiGenerationStatus, hasText: boolean) {
  return status === "reviewing" && hasText
}
