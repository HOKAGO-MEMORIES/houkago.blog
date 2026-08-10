import { afterEach, describe, expect, it, vi } from "vitest";

import { BACKEND_POSTS_CACHE_TAG } from "@/lib/backend-post-cache";

const { revalidateTagMock } = vi.hoisted(() => ({
  revalidateTagMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { POST } from "@/app/api/internal/revalidate/posts/route";

const TEST_SECRET = "synthetic-revalidation-secret";
const ENDPOINT = "http://localhost/api/internal/revalidate/posts";

afterEach(() => {
  vi.unstubAllEnvs();
  revalidateTagMock.mockReset();
});

describe("post revalidation route", () => {
  it("revalidates the backend posts cache for a valid Bearer secret", async () => {
    vi.stubEnv("HOUKAGO_REVALIDATE_SECRET", TEST_SECRET);

    const response = await POST(
      new Request(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${TEST_SECRET}` },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ revalidated: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(revalidateTagMock).toHaveBeenCalledOnce();
    expect(revalidateTagMock).toHaveBeenCalledWith(BACKEND_POSTS_CACHE_TAG);
  });

  it("rejects a request without Authorization", async () => {
    vi.stubEnv("HOUKAGO_REVALIDATE_SECRET", TEST_SECRET);

    const response = await POST(new Request(ENDPOINT, { method: "POST" }));

    expect(response.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("rejects an incorrect Bearer secret without failing on a different length", async () => {
    vi.stubEnv("HOUKAGO_REVALIDATE_SECRET", TEST_SECRET);

    const response = await POST(
      new Request(ENDPOINT, {
        method: "POST",
        headers: { Authorization: "Bearer wrong" },
      }),
    );

    expect(response.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("returns service unavailable when the secret is not configured", async () => {
    vi.stubEnv("HOUKAGO_REVALIDATE_SECRET", "");

    const response = await POST(
      new Request(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${TEST_SECRET}` },
      }),
    );

    expect(response.status).toBe(503);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });
});
