---
name: figma-ui-adjustment
description: Enforces precision alignment between codebase UI and Figma snapshots, design tokens, responsive typography, and layout geometry. Use when implementing or updating UI screens, fixing layout discrepancies, or checking styles against figma/ snapshot JSONs.
---

# Figma UI Adjustment & Design System Patterns

This skill governs how agents inspect, implement, and verify UI components and pages against Figma design snapshots (`figma/**`) and the core brand design system.

---

## 1. Zero Arbitrary Hexes: Design System Tokens

Never hardcode arbitrary hex classes (e.g. `text-[#444440]`, `bg-[#F2EDE5]`, `border-[#EAE4DC]`, `bg-[#FAF8F5]`). Every color from Figma maps to a semantic or brand token defined in [`app/globals.css`](app/globals.css) and exposed through Tailwind CSS v4 `@theme inline`:

| Figma Token | Figma Hex | Utility Class | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| **Slate** | `#444440` / `#44443F` | `text-foreground`, `text-slate`, `bg-primary` | Primary text, titles, subtitles, dark action buttons |
| **Linen** | `#F2EDE5` | `bg-linen`, `bg-secondary` | Warm surface background, cards, secondary buttons, intake cards |
| **Linen Dark** | `#EAE4DC` | `border-linen-dark`, `bg-linen-dark` | Subtle dividers/borders on linen surfaces, pill radio borders |
| **Stone** | `#C9C3B7` / `#C7C3B8` | `border-stone`, `border-border`, `text-muted-foreground` | Outline borders, input borders, muted placeholder text |
| **White** | `#FAFAF7` | `bg-background`, `bg-white` | Main canvas background, popovers, light contrast cards |
| **Black** | `#14140F` | `ring-black`, `text-black` | High-contrast focus rings, pure black accents |
| **Primary Pink** | `#D4537E` / `#E5487E` | `bg-primary-pink`, `text-primary-pink` | Accent badges, primary brand highlights |
| **Secondary Pink**| `#E89BB0` | `bg-secondary-pink` | Soft pink accents, tag badges |
| **Tertiary Pink** | `#F7D4DE` | `bg-tertiary-pink`, `bg-accent` | Subtle pink highlights and card tints |

---

## 2. Layout Geometry & Coordinates from Figma Snapshots

Figma screen exports live under `figma/<domain>/desktop/` and `figma/<domain>/mobile/` as `.json` (Plumb exports), `.png`, and `.svg`.

### Inspecting Node Coordinates
When inspecting a Plumb `.json` file:
1. Examine `tokens` for typography and color mappings.
2. Examine `nodes` for bounding boxes (`box: { w, h }`) and positions (`pos: { x, y }`).
3. **Compute absolute coordinates**: Parent groups or frames offset child coordinates:
   $$x_{\text{abs}} = x_{\text{parent}} + x_{\text{child}}$$
4. Compare $x_{\text{abs}}$ between peer elements to detect true alignment rather than guessing from visual renders.

### Asterisk / Sparkle Header Pattern
A common signature across Loomette screens (Settings, Pricing, Connected Accounts, Privacy Policy, Home, History, Approvals, Intake):
- **Geometry**: The Asterisk / Sparkle icon sits to the left of the title ($x_{\text{asterisk}} < x_{\text{title}}$).
- **Alignment**: The subtitle starts at the exact same horizontal coordinate as the title ($x_{\text{subtitle}} = x_{\text{title}}$).
- **Anti-Pattern**: Placing the subtitle directly underneath the Sparkle or using artificial padding hacks (`pl-8.5`, `pl-10`).
- **Canonical Structure**:
  ```tsx
  <div className="flex items-start gap-3.5 lg:gap-4">
    <Sparkle className="size-6 lg:size-8 text-foreground shrink-0 mt-1 lg:mt-2" />
    <div className="flex flex-col gap-1 lg:gap-2">
      <Typography
        variant="title"
        as="h1"
        className="font-serif text-[32px] md:text-4xl lg:text-[48px] font-normal leading-tight text-foreground"
      >
        Page Title
      </Typography>
      <p className="font-sans text-xs md:text-sm lg:text-xl font-normal text-foreground leading-snug">
        Page subtitle matching Figma copywriting.
      </p>
    </div>
  </div>
  ```

---

## 3. Typography & Casing Rules

- **Font Families**:
  - `font-serif`: Source Serif Pro for titles, numbers in stats, and emphasized headings.
  - `font-sans`: Figtree / Avenir Next for body text, subtitles, buttons, metadata, and form controls.
- **Casing**:
  - Subtitles and section descriptions are **sentence case** by default (e.g., `"Manage how the app works for you."`, `"Spring is coming, wear something sweet!"`).
  - Do NOT apply `uppercase tracking-wider` or `text-muted-foreground` to subtitles unless explicitly specified by Figma tokens (such as uppercase metadata tags or stat card headers).
- **Typography Component**:
  - `<Typography variant="title">` defaults to `font-serif text-title text-foreground`.
  - `<Typography variant="subtitle">` defaults to `font-sans text-subtitle text-foreground`.

---

## 4. Responsive Split & Navigation Architecture

- **Mobile Viewport**: Targeted at `390px` to `412px`.
- **Desktop Viewport**: Targeted at `1280px` to `1440px`.
- **Bottom Navigation**: Per [ADR 0012](docs/adr/0012-nested-route-groups-for-responsive-navigation.md), the mobile bottom bar is strictly confined to the 4 core tabs under `app/(app)/(tabs)/` (`/home`, `/calendar`, `/wardrobe`, `/profile`). All subpages under `app/(app)/` do not render the bottom navigation bar.
- **Desktop Navigation**: Persistent universal header navbar rendered in `app/(app)/layout.tsx`.
- **Sidebars & Grids**:
  - Settings / Privacy Desktop: `w-64` sticky sidebar navigation (`sticky top-28 h-fit`).
  - Cards on Linen: Use `border border-linen-dark bg-background` or `bg-linen` with `rounded-2xl` / `rounded-3xl`.

---

## 5. Verification Checklist

Whenever adjusting UI to match Figma:
1. [ ] **Zero Arbitrary Hexes**: Grep for `\[#` in modified files. Ensure all colors use tokens from `app/globals.css`.
2. [ ] **Coordinate Parity**: Verify horizontal alignment of titles, icons, and subtitles matches the Figma JSON node coordinates.
3. [ ] **Casing & Punctuation**: Verify copywriting matches Figma strings character-for-character.
4. [ ] **Typecheck**: `pnpm.cmd tsc --noEmit` passes with 0 errors.
5. [ ] **Lint**: `pnpm.cmd lint` passes with 0 warnings or errors.
6. [ ] **Tests**: `pnpm.cmd test` passes 100% of test suites. Update test assertions if outdated hardcoded uppercase strings were asserted.
