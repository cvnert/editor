import { useCallback } from "react"
import type { Editor } from "@tiptap/react"

// --- Icons ---
import { CodeBlockIcon } from "@/components/tiptap-icons/code-block-icon"
import { HeadingOneIcon } from "@/components/tiptap-icons/heading-one-icon"
import { HeadingTwoIcon } from "@/components/tiptap-icons/heading-two-icon"
import { HeadingThreeIcon } from "@/components/tiptap-icons/heading-three-icon"
import { ImageIcon } from "@/components/tiptap-icons/image-icon"
import { ListIcon } from "@/components/tiptap-icons/list-icon"
import { ListOrderedIcon } from "@/components/tiptap-icons/list-ordered-icon"
import { BlockquoteIcon } from "@/components/tiptap-icons/blockquote-icon"
import { ListTodoIcon } from "@/components/tiptap-icons/list-todo-icon"
import { MinusIcon } from "@/components/tiptap-icons/minus-icon"
import { TypeIcon } from "@/components/tiptap-icons/type-icon"
import { AtSignIcon } from "@/components/tiptap-icons/at-sign-icon"
import { SmilePlusIcon } from "@/components/tiptap-icons/smile-plus-icon"
import { TableIcon } from "@/components/tiptap-icons/table-icon"
import { ListIndentedIcon } from "@/components/tiptap-icons/list-indented-icon"
import { AiSparklesIcon } from "@/components/tiptap-icons/ai-sparkles-icon"

// --- Lib ---
import { useEditorI18n, type OmniboxEditorI18n } from "@/lib/i18n"
import { isExtensionAvailable, isNodeInSchema } from "@/lib/tiptap-utils"

// --- Tiptap UI ---
import type { SuggestionItem } from "@/components/tiptap-ui-utils/suggestion-menu"
import { addEmojiTrigger } from "@/components/tiptap-ui/emoji-trigger-button"
import { addMentionTrigger } from "@/components/tiptap-ui/mention-trigger-button"

export interface SlashMenuConfig {
  aiEnabled?: boolean
  onAiAction?: (action: SlashMenuAiAction) => void
  enabledItems?: SlashMenuItemType[]
  customItems?: SuggestionItem[]
  itemGroups?: {
    [key in SlashMenuItemType]?: string
  }
  showGroups?: boolean
}

function getSlashMenuTexts(i18n: OmniboxEditorI18n) {
  return {
  // AI
  ai_continue_writing: {
    title: i18n.continueWriting,
    subtext: i18n.continueWritingSubtext,
    keywords: ["ai", "continue", "writing", "autocomplete", "complete"],
    badge: AiSparklesIcon,
    group: i18n.ai,
  },
  ai_ask: {
    title: i18n.askAi,
    subtext: i18n.askAiSubtext,
    keywords: ["ai", "ask", "assistant", "generate", "write"],
    badge: AiSparklesIcon,
    group: i18n.ai,
  },

  // Style
  text: {
    title: i18n.text,
    subtext: i18n.regularTextParagraph,
    keywords: ["p", "paragraph", "text"],
    badge: TypeIcon,
    group: i18n.style,
  },
  heading_1: {
    title: i18n.heading1,
    subtext: i18n.topLevelHeading,
    keywords: ["h", "heading1", "h1"],
    badge: HeadingOneIcon,
    group: i18n.style,
  },
  heading_2: {
    title: i18n.heading2,
    subtext: i18n.heading2,
    keywords: ["h2", "heading2", "subheading"],
    badge: HeadingTwoIcon,
    group: i18n.style,
  },
  heading_3: {
    title: i18n.heading3,
    subtext: i18n.subsectionAndGroupHeading,
    keywords: ["h3", "heading3", "subheading"],
    badge: HeadingThreeIcon,
    group: i18n.style,
  },
  bullet_list: {
    title: i18n.bulletList,
    subtext: i18n.listWithUnorderedItems,
    keywords: ["ul", "li", "list", "bulletlist", "bullet list"],
    badge: ListIcon,
    group: i18n.style,
  },
  ordered_list: {
    title: i18n.orderedList,
    subtext: i18n.listWithOrderedItems,
    keywords: ["ol", "li", "list", "numberedlist", "numbered list"],
    badge: ListOrderedIcon,
    group: i18n.style,
  },
  task_list: {
    title: i18n.taskList,
    subtext: i18n.listWithTasks,
    keywords: ["tasklist", "task list", "todo", "checklist"],
    badge: ListTodoIcon,
    group: i18n.style,
  },
  quote: {
    title: i18n.blockquote,
    subtext: i18n.blockquoteBlock,
    keywords: ["quote", "blockquote"],
    badge: BlockquoteIcon,
    group: i18n.style,
  },
  code_block: {
    title: i18n.codeBlock,
    subtext: i18n.codeBlockWithSyntaxHighlighting,
    keywords: ["code", "pre"],
    badge: CodeBlockIcon,
    group: i18n.style,
  },

  // Insert
  mention: {
    title: i18n.mention,
    subtext: i18n.mentionSubtext,
    keywords: ["mention", "user", "item", "tag"],
    badge: AtSignIcon,
    group: i18n.insert,
  },
  emoji: {
    title: i18n.emoji,
    subtext: i18n.emojiSubtext,
    keywords: ["emoji", "emoticon", "smiley"],
    badge: SmilePlusIcon,
    group: i18n.insert,
  },
  table: {
    title: i18n.table,
    subtext: i18n.tableSubtext,
    keywords: ["table", "insertTable"],
    badge: TableIcon,
    group: i18n.insert,
  },
  divider: {
    title: i18n.separator,
    subtext: i18n.separatorSubtext,
    keywords: ["hr", "horizontalRule", "line", "separator"],
    badge: MinusIcon,
    group: i18n.insert,
  },
  toc: {
    title: i18n.tableOfContents,
    subtext: i18n.tableOfContentsSubtext,
    keywords: ["toc", "tableofcontents", "table of contents"],
    badge: ListIndentedIcon,
    group: i18n.insert,
  },

  // Upload
  image: {
    title: i18n.image,
    subtext: i18n.imageSubtext,
    keywords: [
      "image",
      "imageUpload",
      "upload",
      "img",
      "picture",
      "media",
      "url",
    ],
    badge: ImageIcon,
    group: i18n.upload,
  },
}
}

