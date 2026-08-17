import { describe, expect, it, vi } from "vitest";

import {
  BackendCategoryPostContractError,
  createBackendCategoryPostPageLoader,
} from "@/lib/backend-category-post-loader";
import { BackendPostHttpError } from "@/lib/backend-post-api";
import type { BackendPostPageFetcher } from "@/lib/backend-post-page-loader";
import {
  backendPostPageFixture,
  emptyBackendPostPageFixture,
} from "./fixtures/backend-post";

function algorithmPage() {
  return {
    ...backendPostPageFixture,
    content: backendPostPageFixture.content.map((post, index) => ({
      ...post,
      slug: `algorithm-${index + 1}`,
      category: "algorithm",
    })),
    pageable: {
      ...backendPostPageFixture.pageable,
      pageSize: 25,
    },
    size: 25,
  };
}

describe("backend category post page loader", () => {
  it("loads a known category first page with backend pagination and order", async () => {
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockResolvedValue(algorithmPage());
    const loadCategoryPage = createBackendCategoryPostPageLoader(fetchPage);

    const result = await loadCategoryPage("algorithm", 1);

    expect(fetchPage).toHaveBeenCalledWith(
      { page: 0, size: 25, category: "algorithm" },
      { revalidate: 300 },
    );
    expect(result.posts.map((post) => post.slug)).toEqual([
      "algorithm-1",
      "algorithm-2",
    ]);
    expect(result.currentPage).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it("loads the next category page without client-side slicing", async () => {
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockResolvedValue({
      ...algorithmPage(),
      number: 1,
      first: false,
      last: true,
    });
    const loadCategoryPage = createBackendCategoryPostPageLoader(fetchPage);

    const result = await loadCategoryPage("algorithm", 2);

    expect(fetchPage).toHaveBeenCalledWith(
      { page: 1, size: 25, category: "algorithm" },
      { revalidate: 300 },
    );
    expect(result.currentPage).toBe(2);
    expect(result.last).toBe(true);
  });

  it("keeps an empty first page as a valid category result", async () => {
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockResolvedValue({
      ...emptyBackendPostPageFixture,
      pageable: {
        ...emptyBackendPostPageFixture.pageable,
        pageNumber: 0,
        pageSize: 25,
        offset: 0,
      },
      number: 0,
      size: 25,
      totalPages: 0,
      totalElements: 0,
      numberOfElements: 0,
      first: true,
    });
    const loadCategoryPage = createBackendCategoryPostPageLoader(fetchPage);

    const result = await loadCategoryPage("project", 1);

    expect(result.posts).toEqual([]);
    expect(result.totalItems).toBe(0);
    expect(result.outOfRange).toBe(false);
  });

  it("rejects a category response containing a different category", async () => {
    const fetchPage = vi
      .fn<BackendPostPageFetcher>()
      .mockResolvedValue(backendPostPageFixture);
    const loadCategoryPage = createBackendCategoryPostPageLoader(fetchPage);

    await expect(loadCategoryPage("algorithm", 1)).rejects.toBeInstanceOf(
      BackendCategoryPostContractError,
    );
  });

  it("propagates backend failures without a local fallback", async () => {
    const error = new BackendPostHttpError(500, "/api/posts");
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockRejectedValue(error);
    const loadCategoryPage = createBackendCategoryPostPageLoader(fetchPage);

    await expect(loadCategoryPage("algorithm", 1)).rejects.toBe(error);
  });
});
