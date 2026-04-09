import Link from "next/link";
import { getPostRoute, getRecentPosts } from "@/lib/posts";

export default function RecentPosts() {
  const recentPosts = getRecentPosts(5);

  return (
    <>
      <h2 className="mt-20 text-5xl font-extrabold text-primary">Recent Posts</h2>
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
    </>
  );
}
