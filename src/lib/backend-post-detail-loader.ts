import "server-only";

import { cache } from "react";
import {
  adaptBackendPostDetail,
  type FrontendPostDetail,
} from "@/lib/backend-post-adapter";
import {
  fetchPostDetail,
  type BackendPostApiClient,
} from "@/lib/backend-post-api";
import { getSerializedMDX } from "@/lib/mdx";

export type LoadedBackendPostDetail = {
  readonly post: FrontendPostDetail;
  readonly mdxSource: Awaited<ReturnType<typeof getSerializedMDX>>;
};

type FetchPostDetail = BackendPostApiClient["fetchPostDetail"];

export function createBackendPostDetailLoader(fetchDetail: FetchPostDetail) {
  return async function loadBackendPostDetail(slug: string): Promise<LoadedBackendPostDetail | null> {
    const response = await fetchDetail(slug);
    if (response === null) {
      return null;
    }

    const post = adaptBackendPostDetail(response);
    const mdxSource = await getSerializedMDX(post.rawBody, {
      assetBaseUrl: post.assetBaseUrl,
    });

    return { post, mdxSource };
  };
}

export const loadBackendPostDetail = cache(
  createBackendPostDetailLoader(fetchPostDetail),
);
