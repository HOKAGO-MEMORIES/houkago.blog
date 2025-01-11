import { blogPosts } from "#posts";
import Link from "next/link";

export default function RecentPosts() {
    return (
        <>
            <h2 className="mt-20 text-5xl font-extrabold text-primary">
                Recent Posts
            </h2>
            <div className="flex flex-col">
                {blogPosts
                    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
                    .slice(0, 5)
                    .map((blog) => (
                        <Link
                            href={`${blog.permalink}`}
                            key={blog.slug}
                            className="flex py-5 gap-2 flex-1 border-b last:border-none"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-lg break-keep text-primary">
                                    {blog.title}
                                </span>
                                <span className="break-all">{blog.desc}</span>
                            </div>
                            <time className="text-xs ml-auto">{blog.date}</time>
                        </Link>
                        
                ))}
            </div>
        </>
    );
}