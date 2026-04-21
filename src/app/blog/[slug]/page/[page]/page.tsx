import { notFound } from "next/navigation";
import PaginationNav from "@/app/blog/components/pagination-nav";
import PostListSection from "@/app/blog/components/post-list-section";
import {
  BLOG_CATEGORIES,
  POSTS_PER_PAGE,
  getCategoryPageRoute,
  getCategoryPagination,
  getCategorySummary,
  isCategorySegment,
} from "@/lib/posts";

export function generateStaticParams() {
  return BLOG_CATEGORIES.flatMap((category) => {
    const { totalPages } = getCategoryPagination(category, 1);

    return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
      slug: category,
      page: String(index + 2),
    }));
  });
}

export default async function BlogCategoryPaginationPage({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const { slug, page } = await params;
  const pageNumber = Number(page);

  if (!isCategorySegment(slug) || !Number.isInteger(pageNumber) || pageNumber <= 1) {
    notFound();
  }

  const pagination = getCategoryPagination(slug, pageNumber);

  if (pagination.currentPage !== pageNumber || pagination.totalItems === 0) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <PostListSection
        kicker="Category"
        title={`${slug.toUpperCase()} · Page ${pagination.currentPage}`}
        description={`${getCategorySummary(slug)} 현재 공개된 글은 ${pagination.totalItems}개이며, ${POSTS_PER_PAGE}개 단위로 나눠서 보여줍니다.`}
        posts={pagination.posts}
      />
      <PaginationNav
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        getPageHref={(currentPage) => getCategoryPageRoute(slug, currentPage)}
      />
    </div>
  );
}
