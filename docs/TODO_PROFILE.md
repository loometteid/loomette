# Profile Domain Pending Decisions & TODOs

> **Agent Note**: This document contains unresolved questions from the profile UI grilling session. When working on the Profile or Trip domains, check if any of these topics are relevant to the user's request and remind them if necessary.

---

## 1. Connected Accounts (Figma D.4.5.2 / 4.5.2)
- **Status**: Implemented UI at `/profile/settings/connected-accounts` matching Figma `4.5.2` and `D.4.5.2`. Single sign-in provider disconnection protection is active.
- **Context**: The Figma designs show a Connected Accounts view under Settings (`PROFILE > SETTINGS > CONNECTED ACCOUNT`) with Google, Facebook, and X (Twitter).
- **Questions for User when ready to configure**:
  1. Which OAuth identity providers should be active in Supabase? Currently only Google OAuth is configured in the backend dashboard; Facebook and X buttons provide informative toasts until credentials are added.
  2. Should clicking "Connect" / "Disconnect" call Supabase Auth identity linking APIs (`supabase.auth.linkIdentity()` / `unlinkIdentity()`) in production? (Already wired to standard Supabase auth methods).

---

## 2. Wishlist "Add to Wardrobe" Persistence (Figma D.4.3.1 / 4.3.1)
- **Status**: Deferred ("skip for now"). UI modal and toast feedback are implemented.
- **Context**: On `/profile` (Wishlist tab), clicking an item opens the "Add to Wardrobe" dialog with an `ADD TO WARDROBE` action button.
- **Questions for User when resumed**:
  1. In Supabase, wishlist items are rows in `public.wardrobe_item` with `is_wishlist = true`. When "ADD TO WARDROBE" is confirmed, should it:
     - **Option A (Move)**: Update `is_wishlist = false` on the existing row, moving it out of Wishlist and into Wardrobe.
     - **Option B (Copy)**: Insert a new `wardrobe_item` row with `is_wishlist = false`, preserving the item in the Wishlist.

---

## 3. Trip Packing List Database Persistence (Figma D.4.2.3 / 4.2.3)
- **Status**: Resolved and Implemented.
- **Context**: On `/trip/[id]` (Packing List tab), users can check/uncheck packing items and add new items.
- **Resolution**: Created Supabase migration `20261019170000_add_trip_packing_item_table.sql` with table `public.trip_packing_item`, TanStack Query server and client options, optimistic mutations, and integration tests across devices.

---

