import { describe, expect, it } from "vitest";

import {
  getTagRoute,
  parseTagRouteParam,
} from "@/lib/post-navigation";

describe("tag navigation", () => {
  it.each([
    ["graph", "/blog/tag/graph"],
    ["graph-theory", "/blog/tag/graph-theory"],
    ["그래프 탐색", "/blog/tag/%EA%B7%B8%EB%9E%98%ED%94%84%20%ED%83%90%EC%83%89"],
  ])("encodes %s as a tag route", (tag, route) => {
    expect(getTagRoute(tag)).toBe(route);
  });

  it("decodes an encoded Unicode tag exactly once", () => {
    expect(parseTagRouteParam("%EA%B7%B8%EB%9E%98%ED%94%84%20%ED%83%90%EC%83%89"))
      .toBe("그래프 탐색");
    expect(parseTagRouteParam("%2520")).toBe("%20");
  });

  it.each(["", "%20%20", "%E0%A4%A"])("rejects invalid tag segment %s", (value) => {
    expect(parseTagRouteParam(value)).toBeNull();
  });
});
