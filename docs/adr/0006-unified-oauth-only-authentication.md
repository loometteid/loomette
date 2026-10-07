# ADR 0006: Unified OAuth-Only Authentication Screen

**Status:** Accepted  
**Date:** 2026-10-01

## Context

Previously, authentication was split across `/sign-in` and `/sign-up` routes using email and password credentials validated by React Hook Form and Zod schemas, alongside a separate `/welcome` view. Maintaining dual credential forms introduced registration friction, password reset overhead, and UI fragmentation between landing page entry points.

## Decisions

1. **Single Canonical Route at `/welcome`**:
   The `/welcome` route serves as the sole authentication gateway, replacing separate login and registration views. Both `/sign-in` and `/sign-up` issue HTTP 308 redirects to `/welcome`.

2. **Google OAuth as Sole Identity Provider**:
   Credentials (email/password) forms and schemas in `domains/auth` are retired. Authentication is performed via single-click Google OAuth, handling both new account registration and returning user sign-in seamlessly.

3. **Single Centered Action Button**:
   The authentication UI renders a single prominent rounded-square Google button placed centrally under the agreement disclaimer, matching the design system specifications.

4. **Strict 100dvh Adaptive Viewport**:
   On mobile viewports, the layout is locked to 100dvh without vertical scroll; the top visual sky panel dynamically shrinks on smaller display heights while the authentication controls remain fixed and fully accessible.

## Consequences

- Streamlines the authentication funnel to zero friction without password management.
- Simplifies `domains/auth` by eliminating legacy credential schemas, validation forms, and associated tests.
- Re-routing legacy `/sign-in` and `/sign-up` deep links prevents broken entry points from bookmarks or external links.
