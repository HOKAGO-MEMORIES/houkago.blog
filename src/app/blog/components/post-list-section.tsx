import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/post";
import { getPostRoute } from "@/lib/posts";

interface PostListSectionProps {
  title?: string;
  posts: Post[];
  kicker?: string;
  description?: string;
  id?: string;
  emptyMessage?: string;
}

export default function PostListSection({
  title,
  posts,
  kicker,
  description,
  id,
  emptyMessage = "표시할 글이 없습니다.",
}: PostListSectionProps) {
  return (
    <section id={id} className="flex flex-col gap-4">
      {kicker || title || description ? (
        <div className="flex flex-col gap-2">
          {kicker ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {kicker}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-4xl font-extrabold text-primary">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="rounded-2xl border px-5 py-8 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="flex flex-col">
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
                  {post.featured ? (
                    <span className="text-xs font-semibold text-primary">
                      FEATURED
                    </span>
                  ) : null}
                </div>
                <span className="text-lg font-semibold text-primary">
                  {post.title}
                </span>
                <span className="break-all text-sm text-muted-foreground">
                  {post.description}
                </span>
                <time className="text-xs">{post.date}</time>
              </div>
              {post.thumbnail ? (
                <Image
                  width={144}
                  height={144}
                  src={post.thumbnail}
                  alt={post.title}
                  className="hidden h-24 w-24 rounded-xl object-cover sm:block"
                />
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
