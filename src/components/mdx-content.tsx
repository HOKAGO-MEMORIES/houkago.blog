"use client";

import React from "react";
import type { MDXComponents } from "mdx/types";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import MarkdownRenderer from "@/components/markdown-renderer";

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
