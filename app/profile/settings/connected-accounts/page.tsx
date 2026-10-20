import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ConnectedAccountsView } from "@/domains/profile/connected-accounts-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ConnectedAccountsFallback } from "@/domains/profile/connected-accounts-loading";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";

export default async function ConnectedAccountsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();

  // Populate user data into server queryClient cache
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <Suspense fallback={<ConnectedAccountsFallback />}>
      <ConnectedAccountsView initialUser={user} />
    </Suspense>
  );
}
