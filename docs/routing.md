# Routing

## Public Routes

- `/`
- `/blog`
- `/blog/{category}`
- `/blog/{slug}`

## Route Semantics

- `/` reuses the same normalized post data for featured posts, latest posts, and category highlights
- `/blog` is the hub page for all renderable posts
- `/blog/{category}` lists posts within one allowed category
- `/blog/{slug}` renders an individual post page

## Implementation Note

Because `/blog/{category}` and `/blog/{slug}` share the same segment depth, the app resolves both through a single dynamic route and distinguishes them at build time:

- category segment if the path matches one of `algorithm`, `project`, `cs`, `blog`
- post segment otherwise

For this reason, post slugs that equal an allowed category name are rejected during content validation.

## Current URL Policy

The individual post URL intentionally does not include the category prefix.

If the route strategy changes later, update this document before changing the implementation or content contract.
