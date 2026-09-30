import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { HomeView } from "@/domains/home/home-page";
import { HomeFallback } from "@/domains/home/home-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/domains/profile/query-options/get-profile.query-option.server";
import { getWardrobeItemsQueryOptionsForServer } from "@/domains/wardrobe/query-options/get-wardrobe-items.query-option.server";
import { getLooksCountQueryOptionsForServer } from "@/domains/home/query-options/get-looks-count.query-option.server";

export default async function HomePage() {
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

  // Prefetch home data (unawaited promises per requirements)
  void queryClient.ensureQueryData(
    getProfileQueryOptionsForServer(user.id),
  );
  void queryClient.ensureQueryData(
    getWardrobeItemsQueryOptionsForServer(user.id),
  );
  void queryClient.ensureQueryData(
    getLooksCountQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<HomeFallback />}>
        <HomeView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
