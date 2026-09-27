import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MixAndMatchResult } from "@/components/features/mix-and-match/result-view";
import { MixAndMatchResultFallback } from "@/components/features/mix-and-match/result-fallback";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/components/features/profile/query-options/get-user.query-option";
import { getOutfitResultQueryOptionsForServer } from "@/components/features/mix-and-match/query-options/get-outfit-result.query-option.server";

export default async function MixAndMatchResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  // Prefetch outfit result data
  void queryClient.ensureQueryData(
    getOutfitResultQueryOptionsForServer(user.id, id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<MixAndMatchResultFallback />}>
        <MixAndMatchResult userId={user.id} outfitId={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
