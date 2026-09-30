import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CalendarView } from "@/domains/calendar/calendar-page";
import { CalendarFallback } from "@/domains/calendar/calendar-loading";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { todayParts } from "@/domains/calendar/date-utils";
import { getDiaryEntriesQueryOptionsForServer } from "@/domains/calendar/query-options/get-diary-entries.query-option.server";

export default async function CalendarPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getServerQueryClient();

  // populate user data so the user is not arbitrarily logged out
  // which is a very weird behavior
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user)

  // prefetch diary entries
  const { year, month } = todayParts();
  void queryClient.ensureQueryData(
    getDiaryEntriesQueryOptionsForServer(user.id, year, month),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<CalendarFallback />}>
        <CalendarView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
