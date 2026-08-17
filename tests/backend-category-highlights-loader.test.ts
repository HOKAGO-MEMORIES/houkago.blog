import { describe, expect, it, vi } from "vitest";

import {
  BackendCategoryHighlightsContractError,
  loadBackendCategoryHighlights,
  type BackendCategoryHighlightPageLoader,
} from "@/lib/backend-category-highlights-loader";
import type { FrontendPostPage, FrontendPostSummary } from "@/lib/backend-post-adapter";
import { BLOG_CATEGORIES } from "@/lib/post-navigation";
import type { Category } from "@/types/post";

function post(category: Category, slug: string): FrontendPostSummary {
  return {
    slug,
    title: slug,
    description: `${slug} description`,
    category,
    date: "2026-08-17",
    tags: [],
    featured: false,
  };
}

function page(
  category: Category,
  posts: readonly FrontendPostSummary[],
  totalItems: number,
): FrontendPostPage {
  return {
    posts: [...posts],
    currentPage: 1,
    backendPage: 0,
    pageSize: 3,
    totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / 3),
    totalItems,
    numberOfItems: posts.length,
    first: true,
    last: totalItems <= 3,
    empty: posts.length === 0,
    outOfRange: false,
  };
}

describe("backend category highlights loader", () => {
  it("starts all four category requests in parallel and maps counts", async () => {
    const resolvers = new Map<Category, (value: FrontendPostPage) => void>();
    const loadPage = vi.fn<BackendCategoryHighlightPageLoader>(({ category }) =>
      new Promise((resolve) => {
        resolvers.set(category as Category, resolve);
      }),
    );

    const loading = loadBackendCategoryHighlights(loadPage);

    expect(loadPage).toHaveBeenCalledTimes(4);
    expect(loadPage.mock.calls.map(([options]) => options)).toEqual(
      BLOG_CATEGORIES.map((category) => ({
        frontendPage: 1,
        pageSize: 3,
        category,
      })),
    );

    resolvers.get("algorithm")?.(
      page("algorithm", [post("algorithm", "algorithm-new"), post("algorithm", "algorithm-old")], 8),
    );
    resolvers.get("project")?.(page("project", [], 0));
    resolvers.get("cs")?.(page("cs", [post("cs", "cs-post")], 1));
    resolvers.get("blog")?.(page("blog", [post("blog", "blog-post")], 4));

    const result = await loading;

    expect(result.map((group) => [group.category, group.count])).toEqual([
      ["algorithm", 8],
      ["project", 0],
      ["cs", 1],
      ["blog", 4],
    ]);
    expect(result[0].posts.map((item) => item.slug)).toEqual([
      "algorithm-new",
      "algorithm-old",
    ]);
  });

  it("preserves an empty category instead of treating it as an error", async () => {
    const loadPage = vi.fn<BackendCategoryHighlightPageLoader>(({ category }) =>
      Promise.resolve(page(category as Category, [], 0)),
    );

    const result = await loadBackendCategoryHighlights(loadPage);

    expect(result).toHaveLength(4);
    expect(result.find((group) => group.category === "project")).toMatchObject({
      count: 0,
      posts: [],
    });
  });

  it("rejects content from the wrong category", async () => {
    const loadPage = vi.fn<BackendCategoryHighlightPageLoader>(({ category }) =>
      Promise.resolve(
        category === "algorithm"
          ? page("algorithm", [post("blog", "wrong-category")], 1)
          : page(category as Category, [], 0),
      ),
    );

    await expect(loadBackendCategoryHighlights(loadPage)).rejects.toBeInstanceOf(
      BackendCategoryHighlightsContractError,
    );
  });

  it("rejects more than three highlight posts", async () => {
    const loadPage = vi.fn<BackendCategoryHighlightPageLoader>(({ category }) => {
      const typedCategory = category as Category;
      return Promise.resolve(
        typedCategory === "algorithm"
          ? page(
              typedCategory,
              [
                post(typedCategory, "one"),
                post(typedCategory, "two"),
                post(typedCategory, "three"),
                post(typedCategory, "four"),
              ],
              4,
            )
          : page(typedCategory, [], 0),
      );
    });

    await expect(loadBackendCategoryHighlights(loadPage)).rejects.toBeInstanceOf(
      BackendCategoryHighlightsContractError,
    );
  });
});
