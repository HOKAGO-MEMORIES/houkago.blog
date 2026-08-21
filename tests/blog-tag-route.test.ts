import { beforeEach, describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  loadBackendTagPostPage: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: routeMocks.notFound,
}));

vi.mock("@/lib/backend-tag-post-loader", () => ({
  loadBackendTagPostPage: routeMocks.loadBackendTagPostPage,
}));

import BlogTagPage from "@/app/blog/tag/[tag]/page";
import BlogTagPaginationPage from "@/app/blog/tag/[tag]/page/[page]/page";

function tagPage(overrides = {}) {
  return {
    posts: [
      {
        slug: "graph-new",
        title: "Graph New",
        description: "new",
        category: "algorithm",
        date: "2026-08-17",
        tags: ["graph"],
        featured: false,
      },
      {
        slug: "graph-old",
        title: "Graph Old",
        description: "old",
        category: "algorithm",
        date: "2026-08-16",
        tags: ["graph"],
        featured: false,
      },
    ],
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
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  routeMocks.notFound.mockImplementation(() => {
    throw new Error("NEXT_NOT_FOUND");
  });
  routeMocks.loadBackendTagPostPage.mockResolvedValue(tagPage());
});

describe("blog tag route", () => {
  it("loads the first backend page and preserves count and order", async () => {
    const result = await BlogTagPage({
      params: Promise.resolve({ tag: "graph" }),
    });

    expect(routeMocks.loadBackendTagPostPage).toHaveBeenCalledWith("graph", 1);
    expect(result.props.posts.map((post: { slug: string }) => post.slug))
      .toEqual(["graph-new", "graph-old"]);
    expect(result.props.description).toContain("27개");
  });

  it("decodes a Unicode route segment before loading", async () => {
    await BlogTagPage({
      params: Promise.resolve({
        tag: "%EA%B7%B8%EB%9E%98%ED%94%84%20%ED%83%90%EC%83%89",
      }),
    });

    expect(routeMocks.loadBackendTagPostPage).toHaveBeenCalledWith("그래프 탐색", 1);
  });

  it("keeps the existing unknown tag 404 policy", async () => {
    routeMocks.loadBackendTagPostPage.mockResolvedValue(
      tagPage({
        posts: [],
        totalPages: 0,
        totalItems: 0,
        numberOfItems: 0,
        last: true,
        empty: true,
      }),
    );

    await expect(
      BlogTagPage({ params: Promise.resolve({ tag: "unknown" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it.each(["", "%20", "%E0%A4%A"])(
    "rejects invalid tag segment %s before loading",
    async (tag) => {
      await expect(
        BlogTagPage({ params: Promise.resolve({ tag }) }),
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(routeMocks.loadBackendTagPostPage).not.toHaveBeenCalled();
    },
  );
});

describe("blog tag pagination route", () => {
  it("loads page 2 with backend pagination and order", async () => {
    routeMocks.loadBackendTagPostPage.mockResolvedValue(
      tagPage({ currentPage: 2, backendPage: 1, first: false, last: true }),
    );

    const result = await BlogTagPaginationPage({
      params: Promise.resolve({ tag: "algorithm", page: "2" }),
    });

    expect(routeMocks.loadBackendTagPostPage).toHaveBeenCalledWith("algorithm", 2);
    expect(result.props.posts.map((post: { slug: string }) => post.slug))
      .toEqual(["graph-new", "graph-old"]);
    expect(result.props.description).toContain("27개");
  });

  it("renders a valid last page", async () => {
    routeMocks.loadBackendTagPostPage.mockResolvedValue(
      tagPage({
        posts: [tagPage().posts[0]],
        currentPage: 2,
        backendPage: 1,
        numberOfItems: 1,
        first: false,
        last: true,
      }),
    );

    const result = await BlogTagPaginationPage({
      params: Promise.resolve({ tag: "algorithm", page: "2" }),
    });

    expect(result.type).toBeDefined();
    expect(routeMocks.notFound).not.toHaveBeenCalled();
  });

  it("maps an out-of-range backend page to notFound", async () => {
    routeMocks.loadBackendTagPostPage.mockResolvedValue(
      tagPage({
        posts: [],
        currentPage: 999,
        backendPage: 998,
        numberOfItems: 0,
        empty: true,
        outOfRange: true,
      }),
    );

    await expect(
      BlogTagPaginationPage({
        params: Promise.resolve({ tag: "algorithm", page: "999" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it.each(["1", "0", "-1", "1.5", "abc", "9007199254740992"])(
    "rejects invalid page %s before loading",
    async (page) => {
      await expect(
        BlogTagPaginationPage({
          params: Promise.resolve({ tag: "algorithm", page }),
        }),
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(routeMocks.loadBackendTagPostPage).not.toHaveBeenCalled();
    },
  );

  it("propagates backend errors instead of treating them as missing tags", async () => {
    const error = new Error("backend unavailable");
    routeMocks.loadBackendTagPostPage.mockRejectedValue(error);

    await expect(
      BlogTagPaginationPage({
        params: Promise.resolve({ tag: "algorithm", page: "2" }),
      }),
    ).rejects.toBe(error);
  });
});
