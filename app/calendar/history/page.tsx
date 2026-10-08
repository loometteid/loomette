import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/domains/profile/query-options/get-profile.query-option.server";
import { getAllOutfitsQueryOptionsForServer } from "@/domains/calendar/query-options/get-all-outfits.query-option.server";
import { OutfitHistoryView } from "@/domains/calendar/outfit-history-page";
import { OutfitHistoryFallback } from "@/domains/calendar/outfit-history-loading";

export default async function OutfitHistoryPage() {
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
    getAllOutfitsQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DesktopNav userId={user.id} />
      <HydrationBoundary state={dehydratedQueryClient}>
        <Suspense fallback={<OutfitHistoryFallback />}>
          <OutfitHistoryView userId={user.id} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
