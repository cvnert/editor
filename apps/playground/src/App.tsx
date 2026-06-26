import type { Content, JSONContent } from "@tiptap/core";
import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
  useHocuspocusProvider,
} from "@hocuspocus/provider-react";
import { lazy, Suspense, useMemo, useState } from "react";
import {
  type OmniboxEditorAiSubmitPayload,
  type OmniboxEditorUpdatePayload,
  type UploadFunction,
} from "omnibox-editor";
import { getCollaborationServerUrl } from "./collaboration-url";

const OmniboxEditor = lazy(() =>
  import("omnibox-editor").then((module) => ({
    default: module.OmniboxEditor,
  })),
);

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
          text: "This playground consumes omnibox-editor like an app would.",
        },
      ],
    },
  ],
};

const handleEditorUpdate = ({ json }: OmniboxEditorUpdatePayload) => {
  console.info("Editor updated", json);
};

const uploadImage: UploadFunction = async (file, onProgress) => {
  onProgress?.({ progress: 100 });
  return URL.createObjectURL(file);
};

const AI_DEMO_ENDPOINT = "http://127.0.0.1:4174/api/ai";
const AI_REVEAL_CHARS_PER_FRAME = 2;
const AI_REVEAL_FRAME_MS = 24;
const COLLAB_ROOM_NAME = "omnibox-editor-playground";
const PLAYGROUND_COLLABORATION_ENABLED = true;
const PLAYGROUND_COLLABORATION_DEFAULT_ON = true;

type AiJsonStreamCallbacks = Pick<
  OmniboxEditorAiSubmitPayload,
  "onContent" | "onContentPreview" | "signal"
>;

async function streamAiResponse(
  response: Response,
  onText: (text: string) => void,
) {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("AI response is not streamable.");
  }

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const text = decoder.decode(value, { stream: true });

    if (text) {
      onText(text);
    }
  }

  const trailingText = decoder.decode();

  if (trailingText) {
    onText(trailingText);
  }
}

async function readAiJsonResponse(response: Response) {
  const contentType = response.headers.get("Content-Type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as {
    content?: unknown;
    text?: string;
  };
}

async function streamAiJsonBlocks(
  response: Response,
  callbacks: AiJsonStreamCallbacks,
) {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("AI response is not streamable.");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  const revealedBlocks: JSONContent[] = [];

  const flushLine = async (line: string) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const payload = JSON.parse(trimmedLine) as { content?: unknown };
    if (payload.content) {
      await revealAiJsonContent(payload.content, callbacks, revealedBlocks);
    }
  };

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      await flushLine(line);
    }
  }

  buffer += decoder.decode();
  await flushLine(buffer);
}

async function revealAiJsonContent(
  content: unknown,
  { onContent, onContentPreview, signal }: AiJsonStreamCallbacks,
  revealedBlocks: JSONContent[],
) {
  const blocks = normalizeAiJsonBlocks(content);

  if (!onContentPreview) {
    blocks.forEach((block) => onContent?.(block));
    return;
  }

  for (const block of blocks) {
    throwIfAiRevealAborted(signal);

    const textLength = getTiptapJsonTextLength(block);

    if (textLength <= AI_REVEAL_CHARS_PER_FRAME) {
      revealedBlocks.push(block);
      onContentPreview(revealedBlocks);
      continue;
    }

    for (
      let visibleChars = AI_REVEAL_CHARS_PER_FRAME;
      visibleChars < textLength;
      visibleChars += AI_REVEAL_CHARS_PER_FRAME
    ) {
      throwIfAiRevealAborted(signal);
      const previewBlock = truncateTiptapJsonText(block, visibleChars);
      onContentPreview([...revealedBlocks, previewBlock]);
      await waitForAiRevealFrame(signal);
    }

    revealedBlocks.push(block);
    onContentPreview(revealedBlocks);
  }
}

function normalizeAiJsonBlocks(content: unknown): JSONContent[] {
  if (Array.isArray(content)) {
    return content as JSONContent[];
  }

  const node = content as JSONContent | undefined;

  if (!node) {
    return [];
  }

  if (node.type === "doc") {
    return node.content ?? [];
  }

  return [node];
}

function getTiptapJsonTextLength(node: JSONContent): number {
  if (node.type === "text") {
    return node.text?.length ?? 0;
  }

  return (
    node.content?.reduce((total, child) => {
      return total + getTiptapJsonTextLength(child);
    }, 0) ?? 0
  );
}

