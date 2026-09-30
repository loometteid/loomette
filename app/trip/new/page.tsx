import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { EditTripForm } from "@/domains/trip/edit-trip-page";
import { EditTripFallback } from "@/domains/trip/edit-trip-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";

export default async function NewTripPage() {
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

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<EditTripFallback />}>
        <EditTripForm userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
