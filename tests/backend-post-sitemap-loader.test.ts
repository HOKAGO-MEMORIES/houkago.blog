import { describe, expect, it, vi } from "vitest";

import {
  BackendPostSitemapContractError,
  loadBackendSitemapPosts,
  type BackendSitemapPageFetcher,
} from "@/lib/backend-post-sitemap-loader";
import { DEFAULT_POST_REVALIDATE_SECONDS } from "@/lib/backend-post-api";
import type { BackendPostListItem, BackendPostPage } from "@/types/backend-post";
import {
  backendPostListItemFixture,
  backendSortFixture,
  nullableBackendPostListItemFixture,
} from "./fixtures/backend-post";

describe("backend post sitemap loader", () => {
  it("loads every public page and prefers updated over postDate", async () => {
    const items = [
      backendPostListItemFixture,
      nullableBackendPostListItemFixture,
      ...Array.from({ length: 99 }, (_, index) =>
        post(`post-${index + 3}`, "2026-07-13", null),
      ),
    ];
    const fetchPage = vi.fn<BackendSitemapPageFetcher>(({ page }) =>
      Promise.resolve(pageFixture(page, items.slice(page * 50, (page + 1) * 50), 3, 101)),
    );

    const result = await loadBackendSitemapPosts(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage.mock.calls.map(([input, options]) => ({ input, options }))).toEqual([
      { input: { page: 0, size: 50 }, options: { revalidate: DEFAULT_POST_REVALIDATE_SECONDS } },
      { input: { page: 1, size: 50 }, options: { revalidate: DEFAULT_POST_REVALIDATE_SECONDS } },
      { input: { page: 2, size: 50 }, options: { revalidate: DEFAULT_POST_REVALIDATE_SECONDS } },
    ]);
    expect(result).toHaveLength(101);
    expect(result.slice(0, 2)).toEqual([
      { slug: "synthetic-post", lastModified: "2026-07-15" },
      { slug: "nullable-post", lastModified: "2026-07-14" },
    ]);
    expect(result.at(-1)).toEqual({ slug: "post-101", lastModified: "2026-07-13" });
  });

  it("keeps an empty public dataset valid", async () => {
    const fetchPage = vi.fn<BackendSitemapPageFetcher>(() =>
      Promise.resolve(pageFixture(0, [], 0, 0)),
    );

    await expect(loadBackendSitemapPosts(fetchPage)).resolves.toEqual([]);
    expect(fetchPage).toHaveBeenCalledOnce();
  });

  it("rejects inconsistent pagination instead of publishing a partial sitemap", async () => {
    const fetchPage = vi.fn<BackendSitemapPageFetcher>(() =>
      Promise.resolve(pageFixture(0, [backendPostListItemFixture], 2, 1)),
    );

    await expect(loadBackendSitemapPosts(fetchPage)).rejects.toBeInstanceOf(
      BackendPostSitemapContractError,
    );
  });

  it("rejects duplicate slugs across pages", async () => {
    const firstPage = Array.from({ length: 50 }, (_, index) =>
      post(`post-${index}`, "2026-07-14", null),
    );
    const fetchPage = vi.fn<BackendSitemapPageFetcher>(({ page }) => Promise.resolve(
      pageFixture(
        page,
        page === 0 ? firstPage : [firstPage[0]],
        2,
        51,
      ),
    ));

    await expect(loadBackendSitemapPosts(fetchPage)).rejects.toBeInstanceOf(
      BackendPostSitemapContractError,
    );
  });

  it("propagates Backend failures without a generated fallback", async () => {
    const failure = new Error("backend unavailable");
    const fetchPage = vi.fn<BackendSitemapPageFetcher>().mockRejectedValue(failure);

    await expect(loadBackendSitemapPosts(fetchPage)).rejects.toBe(failure);
  });
});

function post(slug: string, postDate: string, updated: string | null): BackendPostListItem {
  return { ...backendPostListItemFixture, slug, postDate, updated };
}

function pageFixture(
  number: number,
  content: readonly BackendPostListItem[],
  totalPages: number,
  totalElements: number,
): BackendPostPage {
  return {
    content,
    pageable: {
      pageNumber: number,
      pageSize: 50,
      sort: backendSortFixture,
      offset: number * 50,
      paged: true,
      unpaged: false,
    },
    last: totalPages === 0 || number === totalPages - 1,
    totalPages,
    totalElements,
    size: 50,
    number,
    sort: backendSortFixture,
    first: number === 0,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}
