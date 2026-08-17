import { describe, expect, it, vi } from "vitest";

import {
  BackendTagPostContractError,
  BackendTagPostInputError,
  createBackendTagPostPageLoader,
} from "@/lib/backend-tag-post-loader";
import { BackendPostHttpError } from "@/lib/backend-post-api";
import type { BackendPostPageFetcher } from "@/lib/backend-post-page-loader";
import {
  backendPostPageFixture,
  emptyBackendPostPageFixture,
} from "./fixtures/backend-post";

function tagPage(tag = "graph") {
  return {
    ...backendPostPageFixture,
    content: backendPostPageFixture.content.map((post, index) => ({
      ...post,
      slug: `${tag}-${index + 1}`,
      tags: [tag],
    })),
    pageable: {
      ...backendPostPageFixture.pageable,
      pageSize: 25,
    },
    size: 25,
  };
}

describe("backend tag post page loader", () => {
  it("loads an exact tag first page with backend pagination and order", async () => {
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockResolvedValue(tagPage());
    const loadTagPage = createBackendTagPostPageLoader(fetchPage);

    const result = await loadTagPage("graph", 1);

    expect(fetchPage).toHaveBeenCalledWith(
      { page: 0, size: 25, tag: "graph" },
      { revalidate: 300 },
    );
    expect(result.posts.map((post) => post.slug)).toEqual([
      "graph-1",
      "graph-2",
    ]);
    expect(result.totalItems).toBe(3);
  });

  it("loads a later tag page without client-side slicing", async () => {
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockResolvedValue({
      ...tagPage("algorithm"),
      number: 1,
      first: false,
      last: false,
    });
    const loadTagPage = createBackendTagPostPageLoader(fetchPage);

    const result = await loadTagPage("algorithm", 2);

    expect(fetchPage).toHaveBeenCalledWith(
      { page: 1, size: 25, tag: "algorithm" },
      { revalidate: 300 },
    );
    expect(result.currentPage).toBe(2);
  });

  it("keeps an empty first page for the route unknown-tag policy", async () => {
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
    const loadTagPage = createBackendTagPostPageLoader(fetchPage);

    const result = await loadTagPage("unknown", 1);

    expect(result.totalItems).toBe(0);
    expect(result.outOfRange).toBe(false);
  });

  it("rejects a prefix-only match instead of weakening exact membership", async () => {
    const fetchPage = vi
      .fn<BackendPostPageFetcher>()
      .mockResolvedValue(tagPage("graph-theory"));
    const loadTagPage = createBackendTagPostPageLoader(fetchPage);

    await expect(loadTagPage("graph", 1)).rejects.toBeInstanceOf(
      BackendTagPostContractError,
    );
  });

  it("rejects a blank tag before fetching", async () => {
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockResolvedValue(tagPage());
    const loadTagPage = createBackendTagPostPageLoader(fetchPage);

    await expect(loadTagPage("   ", 1)).rejects.toBeInstanceOf(
      BackendTagPostInputError,
    );
    expect(fetchPage).not.toHaveBeenCalled();
  });

  it("propagates backend failures without a local fallback", async () => {
    const error = new BackendPostHttpError(500, "/api/posts");
    const fetchPage = vi.fn<BackendPostPageFetcher>().mockRejectedValue(error);
    const loadTagPage = createBackendTagPostPageLoader(fetchPage);

    await expect(loadTagPage("graph", 1)).rejects.toBe(error);
  });
});
