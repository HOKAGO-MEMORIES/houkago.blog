import {
  BackendPostApiError,
  BackendPostConfigurationError,
  BackendPostContractError,
  BackendPostHttpError,
  fetchPostPage,
  type BackendPostRequestTiming,
} from "@/lib/backend-post-api";
import { adaptBackendPostPage } from "@/lib/backend-post-adapter";
import {
  MAX_POST_SEARCH_QUERY_LENGTH,
  SEARCH_RESULT_PAGE_SIZE,
} from "@/lib/post-search-contract";
import type { SearchResponse } from "@/types/search";

const MAX_BACKEND_PAGE_SIZE = 50;

export const runtime = "nodejs";

export async function GET(request: Request) {
  const totalStartedAt = performance.now();
  const url = new URL(request.url);
  const query = normalizeQuery(url.searchParams.get("q"));
  if (query === null) {
    return jsonError("Search query must not be blank.", 400);
  }
  if (query.length > MAX_POST_SEARCH_QUERY_LENGTH) {
    return jsonError(
      `Search query must not exceed ${MAX_POST_SEARCH_QUERY_LENGTH} characters.`,
      400,
    );
  }

  const page = parseIntegerParameter(url.searchParams.get("page"), 0, 0, Number.MAX_SAFE_INTEGER);
  const size = parseIntegerParameter(
    url.searchParams.get("size"),
    SEARCH_RESULT_PAGE_SIZE,
    1,
    MAX_BACKEND_PAGE_SIZE,
  );
  if (page === null || size === null) {
    return jsonError("Invalid search pagination.", 400);
  }

  try {
    let requestTiming: BackendPostRequestTiming = {
      backendFetchMs: 0,
      jsonParseMs: 0,
      contractValidationMs: 0,
    };
    const backendPage = await fetchPostPage(
      { q: query, page, size },
      {
        cache: "no-store",
        signal: request.signal,
        onTiming: (timing) => {
          requestTiming = timing;
        },
      },
    );

    const adapterStartedAt = performance.now();
    const adaptedPage = adaptBackendPostPage(backendPage);
    const response: SearchResponse = {
      items: adaptedPage.posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        date: post.date,
      })),
      totalElements: adaptedPage.totalItems,
      page: adaptedPage.backendPage,
      size: adaptedPage.pageSize,
      totalPages: adaptedPage.totalPages,
    };
    const adapterMs = performance.now() - adapterStartedAt;
    const totalMs = performance.now() - totalStartedAt;
    return Response.json(response, {
      headers: successHeaders(requestTiming, adapterMs, totalMs),
    });
  } catch (error) {
    if (error instanceof BackendPostHttpError && error.status >= 400 && error.status < 500) {
      return jsonError("Search request was rejected.", error.status);
    }
    if (error instanceof BackendPostConfigurationError) {
      return jsonError("Search service is unavailable.", 503);
    }
    if (error instanceof BackendPostApiError || error instanceof BackendPostContractError) {
      return jsonError("Search service request failed.", 502);
    }
    return jsonError("Search service request failed.", 502);
  }
}

function normalizeQuery(value: string | null) {
  if (value === null) {
    return null;
  }
  const normalized = value.trim();
  return normalized || null;
}

function parseIntegerParameter(
  value: string | null,
  defaultValue: number,
  minimum: number,
  maximum: number,
) {
  if (value === null) {
    return defaultValue;
  }
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    return null;
  }
  return parsed;
}

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status, headers: noStoreHeaders() });
}

function noStoreHeaders() {
  return { "Cache-Control": "no-store" };
}

function successHeaders(
  requestTiming: BackendPostRequestTiming,
  adapterMs: number,
  totalMs: number,
) {
  const parseMs = requestTiming.jsonParseMs + requestTiming.contractValidationMs;
  return {
    ...noStoreHeaders(),
    "Server-Timing": [
      formatServerTimingMetric("backend", requestTiming.backendFetchMs),
      formatServerTimingMetric("parse", parseMs),
      formatServerTimingMetric("json", requestTiming.jsonParseMs),
      formatServerTimingMetric("contract", requestTiming.contractValidationMs),
      formatServerTimingMetric("adapt", adapterMs),
      formatServerTimingMetric("total", totalMs),
    ].join(", "),
  };
}

function formatServerTimingMetric(name: string, durationMs: number) {
  return `${name};dur=${Math.max(0, durationMs).toFixed(1)}`;
}
