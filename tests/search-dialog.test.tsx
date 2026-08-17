/** @vitest-environment jsdom */

import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SEARCH_DEBOUNCE_MS } from "@/lib/post-search-contract";
import type { SearchResponse } from "@/types/search";

const searchMocks = vi.hoisted(() => ({
  fetchSearchResults: vi.fn(),
}));

vi.mock("@/lib/search-client", () => ({
  fetchSearchResults: searchMocks.fetchSearchResults,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={String(href)} {...props}>{children}</a>
  ),
}));

vi.mock("@radix-ui/react-dialog", async () => {
  const ReactModule = await import("react");
  type DialogValue = {
    open: boolean;
    setOpen: (open: boolean) => void;
  };
  const Context = ReactModule.createContext<DialogValue | null>(null);
  const useDialog = () => {
    const value = ReactModule.useContext(Context);
    if (!value) {
      throw new Error("Dialog context is missing.");
    }
    return value;
  };
  const cloneWithClick = (
    child: React.ReactElement<{ onClick?: () => void }>,
    onClick: () => void,
  ) => ReactModule.cloneElement(child, { onClick });

  return {
    Root: ({ open, onOpenChange, children }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      children: React.ReactNode;
    }) => (
      <Context.Provider value={{ open, setOpen: onOpenChange }}>
        {children}
      </Context.Provider>
    ),
    Trigger: ({ children }: { children: React.ReactElement }) => {
      const { setOpen } = useDialog();
      return cloneWithClick(children, () => setOpen(true));
    },
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Overlay: (props: React.HTMLAttributes<HTMLDivElement>) => {
      const { open } = useDialog();
      return open ? <div {...props} /> : null;
    },
    Content: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
      const { open } = useDialog();
      return open ? <div role="dialog" {...props}>{children}</div> : null;
    },
    Title: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
    Close: ({ children }: { children: React.ReactElement }) => {
      const { setOpen } = useDialog();
      return cloneWithClick(children, () => setOpen(false));
    },
  };
});

import SearchDialog from "@/components/search-dialog";

const turretResponse: SearchResponse = {
  items: [
    {
      slug: "boj-1002",
      title: "BOJ 1002 - 터렛",
      description: "위잉..위잉..",
      category: "algorithm",
      date: "2023-03-05",
    },
  ],
  totalElements: 1,
  page: 0,
  size: 20,
  totalPages: 1,
};

beforeEach(() => {
  vi.useFakeTimers();
  searchMocks.fetchSearchResults.mockReset();
  searchMocks.fetchSearchResults.mockResolvedValue(turretResponse);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SearchDialog", () => {
  it("opens in idle state and does not request an empty query", () => {
    openDialog();

    expect(screen.getByText("검색어를 입력하면 결과가 여기에 표시됩니다.")).toBeTruthy();
    expect(searchMocks.fetchSearchResults).not.toHaveBeenCalled();
  });

  it("debounces input, shows loading, and renders Backend results in their order", async () => {
    openDialog();
    const input = screen.getByLabelText("Search query");
    fireEvent.change(input, { target: { value: "PriorityQueue" } });

    expect(screen.getByText("검색 결과를 불러오는 중입니다.")).toBeTruthy();
    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS - 1));
    expect(searchMocks.fetchSearchResults).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(1));

    expect(searchMocks.fetchSearchResults).toHaveBeenCalledWith(
      "PriorityQueue",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(screen.getByText("BOJ 1002 - 터렛")).toBeTruthy();
    expect(screen.getByText("검색 결과 1개")).toBeTruthy();
  });

  it("shows bounded count metadata without requesting every page", async () => {
    searchMocks.fetchSearchResults.mockResolvedValue({
      ...turretResponse,
      totalElements: 33,
      items: Array.from({ length: 20 }, (_, index) => ({
        ...turretResponse.items[0],
        slug: `result-${index}`,
        title: `Result ${index}`,
      })),
      totalPages: 2,
    });
    openDialog();
    fireEvent.change(screen.getByLabelText("Search query"), { target: { value: "최솟값" } });

    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));

    expect(screen.getByText("검색 결과 33개 · 최신 20개 표시")).toBeTruthy();
    expect(searchMocks.fetchSearchResults).toHaveBeenCalledOnce();
  });

  it("distinguishes an empty result from an error", async () => {
    searchMocks.fetchSearchResults.mockResolvedValue({
      items: [],
      totalElements: 0,
      page: 0,
      size: 20,
      totalPages: 0,
    });
    openDialog();
    fireEvent.change(screen.getByLabelText("Search query"), { target: { value: "unknown" } });
    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));

    expect(screen.getByText("일치하는 글이 없습니다.")).toBeTruthy();
    expect(screen.getByText("검색 결과 0개")).toBeTruthy();

    searchMocks.fetchSearchResults.mockRejectedValueOnce(new Error("backend unavailable"));
    fireEvent.change(screen.getByLabelText("Search query"), { target: { value: "unknown-2" } });
    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));

    expect(screen.getByText("검색 결과를 불러오지 못했습니다.")).toBeTruthy();
  });

  it("aborts the previous request and prevents stale results from replacing the latest result", async () => {
    const first = deferred<SearchResponse>();
    const second = deferred<SearchResponse>();
    searchMocks.fetchSearchResults
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    openDialog();
    const input = screen.getByLabelText("Search query");

    fireEvent.change(input, { target: { value: "java" } });
    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));
    const firstSignal = searchMocks.fetchSearchResults.mock.calls[0][1].signal as AbortSignal;
    fireEvent.change(input, { target: { value: "javascript" } });
    expect(firstSignal.aborted).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));

    await act(async () => {
      second.resolve({
        ...turretResponse,
        items: [{ ...turretResponse.items[0], slug: "latest", title: "Latest result" }],
      });
    });
    await act(async () => {
      first.resolve({
        ...turretResponse,
        items: [{ ...turretResponse.items[0], slug: "stale", title: "Stale result" }],
      });
    });

    expect(screen.getByText("Latest result")).toBeTruthy();
    expect(screen.queryByText("Stale result")).toBeNull();
  });

  it("closes the dialog when a result is clicked", async () => {
    openDialog();
    fireEvent.change(screen.getByLabelText("Search query"), { target: { value: "터렛" } });
    await act(() => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));

    fireEvent.click(screen.getByRole("link", { name: /BOJ 1002 - 터렛/ }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

function openDialog() {
  render(<SearchDialog />);
  fireEvent.click(screen.getByRole("button", { name: "Open search" }));
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}
