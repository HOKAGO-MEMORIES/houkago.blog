import { describe, expect, it } from "vitest";

import {
  DEFAULT_RECENT_POST_COUNT,
  selectRecentPosts,
} from "@/lib/recent-posts";

describe("selectRecentPosts", () => {
  it("returns the first five items in the provided backend order", () => {
    const posts = Array.from({ length: 6 }, (_, index) => ({ slug: `post-${index + 1}` }));

    const recentPosts = selectRecentPosts(posts);

    expect(recentPosts).toEqual(posts.slice(0, DEFAULT_RECENT_POST_COUNT));
    expect(recentPosts[0]).toBe(posts[0]);
  });

  it("returns an empty list for an empty backend page", () => {
    expect(selectRecentPosts([])).toEqual([]);
  });
});
