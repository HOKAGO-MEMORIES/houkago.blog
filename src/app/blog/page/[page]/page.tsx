import { notFound } from "next/navigation";
import PageLayout from "@/components/page-layout";
import PaginationNav from "@/app/blog/components/pagination-nav";
import PostListSection from "@/app/blog/components/post-list-section";
import {
  POSTS_PER_PAGE,
  getArchivePagination,
  getArchiveRoute,
} from "@/lib/posts";

export function generateStaticParams() {
  const { totalPages } = getArchivePagination(1);

  return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export default async function BlogArchivePage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber <= 1) {
    notFound();
  }

  const archive = getArchivePagination(pageNumber);

  if (archive.currentPage !== pageNumber) {
    notFound();
  }

  return (
    <PageLayout
      title="Blog Archive"
      description="블로그 허브 이후의 전체 글 페이지입니다."
    >
      <PostListSection
        kicker="Archive"
        title={`All Posts · Page ${archive.currentPage}`}
        description={`전체 공개 글 ${archive.totalItems}개를 ${POSTS_PER_PAGE}개 단위로 보여줍니다.`}
        posts={archive.posts}
      />

      <PaginationNav
        currentPage={archive.currentPage}
        totalPages={archive.totalPages}
        getPageHref={getArchiveRoute}
      />
    </PageLayout>
  );
}
