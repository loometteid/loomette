# Loomette

Production PWA for the Indonesian market.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend / DB / Auth / Storage:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Deployment:** Vercel
- **AI (future):** Gemini
- **Package manager:** pnpm

## Repo structure

Single Next.js app (not a monorepo — see `docs/adr/0001-initial-architecture.md` for why).

```
src/
├── app/            # routes only — thin, no business logic
├── components/
│   ├── ui/          # shadcn-generated
│   └── shared/
├── features/        # business logic, grouped by domain
├── lib/
│   └── supabase/    # client.ts, server.ts, middleware.ts
├── types/            # includes generated database.types.ts
└── config/
supabase/
└── migrations/       # schema as code — never edit schema via dashboard directly
docs/
└── adr/               # architecture decision records
```

## Getting started

Scaffolding pending — see `docs/adr/0001-initial-architecture.md`.
