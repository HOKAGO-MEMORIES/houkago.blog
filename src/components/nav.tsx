"use client"

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui/utils";

interface Nav {
    href: string;
    label: string;
    external?: boolean;
}

export const navs = [
    {
        href: "/blog",
        label: "Blog",
    },
    {
        href: "/projects",
        label: "Projects",
    },
];


export default function Nav() {
    return (
        <nav className="sm:flex hidden items-center space-x-6 text-sm font-medium gap-2">
            {navs.map((nav) => (
                <NavItem key={nav.label} {...nav}/>
            ))}

        </nav>

    );
}

export function NavItem({
	href,
	label,
	external,
	onClick,
}: Nav & { onClick?: () => void }) {
	const pathname = usePathname();
    const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);

	return (
		<Link
			href={href}
			className={cn(
				"flex items-center py-3 text-primary font-semibold uppercase tracking-[0.14em] transition-colors hover:text-foreground",
				isActive && "underline underline-offset-4 text-foreground",
			)}
			target={external ? "_blank" : undefined}
			onClick={onClick}
		>
			{label}
			{external && <ArrowUpRight className="h-4 w-4" />}
		</Link>
	);
}
