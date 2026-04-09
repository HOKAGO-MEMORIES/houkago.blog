import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content";
import { getSerializedMDX } from "@/lib/mdx";
import {
  getCategoryRoute,
  getPostBySlug,
  getPostRoute,
  getStaticBlogSegments,
  getVisiblePostsByCategory,
  isCategorySegment,
} from "@/lib/posts";

export function generateStaticParams() {
  return getStaticBlogSegments();
}

export default async function BlogSegmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isCategorySegment(slug)) {
    const posts = getVisiblePostsByCategory(slug);

    if (posts.length === 0) {
      notFound();
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Category</p>
          <h1 className="text-5xl font-black text-primary">{slug.toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">{posts.length} posts available in this category.</p>
        </div>
        <div className="flex flex-col">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={getPostRoute(post)}
              className="flex items-center justify-between gap-4 border-b py-5 last:border-none"
            >
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-primary">{post.title}</span>
                <span className="text-sm text-muted-foreground">{post.description}</span>
              </div>
              <time className="shrink-0 text-xs">{post.date}</time>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const mdxSource = await getSerializedMDX(post.body);

  return (
    <article className="mt-5 flex flex-col gap-4">
      <Link href={getCategoryRoute(post.category)} className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        {post.category}
      </Link>
      <h1 className="whitespace-pre-wrap text-5xl font-black text-primary">{post.title}</h1>
      <p className="text-base text-muted-foreground">{post.description}</p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-primary">
        <time>{post.date}</time>
        {post.updated && <span>Updated {post.updated}</span>}
        {post.series && <span>Series {post.series}</span>}
      </div>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border px-3 py-1 text-xs font-semibold text-primary">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <MDXContent mdxSource={mdxSource} />
    </article>
  );
}
