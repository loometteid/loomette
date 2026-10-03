import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { StepOneForm } from "@/domains/onboarding/step-one-page";
import { OnboardingFallback } from "@/domains/onboarding/onboarding-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getOnboardingProfileQueryOptionsForServer } from "@/domains/onboarding/query-options/get-onboarding-profile.query-option.server";
import Link from "next/link";

export default async function OnboardingStepOnePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/welcome");
  }

  const queryClient = getServerQueryClient();

  // Seed authenticated user data into query cache
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  // Use query options to verify whether user is already onboarded
  const profile = await queryClient.fetchQuery(
    getOnboardingProfileQueryOptionsForServer(user.id),
  );

  if (profile?.display_name && profile?.gender) {
    redirect("/onboarding/7");
  }

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
