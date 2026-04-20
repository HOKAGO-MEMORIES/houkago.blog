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
        <h2 className="text-5xl font-extrabold text-primary">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col">
        {recentPosts.map((post) => (
          <Link
            href={getPostRoute(post)}
            key={post.slug}
            className="flex gap-4 border-b py-5 last:border-none"
          >
            <div className="flex flex-col gap-1">
              <span className="font-bold text-lg break-keep text-primary">{post.title}</span>
              <span className="break-all">{post.description}</span>
            </div>
            <div className="ml-auto flex shrink-0 flex-col items-end gap-1 text-right">
              <span className="text-primary uppercase">{post.category}</span>
              <time className="text-xs">{post.date}</time>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
