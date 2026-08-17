import "server-only";

import {
  loadBackendPostPage,
  type LoadBackendPostPageOptions,
} from "@/lib/backend-post-page-loader";
import { BLOG_CATEGORIES } from "@/lib/post-navigation";
import type { FrontendPostPage, FrontendPostSummary } from "@/lib/backend-post-adapter";
import type { Category } from "@/types/post";

const CATEGORY_HIGHLIGHT_LIMIT = 3;

export type BackendCategoryHighlight = {
  readonly category: Category;
  readonly count: number;
  readonly posts: readonly FrontendPostSummary[];
};

export type BackendCategoryHighlightPageLoader = (
  options: LoadBackendPostPageOptions,
) => Promise<FrontendPostPage>;

export class BackendCategoryHighlightsContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendCategoryHighlightsContractError";
  }
}

export async function loadBackendCategoryHighlights(
  loadPage: BackendCategoryHighlightPageLoader = loadBackendPostPage,
): Promise<readonly BackendCategoryHighlight[]> {
  const pages = await Promise.all(
    BLOG_CATEGORIES.map((category) =>
      loadPage({
        frontendPage: 1,
        pageSize: CATEGORY_HIGHLIGHT_LIMIT,
        category,
      }),
    ),
  );

  return pages.map((page, index) => {
    const category = BLOG_CATEGORIES[index];
    if (page.posts.length > CATEGORY_HIGHLIGHT_LIMIT) {
      throw new BackendCategoryHighlightsContractError(
        `Category highlight query returned more than ${CATEGORY_HIGHLIGHT_LIMIT} posts.`,
      );
    }
    if (page.posts.some((post) => post.category !== category)) {
      throw new BackendCategoryHighlightsContractError(
        `Category highlight query returned a post outside ${category}.`,
      );
    }
    if (page.totalItems < page.posts.length) {
      throw new BackendCategoryHighlightsContractError(
        `Category highlight total is smaller than its content for ${category}.`,
      );
    }

    return {
      category,
      count: page.totalItems,
      posts: page.posts,
    };
  });
}
