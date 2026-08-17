import { beforeEach, describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  loadBackendCategoryPostPage: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: routeMocks.notFound,
}));

vi.mock("@/lib/backend-category-post-loader", () => ({
  loadBackendCategoryPostPage: routeMocks.loadBackendCategoryPostPage,
}));

vi.mock("@/lib/post-navigation", () => ({
  POSTS_PER_PAGE: 25,
  getCategoryPageRoute: (category: string, page: number) =>
    page <= 1 ? `/blog/${category}` : `/blog/${category}/page/${page}`,
  getCategorySummary: (category: string) => `${category} summary`,
  isCategorySegment: (segment: string) =>
    ["algorithm", "project", "cs", "blog"].includes(segment),
}));

import BlogCategoryPaginationPage from "@/app/blog/[slug]/page/[page]/page";

function categoryPage(overrides = {}) {
  return {
    posts: [
      {
        slug: "page-two-new",
        title: "Page Two New",
        description: "new",
        category: "algorithm",
        date: "2026-08-17",
        tags: [],
        featured: false,
      },
      {
        slug: "page-two-old",
        title: "Page Two Old",
        description: "old",
        category: "algorithm",
        date: "2026-08-16",
        tags: [],
        featured: false,
      },
    ],
    currentPage: 2,
    backendPage: 1,
    pageSize: 25,
    totalPages: 3,
    totalItems: 51,
    numberOfItems: 2,
    first: false,
    last: false,
    empty: false,
    outOfRange: false,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  routeMocks.notFound.mockImplementation(() => {
    throw new Error("NEXT_NOT_FOUND");
  });
  routeMocks.loadBackendCategoryPostPage.mockResolvedValue(categoryPage());
});

describe("blog category pagination route", () => {
  it("loads frontend page 2 and preserves backend order and count", async () => {
    const result = await BlogCategoryPaginationPage({
      params: Promise.resolve({ slug: "algorithm", page: "2" }),
    });

    expect(routeMocks.loadBackendCategoryPostPage).toHaveBeenCalledWith("algorithm", 2);
    expect(result.props.children[0].props.posts.map((post: { slug: string }) => post.slug)).toEqual([
      "page-two-new",
      "page-two-old",
    ]);
    expect(result.props.children[0].props.description).toContain("51개");
  });

  it("renders a valid last page", async () => {
    routeMocks.loadBackendCategoryPostPage.mockResolvedValue(
      categoryPage({
        posts: [categoryPage().posts[0]],
        currentPage: 3,
        backendPage: 2,
        numberOfItems: 1,
        last: true,
      }),
    );

    const result = await BlogCategoryPaginationPage({
      params: Promise.resolve({ slug: "algorithm", page: "3" }),
    });

    expect(result.type).toBe("div");
    expect(routeMocks.notFound).not.toHaveBeenCalled();
  });

  it("maps an out-of-range empty page to notFound", async () => {
    routeMocks.loadBackendCategoryPostPage.mockResolvedValue(
      categoryPage({ posts: [], empty: true, numberOfItems: 0, outOfRange: true }),
    );

    await expect(
      BlogCategoryPaginationPage({
        params: Promise.resolve({ slug: "algorithm", page: "999" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(routeMocks.notFound).toHaveBeenCalledOnce();
  });

  it.each([
    ["algorithm", "1"],
    ["algorithm", "0"],
    ["algorithm", "1.5"],
    ["algorithm", "abc"],
    ["unknown", "2"],
  ])("rejects invalid category pagination %s/%s before loading", async (slug, page) => {
    await expect(
      BlogCategoryPaginationPage({ params: Promise.resolve({ slug, page }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(routeMocks.loadBackendCategoryPostPage).not.toHaveBeenCalled();
  });
});
