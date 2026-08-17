import "server-only";

import {
  DEFAULT_POST_REVALIDATE_SECONDS,
  fetchPostPage,
  type BackendPostRequestOptions,
  type FetchPostPageInput,
} from "@/lib/backend-post-api";
import type { BackendPostPage } from "@/types/backend-post";

const SITEMAP_PAGE_SIZE = 50;
const POST_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type BackendSitemapPost = {
  readonly slug: string;
  readonly lastModified: string;
};

export type BackendSitemapPageFetcher = (
  input: FetchPostPageInput,
  options?: BackendPostRequestOptions,
) => Promise<BackendPostPage>;

export class BackendPostSitemapContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendPostSitemapContractError";
  }
}

export async function loadBackendSitemapPosts(
  fetchPage: BackendSitemapPageFetcher = fetchPostPage,
): Promise<readonly BackendSitemapPost[]> {
  const firstPage = await fetchSitemapPage(fetchPage, 0);
  const expectedTotalPages = firstPage.totalElements === 0
    ? 0
    : Math.ceil(firstPage.totalElements / SITEMAP_PAGE_SIZE);
  if (firstPage.totalPages !== expectedTotalPages) {
    throw new BackendPostSitemapContractError(
      "Sitemap received inconsistent total page metadata.",
    );
  }
  validatePage(firstPage, 0, firstPage.totalPages, firstPage.totalElements);

  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
      fetchSitemapPage(fetchPage, index + 1),
    ),
  );
  const pages = [firstPage, ...remainingPages];
  pages.forEach((page, index) =>
    validatePage(page, index, firstPage.totalPages, firstPage.totalElements),
  );

  const posts = pages.flatMap((page) => page.content);
  if (posts.length !== firstPage.totalElements) {
    throw new BackendPostSitemapContractError(
      "Sitemap pages did not contain the advertised number of public posts.",
    );
  }

  const slugs = new Set<string>();
  return posts.map((post) => {
    if (!post.slug.trim() || slugs.has(post.slug)) {
      throw new BackendPostSitemapContractError(
        `Sitemap received an invalid or duplicate slug: ${post.slug}.`,
      );
    }
    slugs.add(post.slug);

    const lastModified = post.updated ?? post.postDate;
    if (!POST_DATE_PATTERN.test(lastModified)) {
      throw new BackendPostSitemapContractError(
        `Sitemap received an invalid date for ${post.slug}.`,
      );
    }

    return { slug: post.slug, lastModified };
  });
}

function fetchSitemapPage(fetchPage: BackendSitemapPageFetcher, page: number) {
  return fetchPage(
    { page, size: SITEMAP_PAGE_SIZE },
    { revalidate: DEFAULT_POST_REVALIDATE_SECONDS },
  );
}

function validatePage(
  page: BackendPostPage,
  expectedNumber: number,
  expectedTotalPages: number,
  expectedTotalElements: number,
) {
  if (
    page.number !== expectedNumber
    || page.totalPages !== expectedTotalPages
    || page.totalElements !== expectedTotalElements
    || page.size !== SITEMAP_PAGE_SIZE
    || page.numberOfElements !== page.content.length
    || page.content.length > SITEMAP_PAGE_SIZE
  ) {
    throw new BackendPostSitemapContractError(
      `Sitemap received inconsistent pagination metadata for page ${expectedNumber}.`,
    );
  }
}
