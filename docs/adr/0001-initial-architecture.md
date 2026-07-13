# ADR 0001: Initial architecture decisions

**Status:** Accepted
**Date:** 2026-07-13

## Context

Loomette is a new production PWA for the Indonesian market. Before writing
application code, the founding team (Gevyn, Grace, Karina) wants a
maintainable, scalable foundation without slowing down early shipping.

## Decisions

1. **Single Next.js app, not a monorepo.** A 3-person team with one
   product doesn't need Turborepo's build-graph and cross-package versioning
   overhead yet. The `src/` structure keeps `app/` thin and business logic in
   `features/`, so a future split (e.g. extracting a shared package for a
   native app) is a mechanical move, not a rewrite.

2. **pnpm as package manager.** Faster installs, strict dependency
   resolution (avoids phantom-dependency bugs), lower disk usage. Supported
   natively by Vercel.

3. **ESLint + Prettier for linting/formatting.** The Next.js default,
   wired up automatically by `create-next-app`. Chosen over Biome for the
   larger plugin ecosystem (a11y rules, Next.js-specific rules) at the cost
   of running two tools instead of one.

4. **Supabase schema as code.** All schema changes go through Supabase CLI
   migrations committed under `supabase/migrations/`, never made ad hoc via
   the dashboard. With 3 people able to touch the database, undocumented
   dashboard edits are how a prod schema silently diverges from anything
   reproducible. This is treated as non-negotiable, not a preference.

## Consequences

- Adding a second deployable later (admin app, marketing site) means
  revisiting decision 1 and likely migrating to Turborepo.
- Every schema change requires `supabase migration new` + a reviewed PR,
  even for small tweaks — slightly slower than clicking in the dashboard,
  traded for reproducibility and review history.
