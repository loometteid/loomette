# Loomette Application Backlog & Roadmap (TODOs)

This document tracks system-wide pending features, deferred decisions, architectural roadmap items, and identified bugs across all Loomette application domains.

---

## 1. Implement Paid User's Limitations (Subscription Tiers & Gating)
- **Status**: Pending implementation.
- **Context**: Payment gateway architecture (Midtrans, Xendit, Stripe, Mayar, Mock) and billing database schema (`public.subscription`, `public.payment_order`) are in place. Pricing plans (Starter: Free, Pro: Rp 49.000/mo or Rp 470.000/yr) are presented on `/profile/settings/pricing`.
- **Requirements & Scope**:
  1. **Subscription Status Gating**:
     - Create server utility/middleware (`assertProSubscription(userId)` / `getSubscriptionTier(userId)`) verifying active subscription status and billing periods from `public.subscription`.
  2. **Tier Limits**:
     - **Starter (Free)**:
       - Capped wardrobe items intake / storage.
       - Capped monthly AI recommendations and mix-and-match look generations.
       - Standard packing list export without multi-season AI optimization.
     - **Pro (Paid)**:
       - Unlimited wardrobe intake and high-resolution garment extraction.
       - Unlimited AI outfit recommendations, prompts, and mix-and-match looks.
       - Priority AI styling and automated calendar diary sync.
  3. **Client-Side Paywall & Graceful Degradation**:
     - Surface friendly upgrade modals/dialogs when Starter limits are reached.
     - Prevent unauthorized server actions or edge function invocations when quota is exceeded.

---

## 2. Notification Subsystem
- **Status**: Hidden in UI via React 19 `<Activity mode="hidden">`; route `/home/notifications` returns 404 (`notFound()`) in production.
- **Context**: User preferences (`outfitReminders`, `analysisReady`, `weeklyRecap`) are configured in `/profile/settings` and stored in browser `localStorage`.
- **Requirements & Scope**:
  1. **Database Schema**:
     - Create `public.notification` table with fields (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `created_at`).
  2. **Triggers & Background Dispatch**:
     - Automated cron / scheduled Edge Functions for outfit reminders, analysis completion, and weekly recap digest.
  3. **Push & In-App Delivery**:
     - In-app notification popover (desktop) and mobile notification screen (`/home/notifications`).
     - Web Push API / Service Worker notification handling with user permission workflows.
  4. **Un-hiding**:
     - Remove `<Activity mode="hidden">` wrappers in `domains/home/home-page.tsx`, `domains/profile/settings-page.tsx`, and enable production route in `app/home/notifications/page.tsx` once dispatch pipeline is ready.

---

## 3. Mix & Match Interactive Canvas (`/mix-and-match`)
- **Status**: Completed.
- **Context**: Responsive styling canvas implemented across desktop and mobile matching Figma designs (`3.4.1`, `3.4.2`, `3.4.2.1`, `3.4.3` on mobile; `D.3.4.1`, `D.3.4.2`, `D.3.4.2.1`, `D.3.4.3` on desktop).
- **Implemented Scope**:
  1. **Interactive Styling Canvas**:
     - Built with pure vanilla `konva` canvas engine (`domains/mix-and-match/components/konva-canvas.tsx`) equipped with interactive `Konva.Transformer` (4 corner handles, slate `#444440` border) for dragging, rotating, and scaling garments with zero manual transform math.
     - Responsive canvas matching Figma layout geometry, design tokens, and typography.
     - Categorized garment picker (Tops, Bottoms, Shoes, Accessories) with collapsible subcategories (Shirts, Blouse, Polo, etc.) supporting both tap-to-slot and drag-and-drop placement.
  2. **Look Composition Engine**:
     - Interactive element repositioning with coordinate normalization and pointer capture.
     - Layering order controls (Layer Up / Layer Down) and Trash button to delete selected garment.
     - Random outfit Shuffle engine with sensible slot arrangement.
     - Save look directly to user's styled outfits (`public.outfit`, `public.outfit_item`), with optional Trip schedule integration.
     - Result page with inline outfit name editing, Add to Collection, Add to Calendar pop up dialog, and Success modal with brand mascot (`/brand/mascot-image-43.png`).

