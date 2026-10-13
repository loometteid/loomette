<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Architecture & Conventions

- **Domain Structure**: Follows flat domain packaging under `domains/<domain>/` with max 2 directory levels. See [ADR 0005](docs/adr/0005-flat-domain-architecture.md).
- **Route Lifecycle Components**: Domains export `*-page.tsx` (for Next.js `page.tsx`), `*-loading.tsx` (for `loading.tsx`), and `*-error.tsx`. Internal widgets and forms stay in `domains/<domain>/components/`.
- **Next.js 16 & React 19 Conventions**:
  - `params` and `searchParams` are Promises across pages, layouts, and route handlers: `const { id } = await params;`.
  - Async request APIs (`cookies()`, `headers()`, `draftMode()`) must be awaited.
  - Server/Client boundaries: Mark client-interactive components explicitly with `"use client"`. Mark server-only utility/data modules with `import "server-only"`. Never import server-only code (or server Supabase client) into client components.
- **Supabase SSR Clients & Auth**:
  - Browser/client components: `createBrowserSupabaseClient()` from `@/lib/supabase/client`.
  - Server Components, Server Actions, Route Handlers: `createServerSupabaseClient()` from `@/lib/supabase/server`.
  - Always verify authenticated user session before executing sensitive mutations or data access. Never expose service role keys to client bundles.
- **Data Fetching**: TanStack Query strict server/client split under `domains/<domain>/query-options/`. See [tanstack-query-patterns](.agents/skills/tanstack-query-patterns/SKILL.md).
- **Forms & Validation**: React Hook Form + Zod schemas under `domains/<domain>/schemas/`. See [react-hook-form-patterns](.agents/skills/react-hook-form-patterns/SKILL.md).
- **UI & Styling**: Base UI (`@base-ui/react`), Tailwind CSS v4, and conditional class merging with `cn()` (`@/lib/utils` with `clsx` + `tailwind-merge`).
- **State Management**: Zustand stores for client-side ephemeral state.
- **Logging & Code Hygiene**:
  - Structured application logging with `@logtape/logtape` via `getLogger([category, subcategory])` from `@/lib/logging`.
  - No raw `console.log`, `console.error`, `debugger`, or leftover commented-out code in production files.
- **Testing**: Vitest + MSW with BEM `data-testid` and `data-entity-id`. See [testing-patterns](.agents/skills/testing-patterns/SKILL.md) and [ADR 0004](docs/adr/0004-data-testid-and-selector-convention.md).
- **Package Manager**: pnpm v12
