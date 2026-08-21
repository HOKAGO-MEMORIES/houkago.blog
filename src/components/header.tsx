import Image from "next/image";
import Link from "next/link";
import Nav from "./nav";
import NavMobile from "./nav-mobile";
import SearchDialog from "./search-dialog";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[oklch(var(--border-strong))] bg-background/90 backdrop-blur-[18px] supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto grid min-h-[var(--header-height)] w-full max-w-[var(--wide-content-width)] grid-cols-[1fr_auto_1fr] items-center gap-7 px-[var(--layout-gutter)] max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:gap-2">
        <Logo />
        <Nav />
        <div className="flex items-center justify-self-end gap-2">
          <SearchDialog />
          <ThemeToggle />
          <NavMobile />
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      aria-label="방과후 홈"
      className="inline-flex min-h-11 min-w-0 items-center gap-2 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <Image
        src="/logo.svg"
        alt=""
        width={32}
        height={32}
        priority
        className="h-8 w-8 shrink-0 dark:invert max-[420px]:h-7 max-[420px]:w-7"
      />
      <span className="truncate text-[13px] font-semibold tracking-[0.1em] max-[420px]:text-xs">
        방과후
      </span>
    </Link>
  );
}
