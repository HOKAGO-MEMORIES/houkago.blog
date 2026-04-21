import Link from "next/link";
import { projects } from "./data/projects";

export default function ProjectsPage() {
    return (
        <div className="flex flex-col gap-4 py-2">
            {projects.map((p) =>(
                <div key={p.title} className="rounded-2xl border p-5 transition-colors hover:border-primary hover:bg-card/70">
                <Link
                    href={p.link}
                    className="max-w-[90%] break-keep text-lg font-semibold tracking-tight text-primary underline underline-offset-8"
                    target="_blank"
                    rel="noopener"
                >  
                    {p.title}
                </Link>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.description}</p>
                </div>
            ))}
        </div>
    );
}
  
