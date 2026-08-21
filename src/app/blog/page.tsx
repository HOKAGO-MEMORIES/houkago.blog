import type { Metadata } from "next";
import { connection } from "next/server";
import BlogListingPage from "@/app/blog/components/blog-listing-page";
import { loadBackendCategoryHighlights } from "@/lib/backend-category-highlights-loader";
import { loadBackendPostPage } from "@/lib/backend-post-page-loader";
import {
  POSTS_PER_PAGE,
  getArchiveRoute,
} from "@/lib/post-navigation";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: "Backend에서 동기화된 공개 글을 탐색하는 포스트 허브입니다.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: "Backend에서 동기화된 공개 글을 탐색하는 포스트 허브입니다.",
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
    description: "Backend에서 동기화된 공개 글을 탐색하는 포스트 허브입니다.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function BlogPage() {
  await connection();

  const [archive, categoryHighlights] = await Promise.all([
    loadBackendPostPage({
      frontendPage: 1,
      pageSize: POSTS_PER_PAGE,
    }),
    loadBackendCategoryHighlights(),
  ]);
  const featuredPost = archive.posts.find((post) => post.featured);
  const archivePosts = featuredPost
    ? archive.posts.filter((post) => post.slug !== featuredPost.slug)
    : archive.posts;

  return (
    <BlogListingPage
      posts={archivePosts}
      totalItems={archive.totalItems}
      currentPage={archive.currentPage}
      totalPages={archive.totalPages}
      getPageHref={getArchiveRoute}
      categoryHighlights={categoryHighlights}
      featuredPost={featuredPost}
    />
  );
}
