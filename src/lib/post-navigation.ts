import type { Category } from "@/types/post";
import { getCategoryDescription } from "@/lib/site";

export const BLOG_CATEGORIES: readonly Category[] = ["algorithm", "project", "cs", "blog"];
export const POSTS_PER_PAGE = 25;

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

export function getCategoryPageRoute(category: Category, page = 1) {
  return page <= 1 ? getCategoryRoute(category) : `/blog/${category}/page/${page}`;
}

export function getTagRoute(tag: string, page = 1) {
  const encodedTag = encodeURIComponent(tag);
  return page <= 1 ? `/blog/tag/${encodedTag}` : `/blog/tag/${encodedTag}/page/${page}`;
}

export function getCategorySummary(category: Category) {
  return getCategoryDescription(category);
}
