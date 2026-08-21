import { getTzDay } from "@/util/days";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      data-site-footer
      className="w-full border-t border-[oklch(var(--border-strong))]"
    >
      <div className="mx-auto flex min-h-40 w-full max-w-[var(--wide-content-width)] items-center justify-between gap-9 px-[var(--layout-gutter)] py-9 max-[760px]:min-h-44 max-[760px]:flex-col max-[760px]:items-start max-[760px]:justify-center max-[760px]:gap-6">
        <p className="text-xl font-medium text-foreground max-[760px]:text-lg">
          방과 후에도 만들고, 풀고, 기록합니다.
        </p>
        <div className="font-technical flex items-center gap-7 text-[10px] tracking-[0.06em] text-muted-foreground max-[760px]:w-full max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-3">
          <div className="flex items-center gap-6">
            <Link
              href="mailto:memories@houkago.moe"
              aria-label="메일 보내기: memories@houkago.moe"
              className="group inline-flex min-h-11 items-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="border-b border-[oklch(var(--border-strong))] pb-1 transition-colors group-hover:border-primary group-focus-visible:border-primary">
                Mail ↗
              </span>
            </Link>
            <Link
              href="https://github.com/HOKAGO-MEMORIES"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="border-b border-[oklch(var(--border-strong))] pb-1 transition-colors group-hover:border-primary group-focus-visible:border-primary">
                GitHub ↗
              </span>
            </Link>
          </div>
          <span className="inline-flex min-h-11 items-center whitespace-nowrap">
            © {getTzDay(new Date()).get("year")} HOKAGO-MEMORIES
          </span>
        </div>
      </div>
    </footer>
  );
}