export type SlashMenuItemType = keyof ReturnType<typeof getSlashMenuTexts>
export type SlashMenuAiAction = "ask" | "continue_writing"

export function getSlashMenuItemAction(
  itemType: SlashMenuItemType
): SlashMenuAiAction | null {
  if (itemType === "ai_continue_writing") return "continue_writing"
  if (itemType === "ai_ask") return "ask"

  return null
}

export function getSlashMenuItemTypes(
  itemTypes: SlashMenuItemType[],
  config?: Pick<SlashMenuConfig, "aiEnabled">
) {
  if (config?.aiEnabled) {
    return itemTypes
  }

  return itemTypes.filter((itemType) => !itemType.startsWith("ai_"))
}

const getItemImplementations = (config?: SlashMenuConfig) => {
  return {
    // AI
    ai_continue_writing: {
      check: (editor: Editor) => editor.isEditable,
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().run()
        config?.onAiAction?.("continue_writing")
      },
    },
    ai_ask: {
      check: (editor: Editor) => editor.isEditable,
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().run()
        config?.onAiAction?.("ask")
      },
    },

    // Style
    text: {
      check: (editor: Editor) => isNodeInSchema("paragraph", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setParagraph().run()
      },
    },
    heading_1: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 1 }).run()
      },
    },
    heading_2: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 2 }).run()
      },
    },
    heading_3: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 3 }).run()
      },
    },
    bullet_list: {
      check: (editor: Editor) => isNodeInSchema("bulletList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBulletList().run()
      },
    },
    ordered_list: {
      check: (editor: Editor) => isNodeInSchema("orderedList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleOrderedList().run()
      },
    },
    task_list: {
      check: (editor: Editor) => isNodeInSchema("taskList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleTaskList().run()
      },
    },
    quote: {
      check: (editor: Editor) => isNodeInSchema("blockquote", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBlockquote().run()
      },
    },
    code_block: {
      check: (editor: Editor) => isNodeInSchema("codeBlock", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleNode("codeBlock", "paragraph").run()
      },
    },

    // Insert
    mention: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["mention", "mentionAdvanced"]),
      action: ({ editor }: { editor: Editor }) => addMentionTrigger(editor),
    },
    emoji: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["emoji", "emojiPicker"]),
      action: ({ editor }: { editor: Editor }) => addEmojiTrigger(editor),
    },
    divider: {
      check: (editor: Editor) => isNodeInSchema("horizontalRule", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setHorizontalRule().run()
      },
    },
    toc: {
      check: (editor: Editor) => isNodeInSchema("tocNode", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().insertTocNode().run()
      },
    },
    table: {
      check: (editor: Editor) => isNodeInSchema("table", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor
          .chain()
          .focus()
          .insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: false,
          })
          .run()
      },
    },

    // Upload
    image: {
      check: (editor: Editor) => isNodeInSchema("image", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "imageUpload",
          })
          .run()
      },
    },
  }
}

function organizeItemsByGroups(
  items: SuggestionItem[],
  showGroups: boolean
): SuggestionItem[] {
  if (!showGroups) {
    return items.map((item) => ({ ...item, group: "" }))
  }

  const groups: { [groupLabel: string]: SuggestionItem[] } = {}

  // Group items
  items.forEach((item) => {
    const groupLabel = item.group || ""
    if (!groups[groupLabel]) {
      groups[groupLabel] = []
    }
    groups[groupLabel].push(item)
  })

  // Flatten groups in order (this maintains the visual order for keyboard navigation)
  const organizedItems: SuggestionItem[] = []
  Object.entries(groups).forEach(([, groupItems]) => {
    organizedItems.push(...groupItems)
  })

  return organizedItems
}

/**
 * Custom hook for slash dropdown menu functionality
 */
export function useSlashDropdownMenu(config?: SlashMenuConfig) {
  const i18n = useEditorI18n()

  const getSlashMenuItems = useCallback(
    (editor: Editor) => {
      const items: SuggestionItem[] = []
      const texts = getSlashMenuTexts(i18n)

      const enabledItems = getSlashMenuItemTypes(
        config?.enabledItems || (Object.keys(texts) as SlashMenuItemType[]),
        config
      )
      const showGroups = config?.showGroups !== false

      const itemImplementations = getItemImplementations(config)

      enabledItems.forEach((itemType) => {
        const itemImpl = itemImplementations[itemType]
        const itemText = texts[itemType]

        if (itemImpl && itemText && itemImpl.check(editor)) {
          const item: SuggestionItem = {
            onSelect: ({ editor }) => itemImpl.action({ editor }),
            ...itemText,
          }

          if (config?.itemGroups?.[itemType]) {
            item.group = config.itemGroups[itemType]
          } else if (!showGroups) {
            item.group = ""
          }

          items.push(item)
        }
      })

      if (config?.customItems) {
        items.push(...config.customItems)
      }

      // Reorganize items by groups to ensure keyboard navigation works correctly
      return organizeItemsByGroups(items, showGroups)
    },
    [config, i18n]
  )

  return {
    getSlashMenuItems,
    config,
  }
}
