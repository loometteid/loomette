import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopNav, DesktopNavFallback } from "@/components/layout/desktop-nav";
import { UploadJobsNotifier } from "@/components/layout/upload-jobs-notifier";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/domains/profile/query-options/get-profile.query-option.server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <UploadJobsNotifier userId={user.id} />
      <Suspense fallback={<DesktopNavFallback />}>
        <DesktopNav userId={user.id} />
      </Suspense>
      <div className="flex min-h-full flex-1 flex-col pb-24 lg:pb-8">
        {children}
      </div>
      <BottomNav />
    </HydrationBoundary>
  );
}
