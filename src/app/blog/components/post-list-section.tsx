import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FrontendPostSummary } from "@/lib/backend-post-adapter";
import {
  getCategoryDisplayLabel,
  getPostRoute,
} from "@/lib/post-navigation";

type PostListItem = Pick<
  FrontendPostSummary,
  "slug" | "title" | "description" | "category" | "date" | "featured" | "thumbnail"
>;

interface PostListSectionProps {
  title?: string;
  posts: readonly PostListItem[];
  count?: string;
  id?: string;
  emptyMessage?: string;
}

export default function PostListSection({
  title,
  posts,
  count,
  id,
  emptyMessage = "표시할 글이 없습니다.",
}: PostListSectionProps) {
  return (
    <section id={id} className="blog-archive-section">
      {title || count ? (
        <header className="blog-toolbar">
          {title ? <h2>{title}</h2> : <span />}
          {count ? <span>{count}</span> : null}
        </header>
      ) : null}

      {posts.length === 0 ? (
        <div className="blog-empty-state">
          <h3>{emptyMessage}</h3>
        </div>
      ) : (
        <div className="blog-post-list">
          {posts.map((post) => (
            <Link
              href={getPostRoute(post)}
              key={post.slug}
              className="blog-post-row group"
            >
              <div className="blog-post-meta">
                <time dateTime={post.date}>{post.date.replaceAll("-", ".")}</time>
                <span>{getCategoryDisplayLabel(post.category)}</span>
              </div>
              <div className="blog-post-copy">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
              </div>
              <ArrowRight
                className="post-arrow h-4 w-4 group-hover:translate-x-1 group-focus-visible:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
