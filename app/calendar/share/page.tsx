import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getAllOutfitsQueryOptionsForServer } from "@/domains/calendar/query-options/get-all-outfits.query-option.server";
import { ShareOotdView } from "@/domains/calendar/share-ootd-page";

export default async function ShareOotdPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  void queryClient.ensureQueryData(
    getAllOutfitsQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ShareOotdView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
