import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { StepFiveForm } from "@/domains/onboarding/step-five-page";
import { OnboardingFallback } from "@/domains/onboarding/onboarding-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getOnboardingProfileQueryOptionsForServer } from "@/domains/onboarding/query-options/get-onboarding-profile.query-option.server";

export default async function OnboardingStepFivePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/welcome");
  }

  const queryClient = getQueryClient();

  // Seed user data
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  // Unawaited prefetch (tanstack-query-patterns rule 3)
  void queryClient.ensureQueryData(
    getOnboardingProfileQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<OnboardingFallback step={5} />}>
        <StepFiveForm userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
