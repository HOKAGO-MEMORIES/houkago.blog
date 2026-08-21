import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "HOKAGO-MEMORIES가 만든 웹, 알고리즘, 게임, 도구 프로젝트를 살펴봅니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
