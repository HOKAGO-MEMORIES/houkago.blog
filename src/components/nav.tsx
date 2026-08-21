"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui/utils";

interface NavItemDefinition {
  href: string;
  label: string;
  external?: boolean;
}

export const navs = [
  {
    href: "/",
    label: "소개",
  },
  {
    href: "/projects",
    label: "프로젝트",
  },
  {
    href: "/blog",
    label: "블로그",
  },
];

export default function Nav() {
  return (
    <nav
      aria-label="주요 메뉴"
      className="hidden items-center gap-2 min-[761px]:flex"
    >
      {navs.map((nav) => (
        <NavItem key={nav.label} {...nav} />
      ))}
    </nav>
  );
}

export function NavItem({
  href,
  label,
  external,
  onClick,
  mobile = false,
}: NavItemDefinition & { onClick?: () => void; mobile?: boolean }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        mobile
          ? "w-full justify-between border-t px-1 py-3 text-xl font-semibold"
          : "rounded-full px-4 tracking-[0.02em]",
        isActive &&
          (mobile
            ? "bg-muted text-foreground"
            : "bg-muted text-foreground shadow-[inset_0_-1px_0_oklch(var(--foreground))]"),
      )}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
      {external && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
    </Link>
  );
}
