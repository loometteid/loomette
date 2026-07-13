# Loomette

Production PWA for the Indonesian market.

## Team

| Name   | Role                                                 |
| ------ | ---------------------------------------------------- |
| Gevyn  | CEO — Business, Engineering, AI, Technical Decisions |
| Grace  | CPO — Product Strategy, Marketing, Engineering       |
| Karina | Product Designer, Marketing                          |

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **State / data:** Zustand (client state), TanStack Query (server state)
- **Forms:** React Hook Form + Zod
- **Backend / DB / Auth / Storage:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **AI:** Gemini, called only from Supabase Edge Functions (API keys stay server-side)
- **Deployment:** Vercel
- **Package manager:** pnpm

## Repo structure

Single Next.js app (not a monorepo — see `docs/adr/0001-initial-architecture.md` for why). Flat layout, no `src/` directory.

```
app/                 # routes only — thin, no business logic
components/
├── ui/               # shadcn-generated
└── features/          # feature-specific components, by domain
lib/
├── supabase/           # client.ts (browser), server.ts (SSR)
└── gemini.ts             # calls a Supabase Edge Function — never the Gemini API directly
hooks/                  # shared React hooks
stores/                 # Zustand stores
types/                  # includes generated database.types.ts
middleware.ts            # refreshes the Supabase session cookie
supabase/
└── migrations/           # schema as code — never edit schema via dashboard directly
.claude/                  # CLAUDE.md, database.md, features.md — context for Claude Code
docs/
└── adr/                   # architecture decision records
```

## Getting started

```
pnpm install
cp .env.example .env.local   # fill in your Supabase project URL/keys
pnpm dev
```

See `.claude/CLAUDE.md` for conventions and dev commands, and
`.claude/database.md` for the current schema (including known gaps —
read this before building anything auth- or data-related).
