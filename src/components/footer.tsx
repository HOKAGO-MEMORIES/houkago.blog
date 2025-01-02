import { getTzDay } from "@/util/days";
import GithubIcon from '@/components/icons/GithubIcon';
import Link from "next/link"

export default function Footer() {
    return (
        <footer className="flex flex-col items-center justyfy-center w-full h-28 gap-3">
            <div className="flex items-center justyfy-center gap-3">
                <Link href="https://github.com/HOKAGO-MEMORIES" target="_blank">
                    <GithubIcon size={20} className="text-primary stroke-1"/>
                </Link>

            </div>
            <span className="text-xs text-primary font-medium">
				Copyright © {getTzDay(new Date()).get("year")} HOKAGO-MEMORIES
			</span>
        </footer>
    );
}