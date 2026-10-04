# ADR 0009: Responsive Wardrobe Intake and Approval UI

**Status:** Accepted  
**Date:** 2026-10-04

## Context

The wardrobe intake and garment extraction feature enables users to upload outfits, observe background ML analysis, and curate detected clothing pieces in an approval queue before saving them to their wardrobe.

Previously, the wardrobe approval queue (`/wardrobe/approval`) only rendered a basic single-column vertical list suitable for narrow viewports, lacked responsive desktop framing, and did not reflect the Figma design specifications. Both mobile and desktop designs provide distinct layout structures across the intake, loading, and approval stages:
- Mobile designs ([Figma 3.1](file:///e:/Codes/loomette/figma/wardrobe/mobile/3.1%20Approval%20page.png), [3.1.1](file:///e:/Codes/loomette/figma/wardrobe/mobile/3.1.1%20Approval%20Page%20Pop%20Up.png), [3.2.2](file:///e:/Codes/loomette/figma/wardrobe/mobile/3.2.2%20Add%20item.png), [3.2.3](file:///e:/Codes/loomette/figma/wardrobe/mobile/3.2.3%20Add%20item%20loading%20page.png)) optimize for one-handed thumb interaction with compact 2-column grids and accordions.
- Desktop designs ([Figma D.3.1](file:///e:/Codes/loomette/figma/wardrobe/desktop/D.3.1%20Approval%20page.png), [D.3.1.1](file:///e:/Codes/loomette/figma/wardrobe/desktop/D.3.1.1%20Approval%20Page%20Pop%20Up.png), [D.3.2.2](file:///e:/Codes/loomette/figma/wardrobe/desktop/D.3.2.2%20Add%20item.png), [D.3.2.3](file:///e:/Codes/loomette/figma/wardrobe/desktop/D.3.2.3%20Add%20item%20loading%20page.png)) utilize desktop screen real estate with top global navigation, 4-column item grids, mascot banners, and a 2-column split editor dialog.

## Decisions

1. **Responsive Approval Queue Grid (`/wardrobe/approval`)**:
   - **Mobile (`<1024px`)**: Renders a 2-column card grid (`grid-cols-2`) matching [Figma 3.1](file:///e:/Codes/loomette/figma/wardrobe/mobile/3.1%20Approval%20page.png). Each card shows the cropped garment image, top-right selection checkbox, garment title, and upload timestamp. The bottom action bar features a full-width dark `APPROVE` button alongside a compact secondary icon button for `Trash`.
   - **Desktop (`lg:` breakpoint)**: Renders a 4-column card grid (`grid-cols-4`) matching [Figma D.3.1](file:///e:/Codes/loomette/figma/wardrobe/desktop/D.3.1%20Approval%20page.png), encased within the global desktop navigation header (`HOME`, `CALENDAR`, `WARDROBE`, profile). The bottom action bar aligns to the bottom-right, displaying a dark `APPROVE` pill button and a light cream `DELETE` button with text.

2. **Responsive Approval Item Pop-Up Dialog**:
   - **Mobile**: Single-column dialog matching [Figma 3.1.1](file:///e:/Codes/loomette/figma/wardrobe/mobile/3.1.1%20Approval%20Page%20Pop%20Up.png), featuring pill selectors for Category, Subcategory, and Size, with a collapsible accordion for Details (Occasions, Price, Buy From).
   - **Desktop**: Wide 2-column modal matching [Figma D.3.1.1](file:///e:/Codes/loomette/figma/wardrobe/desktop/D.3.1.1%20Approval%20Page%20Pop%20Up.png). The left column displays the garment image preview and classification pills (Category, Subcategory, Outfit Size). The right column directly displays the item name, brand, Occasion pills, Price, Buy From inputs, and the bottom `SAVE` action without requiring accordion expansion.

3. **Intake and Loading State Responsiveness**:
   - **Add Item (`/wardrobe/add`)**: Renders mobile full-screen ([3.2.2](file:///e:/Codes/loomette/figma/wardrobe/mobile/3.2.2%20Add%20item.png)) and desktop centered layout ([D.3.2.2](file:///e:/Codes/loomette/figma/wardrobe/desktop/D.3.2.2%20Add%20item.png)) with `TAKE A PHOTO` and `UPLOAD A PHOTO` actions.
   - **Loading Screen (`/wardrobe/loading`)**: On mobile ([3.2.3](file:///e:/Codes/loomette/figma/wardrobe/mobile/3.2.3%20Add%20item%20loading%20page.png)), renders centered content with sparkle icon, 3-phase checklist, and `GOT IT` button. On desktop ([D.3.2.3](file:///e:/Codes/loomette/figma/wardrobe/desktop/D.3.2.3%20Add%20item%20loading%20page.png)), renders the full-width cloudy banner featuring the mascot pair, standard top navigation, 3-phase checklist, and `BACK TO HOME` button.

4. **Delete Confirmation Dialog**:
   - Tapping delete/trash across both viewports opens a modal dialog ([Figma 3.1.2](file:///e:/Codes/loomette/figma/wardrobe/mobile/3.1.2%20Approval%20Page%20Delete.png)) with `DELETE ITEM` and `KEEP ITEM` options, preventing accidental data loss.

## Consequences

- Delivers pixel-accurate responsive layouts that faithfully match both mobile and desktop Figma specifications.
- Consolidates approval item editing into a single responsive dialog component adapting seamlessly between mobile accordion and desktop dual-column layout.
- Provides consistent desktop navigation and visual branding with mascot art.
