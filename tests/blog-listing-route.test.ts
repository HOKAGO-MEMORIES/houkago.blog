import { beforeEach, describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  connection: vi.fn(),
  loadBackendPostPage: vi.fn(),
  loadBackendCategoryHighlights: vi.fn(),
}));

vi.mock("next/server", () => ({
  connection: routeMocks.connection,
}));

vi.mock("@/lib/backend-post-page-loader", () => ({
  loadBackendPostPage: routeMocks.loadBackendPostPage,
}));

vi.mock("@/lib/backend-category-highlights-loader", () => ({
  loadBackendCategoryHighlights: routeMocks.loadBackendCategoryHighlights,
}));

import BlogPage from "@/app/blog/page";

const featuredPost = {
  slug: "featured-post",
  title: "Featured Post",
  description: "featured",
  category: "blog" as const,
  date: "2026-08-17",
  tags: [],
  featured: true,
};

const regularPost = {
  ...featuredPost,
  slug: "regular-post",
  title: "Regular Post",
  featured: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  routeMocks.loadBackendPostPage.mockResolvedValue({
    posts: [featuredPost, regularPost],
    currentPage: 1,
    backendPage: 0,
    pageSize: 25,
    totalPages: 2,
    totalItems: 27,
    numberOfItems: 2,
    first: true,
    last: false,
    empty: false,
    outOfRange: false,
  });
  routeMocks.loadBackendCategoryHighlights.mockResolvedValue([]);
});

describe("blog listing route", () => {
  it("uses only the current backend page for the lead post and avoids a duplicate archive row", async () => {
    const result = await BlogPage();

    expect(routeMocks.connection).toHaveBeenCalledOnce();
    expect(routeMocks.loadBackendPostPage).toHaveBeenCalledWith({
      frontendPage: 1,
      pageSize: 25,
    });
    expect(result.props.featuredPost.slug).toBe("featured-post");
    expect(result.props.posts.map((post: { slug: string }) => post.slug)).toEqual([
      "regular-post",
    ]);
    expect(result.props.totalItems).toBe(27);
  });

  it("does not promote the first post when the backend page has no featured post", async () => {
    routeMocks.loadBackendPostPage.mockResolvedValue({
      posts: [regularPost],
      currentPage: 1,
      backendPage: 0,
      pageSize: 25,
      totalPages: 1,
      totalItems: 1,
      numberOfItems: 1,
      first: true,
      last: true,
      empty: false,
      outOfRange: false,
    });

    const result = await BlogPage();

    expect(result.props.featuredPost).toBeUndefined();
    expect(result.props.posts).toEqual([regularPost]);
  });
});
