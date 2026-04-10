import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Category, Post, PostManifest } from "@/types/post";

const MANIFEST_PATH = path.join(process.cwd(), ".generated", "posts-manifest.json");

export const BLOG_CATEGORIES: Category[] = ["algorithm", "project", "cs", "blog"];

function isDraftPreviewEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.POSTS_INCLUDE_DRAFTS === "true";
}

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

export function getRenderablePosts() {
  return getAllPosts().filter((post) => {
    if (post.status === "published") {
      return true;
    }

    if (post.status === "draft" && isDraftPreviewEnabled()) {
      return true;
    }

    return false;
  });
}

export function getVisiblePostsByCategory(category: Category) {
  return getRenderablePosts().filter((post) => post.category === category);
}

export function getPostBySlug(slug: string) {
  return getRenderablePosts().find((post) => post.slug === slug);
}

export function getFeaturedPosts(limit = 3) {
  return getRenderablePosts()
    .filter((post) => post.featured)
    .slice(0, limit);
}

export function getRecentPosts(limit = 5) {
  return getRenderablePosts().slice(0, limit);
}

export function getCategoryHighlights() {
  return BLOG_CATEGORIES.map((category) => {
    const posts = getVisiblePostsByCategory(category);
    return {
      category,
      count: posts.length,
      posts: posts.slice(0, 3),
    };
  }).filter((group) => group.count > 0);
}

export function isCategorySegment(segment: string): segment is Category {
  return BLOG_CATEGORIES.includes(segment as Category);
}

export function getStaticBlogSegments() {
  const categories = BLOG_CATEGORIES.filter((category) => getVisiblePostsByCategory(category).length > 0).map((category) => ({
    segment: category,
  }));
  const posts = getRenderablePosts().map((post) => ({
    segment: post.slug,
  }));

  return [...categories, ...posts];
}

export function getPostRoute(post: Post) {
  return `/blog/${post.slug}`;
}

export function getCategoryRoute(category: Category) {
  return `/blog/${category}`;
}
