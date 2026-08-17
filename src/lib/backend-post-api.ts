import "server-only";

import type {
  BackendPageable,
  BackendPostDetail,
  BackendPostListItem,
  BackendPostPage,
  BackendSort,
} from "@/types/backend-post";
import { BACKEND_POSTS_CACHE_TAG } from "@/lib/backend-post-cache";

const API_BASE_URL_ENV = "HOUKAGO_API_BASE_URL";
const MAX_PAGE_SIZE = 50;

export const DEFAULT_POST_REVALIDATE_SECONDS = 300;
export const MAX_POST_SEARCH_QUERY_LENGTH = 100;

type NextFetchRequestInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: readonly string[];
  };
};

export type BackendPostFetch = (
  input: string | URL | Request,
  init?: NextFetchRequestInit,
) => Promise<Response>;

export type BackendPostRequestOptions = {
  readonly cache?: "force-cache" | "no-store";
  readonly revalidate?: number | false;
  readonly signal?: AbortSignal;
};

export type FetchPostPageInput = {
  readonly page: number;
  readonly size: number;
  readonly featured?: boolean;
  readonly category?: string;
  readonly tag?: string;
  readonly q?: string;
};

export type BackendPostApiClient = {
  fetchPostPage(
    input: FetchPostPageInput,
    options?: BackendPostRequestOptions,
  ): Promise<BackendPostPage>;
  fetchPostDetail(
    slug: string,
    options?: BackendPostRequestOptions,
  ): Promise<BackendPostDetail | null>;
};

export class BackendPostConfigurationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "BackendPostConfigurationError";
  }
}

export class BackendPostInputError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "BackendPostInputError";
  }
}

export class BackendPostApiError extends Error {
  readonly endpoint: string;

  constructor(message: string, endpoint: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "BackendPostApiError";
    this.endpoint = endpoint;
  }
}

export class BackendPostHttpError extends BackendPostApiError {
  readonly status: number;

  constructor(status: number, endpoint: string) {
    super(`Backend post API returned HTTP ${status} at ${endpoint}.`, endpoint);
    this.name = "BackendPostHttpError";
    this.status = status;
  }
}

export class BackendPostInvalidJsonError extends BackendPostApiError {
  constructor(endpoint: string, options?: ErrorOptions) {
    super(`Backend post API returned invalid JSON at ${endpoint}.`, endpoint, options);
    this.name = "BackendPostInvalidJsonError";
  }
}

export class BackendPostContractError extends Error {
  readonly fieldPath: string;

  constructor(fieldPath: string) {
    super(`Invalid backend post contract at ${fieldPath}.`);
    this.name = "BackendPostContractError";
    this.fieldPath = fieldPath;
  }
}

type CreateBackendPostApiClientOptions = {
  readonly baseUrl: string;
  readonly fetchImpl?: BackendPostFetch;
};

export function createBackendPostApiClient({
  baseUrl,
  fetchImpl = fetch,
}: CreateBackendPostApiClientOptions): BackendPostApiClient {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  return {
    async fetchPostPage(input, options) {
      validateBackendPage(input.page);
      validatePageSize(input.size);
      validateCategory(input.category);
      validateTag(input.tag);
      const searchQuery = normalizeSearchQuery(input.q);

      const endpoint = "/api/posts";
      const url = new URL("api/posts", normalizedBaseUrl);
      const searchParams = new URLSearchParams({
        page: String(input.page),
        size: String(input.size),
      });
      if (input.featured !== undefined) {
        searchParams.set("featured", String(input.featured));
      }
      if (input.category !== undefined) {
        searchParams.set("category", input.category);
      }
      if (input.tag !== undefined) {
        searchParams.set("tag", input.tag);
      }
      if (searchQuery !== undefined) {
        searchParams.set("q", searchQuery);
      }
      url.search = searchParams.toString();

      const requestOptions = searchQuery !== undefined && options === undefined
        ? { cache: "no-store" as const }
        : options;
      const response = await request(fetchImpl, url, endpoint, requestOptions);
      ensureSuccessfulResponse(response, endpoint);
      return parseBackendPostPage(await parseJson(response, endpoint));
    },

    async fetchPostDetail(slug, options) {
      const normalizedSlug = validateSlug(slug);
      const endpoint = `/api/posts/${encodeURIComponent(normalizedSlug)}`;
      const url = new URL(`api/posts/${encodeURIComponent(normalizedSlug)}`, normalizedBaseUrl);
      const response = await request(fetchImpl, url, endpoint, options);

      if (response.status === 404) {
        return null;
      }

      ensureSuccessfulResponse(response, endpoint);
      return parseBackendPostDetail(await parseJson(response, endpoint));
    },
  };
}

