import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProfileView } from "@/domains/profile/profile-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileFallback } from "@/domains/profile/profile-loading";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/domains/profile/query-options/get-profile.query-option.server";
import { getFavoriteOutfitsQueryOptionsForServer } from "@/domains/profile/query-options/get-favorite-outfits.query-option.server";
import { getWishlistQueryOptionsForServer } from "@/domains/profile/query-options/get-wishlist.query-option.server";
import { getTripsQueryOptionsForServer } from "@/domains/profile/query-options/get-trips.query-option.server";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();

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
