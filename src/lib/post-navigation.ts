import type { Category } from "@/types/post";
import { getCategoryDescription } from "@/lib/site";

export const BLOG_CATEGORIES: readonly Category[] = ["algorithm", "project", "cs", "blog"];
export const POSTS_PER_PAGE = 25;
export type BlogCategoryFilter = Category | "all";

const BLOG_CATEGORY_LABELS: Record<Category, string> = {
  algorithm: "알고리즘",
  project: "프로젝트",
  cs: "CS",
  blog: "블로그",
};

export function isCategorySegment(segment: string): segment is Category {
  return BLOG_CATEGORIES.includes(segment as Category);
}

export function getPostRoute(post: { readonly slug: string }) {
  return `/blog/${post.slug}`;
}

export function getArchiveRoute(page = 1) {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}

export function getCategoryRoute(category: Category) {
  return `/blog/${category}`;
}

export function getCategoryDisplayLabel(category: Category) {
  return BLOG_CATEGORY_LABELS[category];
}

export function getCategoryPageRoute(category: Category, page = 1) {
  return page <= 1 ? getCategoryRoute(category) : `/blog/${category}/page/${page}`;
}

export function getTagRoute(tag: string, page = 1) {
  const encodedTag = encodeURIComponent(tag);
  return page <= 1 ? `/blog/tag/${encodedTag}` : `/blog/tag/${encodedTag}/page/${page}`;
}

export function parseTagRouteParam(value: string): string | null {
  let tag: string;
  try {
    tag = decodeURIComponent(value);
  } catch {
    return null;
  }

  return tag.trim() ? tag : null;
}

export function getCategorySummary(category: Category) {
  return getCategoryDescription(category);
}
