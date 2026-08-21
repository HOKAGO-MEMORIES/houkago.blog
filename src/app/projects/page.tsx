import { ArrowUpRight } from "lucide-react";
import {
  archiveProjects,
  featuredProjects,
  getProjectDisplayCategory,
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
      className={compact ? "project-index-row is-archive" : "project-index-row"}
    >
      <span className="project-index-number">
        {String(index).padStart(2, "0")}
      </span>
      <div className="project-index-title">
        <h3>{project.title}</h3>
        <span>{getProjectDisplayCategory(project)}</span>
      </div>
      <p>{project.description}</p>
      <span className="project-index-action">
        GitHub에서 보기
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
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
    <section
      className={compact ? "project-index-group is-archive" : "project-index-group"}
      aria-labelledby={`${id}-heading`}
    >
      <header className="project-index-group-heading">
        <h2 id={`${id}-heading`}>{title}</h2>
        <span>{String(projects.length).padStart(2, "0")}</span>
      </header>
      <div className="project-index-list">
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
    <div className="projects-index-page">
      <header className="projects-index-hero">
        <h1>프로젝트</h1>
        <p>지금까지 만든 것들을 모았습니다.</p>
      </header>

      <ProjectGroup
        id="featured-projects"
        title="주요 프로젝트"
        projects={featuredProjects}
        startIndex={1}
      />
      <ProjectGroup
        id="project-archive"
        title="아카이브"
        projects={archiveProjects}
        startIndex={featuredProjects.length + 1}
        compact
      />
    </div>
  );
}
