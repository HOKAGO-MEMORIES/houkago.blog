// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PostTableOfContents from "@/app/blog/components/post-table-of-contents";

const scrollTo = vi.fn();

beforeEach(() => {
  scrollTo.mockReset();
  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    value: scrollTo,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({ matches: false }),
  });
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
  window.cancelAnimationFrame = vi.fn();
  window.history.replaceState(null, "", "/");
});

describe("post table of contents", () => {
  it("moves to the matching heading and records the hash", () => {
    render(
      <>
        <PostTableOfContents
          items={[{ id: "문제-이해", level: 2, text: "문제 이해" }]}
        />
        <h2 id="문제-이해">문제 이해</h2>
      </>,
    );

    fireEvent.click(screen.getByRole("link", { name: /문제 이해/ }));

    expect(scrollTo).toHaveBeenCalledWith({
      behavior: "smooth",
      top: 0,
    });
    expect(window.location.hash).toBe("#%EB%AC%B8%EC%A0%9C-%EC%9D%B4%ED%95%B4");
  });
});
