import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/domains/profile/query-options/get-profile.query-option.server";
import { getWardrobeItemsQueryOptionsForServer } from "@/domains/wardrobe/query-options/get-wardrobe-items.query-option.server";
import { RecommendationPageView } from "@/domains/home/recommendation-page";
import { RecommendationFallback } from "@/domains/home/recommendation-loading";

export default async function RecommendationPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  void queryClient.ensureQueryData(getProfileQueryOptionsForServer(user.id));
  void queryClient.ensureQueryData(
    getWardrobeItemsQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<RecommendationFallback />}>
        <RecommendationPageView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
