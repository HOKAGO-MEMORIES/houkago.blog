import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BackendPostApiError,
  type BackendPostFetch,
  BackendPostConfigurationError,
  BackendPostContractError,
  BackendPostHttpError,
  BackendPostInputError,
  BackendPostInvalidJsonError,
  DEFAULT_POST_REVALIDATE_SECONDS,
  MAX_POST_SEARCH_QUERY_LENGTH,
  type BackendPostRequestOptions,
  createBackendPostApiClient,
  fetchPostPage,
} from "@/lib/backend-post-api";
import { BACKEND_POSTS_CACHE_TAG } from "@/lib/backend-post-cache";
import {
  backendPostDetailFixture,
  backendPostPageFixture,
} from "./fixtures/backend-post";

const validCacheOption: BackendPostRequestOptions = { cache: "no-store" };
void validCacheOption;

// @ts-expect-error Only the supported fetch cache modes belong in request options.
const invalidCacheOption: BackendPostRequestOptions = { cache: "reload" };
void invalidCacheOption;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createFetchMock(response: Response) {
  return vi.fn<BackendPostFetch>().mockResolvedValue(response);
}

function readFetchCall(fetchMock: ReturnType<typeof createFetchMock>) {
  const [input, init] = fetchMock.mock.calls[0];
  return {
    url: String(input),
    init,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("backend post API success and contract parsing", () => {
  it("requests and parses a zero-based post page", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test/",
      fetchImpl: fetchMock,
    });

    const result = await client.fetchPostPage({ page: 0, size: 2 });
    const call = readFetchCall(fetchMock);

    expect(call.url).toBe("https://example.test/api/posts?page=0&size=2");
    expect(result.content[0].slug).toBe("synthetic-post");
    expect(result.content[1].updated).toBeNull();
    expect(result.content[0].tags).toEqual(["backend", "testing"]);
  });

  it("reports fetch, JSON parse, and contract validation timing without changing fetch options", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const onTiming = vi.fn();
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({ page: 0, size: 2 }, { onTiming });

    expect(onTiming).toHaveBeenCalledOnce();
    expect(onTiming).toHaveBeenCalledWith({
      backendFetchMs: expect.any(Number),
      jsonParseMs: expect.any(Number),
      contractValidationMs: expect.any(Number),
    });
    const timing = onTiming.mock.calls[0][0];
    expect(timing.backendFetchMs).toBeGreaterThanOrEqual(0);
    expect(timing.jsonParseMs).toBeGreaterThanOrEqual(0);
    expect(timing.contractValidationMs).toBeGreaterThanOrEqual(0);

    const call = readFetchCall(fetchMock);
    expect(call.init?.next).toEqual({
      revalidate: DEFAULT_POST_REVALIDATE_SECONDS,
      tags: [BACKEND_POSTS_CACHE_TAG],
    });
    expect(call.init).not.toHaveProperty("onTiming");
  });

  it.each([
    [undefined, "https://example.test/api/posts?page=0&size=3"],
    [true, "https://example.test/api/posts?page=0&size=3&featured=true"],
    [false, "https://example.test/api/posts?page=0&size=3&featured=false"],
  ])("serializes the optional featured filter as %s", async (featured, expectedUrl) => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({ page: 0, size: 3, featured });

    expect(readFetchCall(fetchMock).url).toBe(expectedUrl);
    expect(readFetchCall(fetchMock).init?.next?.tags).toEqual([
      BACKEND_POSTS_CACHE_TAG,
    ]);
  });

  it("encodes the optional category filter with page, size, and cache tag", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({ page: 1, size: 25, category: "project notes" });

    const call = readFetchCall(fetchMock);
    expect(call.url).toBe(
      "https://example.test/api/posts?page=1&size=25&category=project+notes",
    );
    expect(call.init?.next?.revalidate).toBe(DEFAULT_POST_REVALIDATE_SECONDS);
    expect(call.init?.next?.tags).toEqual([BACKEND_POSTS_CACHE_TAG]);
  });

  it("serializes category and featured filters together", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({
      page: 0,
      size: 3,
      featured: true,
      category: "algorithm",
    });

    expect(readFetchCall(fetchMock).url).toBe(
      "https://example.test/api/posts?page=0&size=3&featured=true&category=algorithm",
    );
  });

  it("encodes a Unicode tag with page, size, and cache contract", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({ page: 1, size: 25, tag: "그래프 탐색" });

    const call = readFetchCall(fetchMock);
    expect(call.url).toBe(
      "https://example.test/api/posts?page=1&size=25&tag=%EA%B7%B8%EB%9E%98%ED%94%84+%ED%83%90%EC%83%89",
    );
    expect(call.init?.next?.revalidate).toBe(DEFAULT_POST_REVALIDATE_SECONDS);
    expect(call.init?.next?.tags).toEqual([BACKEND_POSTS_CACHE_TAG]);
  });

  it("serializes tag, category, and featured filters together", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({
      page: 0,
      size: 3,
      featured: true,
      category: "project",
      tag: "spring",
    });

    expect(readFetchCall(fetchMock).url).toBe(
      "https://example.test/api/posts?page=0&size=3&featured=true&category=project&tag=spring",
    );
  });

  it("trims and encodes a Unicode search query with no-store by default", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({ page: 0, size: 25, q: "  최단 경로  " });

    const call = readFetchCall(fetchMock);
    expect(call.url).toBe(
      "https://example.test/api/posts?page=0&size=25&q=%EC%B5%9C%EB%8B%A8+%EA%B2%BD%EB%A1%9C",
    );
    expect(call.init?.cache).toBe("no-store");
    expect(call.init?.next).toBeUndefined();
  });

  it("serializes q with category, tag, featured, page, and size", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({
      page: 1,
      size: 25,
      featured: true,
      category: "project",
      tag: "backend",
      q: "spring boot",
    });

    expect(readFetchCall(fetchMock).url).toBe(
      "https://example.test/api/posts?page=1&size=25&featured=true&category=project&tag=backend&q=spring+boot",
    );
  });

  it("encodes detail slugs and preserves raw body", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostDetailFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    const result = await client.fetchPostDetail("guide/한글 space");
    const call = readFetchCall(fetchMock);

    expect(call.url).toBe(
      "https://example.test/api/posts/guide%2F%ED%95%9C%EA%B8%80%20space",
    );
    expect(result?.rawBody).toBe(backendPostDetailFixture.rawBody);
    expect(result?.assetBaseUrl).toBe(backendPostDetailFixture.assetBaseUrl);
    expect(call.init?.next?.revalidate).toBe(DEFAULT_POST_REVALIDATE_SECONDS);
    expect(call.init?.next?.tags).toEqual([BACKEND_POSTS_CACHE_TAG]);
  });

  it.each([
    [null, "page"],
    [{ ...backendPostPageFixture, content: "not-an-array" }, "content"],
    [
      {
        ...backendPostPageFixture,
        content: [{ ...backendPostPageFixture.content[0], slug: undefined }],
      },
      "content[0].slug",
    ],
    [
      {
        ...backendPostPageFixture,
        content: [{ ...backendPostPageFixture.content[0], postDate: undefined }],
      },
      "content[0].postDate",
    ],
    [
      {
        ...backendPostPageFixture,
        content: [{ ...backendPostPageFixture.content[0], tags: ["valid", 1] }],
      },
      "content[0].tags[1]",
    ],
    [{ ...backendPostPageFixture, totalPages: "2" }, "totalPages"],
  ])("rejects invalid page contracts at %s", async (body, expectedPath) => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse(body)),
    });

    await expect(client.fetchPostPage({ page: 0, size: 2 })).rejects.toMatchObject({
      name: "BackendPostContractError",
      fieldPath: expectedPath,
    });
  });

  it.each([
    [{ ...backendPostDetailFixture, rawBody: undefined }, "detail.rawBody"],
    [{ ...backendPostDetailFixture, rawBody: 42 }, "detail.rawBody"],
    [{ ...backendPostDetailFixture, assetBaseUrl: undefined }, "detail.assetBaseUrl"],
    [{ ...backendPostDetailFixture, assetBaseUrl: 42 }, "detail.assetBaseUrl"],
  ])("rejects invalid detail contracts", async (body, expectedPath) => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse(body)),
    });

    await expect(client.fetchPostDetail("synthetic-post")).rejects.toMatchObject({
      name: "BackendPostContractError",
      fieldPath: expectedPath,
    });
  });

  it("does not include the response body in contract errors", async () => {
    const privateMarker = "do-not-echo-response-body";
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(
        jsonResponse({ ...backendPostDetailFixture, rawBody: privateMarker, slug: null }),
      ),
    });

    const error = await client.fetchPostDetail("synthetic-post").catch((caught) => caught);

    expect(error).toBeInstanceOf(BackendPostContractError);
    expect(String(error)).not.toContain(privateMarker);
  });
});