## 4. Notification Settings Persistence
- **Status**: Resolved and Implemented.
- **Context**: On `/profile/settings` under "Notification" (`Outfit reminders`, `Analysis ready`, `Weekly recap`).
- **Resolution**: Implemented [`useNotificationSettings`](file:///e:/Codes/loomette/domains/profile/hooks/use-notification-settings.ts) hook defaulting all notification toggles to `false`, backed by browser `localStorage` (`loomette:notification-settings`) via React's `useSyncExternalStore`. Verified with unit and integration tests.

---

## 5. Payment Gateway Provider Decision (Figma D.4.5.5 / 4.5.5)
- **Status**: Implemented with Dependency Inversion Architecture. Provider selection deferred to environment variable configuration.
- **Context**: On `/profile/settings/pricing`, users can view Starter (Free) and Pro plans with interactive Monthly (`Rp 49.000 / mo`) and Annual (`Rp 470.000 / yr` - save 20%) billing options and initiate checkout.
- **Architecture**:
  - Provider-agnostic `PaymentGateway` interface ([`types.ts`](file:///e:/Codes/loomette/lib/payments/types.ts)) adhering to the Dependency Inversion Principle.
  - Implemented 4 production adapters + 1 mock simulator:
    1. **Midtrans** ([`midtrans.adapter.ts`](file:///e:/Codes/loomette/lib/payments/adapters/midtrans.adapter.ts)): Indonesian Snap transactions & SHA512 signature verification.
    2. **Xendit** ([`xendit.adapter.ts`](file:///e:/Codes/loomette/lib/payments/adapters/xendit.adapter.ts)): Indonesian/SEA Invoices v2 & callback token verification.
    3. **Stripe** ([`stripe.adapter.ts`](file:///e:/Codes/loomette/lib/payments/adapters/stripe.adapter.ts)): Global Stripe Checkout sessions & HMAC-SHA256 signature verification.
    4. **Mayar** ([`mayar.adapter.ts`](file:///e:/Codes/loomette/lib/payments/adapters/mayar.adapter.ts)): Indonesian headless payment links & token verification.
    5. **Mock** ([`mock.adapter.ts`](file:///e:/Codes/loomette/lib/payments/adapters/mock.adapter.ts)): Local development & automated CI simulator without live credentials.
  - Gateway Factory ([`factory.ts`](file:///e:/Codes/loomette/lib/payments/factory.ts)): Switch active gateway at runtime via `PAYMENT_GATEWAY_PROVIDER="midtrans" | "xendit" | "stripe" | "mayar" | "mock"`.
  - Database schema: `payment_order` and `subscription` tables ([`20261020140000_add_payment_and_subscription_tables.sql`](file:///e:/Codes/loomette/supabase/migrations/20261020140000_add_payment_and_subscription_tables.sql)).
  - Unified multi-provider webhook route handler: [`route.ts`](file:///e:/Codes/loomette/app/api/webhooks/payment/[provider]/route.ts).
  - Server Action: [`create-checkout-session.action.ts`](file:///e:/Codes/loomette/domains/profile/actions/create-checkout-session.action.ts).
- **Questions for User when ready to select**:
  - Which payment gateway will be used in production? Any adapter can be activated simply by setting `PAYMENT_GATEWAY_PROVIDER` and corresponding keys in `.env.local` without touching any codebase logic.

---

## 7. Social Profile Visibility (Figma D.4.6.1 / 4.6.1)
- **Status**: Hidden in UI via React 19 `<Activity mode="hidden">`; route `/profile/social` returns 404 (`notFound()`) in production.
- **Context**: Social Circle features and public feeds are deferred until the social graph and sharing permissions are designed.
- **Master Roadmap**: See [docs/TODO.md](TODO.md) for master application backlog and roadmap.

---

## 8. Figma Typography & Frame Lookups (Rate Limit Status)
- **Status**: Pulled and cached all available Figma file overview data, design system tokens, canvas trees, and complete frame ID index into `figma/snapshots/`.
- **API Status**:
  - Figma's granular node endpoint (`/v1/files/:fileKey/nodes`) is rate-limited by CloudFront for the current Starter tier account (`Retry-After: ~399,000s`).
  - Document-level metadata, global variables, design system components, layout templates, and the entire High Fidelity canvas frame hierarchy have been pulled and cached.
- **Looked Up & Cached** (in `figma/snapshots/`):
  - [x] Full document hierarchy & frame index $\rightarrow$ `figma/snapshots/figma-frames-index.json`
  - [x] Global variables, design system, layout templates & node mappings $\rightarrow$ `figma/snapshots/figma-design-system-and-nodes.yaml`
  - [x] `4.1 MOBILE` (node `47:296`) $\rightarrow$ `figma/snapshots/4.1-mobile-47-296.json`
  - [x] `D.4.1 DESKTOP` (node `1239:2583`) $\rightarrow$ `figma/snapshots/D.4.1-desktop-1239-2583.json`
  - [x] `4.2 MOBILE` (node `13:146`) $\rightarrow$ `figma/snapshots/4.2-mobile-13-146.json`
  - [x] `4.2.1 MOBILE` (node `325:66`) $\rightarrow$ `figma/snapshots/4.2.1-mobile-325-66.json`
  - [x] `4.2.2.1 MOBILE` (node `364:281`) $\rightarrow$ `figma/snapshots/4.2.2.1-mobile-364-281.json`
  - [x] `4.2.2.2 MOBILE` (node `744:472`) $\rightarrow$ `figma/snapshots/4.2.2.2-mobile-744-472.json`
  - [x] `4.2.3 MOBILE` (node `364:400`) $\rightarrow$ `figma/snapshots/4.2.3-mobile-364-400.json`
  - [x] `4.3 MOBILE` (node `57:24`) $\rightarrow$ `figma/snapshots/4.3-mobile-57-24.json`
  - [x] `4.3.1 MOBILE` (node `518:244`) $\rightarrow$ `figma/snapshots/4.3.1-mobile-518-244.json`
  - [x] `4.4 MOBILE` (node `89:1775`) $\rightarrow$ `figma/snapshots/4.4-mobile-89-1775.json`
  - [x] `4.5 MOBILE` (node `376:723`) $\rightarrow$ `figma/snapshots/4.5-mobile-376-723.json`
  - [x] `4.5.1 MOBILE` (node `378:1015`) $\rightarrow$ `figma/snapshots/4.5.1-mobile-378-1015.json`
  - [x] `4.5.2 MOBILE` (node `378:1096`) $\rightarrow$ `figma/snapshots/4.5.2-mobile-378-1096.json`
  - [x] `4.5.3 MOBILE` (node `379:1241`) $\rightarrow$ `figma/snapshots/4.5.3-mobile-379-1241.json`
  - [x] `4.5.4.1 MOBILE` (node `379:1438`) $\rightarrow$ `figma/snapshots/4.5.4.1-mobile-379-1438.json`
  - [x] `4.5.5 MOBILE` (node `731:345`) $\rightarrow$ `figma/snapshots/4.5.5-mobile-731-345.json`
  - [x] `4.6.1 MOBILE` (node `751:683`) $\rightarrow$ `figma/snapshots/4.6.1-mobile-751-683.json`
  - [x] `D.4.2 DESKTOP` (node `1240:2830`) $\rightarrow$ `figma/snapshots/D.4.2-desktop-1240-2830.json`
  - [x] `D.4.2.1 DESKTOP` (node `1240:3444`) $\rightarrow$ `figma/snapshots/D.4.2.1-desktop-1240-3444.json`
  - [x] `D.4.2.2.1 DESKTOP` (node `1240:2994`) $\rightarrow$ `figma/snapshots/D.4.2.2.1-desktop-1240-2994.json`
  - [x] `D.4.2.3 DESKTOP` (node `1240:3237`) $\rightarrow$ `figma/snapshots/D.4.2.3-desktop-1240-3237.json`
  - [x] `D.4.3 DESKTOP` (node `1240:2915`) $\rightarrow$ `figma/snapshots/D.4.3-desktop-1240-2915.json`
  - [x] `D.4.3.1 DESKTOP` (node `1240:3557`) $\rightarrow$ `figma/snapshots/D.4.3.1-desktop-1240-3557.json`
  - [x] `D.4.4 DESKTOP` (node `1213:739`) $\rightarrow$ `figma/snapshots/D.4.4-desktop-1213-739.json`
  - [x] `D.4.5 DESKTOP` (node `1230:306`) $\rightarrow$ `figma/snapshots/D.4.5-desktop-1230-306.json`
  - [x] `D.4.5.1 DESKTOP` (node `1233:795`) $\rightarrow$ `figma/snapshots/D.4.5.1-desktop-1233-795.json`
  - [x] `D.4.5.2 DESKTOP` (node `1235:1321`) $\rightarrow$ `figma/snapshots/D.4.5.2-desktop-1235-1321.json`
  - [x] `D.4.5.3 DESKTOP` (node `1235:1455`) $\rightarrow$ `figma/snapshots/D.4.5.3-desktop-1235-1455.json`
  - [x] `D.4.5.4.1 DESKTOP` (node `1235:1593`) $\rightarrow$ `figma/snapshots/D.4.5.4.1-desktop-1235-1593.json`
  - [x] `D.4.5.4.2 DESKTOP` (node `1235:1724`) $\rightarrow$ `figma/snapshots/D.4.5.4.2-desktop-1235-1724.json`
  - [x] `D.4.5.4.3 DESKTOP` (node `1235:1870`) $\rightarrow$ `figma/snapshots/D.4.5.4.3-desktop-1235-1870.json`
  - [x] `D.4.5.5 DESKTOP` (node `1237:2015`) $\rightarrow$ `figma/snapshots/D.4.5.5-desktop-1237-2015.json`
  - [x] `D.4.6.1 DESKTOP` (node `1237:2350`) $\rightarrow$ `figma/snapshots/D.4.6.1-desktop-1237-2350.json`
  - [x] `4.5.4.2 MOBILE` (node `761:354`) $\rightarrow$ `figma/snapshots/4.5.4.2-mobile-761-354.json`
  - [x] `4.5.4.3 MOBILE` (node `379:1542`) $\rightarrow$ `figma/snapshots/4.5.4.3-mobile-379-1542.json`
  - [x] `D.4.2.2.2 DESKTOP` (node `1240:3761`) $\rightarrow$ `figma/snapshots/D.4.2.2.2-desktop-1240-3761.json`
  - [x] `3.4.1 MOBILE` (node `152:89`) $\rightarrow$ `figma/snapshots/3.4.1-mobile-152-89.json`
  - [x] `3.4.2 MOBILE` (node `410:717`) $\rightarrow$ `figma/snapshots/3.4.2-mobile-410-717.json`
  - [x] `3.4.2.1 MOBILE` (node `410:749`) $\rightarrow$ `figma/snapshots/3.4.2.1-mobile-410-749.json`
  - [x] `3.4.3 MOBILE` (node `410:946`) $\rightarrow$ `figma/snapshots/3.4.3-mobile-410-946.json`
  - [x] `D.3.4.1 DESKTOP` (node `1115:277`) $\rightarrow$ `figma/snapshots/D.3.4.1-desktop-1115-277.json`
  - [x] `D.3.4.2 DESKTOP` (node `1120:401`) $\rightarrow$ `figma/snapshots/D.3.4.2-desktop-1120-401.json`
  - [x] `D.3.4.2.1 DESKTOP` (node `1120:447`) $\rightarrow$ `figma/snapshots/D.3.4.2.1-desktop-1120-447.json`
  - [x] `D.3.4.3 DESKTOP` (node `1120:608`) $\rightarrow$ `figma/snapshots/D.3.4.3-desktop-1120-608.json`
- **Visual Design Reference**:
  - All profile and mix & match screen designs are saved locally in `figma/profile/desktop`, `figma/profile/mobile`, `figma/mix and match/desktop`, and `figma/mix and match/mobile` as `@1x` PNGs, `@2x` PNGs, and vector `.svg` files with full paths, CSS styles, and bounding boxes.
- **Fallback Verification Source**:
  - The design system guidelines in `figma/Typography.png`, `figma/Button.png`, `figma/Text Field.png`, `figma/Color.png`, and `figma/Layout.png` along with rendered screens in `figma/profile/mobile/*.png` and `figma/profile/desktop/*.png` provide high-fidelity specifications for typography implementation.
