# CLAUDE.md — Loomette

## Project overview

Loomette — fashion-tech PWA for the Indonesian market. Mobile-first,
pre-product-market-fit. Team: Gevyn (CEO — Business, Engineering, AI,
Technical Decisions), Grace (CPO — Product Strategy, Marketing,
Engineering), Karina (Product Designer, Marketing). See README.md for
the team/stack summary and docs/adr/ for architecture history.

## Tech stack (as installed, not aspirational)

- Next.js 16.3.6, App Router, **no `src/` directory** — flat layout
- React 19.2.4, TypeScript ^5 (strict)
- Tailwind CSS ^4, shadcn/ui — style `base-nova`, built on **Base UI,
  not Radix** (non-default; matters when adding new shadcn components)
- Zustand ^5 (client state), TanStack Query ^5 (server state — see
  `app/providers.tsx`)
- react-hook-form + @hookform/resolvers + zod ^4 (forms/validation)
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`) — DB, Auth, Storage
- Vitest ^5 + @testing-library/react ^16 + happy-dom (unit & component tests)
- MSW ^2 (`msw/node`) for Supabase and TanStack Query integration testing
- @vitest/coverage-v8 for coverage reporting
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
├── ui/               shadcn-generated primitives (Base UI)
└── features/
    ├── auth/            sign-up/sign-in forms, Google button, sign-out
    ├── calendar/        OOTD diary entries & calendar view
    ├── mix-and-match/   canvas & outfit generation
    ├── onboarding/      multi-step onboarding flow
    ├── profile/         profile view, edit forms, wishlist
    ├── trip/            trip planner, detail views, forms
    └── wardrobe/        wardrobe items & approval queue
lib/
├── supabase/
│   ├── client.ts      browser client
│   └── server.ts      SSR client, cookie-aware
├── logging/           Logtape client & server logger
├── gemini.ts           client entry point → Supabase Edge Function
└── utils.ts             cn() helper with custom typography scale
stores/                 Zustand stores
test/                   test setup, test-utils, and MSW mocks
├── mocks/
│   ├── handlers.ts    MSW Supabase PostgREST handlers
│   └── server.ts      MSW node server instance
├── setup.ts            Vitest global setup & router mocks
└── test-utils.tsx      renderWithQueryClient helper
types/
└── database.types.ts    generated — see .claude/database.md
proxy.ts                  refreshes the Supabase session cookie every request
                          (Next.js 16 renamed "middleware" to "proxy")
supabase/
├── config.toml
└── migrations/            schema as code
docs/
└── adr/                    architecture decision records
.agents/skills/            architectural skills for agents
.claude/                    this file, database.md, features.md
```

## Path aliases

`@/*` → repo root. Concretely (per `components.json` and `tsconfig.json`): `@/components`,
`@/components/ui`, `@/lib`, `@/lib/utils`, `@/stores`, `@/hooks`, `@/test`.

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
- See `docs/adr/` for the full rationale behind architecture decisions.

## Testing & selector conventions

- Follow the **AAA (Arrange-Act-Assert)** pattern across all tiers (Unit,
  Component, Integration, E2E) as defined in `.agents/skills/testing-patterns/SKILL.md`.
- Keep the **Single Act** rule: exactly one primary action per test.
- Use BEM-style test IDs: `<scope>__<element>` (e.g. `data-testid="trip-form__submit-button"`).
- Use `data-entity-id` for domain identifiers (both list items and singular
  entity containers/forms, per ADR 0004).
- Use `renderWithQueryClient` for components requiring TanStack Query.
- Intercept HTTP calls at the fetch boundary via MSW v2 (`test/mocks/handlers.ts`);
  never mock Supabase client methods by hand.
- Test files must be colocated with their source (`*.test.ts`, `*.test.tsx`).
- CI: `.github/workflows/test.yml` runs independently from lint CI, with
  coverage reporting to PR sticky comments and commit summaries.

## Dev commands

```
pnpm dev / pnpm build / pnpm start / pnpm lint
pnpm format / pnpm format:check

pnpm test                             # run vitest suite
pnpm test:watch                       # vitest in watch mode
pnpm test:coverage                    # vitest with v8 coverage summary

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
2. The Gemini Edge Function does not exist yet; `lib/gemini.ts` is a
   stub caller only — it will fail at runtime until that function ships.
3. Email confirmation is OFF (founder's explicit call, for faster
   manual testing pre-launch) — revisit before real users sign up.
4. No `public.public_profile` view yet — other users' profiles aren't
   readable at all until a follow/search feature needs it (see
   `.claude/database.md`).
