import { notFound } from "next/navigation";
import BlogListingPage from "@/app/blog/components/blog-listing-page";
import { loadBackendCategoryHighlights } from "@/lib/backend-category-highlights-loader";
import {
  loadBackendPostPage,
  parsePaginatedBlogPageParam,
} from "@/lib/backend-post-page-loader";
import { POSTS_PER_PAGE, getArchiveRoute } from "@/lib/post-navigation";

export const revalidate = 300;

export function generateStaticParams(): Array<{ page: string }> {
  return [];
}

export default async function BlogArchivePage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNumber = parsePaginatedBlogPageParam(page);

  if (pageNumber === null || pageNumber <= 1) {
    notFound();
  }

  const [archive, categoryHighlights] = await Promise.all([
    loadBackendPostPage({
      frontendPage: pageNumber,
      pageSize: POSTS_PER_PAGE,
    }),
    loadBackendCategoryHighlights(),
  ]);

  if (archive.outOfRange) {
    notFound();
  }

  return (
    <BlogListingPage
      posts={archive.posts}
      totalItems={archive.totalItems}
      currentPage={archive.currentPage}
      totalPages={archive.totalPages}
      getPageHref={getArchiveRoute}
      categoryHighlights={categoryHighlights}
    />
  );
}
