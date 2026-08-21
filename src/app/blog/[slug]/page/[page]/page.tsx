import { notFound } from "next/navigation";
import PaginationNav from "@/app/blog/components/pagination-nav";
import PostListSection from "@/app/blog/components/post-list-section";
import { loadBackendCategoryPostPage } from "@/lib/backend-category-post-loader";
import { parsePaginatedBlogPageParam } from "@/lib/backend-post-page-loader";
import {
  POSTS_PER_PAGE,
  getCategoryPageRoute,
  getCategorySummary,
  isCategorySegment,
} from "@/lib/post-navigation";

export const revalidate = 300;

export function generateStaticParams(): Array<{ slug: string; page: string }> {
  return [];
}

export default async function BlogCategoryPaginationPage({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const { slug, page } = await params;
  const pageNumber = parsePaginatedBlogPageParam(page);

  if (!isCategorySegment(slug) || pageNumber === null || pageNumber <= 1) {
    notFound();
  }

  const pagination = await loadBackendCategoryPostPage(slug, pageNumber);

  if (pagination.outOfRange) {
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
