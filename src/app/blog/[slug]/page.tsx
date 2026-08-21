import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BlogListingPage from "@/app/blog/components/blog-listing-page";
import PostReadingProgress from "@/app/blog/components/post-reading-progress";
import PostTableOfContents from "@/app/blog/components/post-table-of-contents";
import { blogMDXComponents } from "@/components/mdx/blog-components";
import { MDXContent } from "@/components/mdx-content";
import { loadBackendCategoryHighlights } from "@/lib/backend-category-highlights-loader";
import { loadBackendCategoryPostPage } from "@/lib/backend-category-post-loader";
import { loadBackendPostDetail } from "@/lib/backend-post-detail-loader";
import {
  getCategoryPageRoute,
  getCategoryDisplayLabel,
  getCategorySummary,
  getCategoryRoute,
  getPostRoute,
  getTagRoute,
  isCategorySegment,
} from "@/lib/post-navigation";
import {
  estimatePostReadingMinutes,
  extractPostTableOfContents,
} from "@/lib/post-headings";
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
    const [pagination, categoryHighlights] = await Promise.all([
      loadBackendCategoryPostPage(slug, 1),
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
        getPageHref={(page) => getCategoryPageRoute(slug, page)}
        categoryHighlights={categoryHighlights}
        activeCategory={slug}
        emptyMessage="이 카테고리에 표시할 글이 없습니다."
      />
    );
  }

  const detail = await loadBackendPostDetail(slug);
  if (!detail) {
    notFound();
  }

  const { post, mdxSource } = detail;
  const mdxComponents = post.category === "blog" ? blogMDXComponents : undefined;
  const tableOfContents = extractPostTableOfContents(post.rawBody);
  const readingMinutes = estimatePostReadingMinutes(post.rawBody);
  const articleBodyId = `post-body-${post.slug}`;
  const categoryLabel = getCategoryDisplayLabel(post.category);

  return (
    <article className="post-detail-page">
      <PostReadingProgress targetId={articleBodyId} />

      <nav className="post-detail-breadcrumb" aria-label="현재 위치">
        <Link href="/blog">기록 보관함</Link>
        <span aria-hidden="true">/</span>
        <Link href={getCategoryRoute(post.category)}>{categoryLabel}</Link>
      </nav>

      <header className="post-detail-hero">
        <div className="post-detail-kicker">
          <Link href={getCategoryRoute(post.category)}>{categoryLabel}</Link>
          <span aria-hidden="true">·</span>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingMinutes}분 읽기</span>
        </div>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
        {post.tags.length > 0 && (
          <div className="post-detail-tags" aria-label="태그">
            {post.tags.map((tag) => (
              <Link key={tag} href={getTagRoute(tag)}>
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="post-detail-layout">
        <aside className="post-detail-context" aria-label="글 정보">
          <Link className="post-detail-back" href="/blog">
            <ArrowLeft aria-hidden="true" />
            기록 보관함
          </Link>
          <dl>
            <div>
              <dt>분류</dt>
              <dd>{categoryLabel}</dd>
            </div>
            <div>
              <dt>게시</dt>
              <dd>{formatPostDate(post.date)}</dd>
            </div>
            {post.updated ? (
              <div>
                <dt>수정</dt>
                <dd>{formatPostDate(post.updated)}</dd>
              </div>
            ) : null}
            {post.series ? (
              <div>
                <dt>연재</dt>
                <dd>{post.series}</dd>
              </div>
            ) : null}
          </dl>
        </aside>

        <MDXContent
          id={articleBodyId}
          mdxSource={mdxSource}
          components={mdxComponents}
        />

        <PostTableOfContents items={tableOfContents} />
      </div>
    </article>
  );
}

function formatPostDate(date: string) {
  return date.replaceAll("-", ".");
}
