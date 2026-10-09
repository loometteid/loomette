import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { StepSixComplete } from "@/domains/onboarding/step-six-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";

export default async function OnboardingStepSixPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/waitlist");
  }

  const queryClient = getQueryClient();

  // Seed user data
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <StepSixComplete />
    </HydrationBoundary>
  );
}
