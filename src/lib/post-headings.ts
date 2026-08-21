export type PostTableOfContentsItem = {
  readonly id: string;
  readonly level: 2 | 3;
  readonly text: string;
};

type MarkdownAstNode = {
  type?: string;
  depth?: number;
  value?: unknown;
  alt?: unknown;
  children?: MarkdownAstNode[];
  data?: {
    hProperties?: Record<string, unknown>;
  };
};

export function extractPostTableOfContents(
  markdown: string,
): PostTableOfContentsItem[] {
  const slug = createHeadingSlugger();
  const headings: PostTableOfContentsItem[] = [];
  let fenceMarker: "`" | "~" | null = null;
  let fenceLength = 0;

  markdown.split(/\r?\n/).forEach((line) => {
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0] as "`" | "~";
      if (fenceMarker === null) {
        fenceMarker = marker;
        fenceLength = fence[1].length;
      } else if (marker === fenceMarker && fence[1].length >= fenceLength) {
        fenceMarker = null;
        fenceLength = 0;
      }
      return;
    }

    if (fenceMarker !== null) {
      return;
    }

    const match = line.match(/^\s{0,3}(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!match) {
      return;
    }

    const text = normalizeHeadingText(match[2]);
    if (!text) {
      return;
    }

    headings.push({
      id: slug(text),
      level: match[1].length as 2 | 3,
      text,
    });
  });

  return headings;
}

export function estimatePostReadingMinutes(markdown: string) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/[`#*_\[\]()<>|$~-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 320));
}

export function remarkPostHeadingAnchors() {
  const slug = createHeadingSlugger();

  return function transform(tree: MarkdownAstNode) {
    visitMarkdownNode(tree, (node) => {
      if (node.type !== "heading" || (node.depth !== 2 && node.depth !== 3)) {
        return;
      }

      const text = collectMarkdownText(node).trim();
      if (!text) {
        return;
      }

      node.data = {
        ...node.data,
        hProperties: {
          ...node.data?.hProperties,
          id: slug(text),
        },
      };
    });
  };
}

function createHeadingSlugger() {
  const occurrences = new Map<string, number>();

  return function slugHeading(text: string) {
    const base = text
      .normalize("NFKC")
      .toLocaleLowerCase("ko-KR")
      .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "section";
    const count = (occurrences.get(base) ?? 0) + 1;
    occurrences.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

function normalizeHeadingText(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .trim();
}

function visitMarkdownNode(
  node: MarkdownAstNode,
  visitor: (node: MarkdownAstNode) => void,
) {
  visitor(node);
  node.children?.forEach((child) => visitMarkdownNode(child, visitor));
}

function collectMarkdownText(node: MarkdownAstNode): string {
  if (typeof node.value === "string") {
    return node.value;
  }
  if (typeof node.alt === "string") {
    return node.alt;
  }
  return node.children?.map(collectMarkdownText).join("") ?? "";
}
