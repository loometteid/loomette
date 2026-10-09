import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AddInitialItem } from "@/domains/onboarding/step-seven-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getOnboardingProfileQueryOptionsForServer } from "@/domains/onboarding/query-options/get-onboarding-profile.query-option.server";
import { getWardrobeItemsQueryOptionsForServer } from "@/domains/wardrobe/query-options/get-wardrobe-items.query-option.server";

export default async function OnboardingStepSevenPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/waitlist");
  }

  // A returning user who already has a wardrobe item has effectively
  // finished onboarding -- every sign-in path (password, OAuth, email
  // OTP) lands here via /onboarding/1's own "profile already complete"
  // bounce, so this one check is enough to skip the upload screen for
  // all of them without duplicating it at each entry point. Counting
  // any row regardless of `is_approved`: the upload flow creates the
  // row before the user ever reaches the approval queue, so gating on
  // approval would send someone who just uploaded straight back here.
  const { count } = await supabase
    .from("wardrobe_item")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) {
    redirect("/home");
  }

  const queryClient = getQueryClient();

  // Seed authenticated user data into query cache
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  // Unawaited prefetch (tanstack-query-patterns rule 3)
  void queryClient.ensureQueryData(
    getOnboardingProfileQueryOptionsForServer(user.id),
  );
  void queryClient.ensureQueryData(
    getWardrobeItemsQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={null}>
        <AddInitialItem userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
