import { describe, expect, it } from "vitest";
import {
  archiveProjects,
  featuredProjects,
  projects,
  projectGroups,
} from "@/data/projects";

describe("project source of truth", () => {
  it("uses stable unique ids and hrefs", () => {
    expect(new Set(projects.map((project) => project.id)).size).toBe(
      projects.length,
    );
    expect(new Set(projects.map((project) => project.href)).size).toBe(
      projects.length,
    );
  });

  it("partitions every project into a supported group", () => {
    expect(projects.every((project) => projectGroups.includes(project.group))).toBe(
      true,
    );
    expect(featuredProjects).toEqual(
      projects.filter((project) => project.group === "featured"),
    );
    expect(archiveProjects).toEqual(
      projects.filter((project) => project.group === "archive"),
    );
    expect(featuredProjects.length + archiveProjects.length).toBe(projects.length);
  });

  it("keeps project destinations explicit and external", () => {
    expect(
      projects.every((project) =>
        project.href.startsWith("https://github.com/HOKAGO-MEMORIES/"),
      ),
    ).toBe(true);
  });
});
