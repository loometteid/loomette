import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/domains/profile/query-options/get-profile.query-option.server";
import { getOutfitsByDateQueryOptionsForServer } from "@/domains/calendar/query-options/get-outfits-by-date.query-option.server";
import { OutfitDetailsView } from "@/domains/calendar/outfit-details-page";
import { OutfitDetailsFallback } from "@/domains/calendar/outfit-details-loading";

export default async function OutfitDetailsDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
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
    getOutfitsByDateQueryOptionsForServer(user.id, date),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DesktopNav userId={user.id} />
      <HydrationBoundary state={dehydratedQueryClient}>
        <Suspense fallback={<OutfitDetailsFallback />}>
          <OutfitDetailsView userId={user.id} date={date} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
