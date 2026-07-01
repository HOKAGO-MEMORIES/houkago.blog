# houkago.blog

Frontend repository for Houkago.

## Responsibilities

- UI, routing, rendering, SEO, and frontend build behavior
- consuming post data from `houkago.posts` in the current static-first model
- consuming backend content APIs in the target backend sync/read model

## Reference Docs

Before changing content loading, routing, deployment, or backend integration, check `houkago.docs`
active documents:

- `architecture/overview.md`
- `architecture/deployment.md`
- `architecture/content-source.md`
- `architecture/backend-content-sync.md`
- `api/backend-content-api.md`

Read metadata headers first and follow `related_docs` only when relevant.

## Rules

- Do not redefine the canonical post schema locally.
- Do not treat frontend generated data as the source of truth.
- Draft, private, archived, or deleted posts must not be exposed in production.
- If route behavior, content loading, API usage, cache, or revalidation changes, update or flag
  `houkago.docs`.
- Never commit secrets, deploy tokens, private keys, or production credentials.
