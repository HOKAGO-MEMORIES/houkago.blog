"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { MDXComponents } from "mdx/types";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

const MarkdownRenderer = dynamic(
  () => import("@/components/markdown-renderer"),
  { ssr: false }
);

interface MDXProps {
  mdxSource: MDXRemoteSerializeResult;
  components?: MDXComponents;
}

export const MDXContent = ({ mdxSource, components }: MDXProps) => {
  return (
    <div className="prose flex-1 max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-a:text-primary">
      <MarkdownRenderer mdxSource={mdxSource} components={components} />
    </div>
  );
};
