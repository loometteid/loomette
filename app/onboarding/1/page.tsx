import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { StepOneForm } from "@/domains/onboarding/step-one-page";
import { OnboardingFallback } from "@/domains/onboarding/onboarding-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getOnboardingProfileQueryOptionsForServer } from "@/domains/onboarding/query-options/get-onboarding-profile.query-option.server";
import Link from "next/link";

export default async function OnboardingStepOnePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/waitlist");
  }

  const queryClient = getQueryClient();

  // Seed authenticated user data into query cache
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  // Unawaited prefetch (tanstack-query-patterns rule 3)
  void queryClient.ensureQueryData(
    getOnboardingProfileQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<OnboardingFallback step={1} />}>
        <Link href="/onboarding/2" prefetch />
        <StepOneForm userId={user.id} email={user.email ?? ""} />
      </Suspense>
    </HydrationBoundary>
  );
}
