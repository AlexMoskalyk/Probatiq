# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — Next.js dev server
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — ESLint
- `npm run db:generate` — generate Drizzle migration from schema diff
- `npm run db:migrate` — apply migrations
- `npm run db:push` — push schema directly (dev shortcut, skips migration files)
- `npm run db:studio` — Drizzle Studio UI

No test runner configured.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Drizzle ORM + Postgres (node-postgres) · Clerk auth · Arcjet (bot/rate-limit/shield) · React Hook Form + Zod · @t3-oss/env-nextjs for env validation.

Path alias: `@/*` → repo root (imports look like `@/src/features/...`).

## Architecture

**Edge: `src/proxy.ts`** runs Arcjet (shield + bot detect + 100 req/min sliding window) and then Clerk auth on every request. Public routes (sign-in, root, `/api/webhooks/*`) bypass Clerk. Arcjet runs first — security before auth.

**Auth flow:** Clerk hosts sign-in. On user.created/updated/deleted, Clerk calls `src/app/api/webhooks/clerk/route.ts` which syncs into the local Postgres `user` table via `src/features/users/db.ts`. Post-signup users land on `/onboarding`, where `_client.tsx` polls until the webhook-driven sync completes before redirecting. `src/services/clerk/lib/get-current-user.ts` is the canonical way to read the current user in server code.

**Feature modules (`src/features/<name>/`)** each own their slice end-to-end:
- `db.ts` — Drizzle queries
- `db-cache.ts` — cache key/tag helpers
- `actions.ts` — server actions
- `schemas.ts` — Zod input schemas
- `components/` — feature-scoped UI
- `lib/` — feature-local utilities (e.g. formatters)

Current features: `job-infos`, `users`, `questions`, `interviews`. Add new domains as sibling dirs, not by sprinkling logic into `app/`.

**`src/services/<vendor>/`** wraps third-party SDKs and is the boundary between features and external APIs. Current vendors:
- `services/ai/` — Vercel AI SDK + `@ai-sdk/google` Gemini. `models/google.ts` exports the configured provider; `questions.ts` and `interviews.ts` expose `generateAi*` / `generateAi*Feedback` helpers that wrap `streamText(...)` with system prompts. Features and route handlers consume these, never `streamText` directly.
- `services/clerk/` — `lib/get-current-user.ts` is the only sanctioned way to read the current user server-side.
- `services/hume/` — voice-mode integration for the live interview flow; UI components in `services/hume/components/`.

**`src/app/`** holds route segments only. Pages are thin — they call feature `actions.ts` / `db.ts`. Client islands use the `_client.tsx` naming convention (underscore prefix → not a route).

**AI streaming routes (`src/app/api/ai/**`)** follow a fixed pattern: Zod-parse the body, `getCurrentUser()` for 401, fetch+ownership-check inside a `"use cache"` helper tagged via the feature's `db-cache.ts`, call the corresponding `services/ai/*` helper, and return `result.toTextStreamResponse()`. The client uses `useCompletion({ streamProtocol: "text" })` (`@ai-sdk/react`) — protocols must match. Persistence (e.g. inserting the generated question row) happens client-side via the feature's server action in `onFinish`, not in the streaming route, to avoid double-inserts.

**`src/components/`** is for cross-feature UI. `src/components/ui/` is shadcn-generated and should be edited via the shadcn CLI conventions, not hand-rewritten.

**Database (`src/drizzle/`):** schema is modular under `src/drizzle/schema/` and re-exported from `src/drizzle/schema.ts` (this is what `drizzle.config.ts` points at). Connection in `src/drizzle/db.ts`. Migrations under `src/drizzle/migrations/`. DB URL is assembled from `DB_USER/DB_PASSWORD/DB_HOST/DB_PORT/DB_NAME`, not a single `DATABASE_URL`.

**Env validation:** never read `process.env` directly — import from `src/data/env/server.ts` (server-only) or `src/data/env/client.ts` (`NEXT_PUBLIC_*`). T3 Env enforces the split at build.

**Styling:** `src/app/globals.css` defines layer order `theme, base, vendor, components, utilities` and uses Tailwind v4 `@theme inline { ... }`. Note: `@theme inline` does NOT emit CSS vars at runtime — it inlines values into generated utility classes. External libs (e.g. Clerk appearance) that read `var(--color-*)` will get nothing; reference the underlying `--background`, `--primary`, `--radius`, etc. directly.

## Gotchas

- Next.js 16 + React 19 — APIs diverge from older Next.js. Per AGENTS.md, consult `node_modules/next/dist/docs/` rather than relying on training data.
- Next.js 16 renamed `middleware.ts` → `proxy.ts`. If you see `Could not parse module '[project]/src/middleware.ts', file not found` it is a stale `.next/dev` chunk — `rm -rf .next` and restart `npm run dev`.
- `ai` v6 dropped `createDataStreamResponse` / `dataStream.writeData` / `mergeIntoDataStream`. Use `result.toTextStreamResponse()` for the text-protocol routes, or `createUIMessageStreamResponse` + `result.toUIMessageStream()` if you need a UI message protocol — and switch the client off `streamProtocol: "text"` accordingly.
- No `.env.example`. Required vars: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `ARCJET_KEY`, `ARCJET_ENV`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`. Cross-check against `src/data/env/server.ts` and `client.ts`.
- Clerk webhook route is public — guarded by signature verification, not auth.
