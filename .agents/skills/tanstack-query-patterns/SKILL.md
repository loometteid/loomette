---
name: tanstack-query-patterns
description: Enforces Next.js App Router and TanStack Query architecture conventions including strict server/browser split, unawaited prefetching, Suspense boundaries, and mutation invalidation.
---

# TanStack Query Patterns & Conventions

This skill provides rules, patterns, and boilerplate for implementing data fetching and mutations with `@tanstack/react-query` in Next.js App Router.

---

## 1. Strict Server/Browser Query Split

Every query option **MUST** be split into two separate files under `components/features/<feature>/query-options/`:
1. `*.query-option.client.ts`: Uses `createBrowserSupabaseClient()` from `@/lib/supabase/client`.
2. `*.query-option.server.ts`: Uses `createServerSupabaseClient()` from `@/lib/supabase/server`.

### Rules
- **Query Keys**: Always suffix query keys with `as const` (e.g., `["feature", "items", userId] as const`).
- **Stale Time**: Default to 5 minutes (`staleTime: 1000 * 60 * 5`).
- Keys must match identically between `.client.ts` and `.server.ts`.

### Client Example (`get-items.query-option.client.ts`)
```ts
import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import type { Item } from "../types";

export const getItemsQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["feature", "items", userId] as const,
    queryFn: async (): Promise<Item[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("item")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        const logger = getLogger(["query", "feature"]);
        logger.error("Error fetching items in getItemsQueryOptionsForBrowser: {errorMessage}", {
          errorMessage: error.message,
          error,
          userId,
        });
        return [];
      }
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
```

### Server Example (`get-items.query-option.server.ts`)
```ts
import { queryOptions } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLogger } from "@/lib/logging";
import type { Item } from "../types";

export const getItemsQueryOptionsForServer = (userId: string) =>
  queryOptions({
    queryKey: ["feature", "items", userId] as const,
    queryFn: async (): Promise<Item[]> => {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("item")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        const logger = getLogger(["query", "feature"]);
        logger.error("Error fetching items in getItemsQueryOptionsForServer: {errorMessage}", {
          errorMessage: error.message,
          error,
          userId,
        });
        return [];
      }
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
```

---

## 2. Required Page Route Boilerplate (RSC)

Every data-driven page (`app/(app)/<feature>/page.tsx`) must implement all four steps:

1. **Authentication Check**: Verify session using `createServerSupabaseClient()`, redirecting unauthenticated users to `/sign-in`.
2. **User Seed**: Seed user data into cache via `queryClient.setQueryData(getUserQueryOptions().queryKey, () => user)`.
3. **Unawaited Server Prefetch**: Initiate background prefetching with `void queryClient.ensureQueryData(...)`.
4. **Hydration & Suspense Boundary**: Wrap view component inside `<HydrationBoundary state={dehydratedState}>` with `<Suspense fallback={<FeatureFallback />}>`.

```tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { FeatureView } from "@/components/features/<feature>/feature-view";
import { FeatureFallback } from "@/components/features/<feature>/feature-fallback";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/components/features/profile/query-options/get-user.query-option";
import { getItemsQueryOptionsForServer } from "@/components/features/<feature>/query-options/get-items.query-option.server";

export default async function FeaturePage() {
  // 1. Session check
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getServerQueryClient();

  // 2. User seed
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  // 3. Unawaited prefetch (MUST NOT await)
  void queryClient.ensureQueryData(getItemsQueryOptionsForServer(user.id));

  // 4. Dehydrate & Stream Suspense
  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<FeatureFallback />}>
        <FeatureView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
```

---

## 3. Strict Anti-Pattern: No `await queryClient.ensureQueryData`

> [!CAUTION]
> **NEVER** `await queryClient.ensureQueryData(...)` in page components.
>
> Awaiting blocks the entire React Server Component render, eliminates streaming advantages, and delays Time-to-First-Byte (TTFB). Always prefix prefetch calls with `void` to allow concurrent execution and instant fallback streaming.

```ts
// ❌ FORBIDDEN
await queryClient.ensureQueryData(getProfileQueryOptionsForServer(user.id));

// ✅ REQUIRED
void queryClient.ensureQueryData(getProfileQueryOptionsForServer(user.id));
```

---

## 4. Client View Consumption

Client components use `useSuspenseQuery` with browser query options:

```tsx
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getItemsQueryOptionsForBrowser } from "./query-options/get-items.query-option.client";

export function FeatureView({ userId }: { userId: string }) {
  const { data: items } = useSuspenseQuery(
    getItemsQueryOptionsForBrowser(userId)
  );

  return (
    <div>
      {items.map((item) => (
        <span key={item.id}>{item.name}</span>
      ))}
    </div>
  );
}
```

---

## 5. Mutation & Cache Invalidation Pattern (Option A)

- Define mutations under `components/features/<feature>/mutation-options/`.
- Invalidation logic **lives directly in the mutation hook definition or caller** (`onSuccess`).
- Target explicit query keys using existing query option instances.

```ts
// components/features/<feature>/mutation-options/update-item.mutation-option.client.ts
import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export const updateItemMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("item")
        .update({ name })
        .eq("id", id);

      if (error) throw error;
    },
  });
```

### Invalidation in Component
```tsx
const queryClient = useQueryClient();

const updateMutation = useMutation({
  ...updateItemMutationOptions(),
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: getItemsQueryOptionsForBrowser(userId).queryKey,
    });
    toast.success("Saved");
  },
  onError: (err) => {
    toast.error(err instanceof Error ? err.message : "Failed to update");
  },
});
```

---

## 6. Loading State Standard for Mutations

- **Do NOT** wrap mutations in React's `useTransition`.
- Rely directly on `useMutation`'s built-in `isPending` state for button disabling and loading indicators:

```tsx
<Button type="button" onClick={handleSave} disabled={updateMutation.isPending}>
  {updateMutation.isPending ? "Saving…" : "Save"}
</Button>
```
