import { beforeEach, describe, expect, it, vi } from "vitest"

const { MarkdownManagerMock, parseMock, serializeMock } = vi.hoisted(() => {
  const parse = vi.fn()
  const serialize = vi.fn()

  return {
    parseMock: parse,
    serializeMock: serialize,
    MarkdownManagerMock: vi.fn().mockImplementation(function MarkdownManager() {
      return {
      parse,
      serialize,
      }
    }),
  }
})

vi.mock("@tiptap/markdown", () => ({
  MarkdownManager: MarkdownManagerMock,
}))

import {
  getAiMarkdownPreviewContent,
  getAiTiptapJsonPreviewContent,
} from "./ai-markdown-preview"
import {
  contentToMarkdown,
  markdownToTiptapJson,
  tiptapJsonToMarkdown,
} from "@/lib/markdown"

describe("getAiMarkdownPreviewContent", () => {
  beforeEach(() => {
    parseMock.mockReset()
    serializeMock.mockReset()
    MarkdownManagerMock.mockClear()
  })

  it("parses markdown through the official Tiptap MarkdownManager", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Official" }],
        },
      ],
    }

    parseMock.mockReturnValueOnce(doc)

    expect(markdownToTiptapJson("# Official")).toEqual(doc)
    expect(parseMock).toHaveBeenCalledWith("# Official")
  })

  it("serializes Tiptap JSON through the official Tiptap MarkdownManager", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Official" }],
        },
      ],
    }

    serializeMock.mockReturnValue("Official")

    expect(tiptapJsonToMarkdown(doc)).toBe("Official")
    expect(contentToMarkdown(doc)).toBe("Official")
    expect(serializeMock).toHaveBeenCalledWith(doc)
  })

  it("converts AI markdown into Tiptap block nodes", () => {
    parseMock.mockReturnValueOnce({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Title" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "One",
                      marks: [{ type: "bold" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })

    expect(getAiMarkdownPreviewContent("## Title\n\n- **One**")).toEqual([
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Title" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "One",
                    marks: [{ type: "bold" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
  })
})

describe("getAiTiptapJsonPreviewContent", () => {
  it("uses doc content as insertable Tiptap nodes", () => {
    expect(
      getAiTiptapJsonPreviewContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello" }],
          },
        ],
      })
    ).toEqual([
      {
        type: "paragraph",
        content: [{ type: "text", text: "Hello" }],
      },
    ])
  })

  it("accepts a single node or node array", () => {
    const paragraph = {
      type: "paragraph",
      content: [{ type: "text", text: "Hello" }],
    }

    expect(getAiTiptapJsonPreviewContent(paragraph)).toEqual([paragraph])
    expect(getAiTiptapJsonPreviewContent([paragraph])).toEqual([paragraph])
  })

  it("unwraps AI blockquotes before inserting preview content", () => {
    expect(
      getAiTiptapJsonPreviewContent({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Quoted text" }],
          },
        ],
      })
    ).toEqual([
      {
        type: "paragraph",
        content: [{ type: "text", text: "Quoted text" }],
      },
    ])
  })
})