function truncateTiptapJsonText(
  node: JSONContent,
  maxChars: number,
): JSONContent {
  return (
    truncateTiptapJsonTextNode(node, maxChars).node ?? {
      ...node,
      content: [],
    }
  );
}

function truncateTiptapJsonTextNode(
  node: JSONContent,
  maxChars: number,
): { node: JSONContent | null; usedChars: number } {
  if (maxChars <= 0) {
    return { node: null, usedChars: 0 };
  }

  if (node.type === "text") {
    const text = node.text ?? "";
    const nextText = text.slice(0, maxChars);

    if (!nextText) {
      return { node: null, usedChars: 0 };
    }

    return {
      node: {
        ...node,
        text: nextText,
      },
      usedChars: nextText.length,
    };
  }

  if (!node.content?.length) {
    return { node, usedChars: 0 };
  }

  let usedChars = 0;
  const content: JSONContent[] = [];

  for (const child of node.content) {
    const result = truncateTiptapJsonTextNode(child, maxChars - usedChars);

    if (result.node) {
      content.push(result.node);
    }

    usedChars += result.usedChars;

    if (usedChars >= maxChars) {
      break;
    }
  }

  return {
    node: {
      ...node,
      content,
    },
    usedChars,
  };
}

function waitForAiRevealFrame(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, AI_REVEAL_FRAME_MS);

    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException("AI generation was aborted.", "AbortError"));
      },
      { once: true },
    );
  });
}

function throwIfAiRevealAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("AI generation was aborted.", "AbortError");
  }
}

const handleAiSubmit = async ({
  action,
  editor,
  onChunk,
  onContent,
  onContentPreview,
  prompt,
  signal,
}: OmniboxEditorAiSubmitPayload) => {
  const response = await fetch(AI_DEMO_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      prompt,
      document_text: editor.getText(),
      response_format: "tiptap_json_stream",
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "AI request failed.");
  }

  const contentType = response.headers.get("Content-Type") || "";

  if (contentType.includes("application/x-ndjson")) {
    await streamAiJsonBlocks(response, {
      onContent,
      onContentPreview,
      signal,
    });
    return;
  }

  const json = await readAiJsonResponse(response);

  if (json?.content) {
    onContent?.(json.content);
    return;
  }

  if (json?.text) {
    onChunk?.(json.text);
    return;
  }

  await streamAiResponse(response, (text) => {
    onChunk?.(text);
  });
};

function CollaborativeEditor() {
  const provider = useHocuspocusProvider();
  const collaboration = useMemo(
    () => ({
      document: provider.document,
      provider,
    }),
    [provider],
  );

  return (
    <OmniboxEditor
      ai={{ enabled: true, onSubmit: handleAiSubmit }}
      collaboration={collaboration}
      content={initialContent}
      placeholder="Start writing..."
      onUpdate={handleEditorUpdate}
      imageUpload={uploadImage}
    />
  );
}

export function App() {
  const [collaborationEnabled, setCollaborationEnabled] = useState(
    PLAYGROUND_COLLABORATION_ENABLED && PLAYGROUND_COLLABORATION_DEFAULT_ON,
  );
  const collaborationServerUrl = useMemo(() => getCollaborationServerUrl(), []);

  return (
    <Suspense
      fallback={<div className="editor-loading">Loading editor...</div>}
    >
      <div className="playground-shell">
        {PLAYGROUND_COLLABORATION_ENABLED ? (
          <div className="playground-collab-bar">
            <label className="playground-collab-toggle">
              <input
                checked={collaborationEnabled}
                type="checkbox"
                onChange={(event) => {
                  setCollaborationEnabled(event.target.checked);
                }}
              />
              <span>Collaboration</span>
            </label>
          </div>
        ) : null}

        {PLAYGROUND_COLLABORATION_ENABLED && collaborationEnabled ? (
          <HocuspocusProviderWebsocketComponent url={collaborationServerUrl}>
            <HocuspocusRoom name={COLLAB_ROOM_NAME}>
              <CollaborativeEditor />
            </HocuspocusRoom>
          </HocuspocusProviderWebsocketComponent>
        ) : (
          <OmniboxEditor
            ai={{ enabled: true, onSubmit: handleAiSubmit }}
            content={initialContent}
            placeholder="Start writing..."
            onUpdate={handleEditorUpdate}
            imageUpload={uploadImage}
          />
        )}
      </div>
    </Suspense>
  );
}
