import type { Category } from "@/types/post";

export type SearchResultItem = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly category: Category;
  readonly date: string;
};

export type SearchResponse = {
  readonly items: readonly SearchResultItem[];
  readonly totalElements: number;
  readonly page: number;
  readonly size: number;
  readonly totalPages: number;
};
