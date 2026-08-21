"use client";

import React from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import PostCodeBlock from "@/components/mdx/post-code-block";

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
      className={["post-image", className]
        .filter(Boolean)
        .join(" ")}
      loading={loading ?? "lazy"}
      decoding={decoding ?? "async"}
    />
  );
};

function MarkdownHeading({
  as: Heading,
  id,
  children,
  ...props
}: ComponentPropsWithoutRef<"h2"> & { readonly as: "h2" | "h3" }) {
  if (!id) {
    return <Heading {...props}>{children}</Heading>;
  }

  return (
    <Heading {...props} id={id}>
      <a className="post-heading-anchor" href={`#${id}`}>
        {children}
        <span aria-hidden="true">#</span>
      </a>
    </Heading>
  );
}

function MarkdownPre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const language = (props as Record<string, unknown>)["data-language"];
  return (
    <PostCodeBlock
      {...props}
      language={typeof language === "string" ? language : undefined}
    >
      {children}
    </PostCodeBlock>
  );
}

function MarkdownTable({ children, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div
      className="post-table-scroll"
      role="region"
      aria-label="표"
      tabIndex={0}
    >
      <table {...props}>{children}</table>
    </div>
  );
}

const defaultComponents: MDXComponents = {
  img: MarkdownImage,
  h2: (props) => <MarkdownHeading {...props} as="h2" />,
  h3: (props) => <MarkdownHeading {...props} as="h3" />,
  pre: MarkdownPre,
  table: MarkdownTable,
};

const MarkdownRenderer = ({ mdxSource, components }: MarkdownRendererProps) => {
  return <MDXRemote {...mdxSource} components={{ ...defaultComponents, ...components }} />;
};

export default MarkdownRenderer;
