import "server-only";

import { cache } from "react";
import { fetchPostPage } from "@/lib/backend-post-api";
import {
  loadBackendPostPage,
  type BackendPostPageFetcher,
} from "@/lib/backend-post-page-loader";
import { POSTS_PER_PAGE } from "@/lib/post-navigation";
import type { FrontendPostPage } from "@/lib/backend-post-adapter";

export class BackendTagPostContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendTagPostContractError";
  }
}

export class BackendTagPostInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendTagPostInputError";
  }
}

export function createBackendTagPostPageLoader(fetchPage: BackendPostPageFetcher) {
  return async function loadTagPostPage(
    tag: string,
    frontendPage: number,
  ): Promise<FrontendPostPage> {
    if (!tag.trim()) {
      throw new BackendTagPostInputError("Tag must not be blank.");
    }

    const page = await loadBackendPostPage({
      frontendPage,
      pageSize: POSTS_PER_PAGE,
      tag,
      fetchPage,
    });

    if (page.posts.some((post) => !post.tags.includes(tag))) {
      throw new BackendTagPostContractError(
        `Tag query returned a post outside ${tag}.`,
      );
    }

    return page;
  };
}

export const loadBackendTagPostPage = cache(
  createBackendTagPostPageLoader(fetchPostPage),
);
