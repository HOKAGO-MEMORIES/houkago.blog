import { createHash, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

import { BACKEND_POSTS_CACHE_TAG } from "@/lib/backend-post-cache";

const REVALIDATE_SECRET_ENV = "HOUKAGO_REVALIDATE_SECRET";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const configuredSecret = process.env[REVALIDATE_SECRET_ENV];
  if (!configuredSecret || configuredSecret.trim().length === 0) {
    return jsonResponse({ error: "Revalidation service is unavailable." }, 503);
  }

  const providedSecret = readBearerToken(request.headers.get("authorization"));
  if (!providedSecret || !secretsMatch(providedSecret, configuredSecret)) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  revalidateTag(BACKEND_POSTS_CACHE_TAG);
  return jsonResponse({ revalidated: true }, 200);
}

function readBearerToken(authorization: string | null) {
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

function secretsMatch(provided: string, configured: string) {
  const providedDigest = createHash("sha256").update(provided, "utf8").digest();
  const configuredDigest = createHash("sha256").update(configured, "utf8").digest();
  return timingSafeEqual(providedDigest, configuredDigest);
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
