import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PricingView } from "@/domains/profile/pricing-page";
import { PricingFallback } from "@/domains/profile/pricing-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/domains/profile/query-options/get-profile.query-option.server";
import { getSubscriptionQueryOptionsForServer } from "@/domains/profile/query-options/get-subscription.query-option.server";

export default async function PricingPage() {
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
  void queryClient.ensureQueryData(getSubscriptionQueryOptionsForServer(user.id));

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<PricingFallback />}>
        <PricingView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
