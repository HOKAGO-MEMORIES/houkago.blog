import "server-only";

import {
  DEFAULT_POST_REVALIDATE_SECONDS,
  fetchPostPage,
  type BackendPostRequestOptions,
  type FetchPostPageInput,
} from "@/lib/backend-post-api";
import {
  adaptBackendPostPage,
  toBackendPagination,
  type FrontendPostPage,
} from "@/lib/backend-post-adapter";
import type { BackendPostPage } from "@/types/backend-post";

export type BackendPostPageFetcher = (
  input: FetchPostPageInput,
  options?: BackendPostRequestOptions,
) => Promise<BackendPostPage>;

export type LoadBackendPostPageOptions = {
  readonly frontendPage: number;
  readonly pageSize: number;
  readonly category?: string;
  readonly fetchPage?: BackendPostPageFetcher;
};

export async function loadBackendPostPage({
  frontendPage,
  pageSize,
  category,
  fetchPage = fetchPostPage,
}: LoadBackendPostPageOptions): Promise<FrontendPostPage> {
  const backendPagination = toBackendPagination(frontendPage, pageSize);
  const input = category === undefined
    ? backendPagination
    : { ...backendPagination, category };
  const page = await fetchPage(input, {
    revalidate: DEFAULT_POST_REVALIDATE_SECONDS,
  });

  return adaptBackendPostPage(page);
}

export function parsePaginatedBlogPageParam(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}
