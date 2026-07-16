# CLAUDE.md — Loomette

## Project overview

Loomette — fashion-tech PWA for the Indonesian market. Mobile-first,
pre-product-market-fit. Team: Gevyn (CEO — Business, Engineering, AI,
Technical Decisions), Grace (CPO — Product Strategy, Marketing,
Engineering), Karina (Product Designer, Marketing). See README.md for
the team/stack summary and docs/adr/ for architecture history.

## Tech stack (as installed, not aspirational)

- Next.js 16.2.10, App Router, **no `src/` directory** — flat layout
- React 19.2.4, TypeScript ^5 (strict)
- Tailwind CSS ^4, shadcn/ui — style `base-nova`, built on **Base UI,
  not Radix** (non-default; matters when adding new shadcn components)
- Zustand ^5 (client state), TanStack Query ^5 (server state — see
  `app/providers.tsx`)
- react-hook-form + @hookform/resolvers + zod ^4 (forms/validation)
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`) — DB, Auth, Storage
- Gemini (future) — never called directly from the app; `lib/gemini.ts`
  only invokes a Supabase Edge Function (does not exist yet)
- pnpm (package manager), Vercel (deploy target)
- ESLint + Prettier

## Folder structure

```
app/                 routes only (App Router)
├── auth/
│   ├── callback/      OAuth PKCE code exchange
│   └── confirm/        email OTP verification
└── auth-test/           minimal test surface for auth (no real UI)
components/
├── ui/               shadcn-generated primitives
└── features/
    └── auth/            sign-up/sign-in forms, Google button, sign-out
lib/
├── supabase/
│   ├── client.ts      browser client
│   └── server.ts      SSR client, cookie-aware
├── gemini.ts           client entry point → Supabase Edge Function
└── utils.ts             cn() helper
hooks/                  shared React hooks
stores/                 Zustand stores
types/
└── database.types.ts    generated — see .claude/database.md
proxy.ts                  refreshes the Supabase session cookie every request
                          (Next.js 16 renamed "middleware" to "proxy")
supabase/
├── config.toml
└── migrations/            schema as code
docs/
└── adr/                    architecture decision records
.claude/                    this file, database.md, features.md
```

## Path aliases

`@/*` → repo root. Concretely (per `components.json`): `@/components`,
`@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.

## House rules

- Explain a decision before executing it; challenge a bad call rather
  than silently deferring to it.
- No invented features or business logic beyond what's asked — three
  similar lines beat a premature abstraction. Don't create a hook,
  store, or component "for later."
- Supabase schema changes ONLY via `supabase migration new <name>`,
  committed under `supabase/migrations/`. Never edit schema in the
  dashboard (ADR 0001, decision 4 — non-negotiable).
- Gemini API key lives only in a Supabase Edge Function's environment.
  Never in client code, never in a Next.js server env var read by the
  Next.js app itself.
- See `docs/adr/0001-initial-architecture.md` for the full rationale
  behind single-app / pnpm / ESLint+Prettier / schema-as-code.

## Dev commands

```
pnpm dev / pnpm build / pnpm start / pnpm lint
pnpm format / pnpm format:check

supabase start                        # local Supabase stack (needs Docker)
supabase migration new <name>         # new schema change
supabase db push                      # apply migrations to the linked project
supabase gen types typescript --linked > types/database.types.ts   # after any migration
```

## Auth

Google OAuth + email/password via Supabase Auth. `public.user` is
auto-provisioned and kept in sync with `auth.users` via triggers (see
`.claude/database.md`). RLS is enabled on every table with per-command
policies. Minimal test surface: `app/auth-test/page.tsx`,
`app/auth/callback/route.ts` (OAuth), `app/auth/confirm/route.ts`
(email OTP verification), `components/features/auth/*`. Google OAuth
credentials live only in the Supabase Dashboard, never in this repo.

## Known gaps (do not treat these as "the way it's supposed to be")

1. `app/page.tsx` is still `create-next-app` boilerplate — untouched,
   waiting on the Figma → component handoff.
2. No test framework is installed yet.
3. The Gemini Edge Function does not exist yet; `lib/gemini.ts` is a
   stub caller only — it will fail at runtime until that function ships.
4. Email confirmation is OFF (founder's explicit call, for faster
   manual testing pre-launch) — revisit before real users sign up.
5. No `public.public_profile` view yet — other users' profiles aren't
   readable at all until a follow/search feature needs it (see
   `.claude/database.md`).
