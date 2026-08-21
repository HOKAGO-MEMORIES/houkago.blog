import { describe, expect, it } from "vitest";

import { getVisiblePaginationItems } from "@/app/blog/components/pagination-nav";

describe("blog pagination presentation", () => {
  it("shows every page for a short archive", () => {
    expect(getVisiblePaginationItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps the first, current neighborhood, and last page for a long archive", () => {
    expect(getVisiblePaginationItems(50, 120)).toEqual([
      1,
      "ellipsis",
      49,
      50,
      51,
      "ellipsis",
      120,
    ]);
  });

  it("does not add duplicate ellipses near either boundary", () => {
    expect(getVisiblePaginationItems(2, 20)).toEqual([1, 2, 3, "ellipsis", 20]);
    expect(getVisiblePaginationItems(19, 20)).toEqual([1, "ellipsis", 18, 19, 20]);
  });
});
