import "server-only";

import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { createHighlighter, type Highlighter } from "shiki";
import { resolvePostAssetUrl } from "@/lib/post-asset-url";
import { remarkPostHeadingAnchors } from "@/lib/post-headings";

const POST_MDX_THEME = "nord";

type MarkdownNode = {
  type?: string;
  url?: unknown;
  children?: MarkdownNode[];
};

export type PostMdxSerializationTiming = {
  readonly shikiReadyBeforeSerialize: boolean;
  readonly shikiInitializationMs: number | null;
  readonly assetRewriteMs: number;
  readonly rehypeKatexMs: number;
  readonly rehypePrettyCodeMs: number;
  readonly parseAndCompileMs: number;
  readonly totalMs: number;
};

type SerializePostMdxOptions = {
  readonly assetBaseUrl?: string;
  readonly now?: () => number;
  readonly onTiming?: (timing: PostMdxSerializationTiming) => void;
};

type MutablePostMdxTiming = {
  assetRewriteMs: number;
  rehypeKatexMs: number;
  rehypePrettyCodeMs: number;
};

type Transformer = (
  tree: MarkdownNode,
  file?: unknown,
) => unknown | Promise<unknown>;

let shikiInitializationMs: number | null = null;
let shikiReady = false;
let postMdxHighlighter: Promise<Highlighter> | null = null;

export async function getSerializedMDX(
  content: string,
  options?: SerializePostMdxOptions,
) {
  const now = options?.now ?? (() => performance.now());
  const totalStartedAt = now();
  const shikiReadyBeforeSerialize = shikiReady;
  const timing: MutablePostMdxTiming = {
    assetRewriteMs: 0,
    rehypeKatexMs: 0,
    rehypePrettyCodeMs: 0,
  };
  const remarkPlugins = [
    remarkGfm,
    remarkMath,
    remarkPostHeadingAnchors,
    ...(options?.assetBaseUrl
      ? [createPostAssetRewritePlugin(options.assetBaseUrl, timing, now)]
      : []),
  ];

  const result = await serialize(content, {
    mdxOptions: {
      remarkPlugins,
      rehypePlugins: [
        createTimedTransformerPlugin(
          () => rehypeKatex(),
          (durationMs) => {
            timing.rehypeKatexMs = durationMs;
          },
          now,
        ),
        createTimedTransformerPlugin(
          () =>
            rehypePrettyCode({
              theme: POST_MDX_THEME,
              getHighlighter: getPostMdxHighlighter,
            }),
          (durationMs) => {
            timing.rehypePrettyCodeMs = durationMs;
          },
          now,
        ),
      ],
    },
  });

  const totalMs = now() - totalStartedAt;
  const measuredPluginMs =
    timing.assetRewriteMs + timing.rehypeKatexMs + timing.rehypePrettyCodeMs;

  options?.onTiming?.({
    shikiReadyBeforeSerialize,
    shikiInitializationMs,
    assetRewriteMs: roundMilliseconds(timing.assetRewriteMs),
    rehypeKatexMs: roundMilliseconds(timing.rehypeKatexMs),
    rehypePrettyCodeMs: roundMilliseconds(timing.rehypePrettyCodeMs),
    parseAndCompileMs: roundMilliseconds(totalMs - measuredPluginMs),
    totalMs: roundMilliseconds(totalMs),
  });

  return result;
}

function getPostMdxHighlighter(): Promise<Highlighter> {
  if (postMdxHighlighter === null) {
    const startedAt = performance.now();
    postMdxHighlighter = createHighlighter({
      themes: [POST_MDX_THEME],
      langs: ["plaintext"],
    }).then((highlighter) => {
      shikiInitializationMs = roundMilliseconds(performance.now() - startedAt);
      shikiReady = true;
      return highlighter;
    });
  }

  return postMdxHighlighter;
}

function createPostAssetRewritePlugin(
  assetBaseUrl: string,
  timing: MutablePostMdxTiming,
  now: () => number,
) {
  return function postAssetRewritePlugin() {
    return function transform(tree: MarkdownNode) {
      const startedAt = now();
      rewritePostAssetNodes(tree, assetBaseUrl);
      timing.assetRewriteMs += now() - startedAt;
    };
  };
}

function createTimedTransformerPlugin(
  createTransformer: () => unknown,
  recordDuration: (durationMs: number) => void,
  now: () => number,
) {
  return function timedTransformerPlugin() {
    const transformer = createTransformer();
    if (typeof transformer !== "function") {
      return;
    }

    return async function transform(tree: MarkdownNode, file?: unknown) {
      const startedAt = now();
      const result = await (transformer as Transformer)(tree, file);
      recordDuration(now() - startedAt);
      return result;
    };
  };
}

function rewritePostAssetNodes(node: MarkdownNode, assetBaseUrl: string) {
  if ((node.type === "image" || node.type === "link") && typeof node.url === "string") {
    node.url = resolvePostAssetUrl(node.url, assetBaseUrl);
  }

  node.children?.forEach((child) => rewritePostAssetNodes(child, assetBaseUrl));
}

function roundMilliseconds(durationMs: number) {
  return Number(Math.max(0, durationMs).toFixed(1));
}
