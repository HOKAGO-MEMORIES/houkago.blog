import { notFound } from "next/navigation";
import PageLayout from "@/components/page-layout";
import PaginationNav from "@/app/blog/components/pagination-nav";
import PostListSection from "@/app/blog/components/post-list-section";
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
    <PageLayout className="gap-8">
      <section className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Tag
        </p>
        <h1 className="text-5xl font-black text-primary">
          #{normalizedTag.toUpperCase()}
        </h1>
        <p className="text-sm text-muted-foreground">
          이 태그를 가진 공개 글은 {pagination.totalItems}개입니다.
        </p>
      </section>

      <PostListSection
        posts={pagination.posts}
      />

      <PaginationNav
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        getPageHref={(page) => getTagRoute(normalizedTag, page)}
      />
    </PageLayout>
  );
}
