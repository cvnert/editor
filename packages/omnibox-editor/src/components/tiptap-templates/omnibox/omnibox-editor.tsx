import {
  type CSSProperties,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { createPortal } from "react-dom";

// --- Tiptap Core Extensions ---
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { StarterKit } from "@tiptap/starter-kit";
import { Mention } from "@tiptap/extension-mention";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Placeholder, Selection } from "@tiptap/extensions";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Mathematics } from "@tiptap/extension-mathematics";
import { UniqueID } from "@tiptap/extension-unique-id";
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";
import {
  getHierarchicalIndexes,
  TableOfContents,
} from "@tiptap/extension-table-of-contents";

// --- Hooks ---
import { useUiEditorState } from "@/hooks/use-ui-editor-state";
import { useScrollToHash } from "@/components/tiptap-ui/copy-anchor-link-button/use-scroll-to-hash";

// --- Custom Extensions ---
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { UiState } from "@/components/tiptap-extension/ui-state-extension";
import { Image } from "@/components/tiptap-node/image-node/image-node-extension";
import { NodeBackground } from "@/components/tiptap-extension/node-background-extension";
import { NodeAlignment } from "@/components/tiptap-extension/node-alignment-extension";
import { TocNode } from "@/components/tiptap-node/toc-node/extensions/toc-node-extension";
import { CodeBlock } from "@/components/tiptap-node/code-block-node/code-block-node-extension";
import { AiGenerationWidget } from "@/components/tiptap-extension/ai-generation-widget-extension";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";

// --- Table Node ---
import { TableKit } from "@/components/tiptap-node/table-node/extensions/table-node-extension";
import { TableHandleExtension } from "@/components/tiptap-node/table-node/extensions/table-handle";
import { TableHandle } from "@/components/tiptap-node/table-node/ui/table-handle/table-handle";
import { TableSelectionOverlay } from "@/components/tiptap-node/table-node/ui/table-selection-overlay";
import { TableCellHandleMenu } from "@/components/tiptap-node/table-node/ui/table-cell-handle-menu";
import { TableExtendRowColumnButtons } from "@/components/tiptap-node/table-node/ui/table-extend-row-column-button";
import "@/components/tiptap-node/table-node/styles/prosemirror-table.css";
import "@/components/tiptap-node/table-node/styles/table-node.css";

import "@/components/tiptap-node/blockquote-node/blockquote-node.css";
import "@/components/tiptap-node/code-block-node/code-block-node.css";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.css";
import "@/components/tiptap-node/list-node/list-node.css";
import "@/components/tiptap-node/image-node/image-node.css";
import "@/components/tiptap-node/heading-node/heading-node.css";
import "@/components/tiptap-node/paragraph-node/paragraph-node.css";
import "@/styles/github-markdown.css";

// --- Tiptap UI ---
import { EmojiDropdownMenu } from "@/components/tiptap-ui/emoji-dropdown-menu";
import { MentionDropdownMenu } from "@/components/tiptap-ui/mention-dropdown-menu";
import { SlashDropdownMenu } from "@/components/tiptap-ui/slash-dropdown-menu";
import { AiComposer } from "@/components/tiptap-ui/ai-composer";
import type { AiGenerationStatus } from "@/components/tiptap-ui/ai-composer/ai-generation-state";
import {
  getAiMarkdownPreviewContent,
  getAiTiptapJsonPreviewContent,
  type AiTiptapJsonContent,
} from "@/components/tiptap-ui/ai-composer/ai-markdown-preview";
import { DragContextMenu } from "@/components/tiptap-ui/drag-context-menu";

// --- Contexts ---

