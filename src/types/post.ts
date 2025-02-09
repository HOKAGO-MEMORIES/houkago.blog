export interface Post {
    title: string;
    desc: string;
    slug: string;
    date: string;
    thumbnail?: string;
    body: string;
    category: string;
    permalink: string;
}

export interface BlogPost extends Post {
    type: 'blog';
}

export interface PSPost extends Post {
    type: 'ps';
}

export interface PostsData {
    blogPosts: BlogPost[];
    psPosts: PSPost[];
}