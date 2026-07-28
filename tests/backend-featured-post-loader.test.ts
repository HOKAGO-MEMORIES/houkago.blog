import { describe, expect, it, vi } from "vitest";

import {
  BackendFeaturedPostContractError,
  type BackendFeaturedPostPageFetcher,
  loadBackendFeaturedPosts,
} from "@/lib/backend-featured-post-loader";
import type { BackendPostListItem, BackendPostPage } from "@/types/backend-post";
import {
  backendPostListItemFixture,
  backendPostPageFixture,
  emptyBackendPostPageFixture,
} from "./fixtures/backend-post";

function featuredPost(slug: string, title: string): BackendPostListItem {
  return {
    ...backendPostListItemFixture,
    slug,
    title,
    featured: true,
  };
}

function pageWith(content: readonly BackendPostListItem[]): BackendPostPage {
  return {
    ...backendPostPageFixture,
    content,
    totalElements: content.length,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

describe("backend featured post loader", () => {
  it("requests featured page 0 with size 3 and 300-second revalidation", async () => {
    const fetchPage = vi
      .fn<BackendFeaturedPostPageFetcher>()
      .mockResolvedValue(pageWith([featuredPost("first", "First")]));

    await loadBackendFeaturedPosts(fetchPage);

    expect(fetchPage).toHaveBeenCalledWith(
      { page: 0, size: 3, featured: true },
      { revalidate: 300 },
    );
  });

  it("adapts summaries and preserves backend order", async () => {
    const fetchPage = vi.fn<BackendFeaturedPostPageFetcher>().mockResolvedValue(
      pageWith([
        featuredPost("newer", "Newer"),
        featuredPost("older", "Older"),
      ]),
    );

    const result = await loadBackendFeaturedPosts(fetchPage);

    expect(result.map((post) => post.slug)).toEqual(["newer", "older"]);
    expect(result[0]).toMatchObject({
      date: backendPostListItemFixture.postDate,
      category: backendPostListItemFixture.category,
      featured: true,
    });
    expect(result[0].tags).not.toBe(backendPostListItemFixture.tags);
  });

  it("returns an empty list for an empty featured page", async () => {
    const fetchPage = vi
      .fn<BackendFeaturedPostPageFetcher>()
      .mockResolvedValue(emptyBackendPostPageFixture);

    await expect(loadBackendFeaturedPosts(fetchPage)).resolves.toEqual([]);
  });

  it("accepts at most three featured posts", async () => {
    const fetchPage = vi.fn<BackendFeaturedPostPageFetcher>().mockResolvedValue(
      pageWith([
        featuredPost("first", "First"),
        featuredPost("second", "Second"),
        featuredPost("third", "Third"),
      ]),
    );

    await expect(loadBackendFeaturedPosts(fetchPage)).resolves.toHaveLength(3);
  });

  it("fails closed when the featured query returns a non-featured post", async () => {
    const fetchPage = vi.fn<BackendFeaturedPostPageFetcher>().mockResolvedValue(
      pageWith([
        featuredPost("featured", "Featured"),
        { ...backendPostListItemFixture, slug: "regular", featured: false },
      ]),
    );

    await expect(loadBackendFeaturedPosts(fetchPage)).rejects.toThrow(
      new BackendFeaturedPostContractError(
        "Featured query returned a non-featured post.",
      ),
    );
  });

  it("rejects responses that exceed the requested featured limit", async () => {
    const fetchPage = vi.fn<BackendFeaturedPostPageFetcher>().mockResolvedValue(
      pageWith([
        featuredPost("first", "First"),
        featuredPost("second", "Second"),
        featuredPost("third", "Third"),
        featuredPost("fourth", "Fourth"),
      ]),
    );

    await expect(loadBackendFeaturedPosts(fetchPage)).rejects.toThrow(
      "Featured query returned more than 3 posts.",
    );
  });
});
