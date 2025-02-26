"use client";

import React from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

interface MarkdownRendererProps {
  mdxSource: MDXRemoteSerializeResult;
}

const MarkdownRenderer = ({ mdxSource }: MarkdownRendererProps) => {
  return <MDXRemote {...mdxSource} />;
};

export default MarkdownRenderer;