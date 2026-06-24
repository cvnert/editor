import { describe, expect, it } from "vitest"

import {
  contentToTiptapJson,
  markdownToTiptapJson,
  tiptapJsonToMarkdown,
} from "./markdown"

describe("markdown conversion", () => {
  it("parses markdown into Tiptap JSON through the official markdown manager", () => {
    expect(markdownToTiptapJson("# Hello").content?.[0]).toMatchObject({
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Hello" }],
    })
  })

  it("keeps linkBase compatibility for relative markdown links", () => {
    const json = markdownToTiptapJson("[Docs](./docs)", {
      linkBase: "https://example.com/base",
    })

    expect(json.content?.[0]?.content?.[0]?.marks?.[0]).toMatchObject({
      type: "link",
      attrs: { href: "https://example.com/base/docs" },
    })
  })

  it("keeps serialized JSON content as Tiptap JSON", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello" }],
        },
      ],
    }

    expect(contentToTiptapJson(JSON.stringify(doc))).toEqual(doc)
  })

  it("serializes Tiptap JSON to markdown through the official markdown manager", () => {
    expect(
      tiptapJsonToMarkdown({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Hello" }],
          },
        ],
      }).trim()
    ).toBe("# Hello")
  })
})
