# ADR 0005: Flat Domain Architecture and Route Component Lifecycle

**Status:** Accepted  
**Date:** 2026-09-30

## Context

Previously, feature logic was located under `components/features/<feature>`, while domain utilities were scattered in `lib/` and `types/`. Within feature directories, route-level page views (e.g. `wardrobe-view.tsx`) were co-located flat with internal form components (e.g. `edit-item-form.tsx`), obscuring which components represented route entry points versus internal UI widgets.

We evaluated two architectural alternatives:

1. **Granular micro-features (`features/<action>`)**: High isolation per action, but introduces "shared logic anxiety"—ongoing confusion over where shared cards, filters, and query options across the same domain should live.
2. **Deeply nested corporate modules (`domains/<domain>/views/<name>/hooks/...`)**: High domain cohesion, but introduces 4–5 directory levels of navigation friction for small single files.

## Decisions

1. **Top-level `domains/<domain>` packaging.**
   Business entities, workflows, and data access are organized under root `domains/<domain>/` (e.g. `domains/wardrobe`, `domains/trip`, `domains/profile`, `domains/outfit`, `domains/onboarding`). The term "domain" is chosen over "module" to emphasize business-bounded contexts and avoid ambiguity with JavaScript/Node module concepts.

2. **Flat domain depth cap (maximum 2 directory levels).**
   Within each domain, nesting is capped at 2 levels:
   - `models/`: Zod domain entity schemas and branded types (e.g. `wardrobe-item.model.ts`).
   - `dto/`: Zod request and response data transfer objects (e.g. `get-wardrobe-items.dto.ts`).
   - `query-options/`: Strict client/server query split (`*.query-option.client.ts` and `*.query-option.server.ts`).
   - `mutation-options/`: TanStack Query mutation options (`*.mutation-option.client.ts`).
   - `schemas/`: React Hook Form Zod validation schemas (`*.schema.ts`).
   - `components/`: Internal widgets, forms, dialogs, and cards (e.g. `edit-item-form.tsx`, `wardrobe-item-card.tsx`).
   - `hooks/`: Domain-level custom hooks (flat, not nested).

3. **Route Component Lifecycle Symmetry (`*-page.tsx`, `*-loading.tsx`, `*-error.tsx`).**
   To mirror Next.js App Router conventions 1:1, route-facing components are named after their route role and sit at the root of the domain:
   - `*-page.tsx` $\leftrightarrow$ `app/**/page.tsx` (the client page body rendered inside the RSC)
   - `*-loading.tsx` $\leftrightarrow$ `app/**/loading.tsx` (the streaming skeleton / `<Suspense fallback>`)
   - `*-error.tsx` $\leftrightarrow$ `app/**/error.tsx` (error boundary view)

   `app/` routes only import these route-facing files and `query-options/` for server prefetching. Internal forms, dialogs, and cards remain private to `domains/<domain>/components/`.

4. **Cross-cutting infrastructure remains in `lib/`.**
   `lib/` is strictly reserved for infrastructure and third-party adapters (`lib/supabase/`, `lib/tanstack-query/`, `lib/logging/`, `lib/ai/`, `lib/utils.ts`), never domain entities.

## Visual Architectural Flows

### 1. Import Dependency Flow (Unidirectional)

Dependencies flow strictly downward. Page routes only import domain root components and server queries; internal components and schemas remain private to the domain.

```mermaid
flowchart TD
    subgraph NextRoutes["Next.js App Layer: app/**"]
        PageRSC["page.tsx (React Server Component)"]
        LoadingRSC["loading.tsx (Suspense Fallback)"]
        ErrorRSC["error.tsx (Error Boundary)"]
    end

    subgraph DomainModule["Domain Layer: domains/<domain>/"]
        subgraph DomainRoot["Route Lifecycle Exports (Domain Root)"]
            DomainPage["*-page.tsx (Client Page View)"]
            DomainLoading["*-loading.tsx (Skeleton / Fallback)"]
            DomainError["*-error.tsx (Error View)"]
        end

        subgraph DataAccess["Data Access Layer"]
            ServerQuery["query-options/*.server.ts"]
            ClientQuery["query-options/*.client.ts"]
            ClientMutation["mutation-options/*.client.ts"]
        end

        subgraph DomainUI["Internal UI: components/"]
            Forms["components/*-form.tsx"]
            Dialogs["components/*-dialog.tsx"]
            Cards["components/*-card.tsx"]
        end

        subgraph Contracts["Contracts & Models: models/, dto/, schemas/"]
            Models["models/*.model.ts (Zod Branded Entities)"]
            DTOs["dto/*.dto.ts (Request/Response DTOs)"]
            FormSchemas["schemas/*.schema.ts (RHF Validation)"]
        end
    end

    subgraph SharedInfra["Shared Infrastructure: lib/ & components/ui/"]
        UIPrimitives["components/ui/* (Base UI & shadcn)"]
        SupabaseLib["lib/supabase/* (Server & Browser Clients)"]
        TanstackLib["lib/tanstack-query/* (Query Client Factories)"]
        LoggingLib["lib/logging/* (LogTape Tracers)"]
    end

    %% App imports
    PageRSC -->|"imports view"| DomainPage
    PageRSC -->|"imports server query for prefetch"| ServerQuery
    LoadingRSC -->|"imports skeleton"| DomainLoading
    ErrorRSC -->|"imports error view"| DomainError

    %% Page composition
    DomainPage -->|"renders"| Forms
    DomainPage -->|"renders"| Cards
    DomainPage -->|"renders"| Dialogs
    DomainPage -->|"reads data via"| ClientQuery

    %% UI to contracts & mutations
    Forms -->|"uses schema"| FormSchemas
    Forms -->|"triggers"| ClientMutation
    Cards -->|"typed by"| Models

    %% Data Access to contracts
    ServerQuery -->|"validates with"| DTOs
    ClientQuery -->|"validates with"| DTOs
    DTOs -->|"references"| Models

    %% Infra imports
    ServerQuery -->|"uses"| SupabaseLib
    ClientQuery -->|"uses"| SupabaseLib
    ClientMutation -->|"uses"| SupabaseLib
    DomainUI -->|"uses primitives"| UIPrimitives
    DomainPage -->|"uses primitives"| UIPrimitives
    DataAccess -->|"logs via"| LoggingLib
```