export function fetchPostPage(
  input: FetchPostPageInput,
  options?: BackendPostRequestOptions,
) {
  return createConfiguredClient().fetchPostPage(input, options);
}

export function fetchPostDetail(
  slug: string,
  options?: BackendPostRequestOptions,
) {
  return createConfiguredClient().fetchPostDetail(slug, options);
}

function createConfiguredClient() {
  return createBackendPostApiClient({
    baseUrl: getConfiguredApiBaseUrl(),
  });
}

function getConfiguredApiBaseUrl() {
  const value = process.env[API_BASE_URL_ENV]?.trim();
  if (!value) {
    throw new BackendPostConfigurationError(
      `${API_BASE_URL_ENV} must be configured before calling the backend post API.`,
    );
  }
  return value;
}

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new BackendPostConfigurationError("Backend post API base URL must not be blank.");
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch (error) {
    throw new BackendPostConfigurationError("Backend post API base URL must be a valid URL.", {
      cause: error,
    });
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new BackendPostConfigurationError("Backend post API base URL must use HTTP or HTTPS.");
  }
  if (url.username || url.password) {
    throw new BackendPostConfigurationError(
      "Backend post API base URL must not contain credentials.",
    );
  }
  if (url.search || url.hash) {
    throw new BackendPostConfigurationError(
      "Backend post API base URL must not contain a query string or fragment.",
    );
  }

  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return url;
}

async function request(
  fetchImpl: BackendPostFetch,
  url: URL,
  endpoint: string,
  options?: BackendPostRequestOptions,
) {
  const requestInit = createRequestInit(options);

  try {
    return await fetchImpl(url, requestInit);
  } catch (error) {
    throw new BackendPostApiError(`Backend post API request failed at ${endpoint}.`, endpoint, {
      cause: error,
    });
  }
}

function createRequestInit(options?: BackendPostRequestOptions): NextFetchRequestInit {
  if (options?.cache !== undefined && options.revalidate !== undefined) {
    throw new BackendPostInputError("cache and revalidate options cannot be used together.");
  }

  if (options?.revalidate !== undefined) {
    validateRevalidate(options.revalidate);
  }

  const init: NextFetchRequestInit = {
    headers: {
      Accept: "application/json",
    },
    signal: options?.signal,
  };

  if (options?.cache !== undefined) {
    init.cache = options.cache;
  } else {
    init.next = {
      revalidate: options?.revalidate ?? DEFAULT_POST_REVALIDATE_SECONDS,
      tags: [BACKEND_POSTS_CACHE_TAG],
    };
  }

  return init;
}

function ensureSuccessfulResponse(response: Response, endpoint: string) {
  if (!response.ok) {
    throw new BackendPostHttpError(response.status, endpoint);
  }
}

async function parseJson(response: Response, endpoint: string): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new BackendPostInvalidJsonError(endpoint, { cause: error });
  }
}

function parseBackendPostPage(value: unknown): BackendPostPage {
  const object = readObject(value, "page");
  return {
    content: readArray(object.content, "content").map((item, index) =>
      parseBackendPostListItem(item, `content[${index}]`),
    ),
    pageable: parseBackendPageable(object.pageable, "pageable"),
    last: readBoolean(object.last, "last"),
    totalPages: readNonNegativeInteger(object.totalPages, "totalPages"),
    totalElements: readNonNegativeInteger(object.totalElements, "totalElements"),
    size: readNonNegativeInteger(object.size, "size"),
    number: readNonNegativeInteger(object.number, "number"),
    sort: parseBackendSort(object.sort, "sort"),
    first: readBoolean(object.first, "first"),
    numberOfElements: readNonNegativeInteger(object.numberOfElements, "numberOfElements"),
    empty: readBoolean(object.empty, "empty"),
  };
}

