# ADR 0008: Asynchronous Edge Function ML Garment Extraction Pipeline

**Status:** Accepted  
**Date:** 2026-10-03

## Context

Loomette's item ingestion flow enables users to upload full-body outfit-of-the-day (OOTD) photos or single garment shots. The system must decompose these photos into distinct clothing items, remove backgrounds, classify categories and subcategories, and stage them for user review.

Three architectural alternatives were evaluated for executing the ML extraction:
1. **Client-side pipeline**: Client crops bounding boxes with canvas and runs in-browser `@mediapipe/tasks-vision`. However, client processing forces the user to keep the browser tab active, incompatible with the UX requirement where users can tap "Got It" and leave while analysis runs in the background.
2. **Next.js Route Handlers**: Node.js/Edge server routes handling image manipulation and Gemini calls. This tightly couples heavy multi-garment image segmentation to the Next.js web application server and complicates long-running background tasks.
3. **Supabase Edge Functions with Async Job Tracking**: An autonomous backend pipeline hosted on Supabase Edge Functions orchestrating Google Gemini vision and image segmentation, decoupling execution from the web client.

## Decisions

1. **Supabase Edge Function Execution**:
   All ML and AI operations (garment detection, attribute extraction, cropping, and background segmentation) run on Supabase Edge Functions, keeping Gemini API credentials secured on the backend.

2. **Asynchronous Ingestion Job Model**:
   Uploads initiate an asynchronous ingestion record (`upload_job`) tracking pipeline phases (`pending`, `analyzing`, `completed`, `failed`). The client can remain on the loading screen to observe progress or navigate away immediately ("Got It") without interrupting processing.

3. **Reactive Client Invalidation**:
   Clients observe upload status via TanStack Query and Supabase Realtime, automatically refreshing the loading screen and approval queue once items are staged.

## Consequences

- Users enjoy an uninterrupted experience where closing or navigating away does not abort outfit processing.
- ML operations and secret keys remain strictly isolated from client bundles.
- Requires defining the `upload_job` schema and deploying the `extract-garments` Supabase Edge Function with database write privileges for extracted items.
