import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageLayout from "@/components/page-layout";
import { BLOG_CATEGORIES, getCategoryRoute, getPostRoute, getRenderablePosts } from "@/lib/posts";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: "houkago.posts를 읽고 검증한 정적 포스트 허브입니다.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: "houkago.posts를 읽고 검증한 정적 포스트 허브입니다.",
    url: "/blog",
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: SITE_NAME,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog | ${SITE_NAME}`,
    description: "houkago.posts를 읽고 검증한 정적 포스트 허브입니다.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function BlogPage() {
  const posts = getRenderablePosts();

  return (
    <PageLayout
      title="Blog"
      description="houkago.posts를 읽고 검증한 정적 포스트 허브입니다."
    >
      <section className="grid gap-4 sm:grid-cols-2">
        {BLOG_CATEGORIES.map((category) => {
          const count = posts.filter((post) => post.category === category).length;
          return (
            <Link
              key={category}
              href={getCategoryRoute(category)}
              className="rounded-2xl border p-5 transition-colors hover:border-primary"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{category}</p>
              <h2 className="mt-2 text-2xl font-bold text-primary">{count} posts</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                published posts only in production, with optional explicit draft preview in local development.
              </p>
            </Link>
          );
        })}
      </section>

      <section className="mt-6 flex flex-col">
        {posts.map((post) => (
          <Link
            href={getPostRoute(post)}
            key={post.slug}
            className="flex items-center justify-between gap-4 border-b py-5 last:border-none"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full border px-2 py-0.5 text-xs font-semibold uppercase text-primary">
                  {post.category}
                </span>
                {post.featured && <span className="text-xs font-semibold text-primary">FEATURED</span>}
              </div>
              <span className="text-lg font-semibold text-primary">{post.title}</span>
              <span className="break-all text-sm text-muted-foreground">{post.description}</span>
              <time className="text-xs">{post.date}</time>
            </div>
            {post.thumbnail && (
              <Image
                width={144}
                height={144}
                src={post.thumbnail}
                alt={post.title}
                className="hidden h-24 w-24 rounded-xl object-cover sm:block"
              />
            )}
          </Link>
        ))}
      </section>
    </PageLayout>
  );
}
