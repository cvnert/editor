import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

import type { AiGenerationStatus } from "@/components/tiptap-ui/ai-composer/ai-generation-state"
import type { OmniboxEditorI18n } from "@/lib/i18n"

type AiGenerationWidgetState = {
  pos: number | null
  status: AiGenerationStatus
}

type AiGenerationWidgetMeta =
  | { type: "set"; pos: number; status: Exclude<AiGenerationStatus, "idle"> }
  | { type: "clear" }

type AiGenerationWidgetActions = {
  labels?: Pick<
    OmniboxEditorI18n,
    | "aiIsWriting"
    | "aiReviewPrompt"
    | "apply"
    | "discard"
    | "submitAiPrompt"
    | "stopAiGeneration"
    | "tryAgain"
  >
  onApply?: () => void
  onDiscard?: () => void
  onRetry?: () => void
  onStop?: () => void
  onSubmitInstruction?: (instruction: string) => void
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiGenerationWidget: {
      clearAiGenerationWidget: () => ReturnType
      setAiGenerationWidget: (payload: {
        pos: number
        status: Exclude<AiGenerationStatus, "idle">
      }) => ReturnType
    }
  }

  interface Storage {
    aiGenerationWidget: AiGenerationWidgetActions
  }
}

export const aiGenerationWidgetPluginKey =
  new PluginKey<AiGenerationWidgetState>("aiGenerationWidget")

export function getMappedAiGenerationWidgetState(
  previousState: AiGenerationWidgetState,
  meta: AiGenerationWidgetMeta | undefined,
  mapPosition: (pos: number) => number
): AiGenerationWidgetState {
  if (meta?.type === "clear") {
    return { pos: null, status: "idle" }
  }

  if (meta?.type === "set") {
    return { pos: meta.pos, status: meta.status }
  }

  if (previousState.pos === null) {
    return previousState
  }

  return {
    ...previousState,
    pos: mapPosition(previousState.pos),
  }
}

export const AiGenerationWidget = Extension.create<AiGenerationWidgetActions>({
  name: "aiGenerationWidget",

  addStorage() {
    return {
      labels: undefined,
      onApply: undefined,
      onDiscard: undefined,
      onRetry: undefined,
      onStop: undefined,
      onSubmitInstruction: undefined,
    } satisfies AiGenerationWidgetActions
  },

  addCommands() {
    return {
      clearAiGenerationWidget:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(aiGenerationWidgetPluginKey, { type: "clear" })
          }

          return true
        },
      setAiGenerationWidget:
        (payload) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(aiGenerationWidgetPluginKey, {
              type: "set",
              ...payload,
            })
          }

          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const editor = this.editor

    return [
      new Plugin<AiGenerationWidgetState>({
        key: aiGenerationWidgetPluginKey,
        state: {
          init() {
            return { pos: null, status: "idle" }
          },
          apply(tr, value) {
            const meta = tr.getMeta(
              aiGenerationWidgetPluginKey
            ) as AiGenerationWidgetMeta | undefined

            return getMappedAiGenerationWidgetState(value, meta, (pos) =>
              tr.mapping.map(pos)
            )
          },
        },
        props: {
          decorations(state) {
            const widgetState = aiGenerationWidgetPluginKey.getState(state)
            if (!widgetState || widgetState.pos === null) {
              return DecorationSet.empty
            }

            const pos = Math.min(widgetState.pos, state.doc.content.size)

            return DecorationSet.create(state.doc, [
              Decoration.widget(
                pos,
                () =>
                  createAiGenerationWidget(
                    editor.storage.aiGenerationWidget,
                    widgetState.status
                  ),
                {
                  key: `ai-generation-widget-${widgetState.status}`,
                  side: 1,
                }
              ),
            ])
          },
        },
      }),
    ]
  },
})

function createAiGenerationWidget(
  actions: AiGenerationWidgetActions,
  status: AiGenerationStatus
) {
  if (status === "writing") {
    return createWritingWidget(actions)
  }

  return createReviewWidget(actions)
}

