"use client"

import React from "react";
import dynamic from "next/dynamic";

const MarkdownRenderer = dynamic(() => import("@/components/markdown-renderer"), { ssr: false });

interface MDXProps {
  content: string;
}

export const MDXContent = ({ content }: MDXProps) => {
  return (
    <div className="prose prose-slate dark:prose-invert flex-1">
      <MarkdownRenderer content = {content} />
    </div>
  );
};
