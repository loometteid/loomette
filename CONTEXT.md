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

### Profile & Travel Hub

**Social Circle**:
The authenticated user's own public social profile at `/profile/social` displaying their public handle, bio, follower metrics, and published outfit or repost collections.
_Avoid_: Friend page, friends feed, user search

**Trip Packing List**:
The checklist for planned journeys at `/trip/[id]`, enabling travelers to manage packing items across travel dates.
_Avoid_: Luggage items, suitcase checklist

**Account Deletion Flow**:
The 3-stage user offboarding process requiring data-loss acknowledgement, reason feedback, and confirmation text typing before permanent account removal.
_Avoid_: Immediate unsubscribe, quick delete
