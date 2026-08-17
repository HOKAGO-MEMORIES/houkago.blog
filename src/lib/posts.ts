import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Post, PostManifest } from "@/types/post";
import { POSTS_PER_PAGE } from "@/lib/post-navigation";

export {
  BLOG_CATEGORIES,
  POSTS_PER_PAGE,
  getArchiveRoute,
  getCategoryPageRoute,
  getCategoryRoute,
  getCategorySummary,
  getPostRoute,
  getTagRoute,
  isCategorySegment,
} from "@/lib/post-navigation";

const GENERATED_DIR = path.join(process.cwd(), ".generated");
const MANIFEST_PATH = path.join(GENERATED_DIR, "posts-manifest.json");

type PaginatedPosts = {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export const getPostManifest = cache((): PostManifest => {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      `Generated post manifest was not found at ${MANIFEST_PATH}. Run "npm run posts:sync" with POSTS_REPO_PATH set to houkago.posts, or use the GitHub Actions/Vercel prebuild pipeline.`,
    );
  }

  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  return JSON.parse(raw) as PostManifest;
});

export function getAllPosts() {
  return getPostManifest().posts;
}

export const getRenderablePosts = cache(() => {
  return getAllPosts().filter((post) => post.status === "published");
});

export function getRecentPosts(limit = 5) {
  return getRenderablePosts().slice(0, limit);
}

export function paginatePosts(posts: Post[], page: number, pageSize = POSTS_PER_PAGE): PaginatedPosts {
  const totalItems = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    posts: posts.slice(startIndex, startIndex + pageSize),
    currentPage,
    totalPages,
    totalItems,
  };
}

export function getArchivePagination(page: number) {
  return paginatePosts(getRenderablePosts(), page);
}
