import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/domains/profile/query-options/get-profile.query-option.server";
import { getFavoriteOutfitsQueryOptionsForServer } from "@/domains/profile/query-options/get-favorite-outfits.query-option.server";
import { SocialProfileView } from "@/domains/profile/social-profile-page";
import { SocialProfileFallback } from "@/domains/profile/social-profile-loading";

export default async function SocialProfilePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

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
  void queryClient.ensureQueryData(
    getFavoriteOutfitsQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<SocialProfileFallback />}>
        <SocialProfileView userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
