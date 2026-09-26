import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProfileView } from "@/components/features/profile/profile-view";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileFallback } from "@/components/features/profile/profile-fallback";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/components/features/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/components/features/profile/query-options/get-profile.query-option.server";
import { getFavoriteOutfitsQueryOptionsForServer } from "@/components/features/profile/query-options/get-favorite-outfits.query-option.server";
import { getWishlistQueryOptionsForServer } from "@/components/features/profile/query-options/get-wishlist.query-option.server";
import { getTripsQueryOptionsForServer } from "@/components/features/profile/query-options/get-trips.query-option.server";

export default async function ProfilePage() {
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
  void queryClient.ensureQueryData(
    getFavoriteOutfitsQueryOptionsForServer(user.id),
  );
  void queryClient.ensureQueryData(
    getWishlistQueryOptionsForServer(user.id),
  );
  void queryClient.ensureQueryData(
    getTripsQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<ProfileFallback />}>
        <ProfileView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