// --- Lib ---
import { cn, handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---

// --- Content ---
import { OmniboxEditorHeader } from "@/components/tiptap-templates/omnibox/omnibox-editor-header";
import { MobileToolbar } from "@/components/tiptap-templates/omnibox/omnibox-editor-mobile-toolbar";
import { OmniboxToolbarFloating } from "@/components/tiptap-templates/omnibox/omnibox-editor-toolbar-floating";
import { TocSidebar } from "@/components/tiptap-node/toc-node";
import {
  TocProvider,
  useToc,
} from "@/components/tiptap-node/toc-node/context/toc-context";
import { ListNormalizationExtension } from "@/components/tiptap-extension/list-normalization-extension";
import { Indent } from "@/components/tiptap-extension/indent-extension";
import { TripleClickBlockSelection } from "@/components/tiptap-extension/triple-click-block-selection-extension";
import defaultContent from "@/components/tiptap-templates/omnibox/data/content.json";
import {
  getExternalContentUpdate,
  normalizeEditorContent,
} from "@/lib/editor-content";
import {
  getCollaborationUser,
  getStarterKitUndoRedo,
  isCollaborationEnabled,
  shouldSyncExternalContent,
} from "@/lib/editor-collaboration";
import { tiptapJsonToMarkdown } from "@/lib/markdown";
import {
  EditorI18nContext,
  getEditorTranslations,
  useEditorI18n,
} from "@/lib/i18n";
import { UserProvider, useUser } from "@/contexts/user-context";
import { awarenessUserToEditorUser } from "@/lib/editor-users";
import type {
  SlashMenuAiAction,
} from "@/components/tiptap-ui/slash-dropdown-menu";
import type {
  EditorProviderProps,
  OmniboxEditorCollaborationConfig,
  OmniboxEditorAiFeature,
  OmniboxEditorProps,
} from "@/types";

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
  );
}

/**
 * EditorContent component that renders the actual editor
 */
function isAiEnabled(ai?: OmniboxEditorAiFeature) {
  return typeof ai === "boolean" ? ai : Boolean(ai?.enabled);
}

function getAiSubmitHandler(ai?: OmniboxEditorAiFeature) {
  return typeof ai === "boolean" ? undefined : ai?.onSubmit;
}

