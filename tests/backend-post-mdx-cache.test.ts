import { beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({
  cacheOptions: undefined as { revalidate?: number | false } | undefined,
  keyParts: undefined as readonly string[] | undefined,
  serialize: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (
    operation: (...args: string[]) => Promise<unknown>,
    keyParts: readonly string[],
    options: { revalidate?: number | false },
  ) => {
    cacheMocks.keyParts = keyParts;
    cacheMocks.cacheOptions = options;
    const entries = new Map<string, unknown>();

    return async (...args: string[]) => {
      const key = JSON.stringify(args);
      if (!entries.has(key)) {
        entries.set(key, await operation(...args));
      }
      return entries.get(key);
    };
  },
}));

vi.mock("@/lib/mdx", () => ({
  getSerializedMDX: cacheMocks.serialize,
}));

import { loadCachedPostMdx } from "@/lib/backend-post-mdx-cache";

const timing = {
  shikiReadyBeforeSerialize: true,
  shikiInitializationMs: 10,
  assetRewriteMs: 1,
  rehypeKatexMs: 2,
  rehypePrettyCodeMs: 3,
  parseAndCompileMs: 4,
  totalMs: 10,
};

describe("backend post MDX Data Cache", () => {
  beforeEach(() => {
    cacheMocks.serialize.mockReset();
    cacheMocks.serialize.mockImplementation(async (_rawBody, options) => {
      options?.onTiming?.(timing);
      return { compiledSource: "compiled" };
    });
  });

  it("reuses the serialized result for identical content and asset origin", async () => {
    const first = await loadCachedPostMdx("same body", "https://assets.test/post/");
    const second = await loadCachedPostMdx("same body", "https://assets.test/post/");

    expect(second).toEqual(first);
    expect(cacheMocks.serialize).toHaveBeenCalledOnce();
    expect(cacheMocks.keyParts).toEqual(["post-mdx-v1"]);
    expect(cacheMocks.cacheOptions).toEqual({ revalidate: 86_400 });
  });

  it("uses a new cache entry when rawBody changes", async () => {
    await loadCachedPostMdx("body revision a", "https://assets.test/post/");
    await loadCachedPostMdx("body revision b", "https://assets.test/post/");

    expect(cacheMocks.serialize).toHaveBeenCalledTimes(2);
  });

  it("uses a new cache entry when the asset base changes", async () => {
    await loadCachedPostMdx("asset body", "https://assets-a.test/post/");
    await loadCachedPostMdx("asset body", "https://assets-b.test/post/");

    expect(cacheMocks.serialize).toHaveBeenCalledTimes(2);
  });
});
