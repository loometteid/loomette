import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { EditItemForm } from "@/domains/wardrobe/edit-wardrobe-item-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EditItemFallback } from "@/domains/wardrobe/edit-wardrobe-item-loading";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getWardrobeItemByIdQueryOptionsForServer } from "@/domains/wardrobe/query-options/get-wardrobe-item-by-id.query-option.server";
import { getUserGenderQueryOptionsForServer } from "@/domains/wardrobe/query-options/get-user-gender.query-option.server";
import { getProfileQueryOptionsForServer } from "@/domains/profile/query-options/get-profile.query-option.server";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  // Prefetch item by id and user gender
  void queryClient.ensureQueryData(
    getWardrobeItemByIdQueryOptionsForServer(user.id, id),
  );

  void queryClient.ensureQueryData(
    getUserGenderQueryOptionsForServer(user.id),
  );
  void queryClient.ensureQueryData(
    getProfileQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<EditItemFallback />}>
        <EditItemForm userId={user.id} id={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
