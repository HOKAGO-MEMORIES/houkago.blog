import { beforeEach, describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  loadBackendPostDetail: vi.fn(),
  getStaticCategorySegments: vi.fn(),
  getCategoryPagination: vi.fn(),
  getVisiblePostsByCategory: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: routeMocks.notFound,
}));

vi.mock("@/lib/backend-post-detail-loader", () => ({
  loadBackendPostDetail: routeMocks.loadBackendPostDetail,
}));

vi.mock("@/lib/posts", () => ({
  POSTS_PER_PAGE: 25,
  getCategoryPageRoute: (category: string, page: number) =>
    page <= 1 ? `/blog/${category}` : `/blog/${category}/page/${page}`,
  getCategoryPagination: routeMocks.getCategoryPagination,
  getCategorySummary: (category: string) => `${category} summary`,
  getCategoryRoute: (category: string) => `/blog/${category}`,
  getPostRoute: (post: { slug: string }) => `/blog/${post.slug}`,
  getStaticCategorySegments: routeMocks.getStaticCategorySegments,
  getVisiblePostsByCategory: routeMocks.getVisiblePostsByCategory,
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

import BlogSegmentPage, {
  generateMetadata,
  generateStaticParams,
} from "@/app/blog/[slug]/page";

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
  routeMocks.getStaticCategorySegments.mockReturnValue([
    { slug: "algorithm" },
    { slug: "blog" },
  ]);
  routeMocks.getVisiblePostsByCategory.mockReturnValue([{ slug: "category-post" }]);
  routeMocks.getCategoryPagination.mockReturnValue({
    posts: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
  });
});

describe("blog detail route backend cutover", () => {
  it("pre-generates only category segments without loading backend details", () => {
    expect(generateStaticParams()).toEqual([
      { slug: "algorithm" },
      { slug: "blog" },
    ]);
    expect(routeMocks.loadBackendPostDetail).not.toHaveBeenCalled();
  });

  it("keeps reserved category segments on the local category branch", async () => {
    const result = await BlogSegmentPage({
      params: Promise.resolve({ slug: "algorithm" }),
    });

    expect(result.type).toBe("div");
    expect(routeMocks.getCategoryPagination).toHaveBeenCalledWith("algorithm", 1);
    expect(routeMocks.loadBackendPostDetail).not.toHaveBeenCalled();
  });

  it("renders a public post and metadata from the backend detail loader", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "synthetic-post" }),
    });
    const result = await BlogSegmentPage({
      params: Promise.resolve({ slug: "synthetic-post" }),
    });

    expect(result.type).toBe("article");
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
