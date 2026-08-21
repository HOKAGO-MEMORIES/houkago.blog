import Link from "next/link";
import type { BackendCategoryHighlight } from "@/lib/backend-category-highlights-loader";
import type { FrontendPostSummary } from "@/lib/backend-post-adapter";
import {
  getCategoryDisplayLabel,
  getCategoryRoute,
  type BlogCategoryFilter,
} from "@/lib/post-navigation";
import type { Category } from "@/types/post";
import FeaturedPostsSection from "./featured-posts-section";
import PaginationNav from "./pagination-nav";
import PostListSection from "./post-list-section";

const BLOG_CATEGORY_NAVIGATION: readonly Category[] = [
  "algorithm",
  "cs",
  "project",
  "blog",
];

interface BlogListingPageProps {
  posts: readonly FrontendPostSummary[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  getPageHref: (page: number) => string;
  heading?: string;
  description?: string;
  categoryHighlights?: readonly BackendCategoryHighlight[];
  activeCategory?: BlogCategoryFilter;
  featuredPost?: FrontendPostSummary;
  emptyMessage?: string;
}

export default function BlogListingPage({
  posts,
  totalItems,
  currentPage,
  totalPages,
  getPageHref,
  heading = "블로그",
  description = "개발하며 배운 것을 나중의 내가 다시 이해할 수 있도록 씁니다.",
  categoryHighlights,
  activeCategory = "all",
  featuredPost,
  emptyMessage,
}: BlogListingPageProps) {
  const allPostCount =
    activeCategory === "all"
      ? totalItems
      : categoryHighlights?.reduce((total, highlight) => total + highlight.count, 0) ??
        totalItems;

  return (
    <div className="blog-index-page">
      <header className="blog-index-hero">
        <h1>{heading}</h1>
        <p>{description}</p>
      </header>

      {categoryHighlights ? (
        <nav className="blog-topic-nav" aria-label="글 카테고리">
          <Link
            href="/blog"
            aria-current={activeCategory === "all" ? "page" : undefined}
            className={activeCategory === "all" ? "blog-topic is-active" : "blog-topic"}
          >
            <span>전체</span>
            <small>{allPostCount}</small>
          </Link>
          {BLOG_CATEGORY_NAVIGATION.map((category) => {
            const count = categoryHighlights.find(
              (highlight) => highlight.category === category,
            )?.count ?? 0;
            const isActive = activeCategory === category;

            return (
              <Link
                key={category}
                href={getCategoryRoute(category)}
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "blog-topic is-active" : "blog-topic"}
              >
                <span>{getCategoryDisplayLabel(category)}</span>
                <small>{count}</small>
              </Link>
            );
          })}
        </nav>
      ) : null}

      {featuredPost ? <FeaturedPostsSection post={featuredPost} /> : null}

      <PostListSection
        id="post-archive"
        title="글 아카이브"
        count={`${posts.length}개 표시`}
        posts={posts}
        emptyMessage={emptyMessage}
      />

      <PaginationNav
        currentPage={currentPage}
        totalPages={totalPages}
        getPageHref={getPageHref}
      />
    </div>
  );
}
