import { cloneElement, useEffect, useMemo, useRef, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "@/components/tiptap-ui/color-highlight-popover"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import {
  canSetLink,
  LinkButton,
  LinkContent,
  LinkPopover,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { SlashCommandTriggerButton } from "@/components/tiptap-ui/slash-command-trigger-button"
import { ResetAllFormattingButton } from "@/components/tiptap-ui/reset-all-formatting-button"
import { DeleteNodeButton } from "@/components/tiptap-ui/delete-node-button"
import { CopyAnchorLinkButton } from "@/components/tiptap-ui/copy-anchor-link-button"
import { TurnIntoDropdownContent } from "@/components/tiptap-ui/turn-into-dropdown"
import { useRecentColors } from "@/components/tiptap-ui/color-text-popover"
import {
  ColorTextButton,
  TEXT_COLORS,
} from "@/components/tiptap-ui/color-text-button"
import {
  canColorHighlight,
  ColorHighlightButton,
  HIGHLIGHT_COLORS,
} from "@/components/tiptap-ui/color-highlight-button"
import { DuplicateButton } from "@/components/tiptap-ui/duplicate-button"
import { CopyToClipboardButton } from "@/components/tiptap-ui/copy-to-clipboard-button"
import { IndentButton } from "@/components/tiptap-ui/indent-button"

// --- Utils ---
import { getNodeDisplayName } from "@/lib/tiptap-collab-utils"

// --- Icons ---
import { PaintBucketIcon } from "@/components/tiptap-icons/paint-bucket-icon"
import { Repeat2Icon } from "@/components/tiptap-icons/repeat-2-icon"

// --- UI Primitives ---
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { ChevronRightIcon } from "@/components/tiptap-icons/chevron-right-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"
import { MoreVerticalIcon } from "@/components/tiptap-icons/more-vertical-icon"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"
import { MoveNodeButton } from "@/components/tiptap-ui/move-node-button"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { ImageNodeFloating } from "@/components/tiptap-node/image-node/image-node-floating"
import { useEditorI18n, type OmniboxEditorI18n } from "@/lib/i18n"

// =============================================================================
// Types & Constants
// =============================================================================

const TOOLBAR_VIEWS = {
  MAIN: "main",
  HIGHLIGHTER: "highlighter",
  LINK: "link",
} as const

type ToolbarViewId = (typeof TOOLBAR_VIEWS)[keyof typeof TOOLBAR_VIEWS]

export type ToolbarViewType = {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
  mobileButton?: (onClick: () => void) => React.ReactNode
  desktopComponent?: React.ReactNode
  shouldShow?: (editor: Editor | null) => boolean
}

type ToolbarViewRegistry = Record<
  Exclude<ToolbarViewId, typeof TOOLBAR_VIEWS.MAIN>,
  ToolbarViewType
>

interface ToolbarState {
  viewId: ToolbarViewId
  setViewId: (id: ToolbarViewId) => void
  isMainView: boolean
  showMainView: () => void
  showView: (id: ToolbarViewId) => void
}

// =============================================================================
// Hooks
// =============================================================================

function useToolbarState(isMobile: boolean): ToolbarState {
  const [viewId, setViewId] = useState<ToolbarViewId>(TOOLBAR_VIEWS.MAIN)

  useEffect(() => {
    if (!isMobile && viewId !== TOOLBAR_VIEWS.MAIN) {
      setViewId(TOOLBAR_VIEWS.MAIN)
    }
  }, [isMobile, viewId])

  return {
    viewId,
    setViewId,
    isMainView: viewId === TOOLBAR_VIEWS.MAIN,
    showMainView: () => setViewId(TOOLBAR_VIEWS.MAIN),
    showView: (id: ToolbarViewId) => setViewId(id),
  }
}

function hasTextSelection(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  const { selection } = editor.state
  return !selection.empty
}

// =============================================================================
// Toolbar View Registry
// =============================================================================

function createToolbarViewRegistry(i18n: OmniboxEditorI18n): ToolbarViewRegistry {
  return {
    [TOOLBAR_VIEWS.HIGHLIGHTER]: {
      id: TOOLBAR_VIEWS.HIGHLIGHTER,
      title: i18n.textHighlighter,
      icon: <HighlighterIcon className="tiptap-button-icon" />,
      content: <ColorHighlightPopoverContent />,
      mobileButton: (onClick: () => void) => (
        <ColorHighlightPopoverButton onClick={onClick} />
      ),
      desktopComponent: <ColorHighlightPopover />,
      shouldShow(editor) {
        return canColorHighlight(editor)
      },
    },
    [TOOLBAR_VIEWS.LINK]: {
      id: TOOLBAR_VIEWS.LINK,
      title: i18n.linkEditor,
      icon: <LinkIcon className="tiptap-button-icon" />,
      content: <LinkContent />,
      mobileButton: (onClick: () => void) => <LinkButton onClick={onClick} />,
      desktopComponent: <LinkPopover />,
      shouldShow(editor) {
        return canSetLink(editor)
      },
    },
  }
}

// =============================================================================
// Sub-Components
// =============================================================================

function IndentGroup() {
  return (
    <>
      <ToolbarGroup>
        <IndentButton action="outdent" hideWhenUnavailable />
        <IndentButton action="indent" hideWhenUnavailable />
      </ToolbarGroup>

      <ToolbarSeparator />
    </>
  )
}

function AlignmentGroup() {
  return (
    <>
      <ToolbarGroup>
        <TextAlignButton align="left" hideWhenUnavailable />
        <TextAlignButton align="center" hideWhenUnavailable />
        <TextAlignButton align="right" hideWhenUnavailable />
        <TextAlignButton align="justify" hideWhenUnavailable />
      </ToolbarGroup>

      <ToolbarSeparator />
    </>
  )
}

function ScriptGroup() {
  return (
    <>
      <ToolbarGroup>
        <MarkButton type="superscript" hideWhenUnavailable />
        <MarkButton type="subscript" hideWhenUnavailable />
      </ToolbarGroup>

      <ToolbarSeparator />
    </>
  )
}

function FormattingGroup() {
  return (
    <>
      <ToolbarGroup>
        <MarkButton type="bold" hideWhenUnavailable />
        <MarkButton type="italic" hideWhenUnavailable />
        <MarkButton type="strike" hideWhenUnavailable />
        <MarkButton type="code" hideWhenUnavailable />
      </ToolbarGroup>

      <ToolbarSeparator />
    </>
  )
}

function ColorActionGroup() {
  const i18n = useEditorI18n()
  const { recentColors, isInitialized, addRecentColor } = useRecentColors()

  const renderRecentColors = () => {
    if (!isInitialized || recentColors.length === 0) return null

    return (
      <>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{i18n.recentColors}</DropdownMenuLabel>
          {recentColors.map((colorObj) => (
            <DropdownMenuItem
              key={`${colorObj.type}-${colorObj.value}`}
              asChild
            >
              {colorObj.type === "text" ? (
                <ColorTextButton
                  textColor={colorObj.value}
                  label={colorObj.label}
                  text={colorObj.label}
                  tooltip={colorObj.label}
                  onApplied={({ color, label }) =>
                    addRecentColor({
                      type: "text",
                      label,
                      value: color,
                    })
                  }
                />
              ) : (
                <ColorHighlightButton
                  highlightColor={colorObj.value}
                  text={colorObj.label}
                  tooltip={colorObj.label}
                  onApplied={({ color, label }) =>
                    addRecentColor({
                      type: "highlight",
                      label,
                      value: color,
                    })
                  }
                />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <Separator orientation="horizontal" />
      </>
    )
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger asChild>
        <Button variant="ghost">
          <PaintBucketIcon className="tiptap-button-icon" />
          <span className="tiptap-button-text">{i18n.color}</span>
          <Spacer />
          <ChevronRightIcon className="tiptap-button-icon" />
        </Button>
      </DropdownMenuSubTrigger>

      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {renderRecentColors()}

          <DropdownMenuGroup>
            <DropdownMenuLabel>{i18n.textColor}</DropdownMenuLabel>

            {TEXT_COLORS.map((textColor) => (
              <DropdownMenuItem key={textColor.value} asChild>
                <ColorTextButton
                  textColor={textColor.value}
                  label={textColor.label}
                  text={textColor.label}
                  tooltip={textColor.label}
                  onApplied={({ color, label }) =>
                    addRecentColor({ type: "text", label, value: color })
                  }
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <Separator orientation="horizontal" />

          <DropdownMenuGroup>
            <DropdownMenuLabel>{i18n.highlightColor}</DropdownMenuLabel>

            {HIGHLIGHT_COLORS.map((highlightColor) => (
              <DropdownMenuItem key={highlightColor.value} asChild>
                <ColorHighlightButton
                  highlightColor={highlightColor.value}
                  text={highlightColor.label}
                  tooltip={highlightColor.label}
                  onApplied={({ color, label }) =>
                    addRecentColor({
                      type: "highlight",
                      label,
                      value: color,
                    })
                  }
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

function TransformActionGroup() {
  const i18n = useEditorI18n()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger asChild>
        <Button variant="ghost">
          <Repeat2Icon className="tiptap-button-icon" />
          <span className="tiptap-button-text">{i18n.turnInto}</span>
          <Spacer />
          <ChevronRightIcon className="tiptap-button-icon" />
        </Button>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <TurnIntoDropdownContent />
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

// =============================================================================
// Dropdown Menu Components
// =============================================================================

interface DropdownMenuActionsProps {
  editor: Editor | null
}

function DropdownMenuActions({ editor }: DropdownMenuActionsProps) {
  const isMobile = useIsBreakpoint()
  const i18n = useEditorI18n()

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>{getNodeDisplayName(editor, i18n)}</DropdownMenuLabel>

        <ColorActionGroup />
        <TransformActionGroup />

        <DropdownMenuItem asChild>
          <ResetAllFormattingButton text={i18n.resetFormatting} />
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <Separator orientation="horizontal" />

      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <DuplicateButton text={i18n.duplicateNode} showShortcut={!isMobile} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <CopyToClipboardButton
            text={i18n.copyToClipboard}
            showShortcut={!isMobile}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <CopyAnchorLinkButton
            text={i18n.copyAnchorLink}
            showShortcut={!isMobile}
          />
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <DeleteNodeButton text={i18n.delete} showShortcut={!isMobile} />
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  )
}

function MoreActionsDropdown({ editor }: DropdownMenuActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" data-appearance="subdued">
          <MoreVerticalIcon className="tiptap-button-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuActions editor={editor} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// =============================================================================
// Toolbar View Components
// =============================================================================

interface ToolbarViewButtonProps {
  view: ToolbarViewType
  isMobile: boolean
  onViewChange: (viewId: ToolbarViewId) => void
}

function ToolbarViewButton({
  view,
  isMobile,
  onViewChange,
}: ToolbarViewButtonProps) {
  const viewId = view.id as Exclude<ToolbarViewId, typeof TOOLBAR_VIEWS.MAIN>

  if (isMobile) {
    return view.mobileButton ? (
      cloneElement(
        view.mobileButton(() => onViewChange(viewId)) as React.ReactElement,
        { key: view.id }
      )
    ) : (
      <Button key={view.id} onClick={() => onViewChange(viewId)}>
        {view.icon}
      </Button>
    )
  }

  return view.desktopComponent
    ? cloneElement(view.desktopComponent as React.ReactElement, {
        key: view.id,
      })
    : null
}

interface ToolbarViewsGroupProps {
  toolbarViews: ToolbarViewRegistry
  isMobile: boolean
  onViewChange: (viewId: ToolbarViewId) => void
  editor: Editor | null
}

function ToolbarViewsGroup({
  toolbarViews,
  isMobile,
  onViewChange,
  editor,
}: ToolbarViewsGroupProps) {
  const visibleViews = Object.values(toolbarViews).filter((view) => {
    if (!view.shouldShow) return true
    return view.shouldShow(editor)
  })

  if (visibleViews.length === 0) return null

  return (
    <>
      {visibleViews.map((view) => (
        <ToolbarViewButton
          key={view.id}
          view={view}
          isMobile={isMobile}
          onViewChange={onViewChange}
        />
      ))}

      <ToolbarSeparator />
    </>
  )
}

// =============================================================================
// Main Toolbar Content
// =============================================================================

interface MainToolbarContentProps {
  editor: Editor | null
  isMobile: boolean
  toolbarViews: ToolbarViewRegistry
  onViewChange: (viewId: ToolbarViewId) => void
}

function MainToolbarContent({
  editor,
  isMobile,
  toolbarViews,
  onViewChange,
}: MainToolbarContentProps) {
  const i18n = useEditorI18n()
  const hasSelection = hasTextSelection(editor)
  const hasContent = (editor?.getText().length ?? 0) > 0

  return (
    <>
      <ToolbarGroup>
        <SlashCommandTriggerButton />
        <MoreActionsDropdown editor={editor} />

        <ToolbarSeparator />
      </ToolbarGroup>

      {(hasSelection || hasContent) && (
        <>
          <FormattingGroup />

          <ToolbarViewsGroup
            toolbarViews={toolbarViews}
            isMobile={isMobile}
            onViewChange={onViewChange}
            editor={editor}
          />

          <ImageNodeFloating />

          <ScriptGroup />

          <AlignmentGroup />

          <IndentGroup />

          <ToolbarGroup>
            <ImageUploadButton text={i18n.add} />
            <ToolbarSeparator />
          </ToolbarGroup>
        </>
      )}

      <ToolbarGroup>
        <MoveNodeButton direction="down" />
        <MoveNodeButton direction="up" />
      </ToolbarGroup>
    </>
  )
}

// =============================================================================
// Specialized Toolbar Content
// =============================================================================

interface SpecializedToolbarContentProps {
  view: ToolbarViewType
  onBack: () => void
}

function SpecializedToolbarContent({
  view,
  onBack,
}: SpecializedToolbarContentProps) {
  return (
    <>
      <ToolbarGroup>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeftIcon className="tiptap-button-icon" />
          {view.icon}
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {view.content}
    </>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export interface MobileToolbarProps {
  editor?: Editor | null
}

export function MobileToolbar({ editor: providedEditor }: MobileToolbarProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const i18n = useEditorI18n()
  const isMobile = useIsBreakpoint("max", 480)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const toolbarState = useToolbarState(isMobile)
  const toolbarViews = useMemo(() => createToolbarViewRegistry(i18n), [i18n])

  const currentView = toolbarState.isMainView
    ? null
    : toolbarViews[
        toolbarState.viewId as Exclude<ToolbarViewId, typeof TOOLBAR_VIEWS.MAIN>
      ]

  const { height } = useWindowSize()
  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  if (!isMobile || !editor || !editor.isEditable) {
    return null
  }

  return (
    <Toolbar
      ref={toolbarRef}
      style={{
        ...(isMobile
          ? {
              bottom: `calc(100% - ${height - rect.y}px)`,
            }
          : {}),
      }}
    >
      {toolbarState.isMainView ? (
        <MainToolbarContent
          editor={editor}
          isMobile={isMobile}
          toolbarViews={toolbarViews}
          onViewChange={toolbarState.showView}
        />
      ) : (
        currentView && (
          <SpecializedToolbarContent
            view={currentView}
            onBack={toolbarState.showMainView}
          />
        )
      )}
    </Toolbar>
  )
}
