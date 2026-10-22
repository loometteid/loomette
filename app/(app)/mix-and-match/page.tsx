import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MixAndMatchCanvas } from "@/domains/mix-and-match/mix-and-match-page";
import { MixAndMatchFallback } from "@/domains/mix-and-match/mix-and-match-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getMixAndMatchOptionsQueryOptionsForServer } from "@/domains/mix-and-match/query-options/get-mix-and-match-options.query-option.server";

export default async function MixAndMatchPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();

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
