import Link from "next/link";

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

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      className="flex flex-wrap items-center gap-2 pt-2"
      aria-label="Pagination"
    >
      {currentPage > 1 ? (
        <Link
          href={getPageHref(currentPage - 1)}
          className="rounded-full border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary"
        >
          Prev
        </Link>
      ) : null}

      {pages.map((page) => {
        const isActive = page === currentPage;

        return (
          <Link
            key={page}
            href={getPageHref(page)}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                : "rounded-full border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary"
            }
          >
            {page}
          </Link>
        );
      })}

      {currentPage < totalPages ? (
        <Link
          href={getPageHref(currentPage + 1)}
          className="rounded-full border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
