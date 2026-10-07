# ADR 0010: Responsive Wardrobe and Calendar Layouts

**Status:** Accepted  
**Date:** 2026-10-04

## Context

Loomette was originally drafted with mobile-first viewports in mind. As feature sets expanded across the **Wardrobe** catalog and **Calendar** outfit planner, desktop Figma designs introduced rich, wide-viewport experiences:
- **Global Navigation**: Desktop replaces the bottom tab bar with a sticky top navigation bar (`DesktopNav`) featuring brand logo, active navigation pills (`HOME`, `CALENDAR`, `WARDROBE`), and user profile avatar/handle.
- **Wardrobe Catalog & Inspection**: Desktop expands search results and category rows from 2 columns to a 4-column responsive grid, separates the filter modal into a dual-column layout (classification left, metadata right), and reformats item detail editing (`/wardrobe/[id]`) into a 2-column canvas (garment photo & toggle on the left, pill taxonomies and details on the right).
- **Calendar & Outfit Approval**: Desktop replaces the mobile single-month view and month-picker modal with a dual-month side-by-side calendar display, weekend styling, floating action buttons (`MIX & MATCH`, `UPLOAD PHOTO`), and a responsive 2-column outfit approval page with mascot banner art.

## Decisions

1. **Global Desktop Shell (`DesktopNav` & `BottomNav`)**:
   - `app/(app)/layout.tsx` acts as the root for main tab pages (`/home`, `/calendar`, `/wardrobe`, `/profile`), querying the server user profile and rendering `<DesktopNav />` at the top for `lg:` viewports while maintaining `<BottomNav />` with `lg:hidden`.
   - Standalone subpages (such as `/wardrobe/add`, `/wardrobe/[id]`, `/calendar/loading`, `/calendar/outfit-approval`) render `<DesktopNav />` directly at their page root to guarantee layout continuity.

2. **Dual-Month Side-by-Side Calendar Architecture**:
   - Rather than refactoring the underlying Supabase diary endpoints or database schema, desktop view renders two side-by-side `CalendarGrid` components: current month and `nextMonth` (calculated cleanly via `addMonths(viewedYear, viewedMonth, 1)` in `date-utils.ts`).
   - Two parallel TanStack Query hooks fetch diary entries for both months concurrently with automatic caching.
   - Month navigation buttons (`<` and `>`) step backward and forward by 1 month, while mobile retains its single-month picker modal.
   - Day cells size responsively (`h-16 lg:h-24`) with weekend headers (`SUN`, `SAT`) highlighted in accent pink (`text-[#E07A7A]`) per Figma specs.

3. **Wardrobe Catalog & Item Detail Layouts**:
   - Catalog view (`/wardrobe`) uses responsive max-width containers (`max-w-sm lg:max-w-6xl xl:max-w-7xl`), hides duplicate page titles on desktop (where the active navbar tab already communicates location), and adjusts item grids to 4 columns.
   - The filter dialog (`wardrobe-filter-dialog.tsx`) adapts to a wide 2-column modal (`lg:max-w-3xl`) with filters grouped logically into Category/Subcategory/Colors/Occasion (left) and Times Worn/Date Added/Actions (right).
   - Item detail page (`/wardrobe/[id]`) adopts a 2-column split layout matching Figma `D.3.3`, featuring large garment preview and original photo toggle on the left, with metadata pills, editable price, size, location, and save action on the right.

4. **Outfit Approval & Intake Loading States**:
   - Calendar outfit approval loading (`/calendar/loading`) and approval review (`/calendar/outfit-approval`) render responsive dual-column structures with mascot banners (`mascot-pair.png`), back-to-home actions, and side-by-side preview panels matching Figma `D.2.1.1` and `D.2.1.2`.

## Consequences

- Consistent, fluid user experience across both handheld mobile devices and widescreen desktop monitors without requiring duplicate routes.
- Modular component structure where domain pages gracefully switch layout variants using Tailwind `lg:` breakpoints.
- Zero breaking changes to existing data models, database queries, or server-side API contracts.
