import Link from "next/link";
import { getFeaturedPosts, getPostRoute } from "@/lib/posts";

interface FeaturedPostsSectionProps {
  limit?: number;
}

export default function FeaturedPostsSection({
  limit = 3,
}: FeaturedPostsSectionProps) {
  const featuredPosts = getFeaturedPosts(limit);

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Featured
          </p>
          <h2 className="text-4xl font-extrabold text-primary">Start Here</h2>
        </div>
        <Link
          href="#all-posts"
          className="text-sm font-semibold text-primary underline underline-offset-4"
        >
          Jump to archive
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {featuredPosts.map((post) => (
          <Link
            key={post.slug}
            href={getPostRoute(post)}
            className="flex min-h-44 flex-col justify-between rounded-2xl border p-5 transition-colors hover:border-primary"
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {post.category}
              </span>
              <h3 className="text-2xl font-bold text-primary">{post.title}</h3>
              <p className="text-sm text-muted-foreground">{post.description}</p>
            </div>
            <time className="mt-6 text-xs">{post.date}</time>
          </Link>
        ))}
      </div>
    </section>
  );
}
