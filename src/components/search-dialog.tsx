"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SearchResponse } from "@/types/search";
import { Button } from "@/components/ui/button";
import {
  MAX_POST_SEARCH_QUERY_LENGTH,
  SEARCH_DEBOUNCE_MS,
} from "@/lib/post-search-contract";
import { fetchSearchResults } from "@/lib/search-client";

type SearchState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "results"; readonly response: SearchResponse }
  | { readonly status: "error"; readonly message: string };

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });
  const normalizedQuery = query.trim();

  useEffect(() => {
    if (!open) {
      return;
    }
    if (!normalizedQuery) {
      setSearchState({ status: "idle" });
      return;
    }
    if (normalizedQuery.length > MAX_POST_SEARCH_QUERY_LENGTH) {
      setSearchState({
        status: "error",
        message: `검색어는 ${MAX_POST_SEARCH_QUERY_LENGTH}자 이하로 입력해주세요.`,
      });
      return;
    }

    const controller = new AbortController();
    let active = true;
    setSearchState({ status: "loading" });
    const debounceTimer = window.setTimeout(() => {
      fetchSearchResults(normalizedQuery, { signal: controller.signal })
        .then((response) => {
          if (active) {
            setSearchState({ status: "results", response });
          }
        })
        .catch((error: unknown) => {
          if (active && !(error instanceof DOMException && error.name === "AbortError")) {
            setSearchState({
              status: "error",
              message: "검색 결과를 불러오지 못했습니다.",
            });
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [normalizedQuery, open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="검색"
          className="h-11 w-11 rounded-full text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
        >
          <Search className="h-[18px] w-[18px] transition-colors" strokeWidth={2} />
          <span className="sr-only">Open search</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[12vh] z-50 flex w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-4 rounded-[1.75rem] border bg-background p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Dialog.Title className="text-2xl font-bold text-primary">
                Search
              </Dialog.Title>
              <p className="text-sm text-muted-foreground">
                제목과 본문 내용을 기준으로 현재 공개된 글을 빠르게 찾을 수 있습니다.
              </p>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full text-primary hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" strokeWidth={2.25} />
                <span className="sr-only">Close search</span>
              </Button>
            </Dialog.Close>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-primary">Search query</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={MAX_POST_SEARCH_QUERY_LENGTH}
              placeholder="제목이나 본문 내용을 검색해보세요"
              className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </label>

          {searchState.status === "loading" ? (
            <div className="rounded-2xl border border-dashed px-5 py-8 text-sm text-muted-foreground">
              검색 결과를 불러오는 중입니다.
            </div>
          ) : searchState.status === "error" ? (
            <div className="rounded-2xl border px-5 py-8 text-sm text-muted-foreground">
              {searchState.message}
            </div>
          ) : searchState.status === "results" ? (
            <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
              <p className="text-sm text-muted-foreground">
                검색 결과 {searchState.response.totalElements}개
                {searchState.response.totalElements > searchState.response.items.length
                  ? ` · 최신 ${searchState.response.items.length}개 표시`
                  : ""}
              </p>
              {searchState.response.items.length > 0 ? (
                <div className="flex flex-col">
                  {searchState.response.items.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-4 border-b py-4 last:border-none"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          {post.category}
                        </span>
                        <span className="text-lg font-semibold text-primary">
                          {post.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {post.description}
                        </span>
                      </div>
                      <time className="shrink-0 text-xs">{post.date}</time>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border px-5 py-8 text-sm text-muted-foreground">
                  일치하는 글이 없습니다.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed px-5 py-8 text-sm text-muted-foreground">
              검색어를 입력하면 결과가 여기에 표시됩니다.
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
