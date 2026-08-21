import "server-only";

import { unstable_cache } from "next/cache";
import {
  getSerializedMDX,
  type PostMdxSerializationTiming,
} from "@/lib/mdx";

const POST_MDX_CACHE_VERSION = "post-mdx-v1";
const POST_MDX_CACHE_REVALIDATE_SECONDS = 86_400;

export type CachedPostMdx = {
  readonly mdxSource: Awaited<ReturnType<typeof getSerializedMDX>>;
  readonly mdxStages: PostMdxSerializationTiming;
  readonly generatedAtEpochMs: number;
};

const getCachedPostMdx = unstable_cache(
  async (rawBody: string, assetBaseUrl: string): Promise<CachedPostMdx> => {
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
  },
  // Bump this version whenever the renderer pipeline changes. rawBody and assetBaseUrl are arguments
  // and therefore part of the Next.js Data Cache key.
  [POST_MDX_CACHE_VERSION],
  { revalidate: POST_MDX_CACHE_REVALIDATE_SECONDS },
);

export function loadCachedPostMdx(
  rawBody: string,
  assetBaseUrl: string,
): Promise<CachedPostMdx> {
  return getCachedPostMdx(rawBody, assetBaseUrl);
}
