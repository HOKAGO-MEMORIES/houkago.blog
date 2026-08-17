import type { MetadataRoute } from "next";

import {
  loadBackendSitemapPosts,
  type BackendSitemapPost,
} from "@/lib/backend-post-sitemap-loader";
import { SITE_URL } from "@/lib/site";

export type BackendSitemapPostLoader = () => Promise<readonly BackendSitemapPost[]>;

export async function buildPostSitemap(
  loadPosts: BackendSitemapPostLoader = loadBackendSitemapPosts,
): Promise<MetadataRoute.Sitemap> {
  const posts = await loadPosts();

  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/blog` },
    { url: `${SITE_URL}/projects` },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.lastModified,
    })),
  ];
}
