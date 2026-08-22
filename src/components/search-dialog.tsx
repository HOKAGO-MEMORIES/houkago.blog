"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SearchResponse } from "@/types/search";
import { Button } from "@/components/ui/button";
import {
  MAX_POST_SEARCH_QUERY_LENGTH,
  SEARCH_DEBOUNCE_MS,
} from "@/lib/post-search-contract";
import { getCategoryDisplayLabel } from "@/lib/post-navigation";
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
          aria-label="검색"
          className="h-11 w-11 rounded-full text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
        >
          <Search
            aria-hidden="true"
            className="h-[18px] w-[18px] transition-colors"
            strokeWidth={2}
          />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="search-dialog-overlay" />
        <Dialog.Content
          className="search-dialog-panel"
          aria-describedby={undefined}
        >
          <header className="search-dialog-header">
            <Dialog.Title>검색</Dialog.Title>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="검색 닫기"
                className="search-dialog-close"
              >
                <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
              </Button>
            </Dialog.Close>
          </header>

          <div className="search-dialog-form">
            <label className="search-dialog-input-frame">
              <span className="sr-only">글 검색</span>
              <input
                autoFocus
                type="search"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                maxLength={MAX_POST_SEARCH_QUERY_LENGTH}
                placeholder="문제 번호나 제목 검색"
              />
              <Search aria-hidden="true" />
            </label>
          </div>

          <div className="search-dialog-body" aria-live="polite">
            {searchState.status === "loading" ? (
              <p className="search-dialog-state" role="status">
                검색 중…
              </p>
            ) : searchState.status === "error" ? (
              <p className="search-dialog-state" role="alert">
                {searchState.message}
              </p>
            ) : searchState.status === "results" ? (
              <>
                <p className="search-dialog-summary">
                  검색 결과 {searchState.response.totalElements}개
                  {searchState.response.totalElements > searchState.response.items.length
                    ? ` · 최신 ${searchState.response.items.length}개 표시`
                    : ""}
                </p>
                {searchState.response.items.length > 0 ? (
                  <ul className="search-dialog-results">
                    {searchState.response.items.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/blog/${post.slug}`}
                          onClick={() => setOpen(false)}
                          className="search-dialog-result-row"
                        >
                          <span className="search-dialog-result-meta">
                            <time dateTime={post.date}>{formatSearchDate(post.date)}</time>
                            <span>{getCategoryDisplayLabel(post.category)}</span>
                          </span>
                          <span className="search-dialog-result-copy">
                            <strong>{post.title}</strong>
                            <span>{post.description}</span>
                          </span>
                          <ArrowRight
                            aria-hidden="true"
                            className="search-dialog-result-arrow"
                            strokeWidth={1.75}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="search-dialog-state">검색 결과가 없습니다.</p>
                )}
              </>
            ) : (
              <p className="search-dialog-state">검색어를 입력해 주세요.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function formatSearchDate(date: string) {
  return date.replaceAll("-", ".");
}
