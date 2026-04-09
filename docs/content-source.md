# Content Source

## Purpose

`houkago.blog` consumes content from the private repository `houkago.posts` and never treats itself as the content source of truth.

## Loading Model

The site uses a build-time sync step:

1. resolve the posts repository path from `POSTS_REPO_PATH`
2. fall back to `../houkago.posts` when the variable is missing
3. scan the repository for canonical `index.md` files
4. parse frontmatter and markdown body
5. validate content and route safety
6. rewrite local asset references to public static paths
7. copy post assets into `public/generated/posts`
8. write a normalized manifest to `.generated/posts-manifest.json`

The sync entrypoint is `scripts/generate-posts.mjs`.

## Canonical Structure

Every post must match this layout:

```text
{category}/{slug}/index.md
{category}/{slug}/assets/*
```

Allowed categories:
- `algorithm`
- `project`
- `cs`
- `blog`

## Validation Rules

The sync step fails the build instead of silently skipping invalid content.

Validated constraints:
- `title`, `slug`, `date`, `description`, `category`, `status` must exist
- `status` must be `draft`, `published`, or `archived`
- `category` must be `algorithm`, `project`, `cs`, or `blog`
- folder name must match `slug`
- top-level category directory must match `category`
- `slug` must be unique across the repository
- `slug` must not collide with reserved category routes
- `date` and `updated` must use `YYYY-MM-DD`
- local `thumbnail` and markdown asset references must resolve to real files
- `index.md` path must match `{category}/{slug}/index.md`

## Normalized Shape

```ts
type Post = {
  title: string;
  slug: string;
  date: string;
  description: string;
  category: "algorithm" | "project" | "cs" | "blog";
  status: "draft" | "published" | "archived";
  tags: string[];
  updated?: string;
  thumbnail?: string;
  series?: string;
  featured?: boolean;
  draftNote?: string;
  body: string;
  path: string;
};
```

`body` contains markdown with rewritten static asset paths, and `path` stores the canonical source file path inside `houkago.posts`.
