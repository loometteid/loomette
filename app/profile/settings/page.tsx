import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SettingsView } from "@/components/features/profile/settings-view";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SettingsFallback } from "@/components/features/profile/settings-fallback";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/components/features/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/components/features/profile/query-options/get-profile.query-option.server";

export default async function SettingsPage() {
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

  // Prefetch profile data
  void queryClient.ensureQueryData(
    getProfileQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<SettingsFallback />}>
        <SettingsView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