describe("backend post API errors", () => {
  it("returns null only for detail 404", async () => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse({ error: "not found" }, 404)),
    });

    await expect(client.fetchPostDetail("missing-post")).resolves.toBeNull();
  });

  it.each([404, 500])("throws an HTTP error for list status %s", async (status) => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse({ ignored: true }, status)),
    });

    await expect(client.fetchPostPage({ page: 0, size: 2 })).rejects.toMatchObject({
      name: "BackendPostHttpError",
      status,
      endpoint: "/api/posts",
    });
  });

  it("does not convert detail 500 to not found", async () => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse({ ignored: true }, 500)),
    });

    await expect(client.fetchPostDetail("synthetic-post")).rejects.toBeInstanceOf(
      BackendPostHttpError,
    );
  });

  it("reports invalid JSON without exposing the response body", async () => {
    const fetchMock = createFetchMock(new Response("private-invalid-json", { status: 200 }));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    const error = await client.fetchPostPage({ page: 0, size: 2 }).catch((caught) => caught);

    expect(error).toBeInstanceOf(BackendPostInvalidJsonError);
    expect(String(error)).not.toContain("private-invalid-json");
  });

  it("preserves the cause of fetch failures", async () => {
    const cause = new TypeError("synthetic connection failure");
    const fetchMock = vi.fn<BackendPostFetch>().mockRejectedValue(cause);
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    const error = await client.fetchPostPage({ page: 0, size: 2 }).catch((caught) => caught);

    expect(error).toBeInstanceOf(BackendPostApiError);
    expect(error).toMatchObject({ endpoint: "/api/posts", cause });
  });

  it.each([
    [{ page: -1, size: 20 }, "Backend page"],
    [{ page: 0.5, size: 20 }, "Backend page"],
    [{ page: 0, size: 0 }, "Page size"],
    [{ page: 0, size: 51 }, "Page size"],
  ])("rejects invalid page input", async (input, message) => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse(backendPostPageFixture)),
    });

    await expect(client.fetchPostPage(input)).rejects.toThrow(message);
  });

  it("rejects blank slugs", async () => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse(backendPostDetailFixture)),
    });

    await expect(client.fetchPostDetail("   ")).rejects.toBeInstanceOf(BackendPostInputError);
  });

  it("rejects a blank category filter", async () => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse(backendPostPageFixture)),
    });

    await expect(
      client.fetchPostPage({ page: 0, size: 3, category: "   " }),
    ).rejects.toBeInstanceOf(BackendPostInputError);
  });

  it("rejects a blank tag filter", async () => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse(backendPostPageFixture)),
    });

    await expect(
      client.fetchPostPage({ page: 0, size: 3, tag: "   " }),
    ).rejects.toBeInstanceOf(BackendPostInputError);
  });

  it("rejects blank and overlong search queries", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await expect(
      client.fetchPostPage({ page: 0, size: 3, q: "   " }),
    ).rejects.toBeInstanceOf(BackendPostInputError);
    await expect(
      client.fetchPostPage({
        page: 0,
        size: 3,
        q: "x".repeat(MAX_POST_SEARCH_QUERY_LENGTH + 1),
      }),
    ).rejects.toBeInstanceOf(BackendPostInputError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("lazy environment validation", () => {
  it("imports without an API URL and fails only when the configured method is called", async () => {
    vi.stubEnv("HOUKAGO_API_BASE_URL", "");
    const importedModule = await import("@/lib/backend-post-api");

    expect(importedModule).toBeDefined();
    expect(() => fetchPostPage({ page: 0, size: 1 })).toThrow(
      BackendPostConfigurationError,
    );
  });

  it("uses an injected base URL without environment configuration", async () => {
    vi.stubEnv("HOUKAGO_API_BASE_URL", "");
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse(backendPostPageFixture)),
    });

    await expect(client.fetchPostPage({ page: 0, size: 2 })).resolves.toMatchObject({
      totalElements: 3,
    });
  });
});

