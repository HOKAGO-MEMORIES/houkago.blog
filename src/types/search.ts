import type { Category } from "@/types/post";

export type SearchPost = {
  slug: string;
  title: string;
  description: string;
  category: Category;
  date: string;
  searchText: string;
};

export type SearchIndex = {
  version: number;
  generatedAt: string;
  posts: SearchPost[];
};
