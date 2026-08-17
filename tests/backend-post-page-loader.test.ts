import { describe, expect, it, vi } from "vitest";

import {
  BackendPostApiError,
  BackendPostContractError,
  BackendPostHttpError,
  BackendPostInvalidJsonError,
} from "@/lib/backend-post-api";
import { BackendPostAdapterError } from "@/lib/backend-post-adapter";
import {
  loadBackendPostPage,
  parsePaginatedBlogPageParam,
  type BackendPostPageFetcher,
} from "@/lib/backend-post-page-loader";
import {
  backendPostPageFixture,
  emptyBackendPostPageFixture,
} from "./fixtures/backend-post";

describe("backend post page loader", () => {
  it("loads the blog main first page as backend page 0", async () => {
    const fetchPage = vi
      .fn<BackendPostPageFetcher>()
      .mockResolvedValue(backendPostPageFixture);

    const result = await loadBackendPostPage({
      frontendPage: 1,
      pageSize: 25,
      fetchPage,
    });

    expect(fetchPage).toHaveBeenCalledWith(
      { page: 0, size: 25 },
      { revalidate: 300 },
    );
    expect(result.currentPage).toBe(1);
    expect(result.totalItems).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it("loads frontend page 2 as backend page 1 with the current page size and revalidation", async () => {
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockResolvedValue({
      ...backendPostPageFixture,
      number: 1,
      first: false,
      last: true,
    });

    const result = await loadBackendPostPage({
      frontendPage: 2,
      pageSize: 25,
      fetchPage,
    });

    expect(fetchPage).toHaveBeenCalledWith(
      { page: 1, size: 25 },
      { revalidate: 300 },
    );
    expect(result.currentPage).toBe(2);
    expect(result.posts.map((post) => post.slug)).toEqual([
      "synthetic-post",
      "nullable-post",
    ]);
  });

  it("passes an exact category filter through to the backend page request", async () => {
    const fetchPage = vi
      .fn<BackendPostPageFetcher>()
      .mockResolvedValue(backendPostPageFixture);

    await loadBackendPostPage({
      frontendPage: 2,
      pageSize: 25,
      category: "algorithm",
      fetchPage,
    });

    expect(fetchPage).toHaveBeenCalledWith(
      { page: 1, size: 25, category: "algorithm" },
      { revalidate: 300 },
    );
  });

  it("preserves an out-of-range page result for the route to handle", async () => {
    const fetchPage = vi
      .fn<BackendPostPageFetcher>()
      .mockResolvedValue(emptyBackendPostPageFixture);

    const result = await loadBackendPostPage({
      frontendPage: 3,
      pageSize: 25,
      fetchPage,
    });

    expect(result.empty).toBe(true);
    expect(result.outOfRange).toBe(true);
  });

  it("rejects invalid frontend pages before fetching", async () => {
    const fetchPage = vi
      .fn<BackendPostPageFetcher>()
      .mockResolvedValue(backendPostPageFixture);

    await expect(
      loadBackendPostPage({ frontendPage: 0, pageSize: 25, fetchPage }),
    ).rejects.toBeInstanceOf(BackendPostAdapterError);
    expect(fetchPage).not.toHaveBeenCalled();
  });

  it.each([
    new BackendPostHttpError(500, "/api/posts"),
    new BackendPostApiError("request failed", "/api/posts"),
    new BackendPostInvalidJsonError("/api/posts"),
    new BackendPostContractError("content[0].slug"),
  ])("propagates backend failures without fallback", async (error) => {
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockRejectedValue(error);

    await expect(
      loadBackendPostPage({ frontendPage: 2, pageSize: 25, fetchPage }),
    ).rejects.toBe(error);
  });
});

describe("paginated blog page param parser", () => {
  it("parses a positive integer page", () => {
    expect(parsePaginatedBlogPageParam("2")).toBe(2);
  });

  it.each(["0", "-1", "1.5", "abc", "", "9007199254740992"])(
    "rejects invalid page param %s",
    (value) => {
      expect(parsePaginatedBlogPageParam(value)).toBeNull();
    },
  );
});
