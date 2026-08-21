import { beforeEach, describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  loadBackendPostDetail: vi.fn(),
  loadBackendCategoryPostPage: vi.fn(),
  loadBackendCategoryHighlights: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: routeMocks.notFound,
}));

vi.mock("@/lib/backend-post-detail-loader", () => ({
  loadBackendPostDetail: routeMocks.loadBackendPostDetail,
}));

vi.mock("@/lib/backend-category-post-loader", () => ({
  loadBackendCategoryPostPage: routeMocks.loadBackendCategoryPostPage,
}));

vi.mock("@/lib/backend-category-highlights-loader", () => ({
  loadBackendCategoryHighlights: routeMocks.loadBackendCategoryHighlights,
}));

vi.mock("@/lib/post-navigation", () => ({
  BLOG_CATEGORIES: ["algorithm", "project", "cs", "blog"],
  getCategoryPageRoute: (category: string, page: number) =>
    page <= 1 ? `/blog/${category}` : `/blog/${category}/page/${page}`,
  getCategoryDisplayLabel: (category: string) => category,
  getCategorySummary: (category: string) => `${category} summary`,
  getCategoryRoute: (category: string) => `/blog/${category}`,
  getPostRoute: (post: { slug: string }) => `/blog/${post.slug}`,
  getTagRoute: (tag: string) => `/blog/tag/${tag}`,
  isCategorySegment: (segment: string) =>
    ["algorithm", "project", "cs", "blog"].includes(segment),
}));

vi.mock("@/components/mdx/blog-components", () => ({
  blogMDXComponents: {},
}));

vi.mock("@/components/mdx-content", () => ({
  MDXContent: () => null,
}));

import BlogSegmentPage, { generateMetadata } from "@/app/blog/[slug]/page";

const loadedDetail = {
  post: {
    slug: "synthetic-post",
    title: "Synthetic Post",
    description: "Backend detail route fixture.",
    category: "blog" as const,
    date: "2026-08-17",
    updated: "2026-08-18",
    tags: ["backend", "detail"],
    thumbnail: "https://assets.example.test/assets/posts/synthetic-post/cover.png",
    series: "Migration",
    featured: true,
    rawBody: "# Runtime detail",
    assetBaseUrl: "https://assets.example.test/assets/posts/synthetic-post/",
  },
  mdxSource: {
    compiledSource: "return { default: function MDXContent() {} }",
    frontmatter: {},
    scope: {},
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  routeMocks.notFound.mockImplementation(() => {
    throw new Error("NEXT_NOT_FOUND");
  });
  routeMocks.loadBackendPostDetail.mockResolvedValue(loadedDetail);
  routeMocks.loadBackendCategoryHighlights.mockResolvedValue([]);
  routeMocks.loadBackendCategoryPostPage.mockResolvedValue({
    posts: [
      { ...loadedDetail.post, slug: "category-new" },
      { ...loadedDetail.post, slug: "category-old" },
    ],
    currentPage: 1,
    backendPage: 0,
    pageSize: 25,
    totalPages: 1,
    totalItems: 2,
    numberOfItems: 2,
    first: true,
    last: true,
    empty: false,
    outOfRange: false,
  });
});

describe("blog detail route backend cutover", () => {
  it("keeps reserved category segments on the backend category branch", async () => {
    const result = await BlogSegmentPage({
      params: Promise.resolve({ slug: "algorithm" }),
    });

    expect(result.props.activeCategory).toBe("algorithm");
    expect(routeMocks.loadBackendCategoryPostPage).toHaveBeenCalledWith("algorithm", 1);
    expect(result.props.posts.map((post: { slug: string }) => post.slug)).toEqual([
      "category-new",
      "category-old",
    ]);
    expect(routeMocks.loadBackendPostDetail).not.toHaveBeenCalled();
  });

  it("uses backend category totals in category metadata", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "algorithm" }),
    });

    expect(metadata.description).toContain("2개");
    expect(routeMocks.loadBackendCategoryPostPage).toHaveBeenCalledWith("algorithm", 1);
  });

  it("renders a known empty category instead of treating it as an error", async () => {
    routeMocks.loadBackendCategoryPostPage.mockResolvedValue({
      posts: [],
      currentPage: 1,
      backendPage: 0,
      pageSize: 25,
      totalPages: 0,
      totalItems: 0,
      numberOfItems: 0,
      first: true,
      last: true,
      empty: true,
      outOfRange: false,
    });

    const result = await BlogSegmentPage({
      params: Promise.resolve({ slug: "project" }),
    });

    expect(result.props.posts).toEqual([]);
    expect(routeMocks.notFound).not.toHaveBeenCalled();
    expect(routeMocks.loadBackendPostDetail).not.toHaveBeenCalled();
  });

  it("renders a public post and metadata from the backend detail loader", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "synthetic-post" }),
    });
    const result = await BlogSegmentPage({
      params: Promise.resolve({ slug: "synthetic-post" }),
    });

    const article = result.props.children[1];
    const [breadcrumb, hero, layout] = article.props.children;

    expect(article.type).toBe("article");
    expect(article.props.className).toBe("post-detail-page");
    expect(breadcrumb.props.children[0].props.children).toBe("블로그");
    expect(hero.props.children[0].props.children[0].props.children).toBe(
      "BLOG NOTE",
    );
    expect(layout.props.children[0].props.className).toBe(
      "post-detail-context-rail",
    );
    expect(metadata).toMatchObject({
      title: "Synthetic Post | 방과후 블로그",
      description: "Backend detail route fixture.",
      alternates: { canonical: "/blog/synthetic-post" },
      openGraph: {
        images: [
          {
            url: "https://assets.example.test/assets/posts/synthetic-post/cover.png",
            alt: "Synthetic Post",
          },
        ],
      },
    });
    expect(routeMocks.loadBackendPostDetail).toHaveBeenNthCalledWith(1, "synthetic-post");
    expect(routeMocks.loadBackendPostDetail).toHaveBeenNthCalledWith(2, "synthetic-post");
  });

  it("maps only a missing backend detail result to notFound", async () => {
    routeMocks.loadBackendPostDetail.mockResolvedValue(null);

    await expect(
      BlogSegmentPage({ params: Promise.resolve({ slug: "missing-post" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(routeMocks.notFound).toHaveBeenCalledOnce();
  });
});
