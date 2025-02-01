import { blogPosts, psPosts } from "#posts";
import Link from "next/link";

export default function RecentPosts() {
    const allPosts = [...blogPosts, ...psPosts].sort(
        (a, b) => Number(new Date(b.date)) - Number(new Date(a.date))
    )

    return (
        <>
            <h2 className="mt-20 text-5xl font-extrabold text-primary">
                Recent Posts
            </h2>
            <div className="flex flex-col">
                {allPosts
                    .slice(0, 5)
                    .map((post) => (
                        <Link
                            href={`${post.permalink}`}
                            key={post.slug}
                            className="flex py-5 gap-2 flex-1 border-b last:border-none"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-lg break-keep text-primary">
                                    {post.title}
                                </span>
                                <span className="break-all">{post.desc}</span>
                            </div>
                            <div className="flex flex-col ml-auto">
                                <span className="break-keep ml-auto text-primary">
                                    {post.category}
                                </span>
                                <time className="text-xs">{post.date}</time>
                            </div>                            
                        </Link>
                ))}
            </div>
        </>
    );
}