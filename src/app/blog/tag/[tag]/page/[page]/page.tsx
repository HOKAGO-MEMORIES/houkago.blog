import { notFound } from "next/navigation";
import BlogListingPage from "@/app/blog/components/blog-listing-page";
import { loadBackendTagPostPage } from "@/lib/backend-tag-post-loader";
import { parsePaginatedBlogPageParam } from "@/lib/backend-post-page-loader";
import {
  parseTagRouteParam,
  getTagRoute,
} from "@/lib/post-navigation";

export const revalidate = 300;

export function generateStaticParams(): Array<{ tag: string; page: string }> {
  return [];
}

export default async function BlogTagPaginationPage({
  params,
}: {
  params: Promise<{ tag: string; page: string }>;
}) {
  const { tag, page } = await params;
  const normalizedTag = parseTagRouteParam(tag);
  const pageNumber = parsePaginatedBlogPageParam(page);

  if (normalizedTag === null || pageNumber === null || pageNumber <= 1) {
    notFound();
  }

  const pagination = await loadBackendTagPostPage(normalizedTag, pageNumber);

  if (pagination.outOfRange || pagination.totalItems === 0) {
    notFound();
  }

  return (
    <BlogListingPage
      heading={`#${normalizedTag}`}
      description={`이 태그를 가진 공개 글은 ${pagination.totalItems}개입니다. 현재 ${pagination.currentPage}페이지를 보고 있습니다.`}
      posts={pagination.posts}
      totalItems={pagination.totalItems}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      getPageHref={(currentPage) => getTagRoute(normalizedTag, currentPage)}
      emptyMessage="이 태그에 표시할 글이 없습니다."
    />
  );
}
