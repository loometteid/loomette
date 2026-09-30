<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Architecture & Conventions

- **Domain Structure**: Follows flat domain packaging under `domains/<domain>/` with max 2 directory levels. See [ADR 0005](docs/adr/0005-flat-domain-architecture.md).
- **Route Lifecycle Components**: Domains export `*-page.tsx` (for Next.js `page.tsx`), `*-loading.tsx` (for `loading.tsx`), and `*-error.tsx`. Internal widgets and forms stay in `domains/<domain>/components/`.
- **Data Fetching**: TanStack Query strict server/client split under `domains/<domain>/query-options/`. See [tanstack-query-patterns](.agents/skills/tanstack-query-patterns/SKILL.md).
- **Forms & Validation**: React Hook Form + Zod schemas under `domains/<domain>/schemas/`. See [react-hook-form-patterns](.agents/skills/react-hook-form-patterns/SKILL.md).
- **Testing**: Vitest + MSW with BEM `data-testid` and `data-entity-id`. See [ADR 0004](docs/adr/0004-data-testid-and-selector-convention.md).
