import PageLayout from "@/components/page-layout";
import Link from "next/link";
import { psPosts } from "#posts"

export default function PS() {
    return (
        <PageLayout title="PS" description="알고리즘!">
            <div className="flex flex-col">
                {psPosts
                    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
                    .map((ps) => (
                        <Link
                            href={`${ps.permalink}`}
                            key={ps.slug}
                            className="flex py-5 items-center justify-between gap-2 border-b last:border-none"
                        >
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="font-semibold text-lg break-all line-clamp-2 text-primary">
                                    {ps.title}
                                </span>
                                <span className="break-all">{ps.desc}</span>
                                <time className="text-xs mt-1">{ps.date}</time>
                            </div>
                        </Link>
                    ))
                }
            </div>
        </PageLayout> 
    );
  }
  