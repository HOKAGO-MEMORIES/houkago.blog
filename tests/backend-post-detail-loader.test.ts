import { describe, expect, it, vi } from "vitest";

import { createBackendPostDetailLoader } from "@/lib/backend-post-detail-loader";
import {
  type BackendPostApiClient,
  BackendPostContractError,
  BackendPostHttpError,
  BackendPostInvalidJsonError,
} from "@/lib/backend-post-api";
import { backendPostDetailFixture } from "./fixtures/backend-post";

type FetchPostDetail = BackendPostApiClient["fetchPostDetail"];

describe("backend post detail loader", () => {
  it("adapts metadata and serializes backend rawBody with public assets", async () => {
    const fetchDetail = vi.fn<FetchPostDetail>().mockResolvedValue({
      ...backendPostDetailFixture,
      rawBody: [
        "# Runtime detail",
        "",
        "![diagram](./assets/diagrams/flow.png)",
        "",
        "```java",
        "System.out.println(42);",
        "```",
      ].join("\n"),
    });
    const loadDetail = createBackendPostDetailLoader(fetchDetail);

    const result = await loadDetail("synthetic-post");

    expect(fetchDetail).toHaveBeenCalledWith(
      "synthetic-post",
      expect.objectContaining({ onTiming: expect.any(Function) }),
    );
    expect(result?.post).toMatchObject({
      slug: "synthetic-post",
      title: "Synthetic Post",
      date: "2026-07-14",
      assetBaseUrl: backendPostDetailFixture.assetBaseUrl,
    });
    expect(result?.mdxSource.compiledSource).toContain(
      "https://assets.example.test/assets/posts/synthetic-post/diagrams/flow.png",
    );
  });

  it("logs stage timings without logging the raw body", async () => {
    const fetchDetail = vi.fn<FetchPostDetail>().mockImplementation(async (_slug, options) => {
      options?.onTiming?.({
        backendFetchMs: 91.2,
        jsonParseMs: 0.8,
        contractValidationMs: 0.4,
      });
      return backendPostDetailFixture;
    });
    const logTiming = vi.fn();
    const loadDetail = createBackendPostDetailLoader(fetchDetail, { logTiming });

    await loadDetail("synthetic-post");

    expect(logTiming).toHaveBeenCalledOnce();
    expect(logTiming).toHaveBeenCalledWith({
      event: "backend_post_detail_timing",
      slug: "synthetic-post",
      backendFetchMs: 91.2,
      jsonParseMs: 0.8,
      contractValidationMs: 0.4,
      adapterMs: expect.any(Number),
      mdxSerializationMs: expect.any(Number),
      mdxCacheAgeMs: expect.any(Number),
      mdxStages: {
        shikiReadyBeforeSerialize: expect.any(Boolean),
        shikiInitializationMs: expect.toSatisfy(
          (value: unknown) => value === null || typeof value === "number",
        ),
        assetRewriteMs: expect.any(Number),
        rehypeKatexMs: expect.any(Number),
        rehypePrettyCodeMs: expect.any(Number),
        parseAndCompileMs: expect.any(Number),
        totalMs: expect.any(Number),
      },
      totalMs: expect.any(Number),
    });
    expect(JSON.stringify(logTiming.mock.calls[0][0])).not.toContain(
      backendPostDetailFixture.rawBody,
    );
  });

  it("returns null only when the backend detail is not found", async () => {
    const loadDetail = createBackendPostDetailLoader(
      vi.fn<FetchPostDetail>().mockResolvedValue(null),
    );

    await expect(loadDetail("missing-post")).resolves.toBeNull();
  });

  it.each([
    new Error("backend unavailable"),
    new BackendPostHttpError(500, "/api/posts/synthetic-post"),
    new BackendPostInvalidJsonError("/api/posts/synthetic-post"),
    new BackendPostContractError("detail.rawBody"),
  ])("does not convert %s into not found or local fallback", async (failure) => {
    const loadDetail = createBackendPostDetailLoader(
      vi.fn<FetchPostDetail>().mockRejectedValue(failure),
    );

    await expect(loadDetail("synthetic-post")).rejects.toBe(failure);
  });
});