export function EditorContentArea({ ai }: { ai?: OmniboxEditorAiFeature }) {
  const { editor } = useContext(EditorContext)!;
  const { mentionUsers } = useUser();
  const { isDragging } = useUiEditorState(editor);
  const [aiAction, setAiAction] = useState<SlashMenuAiAction | null>(null);
  const aiAbortControllerRef = useRef<AbortController | null>(null);
  const aiGenerationRangeRef = useRef<{ from: number; to: number } | null>(null);
  const aiGeneratedMarkdownRef = useRef("");
  const aiLastPromptRef = useRef("");
  const aiLastActionRef = useRef<SlashMenuAiAction>("ask");
  const aiPreviewColor = "var(--tt-brand-color-500)";
  const aiEnabled = isAiEnabled(ai);
  const aiSubmitHandler = getAiSubmitHandler(ai);
  const i18n = useEditorI18n();

  useScrollToHash();

  useEffect(() => {
    if (!editor) return;

    const stopBlockDragPropagation = (event: DragEvent) => {
      if (editor.storage.uiState?.isDragging) {
        event.stopPropagation();
      }
    };

    document.addEventListener("dragenter", stopBlockDragPropagation);
    document.addEventListener("dragover", stopBlockDragPropagation);
    document.addEventListener("dragleave", stopBlockDragPropagation);
    document.addEventListener("drop", stopBlockDragPropagation);

    return () => {
      document.removeEventListener("dragenter", stopBlockDragPropagation);
      document.removeEventListener("dragover", stopBlockDragPropagation);
      document.removeEventListener("dragleave", stopBlockDragPropagation);
      document.removeEventListener("drop", stopBlockDragPropagation);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const activeEditor = editor;
  activeEditor.storage.aiGenerationWidget.labels = {
    aiIsWriting: i18n.aiIsWriting,
    aiReviewPrompt: i18n.aiReviewPrompt,
    apply: i18n.apply,
    discard: i18n.discard,
    submitAiPrompt: i18n.submitAiPrompt,
    stopAiGeneration: i18n.stopAiGeneration,
    tryAgain: i18n.tryAgain,
  };
  const clearAiPreview = () => {
    const range = aiGenerationRangeRef.current;
    if (range) {
      activeEditor
        .chain()
        .focus()
        .deleteRange({ from: range.from, to: range.to })
        .run();
    }

    aiGenerationRangeRef.current = null;
    aiGeneratedMarkdownRef.current = "";
    activeEditor.commands.clearAiGenerationWidget();
  };
  const setAiWidgetStatus = (
    status: Exclude<AiGenerationStatus, "idle">,
    pos = aiGenerationRangeRef.current?.to
  ) => {
    if (pos == null) return;

    activeEditor.commands.setAiGenerationWidget({ pos, status });
  };
  const replaceAiPreviewContent = (content: AiTiptapJsonContent) => {
    const range = aiGenerationRangeRef.current;
    if (!range) return range;

    const insertableContent = getAiTiptapJsonPreviewContent(content);
    const beforeSize = activeEditor.state.doc.content.size;
    activeEditor
      .chain()
      .focus()
      .insertContentAt({ from: range.from, to: range.to }, insertableContent)
      .run();

    const afterSize = activeEditor.state.doc.content.size;
    const nextRange = {
      from: range.from,
      to: Math.max(range.from, range.to + afterSize - beforeSize),
    };
    const textStyleMark = activeEditor.schema.marks.textStyle;
    if (textStyleMark && nextRange.to > nextRange.from) {
      activeEditor.view.dispatch(
        activeEditor.state.tr.addMark(
          nextRange.from,
          nextRange.to,
          textStyleMark.create({ color: aiPreviewColor })
        )
      );
    }

    aiGenerationRangeRef.current = nextRange;
    setAiWidgetStatus("writing", nextRange.to);
    return nextRange;
  };
  const appendAiPreviewContent = (content: AiTiptapJsonContent) => {
    const range = aiGenerationRangeRef.current;
    if (!range) return range;

    const insertableContent = getAiTiptapJsonPreviewContent(content);
    const beforeSize = activeEditor.state.doc.content.size;
    activeEditor
      .chain()
      .focus()
      .insertContentAt(range.to, insertableContent)
      .run();

    const afterSize = activeEditor.state.doc.content.size;
    const nextRange = {
      from: range.from,
      to: Math.max(range.from, range.to + afterSize - beforeSize),
    };
    const textStyleMark = activeEditor.schema.marks.textStyle;
    if (textStyleMark && nextRange.to > nextRange.from) {
      activeEditor.view.dispatch(
        activeEditor.state.tr.addMark(
          nextRange.from,
          nextRange.to,
          textStyleMark.create({ color: aiPreviewColor })
        )
      );
    }

    aiGenerationRangeRef.current = nextRange;
    setAiWidgetStatus("writing", nextRange.to);
    return nextRange;
  };
  const insertAiChunk = (chunk: string) => {
    if (!chunk) return;

    const range = aiGenerationRangeRef.current;
    if (!range) return;

    aiGeneratedMarkdownRef.current += chunk;
    activeEditor
      .chain()
      .focus()
      .insertContentAt(range.to, {
        type: "text",
        marks: [
          {
            type: "textStyle",
            attrs: { color: aiPreviewColor },
          },
        ],
        text: chunk,
      })
      .run();

    const nextRange = {
      from: range.from,
      to: range.to + chunk.length,
    };
    aiGenerationRangeRef.current = nextRange;
    setAiWidgetStatus("writing", nextRange.to);
  };
  const renderAiMarkdownPreview = () => {
    const range = aiGenerationRangeRef.current;
    if (!range || range.to === range.from) return range;

    const markdown = aiGeneratedMarkdownRef.current;
    if (!markdown.trim()) return range;

    return replaceAiPreviewContent(getAiMarkdownPreviewContent(markdown));
  };
  const showAiReviewOrClear = () => {
    const range = renderAiMarkdownPreview();
    const nextStatus = range?.to === range?.from ? "idle" : "reviewing";
    if (nextStatus === "reviewing" && range) {
      setAiWidgetStatus("reviewing", range.to);
      return;
    }

    activeEditor.commands.clearAiGenerationWidget();
  };
  const applyAiPreview = () => {
    const range = aiGenerationRangeRef.current;
    const textStyleMark = activeEditor.schema.marks.textStyle;
    if (range && textStyleMark) {
      activeEditor.view.dispatch(
        activeEditor.state.tr.removeMark(range.from, range.to, textStyleMark)
      );
    }

    aiGenerationRangeRef.current = null;
    aiGeneratedMarkdownRef.current = "";
    activeEditor.commands.clearAiGenerationWidget();
  };
  const stopAiGeneration = () => {
    aiAbortControllerRef.current?.abort();
    aiAbortControllerRef.current = null;
    showAiReviewOrClear();
  };
  const runAiGeneration = (action: SlashMenuAiAction, prompt = "") => {
    setAiAction(null);
    aiAbortControllerRef.current?.abort();
    aiAbortControllerRef.current = new AbortController();
    const existingRange = aiGenerationRangeRef.current;
    const insertPos = existingRange?.from ?? activeEditor.state.selection.to;
    clearAiPreview();
    aiLastActionRef.current = action;
    aiLastPromptRef.current = prompt;
    aiGenerationRangeRef.current = { from: insertPos, to: insertPos };
    aiGeneratedMarkdownRef.current = "";
    setAiWidgetStatus("writing", insertPos);

    if (!aiSubmitHandler) {
      activeEditor.commands.clearAiGenerationWidget();
      return;
    }

    void (async () => {
      try {
        await aiSubmitHandler({
          action,
          editor: activeEditor,
          onChunk: insertAiChunk,
          onContent: (content) => {
            appendAiPreviewContent(content);
          },
          onContentPreview: (content) => {
            replaceAiPreviewContent(content);
          },
          prompt,
          signal: aiAbortControllerRef.current?.signal,
        });
        showAiReviewOrClear();
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          showAiReviewOrClear();
          return;
        }

        activeEditor.commands.clearAiGenerationWidget();
        throw error;
      } finally {
        aiAbortControllerRef.current = null;
      }
    })();
  };
  const retryAiGeneration = (prompt = aiLastPromptRef.current) => {
    runAiGeneration(aiLastActionRef.current, prompt);
  };
  activeEditor.storage.aiGenerationWidget.onApply = applyAiPreview;
  activeEditor.storage.aiGenerationWidget.onDiscard = () => {
    clearAiPreview();
  };
  activeEditor.storage.aiGenerationWidget.onRetry = () => retryAiGeneration();
  activeEditor.storage.aiGenerationWidget.onStop = stopAiGeneration;
  activeEditor.storage.aiGenerationWidget.onSubmitInstruction = (
    instruction: string
  ) => retryAiGeneration(instruction);

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
      <MentionDropdownMenu users={mentionUsers} />
      <SlashDropdownMenu
        config={{
          aiEnabled,
          onAiAction: (action) => {
            if (action === "continue_writing") {
              runAiGeneration(action);
              return;
            }

            aiAbortControllerRef.current?.abort();
            aiAbortControllerRef.current = new AbortController();
            setAiAction(action);
          },
        }}
      />
      {aiEnabled ? (
        <AiComposer
          action={aiAction}
          editor={editor}
          open={Boolean(aiAction)}
          signal={aiAbortControllerRef.current?.signal}
          onOpenChange={(open) => {
            if (!open) {
              setAiAction(null);
            }
          }}
          onSubmit={(payload) => {
            runAiGeneration(payload.action, payload.prompt);
          }}
        />
      ) : null}
      <OmniboxToolbarFloating />
      {createPortal(<MobileToolbar />, document.body)}
    </EditorContent>
  );
}

function getVisibility(defaultValue: boolean, override?: boolean) {
  return override ?? defaultValue;
}

function getContentWidthValue(contentWidth?: number | string) {
  if (typeof contentWidth === "number") return `${contentWidth}px`;
  return contentWidth;
}

type AwarenessProvider = {
  awareness?: {
    getStates?: () => Map<number, unknown>;
    on?: (event: string, callback: () => void) => void;
    off?: (event: string, callback: () => void) => void;
  };
};

function getCollaborationProvider(
  collaboration?: OmniboxEditorCollaborationConfig,
) {
  if (!collaboration || typeof collaboration !== "object") {
    return null;
  }

  return collaboration.provider as AwarenessProvider | undefined;
}

function getOnlineUsersFromProvider(provider?: AwarenessProvider | null) {
  const states = provider?.awareness?.getStates?.();
  if (!states) {
    return [];
  }

  return Array.from(states.entries())
    .map(([clientId, state]) => {
      const user =
        state && typeof state === "object" && "user" in state
          ? (state as { user?: unknown }).user
          : null;

      if (!user || typeof user !== "object") {
        return null;
      }

      return awarenessUserToEditorUser({
        clientId,
        ...(user as Record<string, unknown>),
      });
    })
    .filter((user): user is NonNullable<typeof user> => Boolean(user));
}

function getOnlineUsersFromEditorStorage(editor: ReturnType<typeof useEditor>) {
  const storageUsers = editor?.storage.collaborationCaret?.users;
  if (!Array.isArray(storageUsers)) {
    return [];
  }

  return storageUsers
    .map((user) => awarenessUserToEditorUser(user))
    .filter((user): user is NonNullable<typeof user> => Boolean(user));
}

function CollaborationUsersBridge({
  collaboration,
}: {
  collaboration?: OmniboxEditorCollaborationConfig;
}) {
  const { setOnlineUsers } = useUser();
  const { editor } = useContext(EditorContext)!;

  useEffect(() => {
    if (!editor) {
      setOnlineUsers([]);
      return;
    }

    const provider = getCollaborationProvider(collaboration);
    const updateUsers = () => {
      const providerUsers = getOnlineUsersFromProvider(provider);
      setOnlineUsers(
        providerUsers.length
          ? providerUsers
          : getOnlineUsersFromEditorStorage(editor),
      );
    };

    updateUsers();
    provider?.awareness?.on?.("update", updateUsers);
    provider?.awareness?.on?.("change", updateUsers);

    return () => {
      provider?.awareness?.off?.("update", updateUsers);
      provider?.awareness?.off?.("change", updateUsers);
      setOnlineUsers([]);
    };
  }, [collaboration, editor, setOnlineUsers]);

  return null;
}

/**
 * Component that creates and provides the editor instance
 */
export function EditorProvider(props: EditorProviderProps) {
  const {
    ai,
    collaboration,
    editable = true,
    placeholder,
    content = defaultContent,
    linkBase,
    locale,
    translations,
    theme,
    onUpdate,
    imageUpload = handleImageUpload,
    imageUploadMaxSize = MAX_FILE_SIZE,
    imageUploadLimit = 3,
    onImageUploadError,
    onImageUploadSuccess,
    contentWidth,
    variant = "page",
    showHeader,
    showToc,
  } = props;

  const { setTocContent } = useToc();
  const { user } = useUser();
  const isEmbedded = variant === "embedded";
  const shouldShowHeader = getVisibility(!isEmbedded, showHeader);
  const shouldShowToc = getVisibility(!isEmbedded, showToc);
  const contentWidthValue = getContentWidthValue(contentWidth);
  const i18n = getEditorTranslations(locale, translations);
  const editorPlaceholder = placeholder ?? i18n.placeholder;
  const editorContent = normalizeEditorContent(content, { linkBase });
  const syncedExternalContentRef = useRef(editorContent);
  const collaborationEnabled = isCollaborationEnabled(collaboration);
  const handleImageUploadError =
    onImageUploadError ??
    ((error: Error) => console.error(`${i18n.uploadFailed}:`, error));

  const editor = useEditor({
    immediatelyRender: false,
    content: editorContent,
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();

      onUpdate?.({
        editor,
        json,
        html: editor.getHTML(),
        markdown: tiptapJsonToMarkdown(json),
      });
    },
    editorProps: {
      attributes: {
        class: "omnibox-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
        dropcursor: {
          width: 2,
        },
        link: { openOnClick: false },
        undoRedo: getStarterKitUndoRedo(collaboration),
      }),
      ...(collaborationEnabled && collaboration && typeof collaboration === "object"
        ? [
            Collaboration.configure({
              document: collaboration.document,
            }),
            ...(collaboration.provider
              ? [
                  CollaborationCaret.configure({
                    provider: collaboration.provider,
                    user: getCollaborationUser(collaboration, user),
                  }),
                ]
              : []),
          ]
        : []),
      HorizontalRule,
      CodeBlock.configure({ i18n }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: editorPlaceholder,
        emptyNodeClass: "is-empty with-slash",
      }),
      Mention,
      Emoji.configure({
        emojis: gitHubEmojis.filter(
          (emoji) => !emoji.name.includes("regional"),
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
      Image.configure({ i18n }),
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate(content) {
          setTocContent(content);
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
        onError: handleImageUploadError,
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
      AiGenerationWidget,
      TocNode.configure({
        topOffset: 48,
      }),
    ],
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (!shouldSyncExternalContent(collaboration)) {
      return;
    }

    const nextContent = getExternalContentUpdate(
      syncedExternalContentRef.current,
      content,
      { linkBase },
    );

    if (nextContent) {
      syncedExternalContentRef.current = nextContent;
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [collaboration, content, editor, linkBase]);

  if (!editor) {
    return <LoadingSpinner text={i18n.loading} />;
  }

  return (
    <div
      data-variant={variant}
      data-theme={theme}
      style={
        contentWidthValue
          ? ({
              "--omnibox-editor-content-width": contentWidthValue,
            } as CSSProperties)
          : undefined
      }
      className={cn(
        "omnibox-editor-root omnibox-editor-wrapper",
        theme === "dark" && "dark",
        isEmbedded
          ? "omnibox-editor-wrapper--embedded"
          : "omnibox-editor-wrapper--page",
      )}
    >
      <EditorI18nContext.Provider value={i18n}>
        <EditorContext.Provider value={{ editor }}>
          <CollaborationUsersBridge collaboration={collaboration} />
          {shouldShowHeader ? <OmniboxEditorHeader /> : null}
          <div
            className={cn(
              "omnibox-editor-layout",
              isEmbedded && "omnibox-editor-layout--embedded",
            )}
          >
            <EditorContentArea ai={ai} />
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
      </EditorI18nContext.Provider>
    </div>
  );
}

/**
 * Full local editor with all necessary providers.
 */
export function OmniboxEditor({
  ai,
  collaboration,
  mentionUsers,
  user,
  editable = true,
  placeholder,
  content,
  linkBase,
  locale,
  translations,
  theme,
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
  const collaborationUser =
    collaboration && typeof collaboration === "object"
      ? collaboration.user
      : undefined;

  return (
    <UserProvider user={user ?? collaborationUser} mentionUsers={mentionUsers}>
      <TocProvider>
        <EditorProvider
          editable={editable}
          ai={ai}
          collaboration={collaboration}
          placeholder={placeholder}
          content={content}
          linkBase={linkBase}
          locale={locale}
          translations={translations}
          theme={theme}
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
    </UserProvider>
  );
}
