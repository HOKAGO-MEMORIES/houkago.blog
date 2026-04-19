import type { Category } from "@/types/post";

export const SITE_NAME = "방과후 블로그";
export const SITE_DESCRIPTION = "모든게 시작되는 시간";
export const SITE_URL = "https://houkago.moe";
export const DEFAULT_OG_IMAGE = "/home/main.jpg";
export const AUTHOR_NAME = "HOKAGO-MEMORIES";
export const SEO_TIMEZONE_OFFSET = "+09:00";

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  algorithm: "백준을 비롯한 알고리즘 문제 풀이와 풀이 기록을 모아둔 카테고리입니다.",
  project: "프로젝트 제작 기록과 구현 경험을 정리한 카테고리입니다.",
  cs: "컴퓨터공학 개념과 학습 기록을 정리한 카테고리입니다.",
  blog: "개발 일기와 블로그 운영 기록, 구현 메모를 담는 카테고리입니다.",
};

export function getCategoryDescription(category: Category) {
  return CATEGORY_DESCRIPTIONS[category];
}

export function getCategoryTitle(category: Category) {
  return `${category.toUpperCase()} | ${SITE_NAME}`;
}

export function getPostTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}

export function toSeoDate(date: string) {
  return `${date}T00:00:00${SEO_TIMEZONE_OFFSET}`;
}
