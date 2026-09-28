import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MixAndMatchCanvas } from "@/components/features/mix-and-match/canvas";
import { MixAndMatchFallback } from "@/components/features/mix-and-match/mix-and-match-fallback";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/components/features/profile/query-options/get-user.query-option";
import { getMixAndMatchOptionsQueryOptionsForServer } from "@/components/features/mix-and-match/query-options/get-mix-and-match-options.query-option.server";

export default async function MixAndMatchPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getServerQueryClient();

  // Populate user data
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  // Prefetch wardrobe options for canvas
  void queryClient.ensureQueryData(
    getMixAndMatchOptionsQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<MixAndMatchFallback />}>
        <MixAndMatchCanvas userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
