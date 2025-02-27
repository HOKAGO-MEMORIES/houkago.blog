import { psPosts } from "#posts";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx-content"
import { getSerializedMDX } from "@/lib/mdx";

export type ParamsType = Promise<{ slug: string }>;

export default async function PSPage(props: { params: ParamsType }) {
    const { slug } = await props.params;
    const post = getPageBySlug(slug);

    if (!post) {
        notFound();
    }

    const mdxSource = await getSerializedMDX(post.body);
    
    return (
        <div className="flex flex-col mt-5 gap-2">
            <h1 className="text-5xl font-black text-primary whitespace-pre-wrap">
                {post.title}
            </h1>
            <time className="text-primary font-medium text-sm mt-2 mb-10 ml-auto">
                {post.date}
            </time>
            <MDXContent mdxSource={mdxSource} />
        </div>
    );
}

function getPageBySlug(slug: string) {
    return psPosts.find((page) => page.slug === slug);
}   
