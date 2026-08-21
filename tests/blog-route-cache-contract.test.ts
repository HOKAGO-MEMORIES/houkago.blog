import { describe, expect, it } from "vitest";

import { generateStaticParams as generateArchiveParams } from "@/app/blog/page/[page]/page";
import { generateStaticParams as generateSegmentParams } from "@/app/blog/[slug]/page";
import { generateStaticParams as generateCategoryPageParams } from "@/app/blog/[slug]/page/[page]/page";
import { generateStaticParams as generateTagParams } from "@/app/blog/tag/[tag]/page";
import { generateStaticParams as generateTagPageParams } from "@/app/blog/tag/[tag]/page/[page]/page";

describe("on-demand ISR route contract", () => {
  it.each([
    ["archive pagination", generateArchiveParams],
    ["blog segment", generateSegmentParams],
    ["category pagination", generateCategoryPageParams],
    ["tag", generateTagParams],
    ["tag pagination", generateTagPageParams],
  ])("does not enumerate build-time params for %s", (_name, generateStaticParams) => {
    expect(generateStaticParams()).toEqual([]);
  });
});
