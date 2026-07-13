import { describe, expect, it } from "vitest";

import {
  adaptBackendPostDetail,
  adaptBackendPostListItem,
  adaptBackendPostPage,
  BackendPostAdapterError,
  toBackendPageIndex,
  toBackendPagination,
  toFrontendPageIndex,
} from "@/lib/backend-post-adapter";
import {
  backendPostDetailFixture,
  backendPostListItemFixture,
  backendPostPageFixture,
  emptyBackendPostPageFixture,
  nullableBackendPostListItemFixture,
} from "./fixtures/backend-post";

describe("post pagination adapter", () => {
  it("converts frontend one-based pages to backend zero-based pages", () => {
    expect(toBackendPageIndex(1)).toBe(0);
    expect(toBackendPageIndex(2)).toBe(1);
    expect(toBackendPagination(2, 20)).toEqual({ page: 1, size: 20 });
  });

  it("converts backend zero-based pages to frontend one-based pages", () => {
    expect(toFrontendPageIndex(0)).toBe(1);
    expect(toFrontendPageIndex(3)).toBe(4);
  });

  it.each([0, -1, 1.5])("rejects invalid frontend page %s", (page) => {
    expect(() => toBackendPageIndex(page)).toThrow(BackendPostAdapterError);
  });

  it.each([0, -1, 1.5, 51])("rejects invalid page size %s", (size) => {
    expect(() => toBackendPagination(1, size)).toThrow(BackendPostAdapterError);
  });
});

describe("post response adapter", () => {
  it("maps list metadata without sharing the tags array", () => {
    const adapted = adaptBackendPostListItem(backendPostListItemFixture);

    expect(adapted).toEqual({
      slug: "synthetic-post",
      title: "Synthetic Post",
      description: "A small synthetic post used by unit tests.",
      category: "blog",
      date: "2026-07-14",
      updated: "2026-07-15",
      tags: ["backend", "testing"],
      thumbnail: "/images/synthetic.png",
      series: "API migration",
      featured: true,
    });
    expect(adapted.tags).not.toBe(backendPostListItemFixture.tags);
  });

  it("maps nullable metadata to omitted optional values", () => {
    const adapted = adaptBackendPostListItem(nullableBackendPostListItemFixture);

    expect(adapted.updated).toBeUndefined();
    expect(adapted.thumbnail).toBeUndefined();
    expect(adapted.series).toBeUndefined();
  });

  it("preserves raw body and defensively copies detail tags", () => {
    const adapted = adaptBackendPostDetail(backendPostDetailFixture);

    expect(adapted.rawBody).toBe(backendPostDetailFixture.rawBody);
    expect(adapted.tags).toEqual(backendPostDetailFixture.tags);
    expect(adapted.tags).not.toBe(backendPostDetailFixture.tags);
  });

  it("preserves backend order and converts page metadata", () => {
    const adapted = adaptBackendPostPage(backendPostPageFixture);

    expect(adapted.posts.map((post) => post.slug)).toEqual([
      "synthetic-post",
      "nullable-post",
    ]);
    expect(adapted).toMatchObject({
      currentPage: 1,
      backendPage: 0,
      pageSize: 2,
      totalPages: 2,
      totalItems: 3,
      numberOfItems: 2,
      first: true,
      last: false,
      empty: false,
      outOfRange: false,
    });
  });

  it("keeps empty out-of-range information for a future route decision", () => {
    const adapted = adaptBackendPostPage(emptyBackendPostPageFixture);

    expect(adapted.posts).toEqual([]);
    expect(adapted.empty).toBe(true);
    expect(adapted.outOfRange).toBe(true);
  });
});
