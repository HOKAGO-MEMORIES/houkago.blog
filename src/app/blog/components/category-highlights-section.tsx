import Link from "next/link";
import {
  getCategoryHighlights,
  getCategoryRoute,
  getPostRoute,
} from "@/lib/posts";

export default function CategoryHighlightsSection() {
  const categoryHighlights = getCategoryHighlights();

  if (categoryHighlights.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Categories
        </p>
        <h2 className="text-4xl font-extrabold text-primary">
          Category Highlights
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {categoryHighlights.map((group) => (
          <div key={group.category} className="rounded-2xl border p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold uppercase text-primary">
                  {group.category}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {group.count} posts ready for browsing
                </p>
              </div>
              <Link
                href={getCategoryRoute(group.category)}
                className="text-sm font-semibold text-primary underline underline-offset-4"
              >
                View category
              </Link>
            </div>
            <div className="mt-4 flex flex-col">
              {group.posts.map((post) => (
                <Link
                  key={post.slug}
                  href={getPostRoute(post)}
                  className="flex items-center justify-between gap-3 border-b py-3 last:border-none"
                >
                  <span className="font-semibold text-primary">{post.title}</span>
                  <time className="shrink-0 text-xs">{post.date}</time>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
