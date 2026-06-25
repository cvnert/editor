export type MathNodeEditTarget = {
  type: "blockMath" | "inlineMath"
  pos: number
  latex: string
}

type MathEditorCommands = {
  commands: {
    updateBlockMath: (options: { latex: string; pos: number }) => boolean
    updateInlineMath: (options: { latex: string; pos: number }) => boolean
  }
}

export function updateMathNodeLatex(
  editor: MathEditorCommands,
  target: MathNodeEditTarget,
  latex: string
) {
  if (target.type === "blockMath") {
    return editor.commands.updateBlockMath({ latex, pos: target.pos })
  }

  return editor.commands.updateInlineMath({ latex, pos: target.pos })
}
