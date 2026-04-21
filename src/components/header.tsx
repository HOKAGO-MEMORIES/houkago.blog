"use client";

import { Home, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { NavItem, navs } from "./nav";
import NavMobile from "./nav-mobile";
import { Button } from "./ui/button";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 px-3 sm:px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="hidden h-14 grid-cols-4 items-center sm:grid">
                <div className="flex justify-center">
                    <Logo />
                </div>
                {navs.map((nav) => (
                    <div key={nav.href} className="flex justify-center">
                        <NavItem {...nav} />
                    </div>
                ))}
                <div className="flex justify-center">
                    <ThemeChanger />
                </div>
            </div>
            <div className="flex h-14 items-center justify-between sm:hidden">
                <Logo />
                <div className="flex items-center gap-1">
                    <ThemeChanger />
                    <NavMobile />
                </div>
            </div>
        </header>
    );
}

function Logo() {
    return (
        <Link href="/" className="font-extrabold">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none shadow-none text-primary hover:bg-transparent hover:text-foreground"
            >
                <Home className="h-5 w-5 transition-colors" strokeWidth={2.25} />
            </Button>
        </Link>
    );
}

function ThemeChanger() {
	const { resolvedTheme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	};

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="h-8 w-8 rounded-none shadow-none text-primary hover:bg-transparent hover:text-foreground"
		>
			<Sun className="h-5 w-5 transition-colors dark:hidden" strokeWidth={2.25} />
			<Moon className="hidden h-5 w-5 transition-colors dark:block" strokeWidth={2.25} />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
