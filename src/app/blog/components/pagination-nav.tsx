import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  getPageHref: (page: number) => string;
}

export default function PaginationNav({
  currentPage,
  totalPages,
  getPageHref,
}: PaginationNavProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePaginationItems(currentPage, totalPages);

  return (
    <nav
      className="blog-pagination"
      aria-label="페이지 이동"
    >
      {currentPage > 1 ? (
        <Link
          href={getPageHref(currentPage - 1)}
          className="blog-pagination-direction"
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>이전</span>
        </Link>
      ) : (
        <span className="blog-pagination-direction is-disabled" aria-disabled="true">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>이전</span>
        </span>
      )}

      <div className="blog-pagination-pages">
        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="blog-pagination-ellipsis"
                aria-hidden="true"
              >
                ···
              </span>
            );
          }
          const isActive = page === currentPage;

          return (
            <Link
              key={page}
              href={getPageHref(page)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`${page}페이지`}
              className={isActive ? "blog-pagination-page is-active" : "blog-pagination-page"}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={getPageHref(currentPage + 1)}
          className="blog-pagination-direction"
          aria-label="다음 페이지"
        >
          <span>다음</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="blog-pagination-direction is-disabled" aria-disabled="true">
          <span>다음</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}

export type PaginationItem = number | "ellipsis";

export function getVisiblePaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visiblePages = new Set([1, totalPages]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) {
      visiblePages.add(page);
    }
  }

  const sortedPages = [...visiblePages].sort((left, right) => left - right);
  const items: PaginationItem[] = [];
  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  });
  return items;
}
