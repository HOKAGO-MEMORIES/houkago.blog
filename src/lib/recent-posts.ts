export const DEFAULT_RECENT_POST_COUNT = 5;

export function selectRecentPosts<T>(
  posts: readonly T[],
  limit = DEFAULT_RECENT_POST_COUNT,
): T[] {
  return posts.slice(0, limit);
}
