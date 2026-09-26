import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { WardrobeView } from "@/components/features/wardrobe/wardrobe-view";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { WardrobeFallback } from "@/components/features/wardrobe/wardrobe-fallback";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/components/features/profile/query-options/get-user.query-option";
import { getWardrobeItemsQueryOptionsForServer } from "@/components/features/wardrobe/query-options/get-wardrobe-items.query-option.server";
import { getPendingWardrobeCountQueryOptionsForServer } from "@/components/features/wardrobe/query-options/get-pending-count.query-option.server";
import { getUserGenderQueryOptionsForServer } from "@/components/features/wardrobe/query-options/get-user-gender.query-option.server";

export default async function WardrobePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getServerQueryClient();

  // Populate user query cache to prevent premature logout
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  // Prefetch wardrobe data in parallel on server
  void queryClient.ensureQueryData(getWardrobeItemsQueryOptionsForServer(user.id));
  void queryClient.ensureQueryData(getPendingWardrobeCountQueryOptionsForServer(user.id));
  void queryClient.ensureQueryData(getUserGenderQueryOptionsForServer(user.id));

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<WardrobeFallback />}>
        <WardrobeView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
