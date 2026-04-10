export type Category = "algorithm" | "project" | "cs" | "blog";
export type PostStatus = "draft" | "published" | "archived";

export type Post = {
  title: string;
  slug: string;
  date: string;
  description: string;
  category: Category;
  status: PostStatus;
  tags: string[];
  updated?: string;
  thumbnail?: string;
  series?: string;
  featured?: boolean;
  draftNote?: string;
  body: string;
  path: string;
};

export type PostManifest = {
  version: number;
  generatedAt: string;
  sourcePath: string;
  sourcePathInput: string;
  sourcePathStrategy: "env" | "default";
  publicAssetBase: string;
  posts: Post[];
};
