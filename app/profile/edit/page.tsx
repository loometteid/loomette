import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { EditProfileForm } from "@/components/features/profile/edit-profile-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EditProfileFallback } from "@/components/features/profile/edit-profile-fallback";
import { getServerQueryClient } from "@/lib/tanstack-query/server";
import { getUserQueryOptions } from "@/components/features/profile/query-options/get-user.query-option";
import { getProfileQueryOptionsForServer } from "@/components/features/profile/query-options/get-profile.query-option.server";

export default async function EditProfilePage() {
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
      <Suspense fallback={<EditProfileFallback />}>
        <EditProfileForm userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
