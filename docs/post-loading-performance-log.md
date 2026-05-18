# Post Loading Performance Log

## Summary

This log records the post loading performance work completed on the `dev` branch in May 2026.

The original issue was that every page request paid search-preparation costs, even when the user opened a single post. `RootLayout` loaded every renderable post, extracted search text from every post body with regular expressions, and passed the full search payload through the `Header` client component boundary before the target page rendered.

The final structure separates post metadata, search data, and post bodies:

```text
.generated/posts-manifest.json
-> metadata for lists, categories, tags, routes, and SEO

.generated/search-index.json
-> search-only payload, loaded when the search dialog opens

.generated/post-bodies/{slug}.json
-> markdown body for one post, loaded only by the matching post page
```

## Original Runtime Path

Before this work, opening `/blog/{slug}` still triggered global search preparation:

```text
page request
-> RootLayout
-> getRenderablePosts()
-> extractSearchText(post.body) for every renderable post
-> pass searchPosts to Header
-> render the requested post page
-> serialize the selected post body as MDX
```

The problematic part was not `getPostBySlug().find()` itself. That lookup is structurally worth improving, but at the current post count it was not large enough to explain multi-second delays. The larger issue was that layout rendering eagerly processed and transferred data for all post bodies.

## Step 1: Prebuild The Search Index

Commit:

```text
3c2dd1c perf: prebuild blog search index
```

Changes:

- Moved search text extraction from `src/app/layout.tsx` to `scripts/generate-posts.mjs`.
- Added `.generated/search-index.json`.
- Added search index reading helpers in `src/lib/posts.ts`.
- Removed runtime `extractSearchText(post.body)` from `RootLayout`.
- Kept `posts-manifest.json` body data unchanged for this step.

After this step, page requests no longer ran regular expressions over every post body. `RootLayout` still read search data and passed it to `Header`, so the search payload was still part of initial rendering.

## Step 2: Lazy Load Search Data

Commit:

```text
337611a perf: lazy load blog search index
```

Changes:

- Removed the `searchPosts` prop from `Header`.
- Removed search index reads from `RootLayout`.
- Added `src/app/api/search-index/route.ts`.
- Changed `SearchDialog` to fetch `/api/search-index` only when the dialog opens.
- Added module-level client caching so desktop and mobile `SearchDialog` instances share the same request/result.

After this step, normal page loads no longer read or transfer the search index. Search data is downloaded only when the user opens search.

Current search path:

```text
page request
-> RootLayout
-> Header
-> no search index read
-> render page

search dialog open
-> fetch /api/search-index
-> read generated search index
-> run client-side search
```

## Step 3: Split Post Bodies From The Manifest

Commit:

```text
f6d0edc perf: split post bodies from manifest
```

Changes:

- Removed `body` from `.generated/posts-manifest.json`.
- Added `bodyPath` to each manifest post entry.
- Wrote each body to `.generated/post-bodies/{slug}.json`.
- Added `PostBody` and updated `Post` types in `src/types/post.ts`.
- Added `getPostBodyBySlug()` in `src/lib/posts.ts`.
- Updated `src/app/blog/[slug]/page.tsx` to load only the requested post body before MDX serialization.
- Kept search index generation in `posts:sync`, using the normalized body before it is written out.

The body loader validates that the generated body path stays inside `.generated` and that the loaded body slug matches the requested slug.

Current post page path:

```text
page request
-> read metadata from posts-manifest.json
-> find requested post metadata
-> read .generated/post-bodies/{slug}.json
-> serialize only that body as MDX
-> render post page
```

## Verification

The completed work was verified with:

```text
& 'C:\Program Files\nodejs\npm.cmd' run posts:sync
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Observed sync/build results:

```text
post body files: 265
posts-manifest.json: 126,803 chars / 134,308 bytes
manifest body fields: removed
generated routes during build: 144
build status: success
```

## Resulting Model

The application now has separate responsibilities for each generated artifact:

- `posts-manifest.json` supports lists, categories, tags, route generation, and SEO metadata.
- `search-index.json` supports search and is loaded lazily through `/api/search-index`.
- `post-bodies/*.json` supports individual post rendering and is read per slug.

This removes search processing from the global layout path, removes search payload transfer from initial page loads, and prevents metadata-only routes from carrying every post body in the manifest.

## Follow-Up Ideas

- Consider precomputing a lower-case search haystack during `posts:sync` to reduce per-keystroke client work.
- Consider limiting displayed search results when the result set is large.
- Consider replacing linear slug lookup with a cached slug map if post count grows substantially.
