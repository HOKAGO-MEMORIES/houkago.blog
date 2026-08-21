export const projectGroups = ["featured", "archive"] as const;

export type ProjectGroup = (typeof projectGroups)[number];

export type Project = Readonly<{
  id: string;
  title: string;
  description: string;
  category: string;
  group: ProjectGroup;
  href: string;
}>;

export const projects = [
  {
    id: "houkago-server",
    title: "houkago.server",
    description: "블로그의 콘텐츠 동기화와 공개 API를 담당하는 백엔드입니다.",
    category: "웹 / 백엔드",
    group: "featured",
    href: "https://github.com/HOKAGO-MEMORIES/houkago.server",
  },
  {
    id: "houkago-blog",
    title: "houkago.blog",
    description: "지금 보고 있는 방과후 블로그의 프론트엔드입니다.",
    category: "웹 / 프론트엔드",
    group: "featured",
    href: "https://github.com/HOKAGO-MEMORIES/houkago.blog",
  },
  {
    id: "boj-line123",
    title: "백준 문제 풀이",
    description: "풀어낸 알고리즘 문제와 풀이 코드를 차곡차곡 모았습니다.",
    category: "알고리즘",
    group: "featured",
    href: "https://github.com/HOKAGO-MEMORIES/BOJ-line123",
  },
  {
    id: "the-way-home",
    title: "The Way Home",
    description: "대학 캡스톤 디자인으로 만든 2D 플랫폼 게임입니다.",
    category: "게임",
    group: "archive",
    href: "https://github.com/HOKAGO-MEMORIES/The-Way-Home-Scripts",
  },
  {
    id: "discord-gacha-bot",
    title: "디스코드 가챠 봇",
    description: "제비뽑기와 팀 나누기를 도와주는 디스코드 봇입니다.",
    category: "도구",
    group: "archive",
    href: "https://github.com/HOKAGO-MEMORIES/Discord-Gacha-Bot",
  },
  {
    id: "legacy-github-blog",
    title: "깃허브 블로그",
    description: "지금의 방과후 블로그 이전에 운영했던 기록 보관소입니다.",
    category: "아카이브",
    group: "archive",
    href: "https://github.com/HOKAGO-MEMORIES/hokago-memories.github.io",
  },
] as const satisfies readonly Project[];

export const featuredProjects: readonly Project[] = projects.filter(
  (project) => project.group === "featured",
);

export const archiveProjects: readonly Project[] = projects.filter(
  (project) => project.group === "archive",
);

const featuredProjectCategoryLabels: Readonly<Record<string, string>> = {
  "houkago-server": "웹",
  "houkago-blog": "웹",
  "boj-line123": "알고리즘",
};

export function getProjectDisplayCategory(project: Project) {
  return featuredProjectCategoryLabels[project.id] ?? project.category;
}