---

## 4. Onboarding Step 7 Debug & Smooth Transition
- **Status**: Identified bug / UX gap.
- **Context**: Onboarding sequence spans `/onboarding/1` through `/onboarding/7`. Currently step 7 is skipped or fails to load cleanly, potentially rushing or interrupting the final onboarding step.
- **Requirements & Scope**:
  1. Inspect routing logic and step increment conditions across `domains/onboarding/`.
  2. Verify completion state criteria in `useOnboardingGuard` to ensure users complete Step 7 before being routed to `/home`.
  3. Ensure transitions, loading spinners, and state updates between steps 6, 7, and the dashboard are deterministic.

---

## 5. Affiliate Items Integration
- **Status**: Backlog feature.
- **Context**: Monetization channel and product discovery mechanism supplementing user's existing wardrobe.
- **Requirements & Scope**:
  1. **Affiliate Catalog & Link Integration**:
     - Schema or partner API integration for external brand garments (Zara, Uniqlo, ASOS, local Indonesian merchants).
     - Generating affiliate links with tracking IDs.
  2. **Look Pairing Suggestions**:
     - Suggest missing pieces to complete an outfit ("Pair your favorite top with this skirt from...").
     - Display price tags, affiliate badges, and FTC/regulatory compliance disclosures.

---

## 6. Wishlist Enhancement & Media Consumption Pipeline
- **Status**: Basic UI exists on `/profile` (Wishlist tab). External media ingestion pipeline pending.
- **Context**: Users want to bookmark items they discover while browsing external sites and social media, then eventually add them to their wardrobe.
- **Requirements & Scope**:
  1. **Media Ingestion & Web Scraping Pipeline**:
     - External URL intake parser: extract OpenGraph tags, JSON-LD Schema (`Product`, `offers`), images, product title, and price.
     - Image preprocessing: background removal and normalization (leveraging garment extraction pipeline).
  2. **Add to Wardrobe Flow**:
     - Resolve persistence behavior (Move vs Copy into `public.wardrobe_item`).
     - Status tracking (e.g. saved, purchased, owned).

---

## 7. AI-fication of Homepage Recommendations & Prompts
- **Status**: Currently uses local deterministic/random generator (`domains/home/recommendation.ts`) and prompt placeholder toast.
- **Context**: Homepage hero features "Ready to style in...?" outfit composition and "I want to wear..." prompt input bar.
- **Requirements & Scope**:
  1. **LLM / Gemini Styling Intelligence**:
     - Ingest user profile (style tags, gender, occasion preferences, wardrobe inventory, wear count history, local weather/season).
     - Generate smart, color-coordinated outfit recommendations matching the user's aesthetic code.
  2. **Natural Language Styling Prompts**:
     - Connect "I want to wear..." prompt bar (e.g. "Rainy Tuesday meeting with pastel accent") to an LLM agent that selects and coordinates exact garments from the user's wardrobe.

---

## 8. AI-fication of Daily Outfit / Calendar Look Names (e.g. "Chic Kinda Day")
- **Status**: Backlog creative AI feature.
- **Context**: Calendar outfits and outfit diary entries benefit from expressive, mood-based look names rather than generic titles.
- **Requirements & Scope**:
  1. Automatically generate aesthetic, catchy, vibe-aligned titles for daily outfits (e.g. "Chic Kinda Day", "Casual Paris Autumn", "Monochrome Minimalist Friday").
  2. Base generation on composed garments, dominant colors, weather forecast, and user style archetype.

---

## 9. Social Profile & Circle (`/profile/social`)
- **Status**: Hidden in UI via React 19 `<Activity mode="hidden">`; route `/profile/social` returns 404 (`notFound()`) in production.
- **Context**: Figma designs (`4.6.1` mobile, `D.4.6.1` desktop) specify a social feed of public outfits.
- **Requirements & Scope**:
  1. Implement social graph (following/followers, shared outfits, privacy visibility toggles).
  2. Re-enable Social Circle navigation once public feed and privacy permissions are in place.
