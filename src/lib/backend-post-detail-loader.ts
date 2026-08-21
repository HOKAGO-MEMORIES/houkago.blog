import "server-only";

import { cache } from "react";
import {
  adaptBackendPostDetail,
  type FrontendPostDetail,
} from "@/lib/backend-post-adapter";
import {
  fetchPostDetail,
  type BackendPostApiClient,
  type BackendPostRequestTiming,
} from "@/lib/backend-post-api";
import {
  getSerializedMDX,
  type PostMdxSerializationTiming,
} from "@/lib/mdx";
import {
  loadCachedPostMdx,
  type CachedPostMdx,
} from "@/lib/backend-post-mdx-cache";

export type LoadedBackendPostDetail = {
  readonly post: FrontendPostDetail;
  readonly mdxSource: Awaited<ReturnType<typeof getSerializedMDX>>;
};

type FetchPostDetail = BackendPostApiClient["fetchPostDetail"];

export type BackendPostDetailTiming = BackendPostRequestTiming & {
  readonly event: "backend_post_detail_timing";
  readonly slug: string;
  readonly adapterMs: number;
  readonly mdxSerializationMs: number;
  readonly mdxCacheAgeMs: number;
  readonly mdxStages: PostMdxSerializationTiming;
  readonly totalMs: number;
};

type BackendPostDetailLoaderOptions = {
  readonly now?: () => number;
  readonly epochNow?: () => number;
  readonly loadMdx?: (rawBody: string, assetBaseUrl: string) => Promise<CachedPostMdx>;
  readonly logTiming?: (timing: BackendPostDetailTiming) => void;
};

const EMPTY_REQUEST_TIMING: BackendPostRequestTiming = {
  backendFetchMs: 0,
  jsonParseMs: 0,
  contractValidationMs: 0,
};

export function createBackendPostDetailLoader(
  fetchDetail: FetchPostDetail,
  {
    now = () => performance.now(),
    epochNow = () => Date.now(),
    loadMdx = loadUncachedPostMdx,
    logTiming = logProductionDetailTiming,
  }: BackendPostDetailLoaderOptions = {},
) {
  return async function loadBackendPostDetail(slug: string): Promise<LoadedBackendPostDetail | null> {
    const totalStartedAt = now();
    let requestTiming = EMPTY_REQUEST_TIMING;
    const response = await fetchDetail(slug, {
      onTiming: (timing) => {
        requestTiming = timing;
      },
    });
    if (response === null) {
      return null;
    }

    const adapterStartedAt = now();
    const post = adaptBackendPostDetail(response);
    const adapterMs = now() - adapterStartedAt;

    const mdxStartedAt = now();
    const { mdxSource, mdxStages, generatedAtEpochMs } = await loadMdx(
      post.rawBody,
      post.assetBaseUrl,
    );
    const mdxSerializationMs = now() - mdxStartedAt;

    logTiming({
      event: "backend_post_detail_timing",
      slug: post.slug,
      ...roundRequestTiming(requestTiming),
      adapterMs: roundMilliseconds(adapterMs),
      mdxSerializationMs: roundMilliseconds(mdxSerializationMs),
      mdxCacheAgeMs: roundMilliseconds(epochNow() - generatedAtEpochMs),
      mdxStages,
      totalMs: roundMilliseconds(now() - totalStartedAt),
    });

    return { post, mdxSource };
  };
}

export const loadBackendPostDetail = cache(
  createBackendPostDetailLoader(fetchPostDetail, {
    loadMdx: loadCachedPostMdx,
  }),
);

async function loadUncachedPostMdx(
  rawBody: string,
  assetBaseUrl: string,
): Promise<CachedPostMdx> {
  let mdxStages: PostMdxSerializationTiming | null = null;
  const mdxSource = await getSerializedMDX(rawBody, {
    assetBaseUrl,
    onTiming: (timing) => {
      mdxStages = timing;
    },
  });

  if (mdxStages === null) {
    throw new Error("MDX serialization completed without stage timing.");
  }

  return {
    mdxSource,
    mdxStages,
    generatedAtEpochMs: Date.now(),
  };
}

function roundRequestTiming(timing: BackendPostRequestTiming): BackendPostRequestTiming {
  return {
    backendFetchMs: roundMilliseconds(timing.backendFetchMs),
    jsonParseMs: roundMilliseconds(timing.jsonParseMs),
    contractValidationMs: roundMilliseconds(timing.contractValidationMs),
  };
}

function roundMilliseconds(durationMs: number) {
  return Number(Math.max(0, durationMs).toFixed(1));
}

function logProductionDetailTiming(timing: BackendPostDetailTiming) {
  if (process.env.NODE_ENV === "production") {
    console.info(JSON.stringify(timing));
  }
}
