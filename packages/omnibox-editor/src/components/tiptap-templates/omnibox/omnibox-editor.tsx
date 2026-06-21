import { type CSSProperties, useContext, useEffect } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import { createPortal } from "react-dom"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Mention } from "@tiptap/extension-mention"
import { TaskList, TaskItem } from "@tiptap/extension-list"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { Placeholder, Selection } from "@tiptap/extensions"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Superscript } from "@tiptap/extension-superscript"
import { Subscript } from "@tiptap/extension-subscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Mathematics } from "@tiptap/extension-mathematics"
import { UniqueID } from "@tiptap/extension-unique-id"
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji"
import {
  getHierarchicalIndexes,
  TableOfContents,
} from "@tiptap/extension-table-of-contents"

// --- Hooks ---
import { useUiEditorState } from "@/hooks/use-ui-editor-state"
import { useScrollToHash } from "@/components/tiptap-ui/copy-anchor-link-button/use-scroll-to-hash"

// --- Custom Extensions ---
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { UiState } from "@/components/tiptap-extension/ui-state-extension"
import { Image } from "@/components/tiptap-node/image-node/image-node-extension"
import { NodeBackground } from "@/components/tiptap-extension/node-background-extension"
import { NodeAlignment } from "@/components/tiptap-extension/node-alignment-extension"
import { TocNode } from "@/components/tiptap-node/toc-node/extensions/toc-node-extension"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"

// --- Table Node ---
import { TableKit } from "@/components/tiptap-node/table-node/extensions/table-node-extension"
import { TableHandleExtension } from "@/components/tiptap-node/table-node/extensions/table-handle"
import { TableHandle } from "@/components/tiptap-node/table-node/ui/table-handle/table-handle"
import { TableSelectionOverlay } from "@/components/tiptap-node/table-node/ui/table-selection-overlay"
import { TableCellHandleMenu } from "@/components/tiptap-node/table-node/ui/table-cell-handle-menu"
import { TableExtendRowColumnButtons } from "@/components/tiptap-node/table-node/ui/table-extend-row-column-button"
import "@/components/tiptap-node/table-node/styles/prosemirror-table.css"
import "@/components/tiptap-node/table-node/styles/table-node.css"

import "@/components/tiptap-node/blockquote-node/blockquote-node.css"
import "@/components/tiptap-node/code-block-node/code-block-node.css"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.css"
import "@/components/tiptap-node/list-node/list-node.css"
import "@/components/tiptap-node/image-node/image-node.css"
import "@/components/tiptap-node/heading-node/heading-node.css"
import "@/components/tiptap-node/paragraph-node/paragraph-node.css"

// --- Tiptap UI ---
import { EmojiDropdownMenu } from "@/components/tiptap-ui/emoji-dropdown-menu"
import { MentionDropdownMenu } from "@/components/tiptap-ui/mention-dropdown-menu"
import { SlashDropdownMenu } from "@/components/tiptap-ui/slash-dropdown-menu"
import { DragContextMenu } from "@/components/tiptap-ui/drag-context-menu"

// --- Contexts ---

