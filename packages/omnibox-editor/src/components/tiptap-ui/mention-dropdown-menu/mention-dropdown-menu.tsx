import { useEffect, useMemo, useRef } from "react"
import type { Editor, Range } from "@tiptap/react"

// --- Lib ---
import { getMentionUsers } from "@/lib/editor-users"
import { getElementOverflowPosition } from "@/lib/tiptap-collab-utils"
import type { User } from "@/contexts/user-context"

// --- Tiptap UI ---
import type {
  SuggestionItem,
  SuggestionMenuProps,
  SuggestionMenuRenderProps,
} from "@/components/tiptap-ui-utils/suggestion-menu"
import { SuggestionMenu } from "@/components/tiptap-ui-utils/suggestion-menu"

// --- UI Primitives ---
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/tiptap-ui-primitive/avatar"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"

type MentionDropdownMenuProps = Omit<SuggestionMenuProps, "items" | "children"> & {
  users?: User[]
}

interface MentionItemProps {
  item: SuggestionItem<User>
  isSelected: boolean
  onSelect: () => void
}

export const MentionDropdownMenu = ({
  users = [],
  ...props
}: MentionDropdownMenuProps) => {
  const usersRef = useRef(users)

  useEffect(() => {
    usersRef.current = users
  }, [users])

  const handleItemSelect = (props: {
    editor: Editor
    range: Range
    context?: User
  }) => {
    if (!props.editor || !props.range || !props.context) return

    props.editor
      .chain()
      .focus()
      .insertContentAt(props.range, [
        {
          type: "mention",
          attrs: {
            id: props.context.id,
            label: props.context.name,
          },
        },
        {
          type: "text",
          text: " ",
        },
      ])
      .run()
  }

  const getSuggestionItems = async (props: { query: string }) => {
    const mentionUsers = getMentionUsers(props.query, usersRef.current)

    return mentionUsers.map((user) => ({
      title: user.name,
      subtext: user.position,
      context: user,
      onSelect: handleItemSelect,
    }))
  }

  return (
    <SuggestionMenu
      char="@"
      pluginKey="mentionDropdownMenu"
      decorationClass="tiptap-mention-decoration"
      selector="tiptap-mention-dropdown-menu"
      items={getSuggestionItems}
      {...props}
    >
      {(props) => <MentionList {...props} />}
    </SuggestionMenu>
  )
}

const MentionItem = ({ item, isSelected, onSelect }: MentionItemProps) => {
  const itemRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const menuElement = document.querySelector(
      '[data-selector="tiptap-mention-dropdown-menu"]'
    ) as HTMLElement
    if (!itemRef.current || !isSelected || !menuElement) return

    const overflow = getElementOverflowPosition(itemRef.current, menuElement)
    if (overflow === "top") {
      itemRef.current.scrollIntoView(true)
    } else if (overflow === "bottom") {
      itemRef.current.scrollIntoView(false)
    }
  }, [isSelected])

  return (
    <Button
      ref={itemRef}
      variant="ghost"
      data-active-state={isSelected ? "on" : "off"}
      onClick={onSelect}
      data-user-id={item.context?.id}
    >
      <Avatar userColor={item.context?.color}>
        <AvatarImage src={item.context?.avatar} alt={item.title} />
        <AvatarFallback>{item.title[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <span className="tiptap-button-text">{item.title}</span>
    </Button>
  )
}

const MentionList = ({
  items,
  selectedIndex,
  onSelect,
}: SuggestionMenuRenderProps<User>) => {
  const renderedItems = useMemo(() => {
    const rendered: React.ReactElement[] = []

    items.forEach((item, index) => {
      rendered.push(
        <MentionItem
          key={item.context?.id || item.title}
          item={item}
          isSelected={index === selectedIndex}
          onSelect={() => onSelect(item)}
        />
      )
    })

    return rendered
  }, [items, selectedIndex, onSelect])

  if (!renderedItems.length) {
    return null
  }

  return (
    <Card
      style={{
        maxHeight: "var(--suggestion-menu-max-height)",
      }}
    >
      <CardBody>
        <CardItemGroup>{renderedItems}</CardItemGroup>
      </CardBody>
    </Card>
  )
}
