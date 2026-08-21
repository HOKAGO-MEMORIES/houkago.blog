import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import HomePanelNavigator from "@/app/components/home-panel-navigator";
import { featuredProjects } from "@/data/projects";
import { loadBackendPostPage } from "@/lib/backend-post-page-loader";
import { getPostRoute } from "@/lib/post-navigation";

export const revalidate = 300;

export default async function Home() {
  await connection();

  const recentPostPage = await loadBackendPostPage({
    frontendPage: 1,
    pageSize: 3,
  });
  const [leadPost, ...secondaryPosts] = recentPostPage.posts;

  return (
    <div className="home-panel-stage" data-active-panel="1">
      <div className="home-panel-track">
        <div className="home-panel-frame" data-home-panel-frame>
          <section
            id="home-intro"
            aria-labelledby="home-intro-heading"
            className="home-panel-section home-intro"
          >
            <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:gap-20">
              <h1
                id="home-intro-heading"
                className="font-display text-5xl font-normal leading-[1.28] text-foreground sm:text-7xl lg:text-[6.5rem]"
              >
                <span className="block">방과 후에도</span>
                <span className="block text-[oklch(var(--foreground-soft))]">
                  만드는 사람.
                </span>
              </h1>
              <p className="max-w-[34rem] break-keep text-base leading-8 text-muted-foreground lg:pb-2">
                서버와 웹을 만들고, 알고리즘을 풉니다. 그 과정에서 마주한
                선택과 배움을 오래 남을 글로 기록합니다.
              </p>
            </div>

            <div className="mt-16 sm:mt-24">
              <div className="font-technical flex items-center justify-between gap-5 text-[10px] text-muted-foreground sm:text-[11px]">
                <span>AFTER SCHOOL</span>
                <span>BUILD / SOLVE / WRITE</span>
              </div>
              <div className="relative mt-4 h-px bg-[oklch(var(--border-strong))]">
                <span className="absolute left-[68%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 border-2 border-background bg-secondary" />
              </div>
            </div>
          </section>
        </div>

        <div className="home-panel-frame" data-home-panel-frame>
          <section
            id="home-projects"
            aria-labelledby="home-projects-heading"
            className="home-panel-section home-ruled-section"
          >
            <header className="home-section-heading">
              <h2
                id="home-projects-heading"
                className="font-display text-4xl font-normal leading-tight text-foreground sm:text-6xl"
              >
                주요 프로젝트
              </h2>
              <Link
                href="/projects"
                prefetch={false}
                className="home-section-link"
              >
                <span>모든 프로젝트</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </header>

            <div className="border-t border-[oklch(var(--border-strong))]">
              {featuredProjects.map((project, index) => (
                <a
                  key={project.id}
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} GitHub 저장소를 새 창에서 열기`}
                  className="home-project-row group"
                >
                  <span className="font-technical text-[10px] text-muted-foreground sm:text-[11px]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                  <span className="justify-self-end text-xs text-muted-foreground">
                    {project.category}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 justify-self-end transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="home-panel-frame" data-home-panel-frame>
          <section
            id="home-posts"
            aria-labelledby="home-posts-heading"
            className="home-panel-section home-ruled-section home-recent-section"
          >
            <header className="home-section-heading">
              <h2
                id="home-posts-heading"
                className="font-display text-4xl font-normal leading-tight text-foreground sm:text-6xl"
              >
                최근 기록
              </h2>
              <Link href="/blog" prefetch={false} className="home-section-link">
                <span>전체 글 보기</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </header>

            {leadPost ? (
              <div className="home-notes-grid">
                <Link
                  href={getPostRoute(leadPost)}
                  prefetch={false}
                  className="home-note-lead group"
                >
                  <div className="home-note-meta">
                    <span>{leadPost.category}</span>
                    <time dateTime={leadPost.date}>{leadPost.date}</time>
                  </div>
                  <h3 className="mt-10 max-w-[24ch] text-3xl font-semibold leading-snug text-foreground sm:text-5xl">
                    {leadPost.title}
                  </h3>
                  <p className="mt-4 max-w-[48ch] text-sm leading-7 text-muted-foreground">
                    {leadPost.description}
                  </p>
                  <span className="mt-auto inline-flex items-center justify-end gap-2 pt-8 text-xs font-semibold text-foreground">
                    글 읽기
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>

                <div className="grid min-w-0 grid-rows-2">
                  {secondaryPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={getPostRoute(post)}
                      prefetch={false}
                      className="home-note-secondary group"
                    >
                      <div className="home-note-meta">
                        <span>{post.category}</span>
                        <time dateTime={post.date}>{post.date}</time>
                      </div>
                      <h3 className="mt-5 pr-8 text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {post.description}
                      </p>
                      <ArrowRight
                        className="absolute bottom-5 right-5 h-4 w-4 transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="border-y border-[oklch(var(--border-strong))] py-12 text-sm text-muted-foreground">
                공개된 최근 글이 아직 없습니다.
              </p>
            )}
          </section>
        </div>
      </div>
      <HomePanelNavigator />
    </div>
  );
}
