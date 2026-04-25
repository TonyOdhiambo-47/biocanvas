# CLAUDE.md — biocanvas

Working notes for Claude (and for me). The principles here apply to every change in this repo.

## What this is

A ~10 KB static Vite app that animates the central dogma of biology (DNA replication, transcription, translation). No backend, no analytics, zero runtime dependencies.

## Engineering principles

1. **Small surface, small bundle.** Anything that adds more than ~5 KB gzipped needs a justification in the PR description.
2. **Zero runtime dependencies.** The deployed app ships hand-written TypeScript + Canvas 2D. Vite and TypeScript are dev-only.
3. **No frameworks.** No React, no Three.js, no animation libraries. If you need state, write a function.
4. **Type-checked, not test-driven.** `npm run typecheck` must pass. CI enforces this.
5. **Hand-written biology.** No AI-generated content in the data layer. PRs that change a biological claim must cite a primary source (Alberts, Lodish, NCBI Bookshelf, or equivalent).
6. **No telemetry.** No analytics, no error reporting, no fingerprinting. Privacy is a feature, advertised on the page.

## Security principles

1. **Treat the URL as untrusted.** Anything decoded from `location.search` or `location.hash` is validated before reaching the DOM. Use `textContent`, never `innerHTML`, for user-derived strings.
2. **CSP is the second line.** `vercel.json` enforces `script-src 'self'` with no `unsafe-eval`. Adding an external script origin is almost always the wrong move — copy the code instead.
3. **Dependency review before install.** Before `npm install X`, check weekly downloads, last publish date, and transitive depth. Prefer copying ~30 lines over adding a 50-package tree.
4. **No secrets in the repo.** If you ever need one, the architecture is wrong — this app is client-side by design.

## CI

`.github/workflows/ci.yml` runs typecheck + build on every push and PR. Audit job runs `npm audit --audit-level=high` informationally.

## Deploys

Vercel auto-deploys from `main`. Preview deploys on every PR. `main` is production — no staging.
