// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PostCodeBlock from "@/components/mdx/post-code-block";

const writeText = vi.fn();

beforeEach(() => {
  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

describe("post code block", () => {
  it("copies rendered code and exposes a stable accessible status", async () => {
    render(
      <PostCodeBlock language="typescript">
        <code>{"const answer = 42;"}</code>
      </PostCodeBlock>,
    );

    expect(screen.getByText("typescript")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "복사" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("const answer = 42;");
      expect(screen.getByRole("button", { name: "복사됨" })).toBeTruthy();
    });
  });
});
