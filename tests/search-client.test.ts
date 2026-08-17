import { describe, expect, it, vi } from "vitest";

import {
  SearchResponseContractError,
  fetchSearchResults,
  normalizeSearchQuery,
  parseSearchResponse,
} from "@/lib/search-client";
import {
  MAX_POST_SEARCH_QUERY_LENGTH,
  SEARCH_RESULT_PAGE_SIZE,
} from "@/lib/post-search-contract";

const validResponse = {
  items: [
    {
      slug: "boj-1002",
      title: "BOJ 1002 - 터렛",
      description: "위잉..위잉..",
      category: "algorithm",
      date: "2023-03-05",
    },
  ],
  totalElements: 1,
  page: 0,
  size: SEARCH_RESULT_PAGE_SIZE,
  totalPages: 1,
};

describe("browser search client", () => {
  it("uses the same-origin route, encodes Unicode spaces, and requests one no-store page", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(validResponse));
    const controller = new AbortController();

    const response = await fetchSearchResults("  최단 경로  ", {
      fetchImpl: fetchMock,
      signal: controller.signal,
    });

    expect(response).toEqual(validResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/search?q=%EC%B5%9C%EB%8B%A8+%EA%B2%BD%EB%A1%9C&page=0&size=${SEARCH_RESULT_PAGE_SIZE}`,
      { cache: "no-store", signal: controller.signal },
    );
  });

  it("preserves Backend item order and bounded metadata", () => {
    const response = parseSearchResponse({
      ...validResponse,
      items: [
        { ...validResponse.items[0], slug: "newer", title: "Newer" },
        { ...validResponse.items[0], slug: "older", title: "Older" },
      ],
      totalElements: 9,
      size: 20,
      totalPages: 1,
    });

    expect(response.items.map((item) => item.slug)).toEqual(["newer", "older"]);
    expect(response.totalElements).toBe(9);
  });

  it.each(["", "   "])("rejects a blank query without fetching: %j", async (query) => {
    const fetchMock = vi.fn();

    await expect(fetchSearchResults(query, { fetchImpl: fetchMock })).rejects.toBeInstanceOf(
      RangeError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an overlong query without fetching", async () => {
    const fetchMock = vi.fn();

    await expect(fetchSearchResults(
      "x".repeat(MAX_POST_SEARCH_QUERY_LENGTH + 1),
      { fetchImpl: fetchMock },
    )).rejects.toBeInstanceOf(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([400, 500])("preserves an HTTP %s failure", async (status) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status }));

    const promise = fetchSearchResults("query", { fetchImpl: fetchMock });

    await expect(promise).rejects.toMatchObject({ status });
  });

  it("propagates a network failure", async () => {
    const error = new TypeError("network unavailable");
    const fetchMock = vi.fn().mockRejectedValue(error);

    await expect(fetchSearchResults("query", { fetchImpl: fetchMock })).rejects.toBe(error);
  });

  it("rejects invalid JSON and invalid response fields", async () => {
    const invalidJsonFetch = vi.fn().mockResolvedValue(new Response("not-json"));

    await expect(fetchSearchResults("query", { fetchImpl: invalidJsonFetch }))
      .rejects.toBeInstanceOf(SearchResponseContractError);
    expect(() => parseSearchResponse({ ...validResponse, totalElements: "1" }))
      .toThrowError(SearchResponseContractError);
  });

  it("normalizes outer whitespace without changing internal spaces", () => {
    expect(normalizeSearchQuery("  Spring   Boot  ")).toBe("Spring   Boot");
  });
});