describe("cache options", () => {
  it.each([
    [undefined, 300],
    [{ revalidate: 60 } satisfies BackendPostRequestOptions, 60],
    [{ revalidate: false } satisfies BackendPostRequestOptions, false],
  ])("passes the expected revalidate option", async (options, expected) => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({ page: 0, size: 2 }, options);

    expect(readFetchCall(fetchMock).init?.next?.revalidate).toBe(expected);
    expect(readFetchCall(fetchMock).init?.next?.tags).toEqual([
      BACKEND_POSTS_CACHE_TAG,
    ]);
    expect(readFetchCall(fetchMock).init?.cache).toBeUndefined();
  });

  it.each(["force-cache", "no-store"] as const)("passes cache mode %s", async (cache) => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({ page: 0, size: 2 }, { cache });

    expect(readFetchCall(fetchMock).init?.cache).toBe(cache);
    expect(readFetchCall(fetchMock).init?.next).toBeUndefined();
  });

  it("rejects cache and revalidate together", async () => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse(backendPostPageFixture)),
    });

    await expect(
      client.fetchPostPage({ page: 0, size: 2 }, { cache: "no-store", revalidate: 0 }),
    ).rejects.toBeInstanceOf(BackendPostInputError);
  });

  it("rejects negative revalidate values", async () => {
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test",
      fetchImpl: createFetchMock(jsonResponse(backendPostPageFixture)),
    });

    await expect(
      client.fetchPostPage({ page: 0, size: 2 }, { revalidate: -1 }),
    ).rejects.toBeInstanceOf(BackendPostInputError);
  });
});

