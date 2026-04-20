import Link from "next/link";
import PageLayout from "@/components/page-layout";
import { projects } from "@/app/projects/data/projects";
import { getRecentPosts } from "@/lib/posts";
import RecentPosts from "./components/recent-posts";

export default function Home() {
  const recentPosts = getRecentPosts(3);
  const projectPreview = projects.slice(0, 2);

  return (
    <PageLayout>
      <section className="flex flex-col gap-6 rounded-[2rem] border px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            About
          </p>
          <h1 className="max-w-2xl text-5xl font-black tracking-tight text-primary sm:text-6xl">
            YONGHWI KIM
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            방과후는 개인 사이트이자 작업 기록의 출발점입니다. 개발 메모와
            글은 블로그로, 정리된 작업물은 프로젝트 영역으로 나누어 정리하고
            있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Enter Blog
          </Link>
          <Link
            href="/projects"
            className="rounded-full border px-5 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary"
          >
            View Projects
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/blog"
          className="rounded-2xl border p-5 transition-colors hover:border-primary"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Blog
          </p>
          <h2 className="mt-3 text-3xl font-bold text-primary">Writing & Notes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            알고리즘 풀이, 학습 기록, 구현 메모를 모아두는 공간입니다.
          </p>
        </Link>
        <Link
          href="/projects"
          className="rounded-2xl border p-5 transition-colors hover:border-primary"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Projects
          </p>
          <h2 className="mt-3 text-3xl font-bold text-primary">Build Log</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            작업 중이거나 정리된 프로젝트를 한곳에서 확인할 수 있습니다.
          </p>
        </Link>
      </section>

      {recentPosts.length > 0 ? (
        <RecentPosts
          limit={3}
          title="Latest Writing"
          description="최근 작성한 글만 가볍게 모아 둔 홈 미리보기입니다."
          className="mt-10"
        />
      ) : null}

      {projectPreview.length > 0 ? (
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Preview
              </p>
              <h2 className="text-4xl font-extrabold text-primary">
                Project Snapshot
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-sm font-semibold text-primary underline underline-offset-4"
            >
              View all projects
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {projectPreview.map((project) => (
              <a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border p-5 transition-colors hover:border-primary"
              >
                <h3 className="text-xl font-bold text-primary">{project.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </PageLayout>
  );
}
