"use client";

import React from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

interface MarkdownRendererProps {
  mdxSource: MDXRemoteSerializeResult;
  components?: MDXComponents;
}

const MarkdownImage = ({ alt, className, decoding, loading, ...props }: ComponentPropsWithoutRef<"img">) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      className={["mx-auto h-auto max-h-[70vh] w-auto max-w-full rounded-2xl border object-contain", className]
        .filter(Boolean)
        .join(" ")}
      loading={loading ?? "lazy"}
      decoding={decoding ?? "async"}
    />
  );
};

const defaultComponents: MDXComponents = {
  img: MarkdownImage,
};

const MarkdownRenderer = ({ mdxSource, components }: MarkdownRendererProps) => {
  return <MDXRemote {...mdxSource} components={{ ...defaultComponents, ...components }} />;
};

export default MarkdownRenderer;
