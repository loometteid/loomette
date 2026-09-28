import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { EditTripForm } from "@/components/features/trip/edit-trip-form";
import { EditTripFallback } from "@/components/features/trip/edit-trip-fallback";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/components/features/profile/query-options/get-user.query-option";
import { getTripByIdQueryOptionsForServer } from "@/components/features/trip/query-options/get-trip-by-id.query-option.server";

export default async function EditTripPage({
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

  // Prefetch trip by id
  void queryClient.ensureQueryData(
    getTripByIdQueryOptionsForServer(user.id, id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<EditTripFallback />}>
        <EditTripForm userId={user.id} tripId={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
