import "server-only";

import {
  DEFAULT_POST_REVALIDATE_SECONDS,
  fetchPostPage,
  type BackendPostRequestOptions,
  type FetchPostPageInput,
} from "@/lib/backend-post-api";
import {
  adaptBackendPostPage,
  type FrontendPostSummary,
} from "@/lib/backend-post-adapter";
import type { BackendPostPage } from "@/types/backend-post";

const FEATURED_POST_LIMIT = 3;

export type BackendFeaturedPostPageFetcher = (
  input: FetchPostPageInput,
  options?: BackendPostRequestOptions,
) => Promise<BackendPostPage>;

export class BackendFeaturedPostContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendFeaturedPostContractError";
  }
}

export async function loadBackendFeaturedPosts(
  fetchPage: BackendFeaturedPostPageFetcher = fetchPostPage,
): Promise<FrontendPostSummary[]> {
  const page = await fetchPage(
    { page: 0, size: FEATURED_POST_LIMIT, featured: true },
    { revalidate: DEFAULT_POST_REVALIDATE_SECONDS },
  );
  const featuredPosts = adaptBackendPostPage(page).posts;

  if (featuredPosts.length > FEATURED_POST_LIMIT) {
    throw new BackendFeaturedPostContractError(
      `Featured query returned more than ${FEATURED_POST_LIMIT} posts.`,
    );
  }
  if (featuredPosts.some((post) => !post.featured)) {
    throw new BackendFeaturedPostContractError(
      "Featured query returned a non-featured post.",
    );
  }

  return featuredPosts;
}
