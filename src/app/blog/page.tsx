import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageLayout from "@/components/page-layout";
import RecentPosts from "@/app/components/recent-posts";
import CategoryHighlightsSection from "@/app/blog/components/category-highlights-section";
import FeaturedPostsSection from "@/app/blog/components/featured-posts-section";
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
      description="방과후 블로그의 입구 페이지입니다. 추천 글, 최근 글, 카테고리 하이라이트를 먼저 둘러본 뒤 전체 글로 이어질 수 있습니다."
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
                카테고리별 아카이브로 바로 이동해 해당 주제의 글을 이어서 탐색할 수 있습니다.
              </p>
            </Link>
          );
        })}
      </section>

      <FeaturedPostsSection />

      <RecentPosts
        title="Recent Posts"
        description="최근 공개된 글을 시간순으로 빠르게 훑어볼 수 있습니다."
      />

      <CategoryHighlightsSection />

      <section id="all-posts" className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Archive
            </p>
            <h2 className="text-4xl font-extrabold text-primary">All Posts</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            전체 공개 글 {posts.length}개
          </span>
        </div>
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
