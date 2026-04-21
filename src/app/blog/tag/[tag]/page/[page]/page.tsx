import { notFound } from "next/navigation";
import PageLayout from "@/components/page-layout";
import PaginationNav from "@/app/blog/components/pagination-nav";
import PostListSection from "@/app/blog/components/post-list-section";
import {
  decodeRouteParam,
  getAllTags,
  getTagPagination,
  getTagRoute,
} from "@/lib/posts";

export function generateStaticParams() {
  return getAllTags().flatMap((tag) => {
    const { totalPages } = getTagPagination(tag, 1);

    return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
      tag,
      page: String(index + 2),
    }));
  });
}

export default async function BlogTagPaginationPage({
  params,
}: {
  params: Promise<{ tag: string; page: string }>;
}) {
  const { tag, page } = await params;
  const normalizedTag = decodeRouteParam(tag);
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber <= 1) {
    notFound();
  }

  const pagination = getTagPagination(normalizedTag, pageNumber);

  if (pagination.currentPage !== pageNumber || pagination.totalItems === 0) {
    notFound();
  }

  return (
    <PageLayout className="gap-8">
      <section className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Tag
        </p>
        <h1 className="text-5xl font-black text-primary">
          #{normalizedTag.toUpperCase()}
        </h1>
        <p className="text-sm text-muted-foreground">
          이 태그를 가진 공개 글은 {pagination.totalItems}개입니다. 현재{" "}
          {pagination.currentPage}페이지를 보고 있습니다.
        </p>
      </section>

      <PostListSection
        posts={pagination.posts}
      />

      <PaginationNav
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        getPageHref={(currentPage) => getTagRoute(normalizedTag, currentPage)}
      />
    </PageLayout>
  );
}
