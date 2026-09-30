import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TripDetailView } from "@/domains/trip/trip-detail-page";
import { TripDetailFallback } from "@/domains/trip/trip-detail-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getTripDetailQueryOptionsForServer } from "@/domains/trip/query-options/get-trip-detail.query-option.server";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getServerQueryClient();

  // Populate user data
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  // Prefetch trip detail
  void queryClient.ensureQueryData(
    getTripDetailQueryOptionsForServer(user.id, id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<TripDetailFallback />}>
        <TripDetailView userId={user.id} tripId={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
