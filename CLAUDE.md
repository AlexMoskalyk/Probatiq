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

**Edge: `src/proxy.ts`** runs Arcjet (shield + bot detect + 100 req/min sliding window) and then Clerk auth on every request. Public routes (sign-in, root, `/api/webhooks/*`) bypass Clerk. Arcjet runs first — security before auth. Protected routes call `auth.protect({ unauthenticatedUrl: "/" })` so unauthenticated requests land on the landing page, not Clerk's sign-in URL.

**Auth flow + landing:** `/` (`src/app/page.tsx`) is public and renders `LandingPage` for logged-out visitors. Logged-in visitors are redirected to `/dashboard`. The auth check must be inside a `<Suspense>` (inner `HomeGate` component) — top-level `await getCurrentUser()` in a Page would block the static shell and trip Next 16's "Runtime data was accessed outside of `<Suspense>`" error. Post-sign-in / post-sign-up land on `/dashboard` via Clerk's `*_FALLBACK_REDIRECT_URL` env vars. Sign-out lands on `/` via `<ClerkProvider afterSignOutUrl="/">` (`src/services/clerk/components/clerk-provider.tsx`). Webhook-driven user sync still flows through `src/app/api/webhooks/clerk/route.ts` → `src/features/users/db.ts`; new signups detour through `/onboarding` until the row exists. `src/services/clerk/lib/get-current-user.ts` is the canonical way to read the current user in server code.

**Feature modules (`src/features/<name>/`)** each own their slice end-to-end:

- `db.ts` — Drizzle queries
- `db-cache.ts` — cache key/tag helpers
- `actions.ts` — server actions
- `schemas.ts` — Zod input schemas
- `components/` — feature-scoped UI
- `lib/` — feature-local utilities (e.g. formatters)

Current features: `job-infos`, `users`, `questions`, `interviews`, `resume-analyses`. Add new domains as sibling dirs, not by sprinkling logic into `app/`.

**`src/services/<vendor>/`** wraps third-party SDKs and is the boundary between features and external APIs. Current vendors:

- `services/ai/` — Vercel AI SDK + `@ai-sdk/google` Gemini. `models/google.ts` exports the configured provider; `questions.ts` and `interviews.ts` expose `generateAi*` / `generateAi*Feedback` helpers that wrap `streamText(...)` with system prompts. `resumes/ai.ts` exposes `analyzeResumeForJob` which wraps `streamObject(...)` with a Zod schema (`resumes/schemas.ts`) and accepts an optional `model` param for fallback (default `gemini-2.5-flash`, fallback `gemini-2.0-flash`). Features and route handlers consume these, never `streamText` / `streamObject` directly.
- `services/clerk/` — `lib/get-current-user.ts` is the only sanctioned way to read the current user server-side.
- `services/hume/` — voice-mode integration for the live interview flow; UI components in `services/hume/components/`. Always mount Hume via `src/features/interviews/components/voice-shell.tsx` (a `"use client"` wrapper around `VoiceProvider` with `onError` + `onClose` callbacks that toast and log). Hume's `connect` swallows socket / mic / token errors silently; the wrapper is the only thing that makes them visible.

**`src/app/`** holds route segments only. Pages are thin — they call feature `actions.ts` / `db.ts`. Client islands use the `_client.tsx` naming convention (underscore prefix → not a route).

**AI streaming routes (`src/app/api/ai/**`)** follow a fixed pattern: parse the body (JSON via Zod for text routes, `req.formData()`for file routes),`getCurrentUser()`for 401, fetch+ownership-check inside a`"use cache"`helper tagged via the feature's`db-cache.ts`, call the corresponding `services/ai/\*`helper, and return`result.toTextStreamResponse()`. Client protocol must match the route:

- `streamText` routes → `useCompletion({ streamProtocol: "text" })`.
- `streamObject` routes (e.g. `resumes/analyses`) → `experimental_useObject({ schema })` with the same Zod schema imported from `services/ai/<feat>/schemas.ts`. File uploads override `fetch` to send `FormData` and can append a `?model=` query for model fallback.

Persistence (e.g. inserting the generated question row) happens client-side via the feature's server action in `onFinish`, not in the streaming route, to avoid double-inserts.

**`src/components/`** is for cross-feature UI. `src/components/ui/` is shadcn-generated and should be edited via the shadcn CLI conventions, not hand-rewritten. Project-level deviation: `dialog.tsx` and `alert-dialog.tsx` patch `Content` and `Overlay` to `stopPropagation` on click. Reason: cards on `/dashboard` wrap their content in `<Link>` and React synthetic events bubble through portals; without this, clicks inside a modal hijack the wrapping Link's navigation. If you regenerate these via shadcn CLI, re-apply the patch.

**Database (`src/drizzle/`):** schema is modular under `src/drizzle/schema/` and re-exported from `src/drizzle/schema.ts` (this is what `drizzle.config.ts` points at). Connection in `src/drizzle/db.ts`. Migrations under `src/drizzle/migrations/`. DB URL is assembled from `DB_USER/DB_PASSWORD/DB_HOST/DB_PORT/DB_NAME`, not a single `DATABASE_URL`.