function parseBackendPostListItem(value: unknown, path: string): BackendPostListItem {
  const object = readObject(value, path);
  return {
    slug: readString(object.slug, `${path}.slug`),
    title: readString(object.title, `${path}.title`),
    description: readString(object.description, `${path}.description`),
    category: readString(object.category, `${path}.category`),
    postDate: readString(object.postDate, `${path}.postDate`),
    updated: readNullableString(object.updated, `${path}.updated`),
    tags: readStringArray(object.tags, `${path}.tags`),
    thumbnail: readNullableString(object.thumbnail, `${path}.thumbnail`),
    series: readNullableString(object.series, `${path}.series`),
    featured: readBoolean(object.featured, `${path}.featured`),
  };
}

function parseBackendPostDetail(value: unknown): BackendPostDetail {
  const path = "detail";
  const object = readObject(value, path);
  return {
    ...parseBackendPostListItem(object, path),
    rawBody: readString(object.rawBody, `${path}.rawBody`),
    assetBaseUrl: readString(object.assetBaseUrl, `${path}.assetBaseUrl`),
  };
}

function parseBackendPageable(value: unknown, path: string): BackendPageable {
  const object = readObject(value, path);
  return {
    pageNumber: readNonNegativeInteger(object.pageNumber, `${path}.pageNumber`),
    pageSize: readNonNegativeInteger(object.pageSize, `${path}.pageSize`),
    sort: parseBackendSort(object.sort, `${path}.sort`),
    offset: readNonNegativeInteger(object.offset, `${path}.offset`),
    paged: readBoolean(object.paged, `${path}.paged`),
    unpaged: readBoolean(object.unpaged, `${path}.unpaged`),
  };
}

function parseBackendSort(value: unknown, path: string): BackendSort {
  const object = readObject(value, path);
  return {
    empty: readBoolean(object.empty, `${path}.empty`),
    sorted: readBoolean(object.sorted, `${path}.sorted`),
    unsorted: readBoolean(object.unsorted, `${path}.unsorted`),
  };
}

function readObject(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new BackendPostContractError(path);
  }
  return value as Record<string, unknown>;
}

function readArray(value: unknown, path: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new BackendPostContractError(path);
  }
  return value;
}

function readString(value: unknown, path: string) {
  if (typeof value !== "string") {
    throw new BackendPostContractError(path);
  }
  return value;
}

function readNullableString(value: unknown, path: string) {
  if (value === null) {
    return null;
  }
  return readString(value, path);
}

function readBoolean(value: unknown, path: string) {
  if (typeof value !== "boolean") {
    throw new BackendPostContractError(path);
  }
  return value;
}

function readNonNegativeInteger(value: unknown, path: string) {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new BackendPostContractError(path);
  }
  return value as number;
}

function readStringArray(value: unknown, path: string) {
  return readArray(value, path).map((item, index) => readString(item, `${path}[${index}]`));
}

function validateBackendPage(page: number) {
  if (!Number.isInteger(page) || page < 0) {
    throw new BackendPostInputError("Backend page must be a non-negative integer.");
  }
}

function validatePageSize(size: number) {
  if (!Number.isInteger(size) || size < 1 || size > MAX_PAGE_SIZE) {
    throw new BackendPostInputError(`Page size must be an integer between 1 and ${MAX_PAGE_SIZE}.`);
  }
}

function validateCategory(category: string | undefined) {
  if (category !== undefined && !category.trim()) {
    throw new BackendPostInputError("Category must not be blank when provided.");
  }
}

function validateTag(tag: string | undefined) {
  if (tag !== undefined && !tag.trim()) {
    throw new BackendPostInputError("Tag must not be blank when provided.");
  }
}

function normalizeSearchQuery(query: string | undefined) {
  if (query === undefined) {
    return undefined;
  }

  const normalized = query.trim();
  if (!normalized) {
    throw new BackendPostInputError("Search query must not be blank when provided.");
  }
  if (normalized.length > MAX_POST_SEARCH_QUERY_LENGTH) {
    throw new BackendPostInputError(
      `Search query must not exceed ${MAX_POST_SEARCH_QUERY_LENGTH} characters.`,
    );
  }
  return normalized;
}

function validateSlug(slug: string) {
  if (typeof slug !== "string" || !slug.trim()) {
    throw new BackendPostInputError("Post slug must not be blank.");
  }
  return slug.trim();
}

function validateRevalidate(value: number | false) {
  if (value !== false && (!Number.isInteger(value) || value < 0)) {
    throw new BackendPostInputError("revalidate must be false or a non-negative integer.");
  }
}
