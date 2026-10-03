# ADR 0007: Responsive Split-Screen Onboarding Flow

**Status:** Accepted  
**Date:** 2026-10-02

## Context

The onboarding experience personalizes the user profile across 5 distinct steps before wardrobe seeding. Previously, onboarding only had mobile-oriented single-column screens, did not hydrate returning or back-navigating user values, and used raw inline Supabase client calls instead of TanStack Query mutations. Furthermore, desktop Figma designs specify a two-column split-screen layout with visual mascot artwork on the left and a centered form card on the right with a dedicated bottom navigation bar.

## Decisions

1. **Responsive Shell with Desktop Split-Screen**:
   `OnboardingShell` adapts responsively across viewports:
   - On mobile (`<1024px`): Single-column layout with a top header combining the `<` back button and horizontal progress bar, and a full-width bottom `Continue` button.
   - On desktop (`lg:` breakpoint): A 2-column split-screen layout where the left column displays a grayscale cloudy sky visual panel with the silver and black hanger mascots, and the right column houses a centered form card featuring the standalone progress bar at the top and a bottom navigation bar with `<` back button on the left and `Continue` button on the right.

2. **Standardized Navigation & Button Labeling**:
   - The primary submission button is consistently labeled `Continue` (and `Saving…` during mutation).
   - Step 1 omits back navigation entirely across both mobile and desktop viewports.
   - Steps 2 through 4 navigate back to `/onboarding/{step - 1}`.

3. **TanStack Query Mutation & Profile Hydration**:
   - Profile updates during onboarding use TanStack Query `mutationOptions` (`updateOnboardingProfileMutationOptions`) under `domains/onboarding/mutation-options/`.
   - Each onboarding step hydrates form `defaultValues` from existing user profile data, ensuring back-navigation and page reloads retain entered values without losing state.

4. **Normalized Measurement Units & Controls**:
   - Weight accepts `kg` and `lbs` with unit conversion to canonical kg in the database.
   - Length measurements (height, bust, waist, high hip, hip) accept `cm` and `in` with conversion to canonical cm.
   - Step 2 integrates a shadcn-compatible Popover DatePicker for the birthday field, storing ISO `YYYY-MM-DD`.

## Consequences

- Delivers a cohesive, responsive onboarding experience matching both mobile and desktop Figma designs.
- Aligns onboarding data flow with project domain patterns (TanStack Query mutations + React Hook Form + Zod).
- Enables predictable integration testing with MSW and Vitest.
