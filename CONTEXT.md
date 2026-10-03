# Loomette Domain Context

Loomette is an AI-powered personal wardrobe management and styling web application for tracking clothing items, logging daily looks, and planning outfits.

## Language

### Authentication & Lifecycle

**Auth Gateway**:
The unified entry point at `/welcome` where user identity verification occurs via single-click Google OAuth, combining account creation and sign-in into a single action.
_Avoid_: Login screen, sign-up page, registration form

**Onboarding**:
The five-step personalization wizard (steps 1–5) followed by a completion confirmation (step 6), where a newly authenticated user configures their profile (name, identity, profession, sizing, style tags).
_Avoid_: Account setup flow, sign-up wizard

**Initial Wardrobe Seed**:
The mandatory post-onboarding step at `/onboarding/7` where a user uploads their first clothing item or outfit before entering the main application dashboard.
_Avoid_: Step 7, Add item onboarding

**Active Session**:
An authenticated user state with completed onboarding and at least one wardrobe item, landing on `/home`.
_Avoid_: Logged-in state
