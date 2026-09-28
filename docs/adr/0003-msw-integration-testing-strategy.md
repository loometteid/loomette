# ADR 0003: MSW v2 for Supabase and TanStack Query Integration Testing

**Status:** Accepted  
**Date:** 2026-09-28

## Context

Loomette features client-side data flows powered by TanStack Query v5 and `@supabase/ssr` / `@supabase/supabase-js`. Feature forms (such as `EditTripForm`) orchestrate validation via React Hook Form, mutations via TanStack Query, and database operations against Supabase PostgREST tables and Edge Functions.

We evaluated three approaches for testing data queries and mutations:

1. Unit mocking Supabase client methods (`vi.mock('@/lib/supabase/client')` with chained `.from().insert().select().single()`).
2. Network-level interception using Mock Service Worker (MSW v2).
3. Spinning up a local Supabase CLI instance in Docker for every unit/integration run.

## Decisions

1. **Network-level interception with MSW v2 (`msw/node`).** MSW intercepts HTTP requests at the Node `fetch` boundary rather than stubbing JavaScript SDK methods. This tests actual Supabase client serialization, headers, query parameters, error responses, and TanStack Query cache invalidations without brittle method chaining mocks.
2. **Strict unhandled requests policy (`onUnhandledRequest: "error"`).** Ensures any accidental unmocked network call fails immediately rather than silently succeeding or leaking out.
3. **Isolated `createTestQueryClient()` helper.** Creates a fresh `QueryClient` per test with retries disabled (`retry: false`) to avoid slow retry loops during error testing.
4. **Global router mocks in `test/setup.ts`.** Provides default `vi.fn()` spies for `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`, `notFound`) to allow seamless feature form testing.
5. **Default mock environment variables in `test/setup.ts`.** Sets fallback `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` so tests execute consistently in headless and CI environments.

## Consequences

- Tests importing Supabase clients or TanStack Query hooks run completely offline without needing a live backend.
- Adding a new database query or mutation in a test requires defining or overriding MSW handlers via `server.use(...)` if the endpoint is not covered by default handlers.
- High-level browser testing across native device APIs (camera, real storage uploads) remains the domain of Playwright.
