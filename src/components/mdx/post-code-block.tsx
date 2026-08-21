"use client";

import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import { Check, Copy, X } from "lucide-react";

type PostCodeBlockProps = ComponentPropsWithoutRef<"pre"> & {
  readonly language?: string;
};

export default function PostCodeBlock({
  children,
  language,
  ...props
}: PostCodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle");

  const copyCode = async () => {
    const code = preRef.current?.textContent;
    if (!code || !navigator.clipboard) {
      setCopyState("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }
  };

  const copyLabel =
    copyState === "success" ? "복사됨" : copyState === "error" ? "복사 실패" : "복사";

  return (
    <div className="post-code-block">
      <div className="post-code-toolbar">
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={copyCode}
          aria-label={copyLabel}
          title={copyLabel}
        >
          {copyState === "success" ? (
            <Check aria-hidden="true" />
          ) : copyState === "error" ? (
            <X aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          <span aria-live="polite">{copyLabel}</span>
        </button>
      </div>
      <pre {...props} ref={preRef} tabIndex={0}>
        {children}
      </pre>
    </div>
  );
}
