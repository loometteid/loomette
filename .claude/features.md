# Features — Loomette

**Status: nothing formally scoped yet.** This file documents the
convention for how features get recorded here once Figma designs and
product scope exist — it does not commit to any feature, user story,
or UI spec.

## Convention (once a feature is scoped)

Add a subsection per feature (or split into `features/<name>.md` if
this file grows) with:

- User story / problem statement
- Screens & routes touched (`app/...`)
- Data touched (tables from `.claude/database.md`)
- Components: `components/features/<feature-name>/`
- Open questions

## Implied domains from the current schema (NOT a roadmap, NOT a commitment)

These are inferred from table shapes for orientation only — do not
start building against these without confirming scope with Grace/Karina
first:

- Wardrobe (`item`, `wardrobe_item`)
- Outfit builder (`outfit`, `outfit_item`)
- AI outfit recommendations (`outfit_recommendation`) — depends on the
  not-yet-built Gemini Edge Function
- Social / follow (`follow`, `user.is_private`)
- Wear tracking (`wear_log`)

This file intentionally contains no acceptance criteria or UI detail —
that arrives with Figma handoff.
