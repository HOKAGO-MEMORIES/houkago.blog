import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BackendPostApiError,
  BackendPostConfigurationError,
  BackendPostContractError,
  BackendPostHttpError,
} from "@/lib/backend-post-api";
import { MAX_POST_SEARCH_QUERY_LENGTH } from "@/lib/post-search-contract";
import {
  backendPostPageFixture,
  backendSortFixture,
} from "./fixtures/backend-post";
import type { BackendPostPage } from "@/types/backend-post";

const routeMocks = vi.hoisted(() => ({
  fetchPostPage: vi.fn(),
}));

vi.mock("@/lib/backend-post-api", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/backend-post-api")>();
  return {
    ...original,
    fetchPostPage: routeMocks.fetchPostPage,
  };
});

import { GET } from "@/app/api/search/route";

const ENDPOINT = "http://localhost/api/search";

beforeEach(() => {
  vi.clearAllMocks();
  routeMocks.fetchPostPage.mockResolvedValue(backendPostPageFixture);
});

describe("same-origin search route", () => {
  it("trims a Unicode query and forwards page, size, no-store, and the request signal", async () => {
    const request = new Request(`${ENDPOINT}?q=%20%20%EC%B5%9C%EC%86%9F%EA%B0%92%20%20&page=2&size=7`);

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(routeMocks.fetchPostPage).toHaveBeenCalledWith(
      { q: "최솟값", page: 2, size: 7 },
      { cache: "no-store", signal: request.signal },
    );
    await expect(response.json()).resolves.toEqual({
      items: [
        {
          slug: "synthetic-post",
          title: "Synthetic Post",
          description: "A small synthetic post used by unit tests.",
          category: "blog",
          date: "2026-07-14",
        },
        {
          slug: "nullable-post",
          title: "Nullable Post",
          description: "A small synthetic post used by unit tests.",
          category: "blog",
          date: "2026-07-14",
        },
      ],
      totalElements: 3,
      page: 0,
      size: 2,
      totalPages: 2,
    });
  });

  it("uses bounded page defaults and preserves an empty result", async () => {
    const emptyPage: BackendPostPage = {
      content: [],
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: backendSortFixture,
        offset: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: 20,
      number: 0,
      sort: backendSortFixture,
      first: true,
      numberOfElements: 0,
      empty: true,
    };
    routeMocks.fetchPostPage.mockResolvedValue(emptyPage);

    const response = await GET(new Request(`${ENDPOINT}?q=unknown`));

    expect(routeMocks.fetchPostPage).toHaveBeenCalledWith(
      { q: "unknown", page: 0, size: 20 },
      expect.objectContaining({ cache: "no-store" }),
    );
    await expect(response.json()).resolves.toEqual({
      items: [],
      totalElements: 0,
      page: 0,
      size: 20,
      totalPages: 0,
    });
  });

  it.each([
    `${ENDPOINT}`,
    `${ENDPOINT}?q=`,
    `${ENDPOINT}?q=%20%20%20`,
    `${ENDPOINT}?q=valid&page=-1`,
    `${ENDPOINT}?q=valid&page=1.5`,
    `${ENDPOINT}?q=valid&size=0`,
    `${ENDPOINT}?q=valid&size=51`,
  ])("rejects invalid input before calling the Backend: %s", async (url) => {
    const response = await GET(new Request(url));

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(routeMocks.fetchPostPage).not.toHaveBeenCalled();
  });

  it("rejects an overlong query before calling the Backend", async () => {
    const query = "x".repeat(MAX_POST_SEARCH_QUERY_LENGTH + 1);

    const response = await GET(new Request(`${ENDPOINT}?q=${query}`));

    expect(response.status).toBe(400);
    expect(routeMocks.fetchPostPage).not.toHaveBeenCalled();
  });

  it.each([
    [new BackendPostHttpError(400, "/api/posts"), 400],
    [new BackendPostHttpError(429, "/api/posts"), 429],
    [new BackendPostHttpError(503, "/api/posts"), 502],
    [new BackendPostApiError("network failure", "/api/posts"), 502],
    [new BackendPostContractError("content[0].slug"), 502],
    [new TypeError("connection failed"), 502],
    [new BackendPostConfigurationError("missing base URL"), 503],
  ])("maps a Backend failure to HTTP %s", async (error, expectedStatus) => {
    routeMocks.fetchPostPage.mockRejectedValue(error);

    const response = await GET(new Request(`${ENDPOINT}?q=valid`));

    expect(response.status).toBe(expectedStatus);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
