import { notFound } from "next/navigation";
import BlogListingPage from "@/app/blog/components/blog-listing-page";
import { loadBackendTagPostPage } from "@/lib/backend-tag-post-loader";
import {
  parseTagRouteParam,
  getTagRoute,
} from "@/lib/post-navigation";

export const revalidate = 300;

export function generateStaticParams(): Array<{ tag: string }> {
  return [];
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const normalizedTag = parseTagRouteParam(tag);

  if (normalizedTag === null) {
    notFound();
  }

  const pagination = await loadBackendTagPostPage(normalizedTag, 1);

  if (pagination.totalItems === 0) {
    notFound();
  }

  return (
    <BlogListingPage
      heading={`#${normalizedTag}`}
      description={`이 태그를 가진 공개 글은 ${pagination.totalItems}개입니다.`}
      posts={pagination.posts}
      totalItems={pagination.totalItems}
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      getPageHref={(page) => getTagRoute(normalizedTag, page)}
      emptyMessage="이 태그에 표시할 글이 없습니다."
    />
  );
}
