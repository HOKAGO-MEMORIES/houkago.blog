# houkago.blog

`houkago.blog` is the public frontend repository for the Houkago portfolio and blog site.

This repository is not the content source of truth. The canonical post source lives in the private repository `houkago.posts`. `houkago.blog` reads, validates, normalizes, and renders that content into static-first pages.

## Repository Role

`houkago.blog` owns:
- the public UI
- route structure
- build-time content validation
- normalization for rendering
- static page generation and deployment

`houkago.blog` does not own:
- original markdown post files
- canonical content metadata
- post authoring workflow

## Build Strategy

The site uses a two-repository checkout flow:

1. `houkago.posts` changes trigger GitHub Actions.
2. Actions checks out both `houkago.blog` and `houkago.posts`.
3. `houkago.blog` runs `npm run posts:sync`.
4. The sync step reads `POSTS_REPO_PATH`, validates the content contract, rewrites local asset paths, copies static assets into `public/generated/posts`, and writes `.generated/posts-manifest.json`.
5. `next build` consumes that manifest to statically generate `/`, `/blog`, `/blog/{category}`, and `/blog/{slug}`.

Vercel does not read the private content repository directly. Private repository access stays inside GitHub Actions.

## Environment Variables

Required integration variable:
- `POSTS_REPO_PATH`

Resolution behavior:
- use `POSTS_REPO_PATH` when provided
- otherwise fall back to `../houkago.posts`

Optional local preview variable:
- `POSTS_INCLUDE_DRAFTS=true`

Draft preview is never enabled implicitly in production.

## Content Contract Summary

Expected post layout:

```text
{category}/{slug}/index.md
{category}/{slug}/assets/*
```

Allowed categories:
- `algorithm`
- `project`
- `cs`
- `blog`

Required frontmatter:
- `title`
- `slug`
- `date`
- `description`
- `category`
- `status`

Optional frontmatter:
- `tags`
- `updated`
- `thumbnail`
- `series`
- `featured`
- `draftNote`

## Documentation

- [docs/content-source.md](./docs/content-source.md)
- [docs/routing.md](./docs/routing.md)
- [docs/rendering-rules.md](./docs/rendering-rules.md)