function createWritingWidget(actions: AiGenerationWidgetActions) {
  const root = document.createElement("span")
  const labels = actions.labels
  root.className = "tiptap-ai-widget tiptap-ai-writing-indicator"
  root.contentEditable = "false"
  root.setAttribute("role", "status")
  root.setAttribute("aria-live", "polite")

  const content = document.createElement("span")
  content.className = "tiptap-ai-writing-indicator__content"

  const label = document.createElement("span")
  label.className = "tiptap-ai-writing-indicator__label"
  label.textContent = labels?.aiIsWriting ?? "AI is writing"

  const dots = document.createElement("span")
  dots.className = "tiptap-ai-writing-indicator__dots"
  dots.setAttribute("aria-hidden", "true")
  dots.append(document.createElement("span"))
  dots.append(document.createElement("span"))
  dots.append(document.createElement("span"))

  content.append(label, dots)

  const stopButton = document.createElement("button")
  stopButton.type = "button"
  stopButton.className = "tiptap-ai-writing-indicator__stop"
  stopButton.setAttribute(
    "aria-label",
    labels?.stopAiGeneration ?? "Stop AI generation"
  )
  stopButton.textContent = "■"
  stopButton.addEventListener("click", (event) => {
    event.preventDefault()
    actions.onStop?.()
  })

  root.append(content, stopButton)

  return root
}

function createReviewWidget(actions: AiGenerationWidgetActions) {
  const root = document.createElement("span")
  const labels = actions.labels
  root.className = "tiptap-ai-widget tiptap-ai-review"
  root.contentEditable = "false"
  root.setAttribute("role", "dialog")
  root.setAttribute("aria-label", "AI")

  const promptRow = document.createElement("span")
  promptRow.className = "tiptap-ai-review__prompt-row"

  const textarea = document.createElement("textarea")
  textarea.className = "tiptap-ai-review__textarea"
  textarea.rows = 1
  textarea.placeholder =
    labels?.aiReviewPrompt ?? "Tell AI what else needs to be changed..."

  const submitButton = document.createElement("button")
  submitButton.type = "button"
  submitButton.className = "tiptap-ai-review__submit"
  submitButton.setAttribute(
    "aria-label",
    labels?.submitAiPrompt ?? "Submit AI prompt"
  )
  submitButton.textContent = "↑"

  promptRow.append(textarea, submitButton)

  const actionsRow = document.createElement("span")
  actionsRow.className = "tiptap-ai-review__actions"

  const retryButton = createActionButton(
    "retry",
    `↻ ${labels?.tryAgain ?? "Try again"}`
  )
  const spacer = document.createElement("span")
  spacer.className = "tiptap-ai-review__spacer"
  const discardButton = createActionButton(
    "discard",
    `× ${labels?.discard ?? "Discard"}`
  )
  const applyButton = document.createElement("button")
  applyButton.type = "button"
  applyButton.className = "tiptap-ai-review__apply"
  applyButton.dataset.action = "apply"
  applyButton.textContent = `✓ ${labels?.apply ?? "Apply"}`

  actionsRow.append(retryButton, spacer, discardButton, applyButton)
  root.append(promptRow, actionsRow)

  const submitInstruction = () => {
    const instruction = textarea?.value.trim()
    if (!instruction) return

    actions.onSubmitInstruction?.(instruction)
    if (textarea) textarea.value = ""
  }

  textarea?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return

    event.preventDefault()
    submitInstruction()
  })
  submitButton.addEventListener("click", (event) => {
    event.preventDefault()
    submitInstruction()
  })

  retryButton.addEventListener("click", (event) => {
    event.preventDefault()
    actions.onRetry?.()
  })
  discardButton.addEventListener("click", (event) => {
    event.preventDefault()
    actions.onDiscard?.()
  })
  applyButton.addEventListener("click", (event) => {
    event.preventDefault()
    actions.onApply?.()
  })

  return root
}

function createActionButton(action: string, label: string) {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "tiptap-ai-review__action"
  button.dataset.action = action
  button.textContent = label

  return button
}
