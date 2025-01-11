"use client";

import { Home, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Nav from "./nav";
import NavMobile from "./nav-mobile";
import { Button } from "./ui/button";

export default function Header() {
    return (
        <header className="h-14 px-5 sticky top-0 z-50 w-full border-b flex justify-between items-center bg-background">
            <div className="flex items-center">
                <NavMobile />
                <Nav />

            </div>
            <div className="flex items-center gap-1">
                <ThemeChanger />
				<Logo />
			</div>

        </header>
    );
}

function Logo() {
    return (
        <Link href="/" className="font-extrabold">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
            >
                <Home className="h-5 w-5 transition-all text-primary stroke-1"/>
            </Button>
        </Link>
    );
}

function ThemeChanger() {
	const { setTheme, theme } = useTheme();

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<Button
			type="button"
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			className="rounded-full"
		>
			<Sun className="h-5 w-5 transition-all dark:hidden text-primary stroke-1" />
			<Moon className="h-5 w-5 hidden transition-all dark:block text-primary stroke-1" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}