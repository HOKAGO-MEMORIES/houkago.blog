import Link from "next/link";
import { projects } from "./data/projects";

export default function ProjectsPage() {
    return (
        <div className="flex flex-col gap-5 py-5">
            {projects.map((p) =>(
                <div key={p.title}>
                <Link
                    href={p.link}
                    className="break-keep underline underline-offset-8 max-w-[90%] font-semibold tracking-wider text-base"
                    target="_blank"
                    rel="noopener"
                >  
                    {p.title}
                </Link>
                <p className="text-sm text-gray-600 mt-1">{p.description}</p> {/* 설명 */}
                </div>
            ))}
        </div>
    );
}
  