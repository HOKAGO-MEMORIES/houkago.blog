"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { SearchPost } from "@/types/search";
import { Button } from "@/components/ui/button";

interface SearchDialogProps {
  posts: SearchPost[];
}

export default function SearchDialog({ posts }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return posts.filter((post) => {
      const haystack = `${post.title} ${post.searchText}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, posts]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none shadow-none text-primary hover:bg-transparent hover:text-foreground"
        >
          <Search className="h-5 w-5 transition-colors" strokeWidth={2.25} />
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
                className="h-8 w-8 rounded-none text-primary hover:bg-transparent hover:text-foreground"
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
              placeholder="제목이나 본문 내용을 검색해보세요"
              className="rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </label>

          {normalizedQuery ? (
            <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
              <p className="text-sm text-muted-foreground">
                검색 결과 {results.length}개
              </p>
              {results.length > 0 ? (
                <div className="flex flex-col">
                  {results.map((post) => (
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
