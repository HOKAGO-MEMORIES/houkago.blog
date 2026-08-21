import { ArrowUpRight } from "lucide-react";
import {
  archiveProjects,
  featuredProjects,
  type Project,
} from "@/data/projects";

function ProjectRow({
  project,
  index,
  compact = false,
}: {
  project: Project;
  index: number;
  compact?: boolean;
}) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.title} GitHub 저장소를 새 창에서 열기`}
      className={`group grid grid-cols-[1.5rem_minmax(0,1fr)_2.75rem] items-start gap-x-3 gap-y-4 border-b px-1 transition-colors hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[3rem_minmax(12rem,0.8fr)_minmax(14rem,1fr)_auto] sm:items-center sm:gap-6 sm:px-4 ${
        compact ? "min-h-36 py-6 sm:min-h-32" : "min-h-44 py-8 sm:min-h-48"
      }`}
    >
      <span className="font-technical self-start pt-1 text-[11px] text-muted-foreground sm:self-auto sm:pt-0">
        {String(index).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <h3
          className={`font-display [overflow-wrap:anywhere] font-semibold leading-tight text-foreground ${
            compact
              ? "text-xl min-[360px]:text-2xl sm:text-3xl"
              : "text-[22px] min-[360px]:text-3xl sm:text-4xl"
          }`}
        >
          {project.title}
        </h3>
        <p className="font-technical mt-3 text-[10px] text-muted-foreground sm:text-[11px]">
          {project.category}
        </p>
      </div>

      <p className="col-start-2 col-end-4 max-w-[46ch] text-sm leading-7 text-muted-foreground sm:col-auto">
        {project.description}
      </p>

      <span
        aria-hidden="true"
        className="col-start-3 row-start-1 inline-flex min-h-11 min-w-11 items-center justify-center justify-self-end self-start text-xs font-semibold text-foreground sm:col-auto sm:row-auto sm:self-auto sm:gap-2"
      >
        <span className="hidden lg:inline">GitHub에서 보기</span>
        <ArrowUpRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
          strokeWidth={1.75}
        />
      </span>
    </a>
  );
}

function ProjectGroup({
  id,
  title,
  projects,
  startIndex,
  compact = false,
}: {
  id: string;
  title: string;
  projects: readonly Project[];
  startIndex: number;
  compact?: boolean;
}) {
  return (
    <section aria-labelledby={`${id}-heading`}>
      <header className="flex min-h-16 items-center justify-between gap-6 border-y border-[oklch(var(--border-strong))]">
        <h2
          id={`${id}-heading`}
          className="font-display text-2xl font-normal text-foreground"
        >
          {title}
        </h2>
        <span className="font-technical text-[10px] text-muted-foreground">
          {String(projects.length).padStart(2, "0")}
        </span>
      </header>
      <div>
        {projects.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={startIndex + index}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}

export default function ProjectsPage() {
  return (
    <div className="relative left-1/2 w-screen max-w-[var(--wide-content-width)] -translate-x-1/2 px-[var(--layout-gutter)] pb-24 pt-16 sm:pb-28 sm:pt-24">
      <header className="max-w-4xl pb-16 sm:pb-20">
        <p className="font-technical text-xs text-primary">INDEX / PROJECTS</p>
        <h1 className="font-display mt-5 text-5xl font-normal leading-tight text-foreground sm:text-7xl">
          프로젝트
        </h1>
        <p className="mt-7 max-w-2xl break-keep text-base leading-8 text-muted-foreground">
          블로그를 지탱하는 서비스부터 문제 풀이와 게임까지, 만들고 운영하며
          배운 것들을 모았습니다.
        </p>
      </header>

      <ProjectGroup
        id="featured-projects"
        title="Featured Projects"
        projects={featuredProjects}
        startIndex={1}
      />
      <ProjectGroup
        id="project-archive"
        title="Project Archive"
        projects={archiveProjects}
        startIndex={featuredProjects.length + 1}
        compact
      />
    </div>
  );
}