**Env validation:** never read `process.env` directly — import from `src/data/env/server.ts` (server-only) or `src/data/env/client.ts` (`NEXT_PUBLIC_*`). T3 Env enforces the split at build.

**Styling:** `src/app/globals.css` defines layer order `theme, base, vendor, components, utilities` and uses Tailwind v4 `@theme inline { ... }`. Note: `@theme inline` does NOT emit CSS vars at runtime — it inlines values into generated utility classes. External libs (e.g. Clerk appearance) that read `var(--color-*)` will get nothing; reference the underlying `--background`, `--primary`, `--radius`, etc. directly.

## Conventions

- **Modals inside `<Link>` cards.** Use a controlled `open` state, not `DialogTrigger asChild`. The trigger button calls `e.preventDefault(); e.stopPropagation(); setOpen(true)` so clicking it doesn't activate the parent Link. See `src/features/job-infos/components/delete-job-info-button.tsx` and `src/features/job-infos/components/view-description-button.tsx`. The dialog primitives already stop click bubbling (see Architecture note), so modal interior + backdrop clicks are safe.
- **Read-only forms.** Reuse the editing form with a `readOnly` prop instead of building a separate view component. `JobInfoForm` (`src/features/job-infos/components/job-info-form.tsx`) disables every control and hides the submit button when `readOnly`. The view modal in `ViewDescriptionButton` consumes it that way.
- **Empty states render inline; don't redirect.** When a feature list is empty (e.g. no interviews for a job), render an explicit "No X yet" card with a primary CTA on the list route itself — see `NoInterviews` inside `src/app/dashboard/job-infos/[jobInfoId]/interviews/page.tsx` and `NoJobInfos` for the dashboard. Redirecting away makes nav feel broken (e.g. "Practice Interviewing" from job-info → list → silently bounces back).
- **Full-height dashboard pages.** Wrap in `h-screen-header flex flex-col`; nested children that should fill the rest use `flex-1 min-h-0`. The header utility is `var(--spacing-header) = 4rem` (defined in `globals.css`), and `h-screen-header = calc(100vh - var(--spacing-header))`. Stacking another `h-screen-header` under a sibling block (e.g. a BackLink with `my-4`) overflows the viewport — convert siblings to flex-1 children of one outer `h-screen-header` container instead. See `src/app/dashboard/job-infos/[jobInfoId]/interviews/new/page.tsx`.
- **Live-interview routing.** Navigation out of `StartCall` (`src/features/interviews/components/start-call.tsx`) is event-driven, not state-driven: `handleEnd` calls `disconnect()` + a fire-and-forget `updateInterview` + `startEndTransition(router.push(...))`. While the React transition is pending an `isEnding` flag renders the loader. Do not add a `useEffect` that watches `readyState === CLOSED` to route — Next 16's persistent client cache can restore that state and trigger spurious nav. For the same reason `CLOSED` renders a "Restart Interview" button (same handler as the IDLE Start button) rather than a stuck loader.

## Gotchas

- Next.js 16 + React 19 — APIs diverge from older Next.js. Per AGENTS.md, consult `node_modules/next/dist/docs/` rather than relying on training data.
- Next.js 16 renamed `middleware.ts` → `proxy.ts`. If you see `Could not parse module '[project]/src/middleware.ts', file not found` it is a stale `.next/dev` chunk — `rm -rf .next` and restart `npm run dev`.
- `next.config.ts` opts into `cacheComponents: true`. Two consequences worth keeping in mind: (1) Page server components must read request data (cookies/auth) inside a `<Suspense>` — otherwise the static shell can't prerender and the route logs "Runtime data was accessed outside of `<Suspense>`". (2) Server-side runtime values like `new Date()` cannot be used in server components without first touching request data; landing-style routes should use static fallbacks or move dynamic bits to client components.
- `ai` v6 dropped `createDataStreamResponse` / `dataStream.writeData` / `mergeIntoDataStream`. Use `result.toTextStreamResponse()` for the text-protocol routes, or `createUIMessageStreamResponse` + `result.toUIMessageStream()` if you need a UI message protocol — and switch the client off `streamProtocol: "text"` accordingly.
- `ai` v6 `toTextStreamResponse()` accepts only `ResponseInit` — no `onError`. Put `onError` on the `streamText` / `streamObject` call itself (signature `({ error }) => void`).
- `ai` v6 `FilePart` uses `mediaType`, not `mimeType`. When building `{ type: "file", data, ... }` content parts pass `mediaType: file.type`.
- Surface model errors to the user: errors from `streamObject`/`streamText` happen during stream consumption, so the route still returns HTTP 200. Client-side `useObject({ onError })` (or `useCompletion({ onError })`) is the only place to toast. The resume flow uses this to auto-retry once with `gemini-2.0-flash` via a `?model=` query.
- No `.env.example`. Required vars: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `ARCJET_KEY`, `ARCJET_ENV`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`. Cross-check against `src/data/env/server.ts` and `client.ts`.
- Clerk webhook route is public — guarded by signature verification, not auth.
