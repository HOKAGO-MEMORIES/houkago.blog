# Rendering Rules

## Status Values

- `draft`
- `published`
- `archived`

## Production Rules

Production rendering is static-first and conservative:

- only `published` posts are included in generated blog routes
- `draft` posts are excluded from public lists and post pages
- `archived` posts are excluded from standard lists and routes

## Local Development Rules

Draft preview is explicit, not implicit.

- by default, local development behaves like production
- `POSTS_INCLUDE_DRAFTS=true` allows draft posts to appear in local routes and lists
- `archived` posts remain hidden from the normal experience

This keeps production behavior stable while still allowing controlled local preview when needed.

## Homepage Reuse

The homepage must not invent a second content source. It reuses the same normalized post dataset for:

- featured posts
- latest posts
- category highlights

## Error Handling

Content errors are not ignored.

- invalid metadata fails the sync step
- duplicate slugs fail the sync step
- invalid post paths fail the sync step
- missing local assets fail the sync step with explicit logs

## Featured Content

`featured` is only a display hint. It never overrides `status`.
