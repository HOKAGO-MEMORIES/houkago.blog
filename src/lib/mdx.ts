import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { resolvePostAssetUrl } from "@/lib/post-asset-url";

type MarkdownNode = {
    type?: string;
    url?: unknown;
    children?: MarkdownNode[];
};

type SerializePostMdxOptions = {
    assetBaseUrl?: string;
};

export async function getSerializedMDX(content: string, options?: SerializePostMdxOptions) {
    const remarkPlugins = options?.assetBaseUrl
        ? [remarkGfm, remarkMath, createPostAssetRewritePlugin(options.assetBaseUrl)]
        : [remarkGfm, remarkMath];

    return await serialize(content, {
        mdxOptions: {
            remarkPlugins,
            rehypePlugins: [rehypeKatex, [rehypePrettyCode, { theme: "nord" }]],
        },
    });
}

function createPostAssetRewritePlugin(assetBaseUrl: string) {
    return function postAssetRewritePlugin() {
        return function transform(tree: MarkdownNode) {
            rewritePostAssetNodes(tree, assetBaseUrl);
        };
    };
}

function rewritePostAssetNodes(node: MarkdownNode, assetBaseUrl: string) {
    if ((node.type === "image" || node.type === "link") && typeof node.url === "string") {
        node.url = resolvePostAssetUrl(node.url, assetBaseUrl);
    }

    node.children?.forEach((child) => rewritePostAssetNodes(child, assetBaseUrl));
}
