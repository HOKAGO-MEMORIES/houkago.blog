import type { Category } from "@/types/post";
import type {
  BackendPostDetail,
  BackendPostListItem,
  BackendPostPage,
} from "@/types/backend-post";
import {
  normalizePostAssetBaseUrl,
  resolvePostAssetUrl,
} from "@/lib/post-asset-url";

const SUPPORTED_CATEGORIES: readonly Category[] = ["algorithm", "project", "cs", "blog"];
const MAX_PAGE_SIZE = 50;

export type FrontendPostSummary = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly category: Category;
  readonly date: string;
  readonly updated?: string;
  readonly tags: string[];
  readonly thumbnail?: string;
  readonly series?: string;
  readonly featured: boolean;
};

export type FrontendPostDetail = FrontendPostSummary & {
  readonly rawBody: string;
  readonly assetBaseUrl: string;
};

export type FrontendPostPage = {
  readonly posts: FrontendPostSummary[];
  readonly currentPage: number;
  readonly backendPage: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly numberOfItems: number;
  readonly first: boolean;
  readonly last: boolean;
  readonly empty: boolean;
  readonly outOfRange: boolean;
};

export type BackendPaginationInput = {
  readonly page: number;
  readonly size: number;
};

export class BackendPostAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendPostAdapterError";
  }
}

export function adaptBackendPostListItem(post: BackendPostListItem): FrontendPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: toCategory(post.category),
    date: post.postDate,
    updated: toOptional(post.updated),
    tags: [...post.tags],
    thumbnail: toOptional(post.thumbnail),
    series: toOptional(post.series),
    featured: post.featured,
  };
}

export function adaptBackendPostDetail(post: BackendPostDetail): FrontendPostDetail {
  const assetBaseUrl = normalizePostAssetBaseUrl(post.assetBaseUrl);
  return {
    ...adaptBackendPostListItem(post),
    thumbnail: post.thumbnail
      ? resolvePostAssetUrl(post.thumbnail, assetBaseUrl)
      : undefined,
    rawBody: post.rawBody,
    assetBaseUrl,
  };
}

export function adaptBackendPostPage(page: BackendPostPage): FrontendPostPage {
  return {
    posts: page.content.map(adaptBackendPostListItem),
    currentPage: toFrontendPageIndex(page.number),
    backendPage: page.number,
    pageSize: page.size,
    totalPages: page.totalPages,
    totalItems: page.totalElements,
    numberOfItems: page.numberOfElements,
    first: page.first,
    last: page.last,
    empty: page.empty,
    outOfRange: page.number > 0 && page.number >= page.totalPages,
  };
}

export function toBackendPagination(frontendPage: number, size: number): BackendPaginationInput {
  validateFrontendPage(frontendPage);
  validatePageSize(size);
  return {
    page: frontendPage - 1,
    size,
  };
}

export function toBackendPageIndex(frontendPage: number) {
  validateFrontendPage(frontendPage);
  return frontendPage - 1;
}

export function toFrontendPageIndex(backendPage: number) {
  if (!Number.isInteger(backendPage) || backendPage < 0) {
    throw new BackendPostAdapterError("Backend page must be a non-negative integer.");
  }
  return backendPage + 1;
}

function toCategory(value: string): Category {
  if (!SUPPORTED_CATEGORIES.includes(value as Category)) {
    throw new BackendPostAdapterError(`Unsupported backend post category: ${value}.`);
  }
  return value as Category;
}

function toOptional(value: string | null) {
  return value ?? undefined;
}

function validateFrontendPage(page: number) {
  if (!Number.isInteger(page) || page < 1) {
    throw new BackendPostAdapterError("Frontend page must be an integer greater than or equal to 1.");
  }
}

function validatePageSize(size: number) {
  if (!Number.isInteger(size) || size < 1 || size > MAX_PAGE_SIZE) {
    throw new BackendPostAdapterError(`Page size must be an integer between 1 and ${MAX_PAGE_SIZE}.`);
  }
}
