import blogPostsData from "./blogPosts.json";
import psPostsData from "./psPosts.json";

type BlogPost = {
    title: string;
    desc: string;
    slug: string;
    date: string;
    thumbnail: string;
    body: string;
    permalink: string;
    category: string;
};

type PSPost = {
    title: string;
    desc: string;
    slug: string;
    date: string;
    body: string;
    permalink: string;
    category: string;
};

// This module is committed with the frontend so Vercel can always resolve `#posts`.
export const blogPosts: BlogPost[] = blogPostsData;
export const psPosts: PSPost[] = psPostsData;
