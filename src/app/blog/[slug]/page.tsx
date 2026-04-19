import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogMDXComponents } from "@/components/mdx/blog-components";
import { MDXContent } from "@/components/mdx-content";
import { getSerializedMDX } from "@/lib/mdx";
import {
  getCategorySummary,
  getCategoryRoute,
  getPostBySlug,
  getPostRoute,
  getStaticBlogSegments,
  getVisiblePostsByCategory,
  isCategorySegment,
} from "@/lib/posts";
import {
  AUTHOR_NAME,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  getCategoryTitle,
  getPostTitle,
  toSeoDate,
} from "@/lib/site";

export function generateStaticParams() {
  return getStaticBlogSegments();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (isCategorySegment(slug)) {
    const posts = getVisiblePostsByCategory(slug);
    if (posts.length === 0) {
      return {};
    }

    const title = getCategoryTitle(slug);
    const description = `${getCategorySummary(slug)} 현재 공개된 글은 ${posts.length}개입니다.`;
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

  const post = getPostBySlug(slug);
  if (!post) {
    return {};
  }

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
    const posts = getVisiblePostsByCategory(slug);

    if (posts.length === 0) {
      notFound();
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Category</p>
          <h1 className="text-5xl font-black text-primary">{slug.toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            {getCategorySummary(slug)}
            {" "}
            현재 공개된 글은 {posts.length}개입니다.
          </p>
        </div>
        <div className="flex flex-col">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={getPostRoute(post)}
              className="flex items-center justify-between gap-4 border-b py-5 last:border-none"
            >
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-primary">{post.title}</span>
                <span className="text-sm text-muted-foreground">{post.description}</span>
              </div>
              <time className="shrink-0 text-xs">{post.date}</time>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const mdxSource = await getSerializedMDX(post.body);
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
            <span key={tag} className="rounded-full border px-3 py-1 text-xs font-semibold text-primary">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <MDXContent mdxSource={mdxSource} components={mdxComponents} />
    </article>
  );
}
