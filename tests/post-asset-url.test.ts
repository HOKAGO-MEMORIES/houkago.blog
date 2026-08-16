import { describe, expect, it } from "vitest";

import {
  normalizePostAssetBaseUrl,
  PostAssetUrlError,
  resolvePostAssetUrl,
} from "@/lib/post-asset-url";

const assetBaseUrl = "https://assets.example.test/assets/posts/example-post/";

describe("post asset URL resolution", () => {
  it.each([
    ["./assets/foo.png", "https://assets.example.test/assets/posts/example-post/foo.png"],
    [
      "./assets/a/b image.png",
      "https://assets.example.test/assets/posts/example-post/a/b%20image.png",
    ],
    [
      "./assets/report.pdf#page=2",
      "https://assets.example.test/assets/posts/example-post/report.pdf#page=2",
    ],
  ])("resolves %s inside the post asset base", (target, expected) => {
    expect(resolvePostAssetUrl(target, assetBaseUrl)).toBe(expected);
  });

  it.each([
    "https://cdn.example.test/image.png",
    "#section",
    "./other-post",
    "../parent",
    "/blog/another-post",
    "mailto:author@example.test",
    "javascript:alert(1)",
    "data:image/png;base64,AAAA",
  ])("does not treat %s as a local post asset", (target) => {
    expect(resolvePostAssetUrl(target, assetBaseUrl)).toBe(target);
  });

  it.each([
    "./assets/../private.txt",
    "./assets/%2e%2e/private.txt",
    "./assets/nested/%2Fprivate.txt",
    "./assets/nested\\private.txt",
    "./assets//empty-segment.png",
  ])("rejects unsafe local asset target %s", (target) => {
    expect(() => resolvePostAssetUrl(target, assetBaseUrl)).toThrow(PostAssetUrlError);
  });

  it("requires the canonical trailing-slash asset base contract", () => {
    expect(normalizePostAssetBaseUrl(assetBaseUrl)).toBe(assetBaseUrl);
    expect(() => normalizePostAssetBaseUrl("https://assets.example.test/assets/posts/example-post"))
      .toThrow(PostAssetUrlError);
    expect(() => normalizePostAssetBaseUrl("https://assets.example.test/other/path/"))
      .toThrow(PostAssetUrlError);
    expect(() => normalizePostAssetBaseUrl("javascript:alert(1)"))
      .toThrow(PostAssetUrlError);
  });
});
