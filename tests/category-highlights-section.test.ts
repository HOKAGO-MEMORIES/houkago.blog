import { describe, expect, it } from "vitest";

import CategoryHighlightsSection from "@/app/blog/components/category-highlights-section";
import type { BackendCategoryHighlight } from "@/lib/backend-category-highlights-loader";

const algorithmHighlight: BackendCategoryHighlight = {
  category: "algorithm",
  count: 8,
  posts: [
    {
      slug: "newest",
      title: "Newest",
      description: "Newest post",
      category: "algorithm",
      date: "2026-08-17",
      tags: [],
      featured: false,
    },
    {
      slug: "older",
      title: "Older",
      description: "Older post",
      category: "algorithm",
      date: "2026-08-16",
      tags: [],
      featured: false,
    },
  ],
};

describe("category highlights section", () => {
  it("keeps backend order and omits empty highlight cards", () => {
    const result = CategoryHighlightsSection({
      highlights: [
        algorithmHighlight,
        { category: "project", count: 0, posts: [] },
      ],
    });

    expect(result).not.toBeNull();
    const cards = result?.props.children[1].props.children;
    expect(cards).toHaveLength(1);
    const postLinks = cards[0].props.children[1].props.children;
    expect(postLinks.map((link: { key: string }) => link.key)).toEqual([
      "newest",
      "older",
    ]);
  });

  it("hides the section when every known category is empty", () => {
    const result = CategoryHighlightsSection({
      highlights: [
        { category: "algorithm", count: 0, posts: [] },
        { category: "project", count: 0, posts: [] },
        { category: "cs", count: 0, posts: [] },
        { category: "blog", count: 0, posts: [] },
      ],
    });

    expect(result).toBeNull();
  });
});