### 2. Runtime Data Flow (RSC Streaming to Mutation)

Illustrates the end-to-end lifecycle: server-side unawaited prefetch, instant streaming skeleton, client hydration cache hit, and mutation invalidation.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant RSC as Next.js RSC (app/**/page.tsx)
    participant QueryServer as domains/<domain>/query-options/*.server.ts
    participant Supabase as Supabase (PostgreSQL + RLS)
    participant ClientPage as domains/<domain>/*-page.tsx
    participant Form as domains/<domain>/components/*-form.tsx
    participant QueryBrowser as domains/<domain>/query-options/*.client.ts
    participant Mutation as domains/<domain>/mutation-options/*.client.ts

    %% PHASE 1: Server Prefetch & Streaming
    Note over User, Supabase: Phase 1: Server-Side Prefetch & Streaming (TTFB)
    User->>+RSC: Navigate to route (e.g. /wardrobe)
    RSC->>RSC: Verify user auth session (cookies)
    RSC->>QueryServer: void queryClient.ensureQueryData(getWardrobeItemsForServer(userId))
    QueryServer->>Supabase: Fetch data via createServerSupabaseClient()
    RSC-->>User: Instant Stream: HydrationBoundary + Suspense fallback={WardrobeLoading}
    User->>User: Renders skeleton UI immediately
    Supabase-->>QueryServer: Data arrives
    QueryServer-->>RSC: Server query resolved & dehydrated

    %% PHASE 2: Client Hydration
    Note over User, ClientPage: Phase 2: Instant Client Hydration (No Waterfall)
    RSC-->>User: Stream resolved HTML + dehydrated state
    User->>+ClientPage: Hydrate WardrobePage
    ClientPage->>QueryBrowser: useSuspenseQuery(getWardrobeItemsForBrowser(userId))
    QueryBrowser-->>ClientPage: Instant cache hit from dehydrated state!
    ClientPage->>Form: Render EditItemForm with defaultValues

    %% PHASE 3: Mutation & Invalidation
    Note over Form, Supabase: Phase 3: Form Mutation & Cache Invalidation
    User->>Form: Edit fields & submit form
    Form->>Form: Validate inputs with schemas/*.schema.ts
    Form->>+Mutation: useMutation().mutate(values)
    Mutation->>Supabase: Update row via createBrowserSupabaseClient()
    Supabase-->>Mutation: Success 200 OK
    Mutation->>QueryBrowser: queryClient.invalidateQueries(getWardrobeItemsForBrowser.queryKey)
    QueryBrowser->>Supabase: Background refetch updated rows
    Supabase-->>QueryBrowser: Fresh data
    QueryBrowser-->>ClientPage: Re-render with updated state + show toast notification
```

## Considered Options

- **Granular Feature Slicing (`features/<action>`)**: Rejected due to the "shared junk drawer" problem where domain entities (like wardrobe items or category selectors) must be accessed by multiple sub-features.
- **Deeply Nested Views (`views/<name>/hooks/<hook>.hook.ts`)**: Rejected to avoid cognitive fatigue and excessive folder depth on a fast-shipping product.
- **"modules" vs "domains" naming**: Selected "domains" to directly align with Domain-Driven Design terminology and project ubiquity.

## Consequences

- Domain cohesion is preserved: all queries, mutations, models, and shared components for a domain reside in one folder.
- Navigation remains fast and shallow (max 2 levels deep).
- Next.js route integration has a clear contract (`page.tsx` imports `*-page.tsx` and `*-loading.tsx`).
