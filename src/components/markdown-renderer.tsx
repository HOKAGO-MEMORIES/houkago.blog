import React from "react";
import ReactMarkdown from "react-markdown";
// import rehypePrettyCode from "rehype-pretty-code";


interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
    return (
        <ReactMarkdown
            // rehypePlugins={[[rehypePrettyCode, { theme: "nord", async: true }]]}
        >
            {content}
        </ReactMarkdown>
    );
};


export default MarkdownRenderer;