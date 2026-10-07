import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ApprovalQueue } from "@/domains/wardrobe/wardrobe-approval-page";
import { ApprovalFallback } from "@/domains/wardrobe/wardrobe-approval-loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQueryClient } from "@/lib/tanstack-query";
import { getUserQueryOptions } from "@/domains/profile/query-options/get-user.query-option";
import { getPendingWardrobeItemsQueryOptionsForServer } from "@/domains/wardrobe/query-options/get-pending-items.query-option.server";
import { getUserGenderQueryOptionsForServer } from "@/domains/wardrobe/query-options/get-user-gender.query-option.server";

export default async function ApprovalPage() {
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

  // Prefetch pending items and gender
  void queryClient.ensureQueryData(
    getPendingWardrobeItemsQueryOptionsForServer(user.id),
  );
  void queryClient.ensureQueryData(
    getUserGenderQueryOptionsForServer(user.id),
  );

  const dehydratedQueryClient = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedQueryClient}>
      <Suspense fallback={<ApprovalFallback />}>
        <ApprovalQueue userId={user.id} />
      </Suspense>
    </HydrationBoundary>
  );
}
