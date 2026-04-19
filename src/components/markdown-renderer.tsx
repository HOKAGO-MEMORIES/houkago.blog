"use client";

import React from "react";
import type { MDXComponents } from "mdx/types";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

interface MarkdownRendererProps {
  mdxSource: MDXRemoteSerializeResult;
  components?: MDXComponents;
}

const MarkdownRenderer = ({ mdxSource, components }: MarkdownRendererProps) => {
  return <MDXRemote {...mdxSource} components={components} />;
};

export default MarkdownRenderer;
