"use client";

import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="색상 테마 전환"
      title="색상 테마 전환"
    >
      <span
        aria-hidden="true"
        className="flex h-[15px] w-7 items-center rounded-full border border-[oklch(var(--border-strong))] p-0.5"
      >
        <span className="h-[9px] w-[9px] rounded-full bg-[oklch(var(--foreground-soft))] transition-transform duration-200 dark:translate-x-3" />
      </span>
      <span className="whitespace-nowrap max-[420px]:sr-only">
        <span className="dark:hidden">어둡게</span>
        <span className="hidden dark:inline">밝게</span>
      </span>
    </button>
  );
}
