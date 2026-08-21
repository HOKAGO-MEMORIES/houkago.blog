import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PaginationNav from "@/app/blog/components/pagination-nav";
import PostListSection from "@/app/blog/components/post-list-section";
import { blogMDXComponents } from "@/components/mdx/blog-components";
import { MDXContent } from "@/components/mdx-content";
import { loadBackendCategoryPostPage } from "@/lib/backend-category-post-loader";
import { loadBackendPostDetail } from "@/lib/backend-post-detail-loader";
import {
  POSTS_PER_PAGE,
  getCategoryPageRoute,
  getCategorySummary,
  getCategoryRoute,
  getPostRoute,
  getTagRoute,
  isCategorySegment,
} from "@/lib/post-navigation";
import {
  AUTHOR_NAME,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  getCategoryTitle,
  getPostTitle,
  toSeoDate,
} from "@/lib/site";

export const revalidate = 300;

export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (isCategorySegment(slug)) {
    const pagination = await loadBackendCategoryPostPage(slug, 1);
    const title = getCategoryTitle(slug);
    const description = `${getCategorySummary(slug)} 현재 공개된 글은 ${pagination.totalItems}개입니다.`;
    const canonical = getCategoryRoute(slug);

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: SITE_NAME,
        images: [
          {
            url: DEFAULT_OG_IMAGE,
            alt: title,
          },
        ],
        locale: "ko_KR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [DEFAULT_OG_IMAGE],
      },
    };
  }

  const detail = await loadBackendPostDetail(slug);
  if (!detail) {
    return {};
  }
  const { post } = detail;

  const title = getPostTitle(post.title);
  const canonical = getPostRoute(post);
  const image = post.thumbnail ?? DEFAULT_OG_IMAGE;
  const modifiedDate = post.updated ?? post.date;

  return {
    title,
    description: post.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: post.description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          alt: post.title,
        },
      ],
      locale: "ko_KR",
      type: "article",
      publishedTime: toSeoDate(post.date),
      modifiedTime: toSeoDate(modifiedDate),
      authors: [AUTHOR_NAME],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description,
      images: [image],
    },
  };
}

export default async function BlogSegmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isCategorySegment(slug)) {
    const pagination = await loadBackendCategoryPostPage(slug, 1);
    if (pagination.outOfRange) {
      notFound();
    }

    return (
      <div className="flex flex-col gap-6">
        <PostListSection
          kicker="Category"
          title={slug.toUpperCase()}
          description={`${getCategorySummary(slug)} 현재 공개된 글은 ${pagination.totalItems}개이며, ${POSTS_PER_PAGE}개 단위로 나눠서 보여줍니다.`}
          posts={pagination.posts}
        />
        <PaginationNav
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          getPageHref={(page) => getCategoryPageRoute(slug, page)}
        />
      </div>
    );
  }

  const detail = await loadBackendPostDetail(slug);
  if (!detail) {
    notFound();
  }

  const { post, mdxSource } = detail;
  const mdxComponents = post.category === "blog" ? blogMDXComponents : undefined;

  return (
    <article className="mt-5 flex flex-col gap-4">
      <Link href={getCategoryRoute(post.category)} className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        {post.category}
      </Link>
      <h1 className="whitespace-pre-wrap text-5xl font-black text-primary">{post.title}</h1>
      <p className="text-base text-muted-foreground">{post.description}</p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-primary">
        <time>{post.date}</time>
        {post.updated && <span>Updated {post.updated}</span>}
        {post.series && <span>Series {post.series}</span>}
      </div>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={getTagRoute(tag)}
              className="rounded-full border px-3 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
      <MDXContent mdxSource={mdxSource} components={mdxComponents} />
    </article>
  );
}
