# ADR 0011: Responsive Profile and Travel Layouts

**Status:** Accepted  
**Date:** 2026-10-17  

## Context

Following the desktop expansions for Wardrobe and Calendar (ADR 0010), the **Profile** and **Travel (Trip)** domains required a full responsive overhaul based on Figma designs (`figma/profile/desktop` and `figma/profile/mobile`):
- **Profile Hub (`/profile`)**: Mobile featured a full-bleed sky hero banner, avatar badge, and bottom tab bar, while desktop Figma introduced a dedicated sticky left sidebar (144px avatar, `@username`, display name, size line, Social Circle & Settings buttons) alongside a 4-column content grid for Favorites, Travels, and Wishlist.
- **Social Circle (`/profile/social`)**: Figma design `4.6.1 Friend Page` introduced follower metrics, bio, and outfit/repost tabs. Clarification was needed whether this represented an external friend's page or the authenticated user's own public social persona.
- **Settings & Account Management (`/profile/settings`)**: Mobile presented a single vertical stack, whereas desktop required a master-detail navigation structure with scroll-spy anchors, nested modal dialogs (Log Out and Delete Account), and dedicated sub-routes for Pricing and Privacy Policy.
- **Trip Details & Outfit Planning (`/trip/[id]`)**: Required responsive presentation with suitcase hero banner, travel breakdown, outfit plan timeline, and packing list checklist.

## Decisions

1. **Single-Route Responsive Architecture (`lg:` Breakpoint)**:
   - Profile pages avoid route duplication by utilizing a unified component tree with responsive Tailwind styling at the `lg:` (1024px) breakpoint, consistent with `DesktopNav` and `WardrobeView`.
   - Desktop view replaces the mobile sky header with a sticky left sidebar (`<aside className="hidden lg:flex w-64 ...">`) and renders pill-style navigation tabs at the top of the right content pane.
   - Breadcrumb navigation (`ProfileBreadcrumb`) is rendered across all desktop subpages (`/profile/edit`, `/profile/settings`, `/profile/settings/pricing`, `/profile/settings/privacy`, `/trip/[id]`, `/trip/[id]/edit`) to provide orientation and quick traversal.

2. **Social Profile Domain Alignment (`/profile/social`)**:
   - Figma `4.6.1 Friend Page` is formally established as the user's *own public social circle profile* (`/profile/social`), exposing their public handle, bio, follower/following stats, and published outfit/repost tabs.
   - It is directly accessible via the mobile header icon and the desktop sidebar's "Social Circle" action button.

3. **Master-Detail Settings Navigation (`/profile/settings`)**:
   - On desktop, `/profile/settings` renders a sticky left sub-navigation (`Account`, `General`, `App`) enabling quick anchor navigation to sections, while mobile maintains a clean linear stack.
   - Pricing (`/profile/settings/pricing`) and Privacy Policy (`/profile/settings/privacy`) are partitioned into dedicated sub-routes with loading fallbacks (`pricing-loading.tsx`, `pricing-page.tsx`) and responsive tier selection.

4. **Multi-Step Account Deletion Flow (`DeleteAccountDialog` & `deleteAccountAction`)**:
   - Account deletion implements a 3-step progressive modal matching Figma `D.4.5.4.1` - `4.5.4.3`:
     1. Warning and data loss overview.
     2. Reason survey with optional feedback input.
     3. Explicit confirmation requiring typing `DELETE`.
   - Execution is delegated to a server action (`deleteAccountAction`) with `import "server-only"`, which triggers administrative account cascade deletion via Supabase admin client (`admin.auth.admin.deleteUser`) when `SUPABASE_SERVICE_ROLE_KEY` is configured, followed by session sign-out.

5. **Trip Detail Layout & Interactive Packing List (`/trip/[id]`)**:
   - Trip detail page renders a centered suitcase hero with days count, month/year, and companion badges.
   - The Outfit Plan tab renders a responsive multi-column timeline with outfit compositions.
   - The Packing List tab provides an interactive client-side checklist per trip (persisted to `localStorage` per trip ID), pending backend database table provisioning.

6. **Deferred Decisions Tracking in `docs/TODO_PROFILE.md`**:
   - Unanswered architectural questions—specifically Connected Accounts (`D.4.5.2`) OAuth provider setup, Wishlist mutation vs copy mechanics, and database persistence for Trip Packing lists—are recorded in `docs/TODO_PROFILE.md` and referenced in `AGENTS.md` so future agent sessions will prompt the user when modifying these flows.

## Consequences

- Responsive continuity across all screen sizes without duplicating routes or business logic.
- Clean separation between client presentation components, TanStack Query options, and server actions following ADR 0005 (Flat Domain Architecture).
- Robust test coverage adhering to ADR 0004 `data-testid` standards across dialogs, tabs, and list items.
- Preserved developer clarity through explicit documentation of deferred decisions and domain terminology.
