import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { NotificationsView } from "@/domains/home/notifications-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getNotificationsQueryOptionsForServer } from "@/domains/home/query-options/get-notifications.query-option.server";

export default async function NotificationsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const queryClient = getQueryClient();
  queryClient.setQueryData(getUserQueryOptions().queryKey, () => user);

  void queryClient.ensureQueryData(
    getNotificationsQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <NotificationsView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
