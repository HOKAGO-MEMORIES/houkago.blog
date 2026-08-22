// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PostDetailNavigation from "@/app/blog/components/post-detail-navigation";

const olderPost = {
  slug: "older-post",
  title: "A deliberately long older post title that must wrap without overflowing",
  date: "2026-08-16",
};
const newerPost = {
  slug: "newer-post",
  title: "Newer Post",
  date: "2026-08-18",
};

afterEach(cleanup);

describe("post detail navigation", () => {
  it("maps older left and newer right to exact detail links", () => {
    render(<PostDetailNavigation olderPost={olderPost} newerPost={newerPost} />);

    expect(screen.getByRole("navigation", { name: "이전 및 다음 글" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /이전 글/ }).getAttribute("href")).toBe(
      "/blog/older-post",
    );
    expect(screen.getByRole("link", { name: /다음 글/ }).getAttribute("href")).toBe(
      "/blog/newer-post",
    );
  });

  it("keeps the newest boundary slot as a non-focusable note", () => {
    render(<PostDetailNavigation olderPost={olderPost} newerPost={null} />);

    expect(screen.getByText("더 새로운 글이 없습니다.").closest("[role=note]")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /다음 글/ })).toBeNull();
    expect(screen.getByRole("link", { name: /이전 글/ })).toBeTruthy();
  });

  it("keeps the oldest boundary slot as a non-focusable note", () => {
    render(<PostDetailNavigation olderPost={null} newerPost={newerPost} />);

    expect(screen.getByText("더 오래된 글이 없습니다.").closest("[role=note]")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /이전 글/ })).toBeNull();
    expect(screen.getByRole("link", { name: /다음 글/ })).toBeTruthy();
  });
});
