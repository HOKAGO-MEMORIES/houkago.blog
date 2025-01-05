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
        href: "/project",
        label: "Project",
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

	return (
		<Link
			href={href}
			className={cn(
				"transition-colors hover:font-black py-3 text-primary font-bold flex items-center",
				pathname?.startsWith(href) && "underline underline-offset-4 font-black",
			)}
			target={external ? "_blank" : undefined}
			onClick={onClick}
		>
			{label.toUpperCase()}
			{external && <ArrowUpRight className="h-4 w-4" />}
		</Link>
	);
}
