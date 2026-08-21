import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import AfterSchoolClock from "@/app/components/after-school-clock";
import HomePanelNavigator from "@/app/components/home-panel-navigator";
import { featuredProjects } from "@/data/projects";
import { loadBackendPostPage } from "@/lib/backend-post-page-loader";
import { getPostRoute } from "@/lib/post-navigation";

export const revalidate = 300;

const homeProjectCategories: Readonly<Record<string, string>> = {
  "houkago-server": "웹",
  "houkago-blog": "웹",
  "boj-line123": "알고리즘",
};

export default async function Home() {
  await connection();

  const recentPostPage = await loadBackendPostPage({
    frontendPage: 1,
    pageSize: 3,
  });
  const [leadPost, ...secondaryPosts] = recentPostPage.posts;

  return (
    <HomePanelNavigator>
      <section
        id="home-intro"
        aria-labelledby="home-intro-heading"
        className="home-panel-section home-intro"
        data-home-snap-section
      >
        <div className="home-hero-grid">
          <h1 id="home-intro-heading">
            <span>방과 후에도</span>
            <span>만드는 사람.</span>
          </h1>
          <div className="home-hero-aside">
            <p>
              서버와 게임을 만들고, 알고리즘을 풉니다. 그 과정에서 배운 것을
              기록합니다.
            </p>
          </div>
        </div>
        <AfterSchoolClock />
      </section>

      <section
        id="home-projects"
        aria-labelledby="home-projects-heading"
        className="home-panel-section home-ruled-section"
        data-home-snap-section
      >
        <header className="home-section-heading">
          <h2 id="home-projects-heading">주요 프로젝트</h2>
          <Link
            href="/projects"
            prefetch={false}
            className="home-section-link"
          >
            <span>모든 프로젝트</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <div className="home-project-list">
          {featuredProjects.map((project, index) => (
            <a
              key={project.id}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} GitHub 저장소를 새 창에서 열기`}
              className="home-project-row group"
            >
              <span className="home-project-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <span className="home-project-category">
                {homeProjectCategories[project.id] ?? project.category}
              </span>
              <ArrowUpRight
                className="h-4 w-4 justify-self-end transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      </section>

      <section
        id="home-posts"
        aria-labelledby="home-posts-heading"
        className="home-panel-section home-ruled-section home-recent-section"
        data-home-snap-section
      >
        <header className="home-section-heading">
          <h2 id="home-posts-heading">최근 기록</h2>
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
              <h3>{leadPost.title}</h3>
              <p>{leadPost.description}</p>
              <span className="home-read-label">
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
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
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
    </HomePanelNavigator>
  );
}
