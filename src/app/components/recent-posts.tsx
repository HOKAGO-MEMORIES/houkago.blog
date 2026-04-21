import Link from "next/link";
import { cn } from "@/components/ui/utils";
import { getPostRoute, getRecentPosts } from "@/lib/posts";

interface RecentPostsProps {
  limit?: number;
  title?: string;
  description?: string;
  className?: string;
}

export default function RecentPosts({
  limit = 5,
  title = "Recent Posts",
  description,
  className,
}: RecentPostsProps) {
  const recentPosts = getRecentPosts(limit);

  return (
    <section className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col">
        {recentPosts.map((post) => (
          <Link
            href={getPostRoute(post)}
            key={post.slug}
            className="flex flex-col gap-3 border-b py-5 transition-colors hover:border-primary sm:flex-row sm:items-start sm:gap-4 last:border-none"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="break-keep text-lg font-semibold text-primary">{post.title}</span>
              <span className="break-words text-sm leading-6 text-muted-foreground">{post.description}</span>
            </div>
            <div className="flex shrink-0 flex-col gap-1 text-left sm:ml-auto sm:items-end sm:text-right">
              <span className="text-primary uppercase">{post.category}</span>
              <time className="text-xs">{post.date}</time>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
