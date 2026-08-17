import { describe, expect, it, vi } from "vitest";

import { buildPostSitemap, type BackendSitemapPostLoader } from "@/lib/post-sitemap";

describe("post sitemap", () => {
  it("contains stable public routes and only the posts supplied by the public Backend API", async () => {
    const loadPosts = vi.fn<BackendSitemapPostLoader>().mockResolvedValue([
      { slug: "published-post", lastModified: "2026-08-17" },
      { slug: "slug with spaces", lastModified: "2026-08-16" },
    ]);

    const sitemap = await buildPostSitemap(loadPosts);

    expect(sitemap).toEqual([
      { url: "https://houkago.moe" },
      { url: "https://houkago.moe/blog" },
      { url: "https://houkago.moe/projects" },
      {
        url: "https://houkago.moe/blog/published-post",
        lastModified: "2026-08-17",
      },
      {
        url: "https://houkago.moe/blog/slug%20with%20spaces",
        lastModified: "2026-08-16",
      },
    ]);
    expect(sitemap.map((entry) => entry.url)).not.toContain(
      "https://houkago.moe/blog/draft-private-or-deleted",
    );
  });

  it("propagates Backend failure instead of returning a static fallback", async () => {
    const failure = new Error("backend unavailable");
    const loadPosts = vi.fn<BackendSitemapPostLoader>().mockRejectedValue(failure);

    await expect(buildPostSitemap(loadPosts)).rejects.toBe(failure);
  });
});
