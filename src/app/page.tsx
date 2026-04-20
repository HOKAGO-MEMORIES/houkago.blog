import Link from "next/link";
import PageLayout from "@/components/page-layout";

export default function Home() {
  return (
    <PageLayout className="min-h-[calc(100vh-9rem)] justify-center">
      <section className="flex flex-col gap-8 py-10">
        <div className="flex max-w-2xl flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            HOUKAGO
          </p>
          <h1 className="text-5xl font-black tracking-tight text-primary sm:text-6xl">
            꿈을 꾸는 개발자입니다
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            조용히 만들고, 기록하고, 조금씩 앞으로 나아갑니다. 글은 블로그에서,
            작업물은 프로젝트 영역에서 정리하고 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Blog
          </Link>
          <Link
            href="/projects"
            className="rounded-full border px-5 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary"
          >
            Projects
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
