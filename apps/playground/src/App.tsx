import type { Content } from "@tiptap/core"
import { lazy, Suspense } from "react"
import {
  type CvnertEditorUpdatePayload,
  type UploadFunction,
} from "cvnert-editor"

const CvnertEditor = lazy(() =>
  import("cvnert-editor").then((module) => ({
    default: module.CvnertEditor,
  }))
)

const initialContent: Content = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Local editor package" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This playground consumes cvnert-editor like an app would.",
        },
      ],
    },
  ],
}

const handleEditorUpdate = ({ json }: CvnertEditorUpdatePayload) => {
  console.info("Editor updated", json)
}

const uploadImage: UploadFunction = async (file, onProgress) => {
  onProgress?.({ progress: 100 })
  return URL.createObjectURL(file)
}

export function App() {
  return (
    <Suspense fallback={<div className="editor-loading">Loading editor...</div>}>
      <CvnertEditor
        content={initialContent}
        placeholder="Start writing..."
        onUpdate={handleEditorUpdate}
        imageUpload={uploadImage}
      />
    </Suspense>
  )
}
