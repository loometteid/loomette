# ADR 0002: Vitest and React Testing Library for Unit and Component Testing

**Status:** Accepted  
**Date:** 2026-09-28

## Context

Loomette is a Next.js 16 (App Router) and React 19 fashion PWA using TypeScript, TanStack Query v5, Zustand, Base UI primitives, and Zod v4. The repository initially lacked an automated testing foundation.

We needed a fast, reliable test suite capable of testing:

1. Pure business logic and validation schemas (Zod v4).
2. Client-side state stores (Zustand).
3. React UI components and form interactions (Base UI, React Hook Form).

We evaluated Jest vs. Vitest, external tsconfig path resolution plugins vs. native Vite/Rolldown path resolution, and jsdom vs. happy-dom.

## Decisions

1. **Vitest as test runner.** Vitest provides native ESM execution, compatibility with React 19 and Next.js 16 dependencies (`@supabase/ssr`, `@logtape/logtape`), and instant feedback in watch mode.
2. **Native `resolve.tsconfigPaths: true` for alias resolution.** Vite/Rolldown natively resolves `@/*` path aliases defined in `tsconfig.json` without requiring external plugins like `vite-tsconfig-paths`.
3. **`happy-dom` as the DOM environment.** Lightweight and significantly faster than `jsdom` for rendering Base UI and React 19 component trees.
4. **React Testing Library (`@testing-library/react` v16+) and `@testing-library/user-event`.** Standard user-centric testing for forms and UI components.
5. **Colocated test files.** Test files are stored alongside their implementation (`*.test.ts` and `*.test.tsx`) to maintain high cohesion and ease refactoring.

## Consequences

- Tests run via `pnpm test` (`vitest run`) and `pnpm test:watch` (`vitest`).
- Future data fetching and query integration tests will interact through TanStack Query client stubs or network-level mocks.
- End-to-end browser flows (e.g. camera capture, full onboarding, file uploads) remain designated for a browser-level E2E runner (Playwright).
