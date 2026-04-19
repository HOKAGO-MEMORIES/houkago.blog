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
    <div className="prose prose-slate dark:prose-invert flex-1">
      <MarkdownRenderer mdxSource={mdxSource} components={components} />
    </div>
  );
};
