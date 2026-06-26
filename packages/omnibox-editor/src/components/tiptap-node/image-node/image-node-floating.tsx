import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { isNodeTypeSelected } from "@/lib/tiptap-utils"
import { useEditorI18n } from "@/lib/i18n"

// --- Tiptap UI ---
import { DeleteNodeButton } from "@/components/tiptap-ui/delete-node-button"
import { ImageDownloadButton } from "@/components/tiptap-ui/image-download-button"
import { ImageAlignButton } from "@/components/tiptap-ui/image-align-button"

// --- UI Primitive ---
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import { ImageCaptionButton } from "@/components/tiptap-ui/image-caption-button"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { RefreshCcwIcon } from "@/components/tiptap-icons/refresh-ccw-icon"

export function ImageNodeFloating({
  editor: providedEditor,
}: {
  editor?: Editor | null
}) {
  const { editor } = useTiptapEditor(providedEditor)
  const i18n = useEditorI18n()
  const visible = isNodeTypeSelected(editor, ["image"])

  if (!editor || !visible) {
    return null
  }

  return (
    <>
      <ImageAlignButton align="left" />
      <ImageAlignButton align="center" />
      <ImageAlignButton align="right" />
      <Separator />
      <ImageCaptionButton />
      <Separator />
      <ImageDownloadButton />
      <ImageUploadButton icon={RefreshCcwIcon} tooltip={i18n.replaceImage} />
      <Separator />
      <DeleteNodeButton />
    </>
  )
}
