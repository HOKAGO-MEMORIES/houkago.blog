import { serialize } from "next-mdx-remote/serialize";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export async function getSerializedMDX(content: string) {
    return await serialize(content, {
        mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [rehypeKatex, [rehypePrettyCode, { theme: "nord" }]],
        },
    });
}
