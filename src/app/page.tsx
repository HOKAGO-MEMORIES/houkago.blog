import Link from "next/link";
import PageLayout from "@/components/page-layout";
import { getCategoryHighlights, getCategoryRoute, getFeaturedPosts, getPostRoute } from "@/lib/posts";
import Banner from "./components/banner";
import RecentPosts from "./components/recent-posts";

export default function Home() {
  const featuredPosts = getFeaturedPosts(3);
  const categoryHighlights = getCategoryHighlights();

  return (
    <PageLayout>
      <Banner />
      {featuredPosts.length > 0 && (
        <section className="mt-12 flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-4xl font-extrabold text-primary">Featured</h2>
            <Link href="/blog" className="text-sm font-semibold text-primary underline underline-offset-4">
              See all posts
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={getPostRoute(post)}
                className="flex min-h-40 flex-col justify-between rounded-2xl border p-5 transition-colors hover:border-primary"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{post.category}</span>
                  <h3 className="text-2xl font-bold text-primary">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">{post.description}</p>
                </div>
                <time className="mt-6 text-xs">{post.date}</time>
              </Link>
            ))}
          </div>
        </section>
      )}
      <RecentPosts />
      {categoryHighlights.length > 0 && (
        <section className="mt-20 flex flex-col gap-5">
          <h2 className="text-4xl font-extrabold text-primary">Category Highlights</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {categoryHighlights.map((group) => (
              <div key={group.category} className="rounded-2xl border p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-primary uppercase">{group.category}</h3>
                    <p className="text-sm text-muted-foreground">{group.count} posts ready for browsing</p>
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
      )}
    </PageLayout>
  );
}
