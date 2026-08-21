import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FrontendPostSummary } from "@/lib/backend-post-adapter";
import {
  getCategoryDisplayLabel,
  getPostRoute,
} from "@/lib/post-navigation";

interface FeaturedPostsSectionProps {
  post: FrontendPostSummary;
}

export default function FeaturedPostsSection({
  post,
}: FeaturedPostsSectionProps) {
  return (
    <section className="blog-featured" aria-labelledby="featured-post-heading">
      <div className="featured-label">
        <span>추천 글</span>
        <time dateTime={post.date}>{post.date.replaceAll("-", ".")}</time>
      </div>
      <Link href={getPostRoute(post)} className="group">
        <div>
          <span className="post-category">
            {getCategoryDisplayLabel(post.category)}
          </span>
          <h2 id="featured-post-heading">{post.title}</h2>
          <p>{post.description}</p>
        </div>
        <span className="featured-action">
          읽기
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </Link>
    </section>
  );
}
