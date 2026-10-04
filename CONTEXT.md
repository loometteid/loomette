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

### Wardrobe Ingestion & AI Extraction

**OOTD Upload**:
The multi-garment intake flow initiated from Wardrobe or Calendar where a user submits an outfit photo to be decomposed by AI into individual wardrobe items.
_Avoid_: Add photo, outfit diary photo upload

**Approval Queue**:
The staging screen at `/wardrobe/approval` where AI-extracted garments reside in an unapproved state until the user reviews, optionally edits attributes, and commits or discards them.
_Avoid_: Review list, pending screen

**Upload Job**:
An asynchronous background task tracking the ingestion lifecycle (`pending`, `analyzing`, `completed`, `failed`) of an OOTD photo from initial upload through Edge Function garment extraction.
_Avoid_: Processing task, background worker

**Calendar Look Ingestion**:
Dual-action intake where an outfit photo logged on a calendar date saves the daily diary look while concurrently initiating an Upload Job to extract individual garments into the Approval Queue.
_Avoid_: Calendar photo copy, diary sync

**Duplicate Flag**:
A non-blocking advisory status shown in the Approval Queue when a newly extracted garment visually or taxonomically resembles an existing piece in the user's wardrobe, informing the user without prohibiting approval.
_Avoid_: Duplicate blocker, duplicate error