// --- Lib ---
import { cn, handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---

// --- Content ---
import { OmniboxEditorHeader } from "@/components/tiptap-templates/omnibox/omnibox-editor-header"
import { MobileToolbar } from "@/components/tiptap-templates/omnibox/omnibox-editor-mobile-toolbar"
import { OmniboxToolbarFloating } from "@/components/tiptap-templates/omnibox/omnibox-editor-toolbar-floating"
import { TocSidebar } from "@/components/tiptap-node/toc-node"
import {
  TocProvider,
  useToc,
} from "@/components/tiptap-node/toc-node/context/toc-context"
import { ListNormalizationExtension } from "@/components/tiptap-extension/list-normalization-extension"
import { Indent } from "@/components/tiptap-extension/indent-extension"
import { TripleClickBlockSelection } from "@/components/tiptap-extension/triple-click-block-selection-extension"
import defaultContent from "@/components/tiptap-templates/omnibox/data/content.json"
import type { EditorProviderProps, OmniboxEditorProps } from "@/types"

/**
 * Loading spinner component shown while creating the editor instance
 */
export function LoadingSpinner({ text = "Connecting..." }: { text?: string }) {
  return (
    <div className="omnibox-editor-loading">
      <div className="omnibox-editor-loading__content">
        <svg
          className="omnibox-editor-loading__spinner"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="omnibox-editor-loading__spinner-track"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="omnibox-editor-loading__spinner-path"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <div className="omnibox-editor-loading__text">{text}</div>
      </div>
    </div>
  )
}

/**
 * EditorContent component that renders the actual editor
 */
export function EditorContentArea() {
  const { editor } = useContext(EditorContext)!
  const { isDragging } = useUiEditorState(editor)

  useScrollToHash()

  useEffect(() => {
    if (!editor) return

    const stopBlockDragPropagation = (event: DragEvent) => {
      if (editor.storage.uiState?.isDragging) {
        event.stopPropagation()
      }
    }

    document.addEventListener("dragenter", stopBlockDragPropagation)
    document.addEventListener("dragover", stopBlockDragPropagation)
    document.addEventListener("dragleave", stopBlockDragPropagation)
    document.addEventListener("drop", stopBlockDragPropagation)

    return () => {
      document.removeEventListener("dragenter", stopBlockDragPropagation)
      document.removeEventListener("dragover", stopBlockDragPropagation)
      document.removeEventListener("dragleave", stopBlockDragPropagation)
      document.removeEventListener("drop", stopBlockDragPropagation)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <EditorContent
      editor={editor}
      role="presentation"
      className="omnibox-editor-content"
      style={{
        cursor: isDragging ? "grabbing" : "auto",
      }}
    >
      <DragContextMenu />
      <EmojiDropdownMenu />
      <MentionDropdownMenu />
      <SlashDropdownMenu />
      <OmniboxToolbarFloating />
      {createPortal(<MobileToolbar />, document.body)}
    </EditorContent>
  )
}

function getVisibility(defaultValue: boolean, override?: boolean) {
  return override ?? defaultValue
}

function getContentWidthValue(contentWidth?: number | string) {
  if (typeof contentWidth === "number") return `${contentWidth}px`
  return contentWidth
}

/**
 * Component that creates and provides the editor instance
 */
export function EditorProvider(props: EditorProviderProps) {
  const {
    editable = true,
    placeholder = "Start writing...",
    content = defaultContent,
    onUpdate,
    imageUpload = handleImageUpload,
    imageUploadMaxSize = MAX_FILE_SIZE,
    imageUploadLimit = 3,
    onImageUploadError = (error) => console.error("Upload failed:", error),
    onImageUploadSuccess,
    contentWidth,
    variant = "page",
    showHeader,
    showToc,
  } = props

  const { setTocContent } = useToc()
  const isEmbedded = variant === "embedded"
  const shouldShowHeader = getVisibility(!isEmbedded, showHeader)
  const shouldShowToc = getVisibility(!isEmbedded, showToc)
  const contentWidthValue = getContentWidthValue(contentWidth)

  const editor = useEditor({
    immediatelyRender: false,
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate?.({
        editor,
        json: editor.getJSON(),
        html: editor.getHTML(),
      })
    },
    editorProps: {
      attributes: {
        class: "omnibox-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        dropcursor: {
          width: 2,
        },
        link: { openOnClick: false },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder,
        emptyNodeClass: "is-empty with-slash",
      }),
      Mention,
      Emoji.configure({
        emojis: gitHubEmojis.filter(
          (emoji) => !emoji.name.includes("regional")
        ),
        forceFallbackImages: true,
      }),
      TableKit.configure({
        table: {
          resizable: true,
          cellMinWidth: 120,
        },
      }),
      NodeBackground.configure({
        types: [
          "paragraph",
          "heading",
          "blockquote",
          "taskList",
          "bulletList",
          "orderedList",
          "tableCell",
          "tableHeader",
          "tocNode",
        ],
      }),
      NodeAlignment,
      TextStyle,
      Mathematics,
      Superscript,
      Subscript,
      Indent,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Selection,
      Image,
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate(content) {
          setTocContent(content)
        },
      }),
      TableHandleExtension,
      ListNormalizationExtension,
      TripleClickBlockSelection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: imageUploadMaxSize,
        limit: imageUploadLimit,
        upload: imageUpload,
        onError: onImageUploadError,
        onSuccess: onImageUploadSuccess,
      }),
      UniqueID.configure({
        types: [
          "table",
          "paragraph",
          "bulletList",
          "orderedList",
          "taskList",
          "heading",
          "blockquote",
          "codeBlock",
          "tocNode",
        ],
      }),
      Typography,
      UiState,
      TocNode.configure({
        topOffset: 48,
      }),
    ],
  })

  if (!editor) {
    return <LoadingSpinner />
  }

  return (
    <div
      data-variant={variant}
      style={
        contentWidthValue
          ? ({
              "--omnibox-editor-content-width": contentWidthValue,
            } as CSSProperties)
          : undefined
      }
      className={cn(
        "omnibox-editor-root omnibox-editor-wrapper",
        isEmbedded
          ? "omnibox-editor-wrapper--embedded"
          : "omnibox-editor-wrapper--page"
      )}
    >
      <EditorContext.Provider value={{ editor }}>
        {shouldShowHeader ? <OmniboxEditorHeader /> : null}
        <div
          className={cn(
            "omnibox-editor-layout",
            isEmbedded && "omnibox-editor-layout--embedded"
          )}
        >
          <EditorContentArea />
          {shouldShowToc ? <TocSidebar topOffset={48} /> : null}
        </div>

        <TableExtendRowColumnButtons />
        <TableHandle />
        <TableSelectionOverlay
          showResizeHandles={true}
          cellMenu={(props) => (
            <TableCellHandleMenu
              editor={props.editor}
              onMouseDown={(e) => props.onResizeStart?.("br")(e)}
            />
          )}
        />
      </EditorContext.Provider>
    </div>
  )
}

/**
 * Full local editor with all necessary providers.
 */
export function OmniboxEditor({
  editable = true,
  placeholder = "Start writing...",
  content,
  contentWidth,
  variant,
  showHeader,
  showToc,
  onUpdate,
  imageUpload,
  imageUploadMaxSize,
  imageUploadLimit,
  onImageUploadError,
  onImageUploadSuccess,
}: OmniboxEditorProps) {
  return (
    <TocProvider>
      <EditorProvider
        editable={editable}
        placeholder={placeholder}
        content={content}
        contentWidth={contentWidth}
        variant={variant}
        showHeader={showHeader}
        showToc={showToc}
        onUpdate={onUpdate}
        imageUpload={imageUpload}
        imageUploadMaxSize={imageUploadMaxSize}
        imageUploadLimit={imageUploadLimit}
        onImageUploadError={onImageUploadError}
        onImageUploadSuccess={onImageUploadSuccess}
      />
    </TocProvider>
  )
}
