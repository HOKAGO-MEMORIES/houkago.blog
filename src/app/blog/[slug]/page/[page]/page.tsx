import { notFound } from "next/navigation";
import BlogListingPage from "@/app/blog/components/blog-listing-page";
import { loadBackendCategoryHighlights } from "@/lib/backend-category-highlights-loader";
import { loadBackendCategoryPostPage } from "@/lib/backend-category-post-loader";
import { parsePaginatedBlogPageParam } from "@/lib/backend-post-page-loader";
import {
  getCategoryPageRoute,
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

  const [pagination, categoryHighlights] = await Promise.all([
    loadBackendCategoryPostPage(slug, pageNumber),
    loadBackendCategoryHighlights(),
  ]);

  if (pagination.outOfRange) {
    notFound();
  }

  return (
    <BlogListingPage
      posts={pagination.posts}
      totalItems={pagination.totalItems}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      getPageHref={(currentPage) => getCategoryPageRoute(slug, currentPage)}
      categoryHighlights={categoryHighlights}
      activeCategory={slug}
      emptyMessage="이 카테고리에 표시할 글이 없습니다."
    />
  );
}
