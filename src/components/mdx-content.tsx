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
  id?: string;
  mdxSource: MDXRemoteSerializeResult;
  components?: MDXComponents;
}

export const MDXContent = ({ id, mdxSource, components }: MDXProps) => {
  return (
    <div id={id} className="post-body">
      <MarkdownRenderer mdxSource={mdxSource} components={components} />
    </div>
  );
};
