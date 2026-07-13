# Stores

Zustand stores for global client-only state (e.g. outfit-builder draft
state that must survive navigation).

Server data belongs in TanStack Query (`app/providers.tsx`), not
Zustand. No store exists yet — don't create one speculatively; add it
when a second component genuinely needs to share client state.
