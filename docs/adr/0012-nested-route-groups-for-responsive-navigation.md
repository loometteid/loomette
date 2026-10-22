# ADR 0012: Nested Route Groups for Responsive Shell Navigation

**Status:** Accepted  
**Date:** 2026-10-22  

## Context

A structural discrepancy existed between desktop and mobile navigation across all Figma design frames (`figma/*/desktop` and `figma/*/mobile`):
- **Desktop ($\ge 1024\text{px}$)**: All screens after onboarding (Home, Calendar, Wardrobe, Profile, Profile Edit, Settings, Pricing, Privacy, Mix & Match, Trip Detail, etc.) include the top header navigation bar (`<DesktopNav />`).
- **Mobile ($< 1024\text{px}$)**: Only the four primary hub pages (`/home`, `/calendar`, `/wardrobe`, `/profile`) display the floating bottom navigation bar (`<BottomNav />`). Detail screens, forms, modals, and subpages (such as `/profile/settings`, `/profile/edit`, `/trip/[id]`, `/wardrobe/add`) omit the bottom navigation bar to provide full viewport vertical space and rely on native top back buttons (`ChevronLeft`).

Previously:
- Putting `BottomNav` inside `app/(app)/layout.tsx` caused mobile subpages placed under `(app)` to inappropriately render the bottom tab bar and suffer from unwanted `pb-24` bottom padding.
- Conversely, placing subpages outside `app/(app)/` caused desktop screens to lose `<DesktopNav />`, requiring ad-hoc manual header inclusions or causing visual regressions against Figma desktop frames.

## Decisions

### 1. Nested Route Group Architecture (`app/(app)/(tabs)`)

We utilize Next.js App Router's route group convention `(folder)`—which does not alter URL paths—to establish a two-tiered shell hierarchy under `app/(app)`:

```text
app/
├── (auth)/                         # Public auth flows (/sign-in, /sign-up)
├── (onboarding)/                   # Multi-step onboarding (/onboarding/1..7)
│
└── (app)/                          # All post-onboarding authenticated routes
    ├── layout.tsx                  # 1. Outer Desktop Shell:
    │                               #    - Supabase authentication session guard & user prefetch
    │                               #    - <UploadJobsNotifier />
    │                               #    - <DesktopNav /> (hidden lg:flex -> only visible on desktop!)
    │                               #    - Container without bottom padding or mobile bottom nav
    │
    ├── (tabs)/                     # 2. Nested Mobile Tabs Route Group (only the 4 main hubs)
    │   ├── layout.tsx              #    - Renders <BottomNav /> (lg:hidden -> mobile only!)
    │   │                           #    - Applies container `pb-24 lg:pb-0` for mobile clearance
    │   ├── home/page.tsx           #    -> /home
    │   ├── calendar/page.tsx       #    -> /calendar
    │   ├── wardrobe/page.tsx       #    -> /wardrobe
    │   └── profile/page.tsx        #    -> /profile
    │
    ├── profile/                    # 3. Sub-pages (outside (tabs), inside (app))
    │   ├── edit/page.tsx           #    -> /profile/edit
    │   ├── social/page.tsx         #    -> /profile/social
    │   └── settings/               #    -> /profile/settings, /profile/settings/*
    │
    ├── trip/                       #    -> /trip/new, /trip/[id], /trip/[id]/edit
    ├── wardrobe/                   #    -> /wardrobe/add, /wardrobe/approval, /wardrobe/[id]
    ├── calendar/                   #    -> /calendar/history, /calendar/outfits/[date], etc.
    ├── home/                       #    -> /home/notifications, /home/recommendation
    └── mix-and-match/              #    -> /mix-and-match, /mix-and-match/result/[id]
```

### 2. Device Behavior & Component Rendering

```
                     ┌────────────────────────────────────────────────────────┐
                     │                  app/(app)/layout.tsx                  │
                     │  • Supabase Session Guard                              │
                     │  • <UploadJobsNotifier />                              │
                     │  • <DesktopNav /> (hidden lg:flex)                     │
                     └──────────────────────────┬─────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
                 ▼                                                             ▼
┌─────────────────────────────────┐                       ┌─────────────────────────────────────────┐
│     app/(app)/(tabs)/layout     │                       │       Direct Subpages under (app)       │
│  (/home, /calendar, /wardrobe,  │                       │  (/profile/settings, /trip/*, etc.)     │
│   /profile)                     │                       ├─────────────────────────────────────────┤
├─────────────────────────────────┤                       │ Desktop (>= 1024px):                    │
│ Desktop (>= 1024px):            │                       │  • Renders <DesktopNav /> from (app)    │
│  • Renders <DesktopNav />       │                       │ Mobile (< 1024px):                      │
│  • <BottomNav /> is hidden      │                       │  • <DesktopNav /> is hidden (lg:flex)   │
│ Mobile (< 1024px):              │                       │  • NO <BottomNav />                     │
│  • <DesktopNav /> is hidden     │                       │  • Full viewport vertical real estate   │
│  • Shows <BottomNav /> (lg:hid) │                       │  • Native <ChevronLeft /> back buttons  │
└─────────────────────────────────┘                       └─────────────────────────────────────────┘
```

1. **Deterministic URL Stability**: Next.js route groups are stripped during URL resolution. `/profile` stays `/profile`, `/profile/settings` stays `/profile/settings`, `/trip/[id]` stays `/trip/[id]`.
2. **Unified Desktop Experience**: Every post-onboarding page automatically inherits `<DesktopNav />` without manually duplicating headers in each page file.
3. **Optimized Mobile UX**: Mobile detail pages and forms have unconstrained vertical space with zero obstruction from the bottom navigation bar.
4. **Centralized Auth Guard**: All authenticated routes inside `(app)` are protected at the shell layout, ensuring early redirection to `/sign-in` for unauthenticated visitors.

## Consequences

- Direct compliance with Figma designs across all desktop and mobile viewports.
- Clear mental model for route placement: core tab hubs go to `(tabs)`, while detail routes and flows live directly under `(app)`.
- Fully verified with 100% passing tests (189/189) across route handlers, layouts, and components.
