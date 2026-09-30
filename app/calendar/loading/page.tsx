import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { OutfitLoading } from "@/domains/calendar/outfit-approval-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";

export default async function CalendarLoadingPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getServerQueryClient();
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);
  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <OutfitLoading />
    </HydrationBoundary>
  );
}
