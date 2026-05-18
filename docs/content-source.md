# Content Source

## Purpose

`houkago.blog` consumes content from the private repository `houkago.posts` and never treats itself as the content source of truth.

`houkago.posts` is the source of truth for markdown, metadata, and post-local assets. `houkago.blog` only reads, validates, normalizes, and renders that content.

## Loading Model

The site uses a build-time sync step:

1. resolve the posts repository path from `POSTS_REPO_PATH`
2. fall back to `../houkago.posts` when the variable is missing
3. normalize that path to an absolute path relative to the `houkago.blog` project root
4. scan the repository for canonical `index.md` files
5. parse frontmatter and markdown body
6. validate content and route safety
7. rewrite local asset references to public static paths
8. copy post assets into `public/generated/posts`
9. write normalized post metadata to `.generated/posts-manifest.json`
10. write search data to `.generated/search-index.json`
11. write post bodies to `.generated/post-bodies/*.json`

The sync entrypoint is `scripts/generate-posts.mjs`.

## Deployment Model

- GitHub Actions checks out both `houkago.blog` and private `houkago.posts`
- the workflow passes `POSTS_REPO_PATH=../houkago.posts`
- the sync step reads from the checked out local filesystem path
- Vercel receives prebuilt output and does not need direct access to the private posts repository

This design intentionally avoids fixed paths like `/vercel/houkago.posts`.

## Canonical Structure

Non-algorithm posts use the flat layout:

```text
{category}/{slug}/index.md
{category}/{slug}/assets/*
```

Algorithm problem-solving posts may use the platform layout:

```text
algorithm/{platform}/{problem-id}/index.md
algorithm/{platform}/{problem-id}/assets/*
```

Allowed categories:
- `algorithm`
- `project`
- `cs`
- `blog`

For algorithm platform paths, the public slug is derived as `{platform}-{problem-id}`. For example, `algorithm/boj/1002/index.md` becomes the flat public post slug `boj-1002`.

## Validation Rules

The sync step fails the build instead of silently skipping invalid content.

Validated constraints:
- `title`, `slug`, `date`, `description`, `category`, `status` must exist
- `status` must be `draft`, `published`, or `archived`
- `category` must be `algorithm`, `project`, `cs`, or `blog`
- flat post folder names must match `slug`
- algorithm platform paths derive the expected `slug` from `{platform}-{problem-id}`
- `platform` and `problemId` are optional frontmatter fields, but are normalized for algorithm platform paths
- when present, `platform` and `problemId` must match the algorithm path segments
- top-level category directory must match `category`
- `slug` must be unique across the repository
- `slug` must not collide with reserved category routes
- `date` and `updated` must use `YYYY-MM-DD`
- local `thumbnail` and markdown asset references must resolve to real files
- `index.md` path must match `{category}/{slug}/index.md` or `algorithm/{platform}/{problem-id}/index.md`

If the posts repository cannot be found, the sync step fails with a diagnostic error that includes:
- the resolved absolute path
- whether the path came from `POSTS_REPO_PATH` or the default fallback
- the original input value
- the `houkago.blog` project root
- the current working directory

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
  platform?: string;
  problemId?: string;
  bodyPath: string;
  path: string;
};
```

`bodyPath` points to a generated body file containing markdown with rewritten static asset paths. `path` stores the source file path inside `houkago.posts`, such as `cs/001-osiv/index.md` or `algorithm/boj/1002/index.md`.