describe("base URL handling", () => {
  it.each([
    "https://example.test/",
    "https://example.test////",
    "http://localhost:3000/",
  ])("normalizes trailing slashes for %s", async (baseUrl) => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({ baseUrl, fetchImpl: fetchMock });

    await client.fetchPostPage({ page: 0, size: 2 });

    expect(readFetchCall(fetchMock).url).toBe(
      `${baseUrl.startsWith("http://localhost") ? "http://localhost:3000" : "https://example.test"}/api/posts?page=0&size=2`,
    );
  });

  it("preserves an explicit base pathname", async () => {
    const fetchMock = createFetchMock(jsonResponse(backendPostPageFixture));
    const client = createBackendPostApiClient({
      baseUrl: "https://example.test/backend/v1/",
      fetchImpl: fetchMock,
    });

    await client.fetchPostPage({ page: 0, size: 2 });

    expect(readFetchCall(fetchMock).url).toBe(
      "https://example.test/backend/v1/api/posts?page=0&size=2",
    );
  });

  it.each([
    "api.example.test",
    "/relative/path",
    "ftp://example.test",
    "https://user:password@example.test",
    "https://example.test?query=value",
    "https://example.test#fragment",
  ])("rejects unsafe or invalid base URL %s", (baseUrl) => {
    expect(() => createBackendPostApiClient({ baseUrl })).toThrow(
      BackendPostConfigurationError,
    );
  });

  it("does not reveal URL credentials in validation errors", () => {
    const credentialUrl = "https://sensitive-user:sensitive-password@example.test";

    expect(() => createBackendPostApiClient({ baseUrl: credentialUrl })).toThrowError(
      expect.not.objectContaining({ message: expect.stringContaining("sensitive-password") }),
    );
  });
});
