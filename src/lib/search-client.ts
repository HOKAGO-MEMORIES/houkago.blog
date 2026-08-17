import type { Category } from "@/types/post";
import type { SearchResponse, SearchResultItem } from "@/types/search";
import {
  MAX_POST_SEARCH_QUERY_LENGTH,
  SEARCH_RESULT_PAGE_SIZE,
} from "@/lib/post-search-contract";

const SEARCH_ENDPOINT = "/api/search";
const SUPPORTED_CATEGORIES: readonly Category[] = ["algorithm", "project", "cs", "blog"];

type SearchFetch = typeof fetch;

type FetchSearchResultsOptions = {
  readonly signal?: AbortSignal;
  readonly fetchImpl?: SearchFetch;
};

export class SearchRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Search request failed with HTTP ${status}.`);
    this.name = "SearchRequestError";
    this.status = status;
  }
}

export class SearchResponseContractError extends Error {
  readonly fieldPath: string;

  constructor(fieldPath: string, options?: ErrorOptions) {
    super(`Invalid search response contract at ${fieldPath}.`, options);
    this.name = "SearchResponseContractError";
    this.fieldPath = fieldPath;
  }
}

export async function fetchSearchResults(
  query: string,
  {
    signal,
    fetchImpl = fetch,
  }: FetchSearchResultsOptions = {},
): Promise<SearchResponse> {
  const normalizedQuery = normalizeSearchQuery(query);
  const searchParams = new URLSearchParams({
    q: normalizedQuery,
    page: "0",
    size: String(SEARCH_RESULT_PAGE_SIZE),
  });
  const response = await fetchImpl(`${SEARCH_ENDPOINT}?${searchParams}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new SearchRequestError(response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new SearchResponseContractError("root JSON", { cause: error });
  }
  return parseSearchResponse(body);
}

export function normalizeSearchQuery(query: string) {
  const normalized = query.trim();
  if (!normalized) {
    throw new RangeError("Search query must not be blank.");
  }
  if (normalized.length > MAX_POST_SEARCH_QUERY_LENGTH) {
    throw new RangeError(
      `Search query must not exceed ${MAX_POST_SEARCH_QUERY_LENGTH} characters.`,
    );
  }
  return normalized;
}

export function parseSearchResponse(value: unknown): SearchResponse {
  const root = requireRecord(value, "root");
  const items = requireArray(root.items, "items").map((item, index) => (
    parseSearchResultItem(item, `items[${index}]`)
  ));
  const totalElements = requireNonNegativeInteger(root.totalElements, "totalElements");
  const page = requireNonNegativeInteger(root.page, "page");
  const size = requirePositiveInteger(root.size, "size");
  const totalPages = requireNonNegativeInteger(root.totalPages, "totalPages");

  if (items.length > size || items.length > totalElements) {
    throw new SearchResponseContractError("items");
  }

  return {
    items,
    totalElements,
    page,
    size,
    totalPages,
  };
}

function parseSearchResultItem(value: unknown, path: string): SearchResultItem {
  const item = requireRecord(value, path);
  const category = requireString(item.category, `${path}.category`);
  if (!SUPPORTED_CATEGORIES.includes(category as Category)) {
    throw new SearchResponseContractError(`${path}.category`);
  }

  return {
    slug: requireString(item.slug, `${path}.slug`),
    title: requireString(item.title, `${path}.title`),
    description: requireString(item.description, `${path}.description`),
    category: category as Category,
    date: requireString(item.date, `${path}.date`),
  };
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new SearchResponseContractError(path);
  }
  return value as Record<string, unknown>;
}

function requireArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new SearchResponseContractError(path);
  }
  return value;
}

function requireString(value: unknown, path: string) {
  if (typeof value !== "string") {
    throw new SearchResponseContractError(path);
  }
  return value;
}

function requireNonNegativeInteger(value: unknown, path: string) {
  if (!Number.isSafeInteger(value) || Number(value) < 0) {
    throw new SearchResponseContractError(path);
  }
  return Number(value);
}

function requirePositiveInteger(value: unknown, path: string) {
  const integer = requireNonNegativeInteger(value, path);
  if (integer === 0) {
    throw new SearchResponseContractError(path);
  }
  return integer;
}
