import "server-only";

import { cache } from "react";
import { fetchPostPage } from "@/lib/backend-post-api";
import {
  loadBackendPostPage,
  type BackendPostPageFetcher,
} from "@/lib/backend-post-page-loader";
import { POSTS_PER_PAGE } from "@/lib/post-navigation";
import type { FrontendPostPage } from "@/lib/backend-post-adapter";
import type { Category } from "@/types/post";

export class BackendCategoryPostContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendCategoryPostContractError";
  }
}

export function createBackendCategoryPostPageLoader(fetchPage: BackendPostPageFetcher) {
  return async function loadCategoryPostPage(
    category: Category,
    frontendPage: number,
  ): Promise<FrontendPostPage> {
    const page = await loadBackendPostPage({
      frontendPage,
      pageSize: POSTS_PER_PAGE,
      category,
      fetchPage,
    });

    if (page.posts.some((post) => post.category !== category)) {
      throw new BackendCategoryPostContractError(
        `Category query returned a post outside ${category}.`,
      );
    }

    return page;
  };
}

export const loadBackendCategoryPostPage = cache(
  createBackendCategoryPostPageLoader(fetchPostPage),
);
