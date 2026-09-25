import { redirect } from "next/navigation";
import { ApprovalQueue } from "@/components/features/wardrobe/approval-queue";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PendingItem } from "@/components/features/wardrobe/types";

export default async function ApprovalPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [{ data: rows }, { data: profile }] = await Promise.all([
    supabase
      .from("wardrobe_item")
      .select(
        "id, created_at, size, price, purchase_location, occasions, image_url, item:item_id(item_id, name, category, subcategory, brand, color, image_url)",
      )
      .eq("user_id", user.id)
      .eq("is_approved", false)
      .order("created_at", { ascending: false })
      .returns<PendingItem[]>(),
    supabase.from("user").select("gender").eq("user_id", user.id).single(),
  ]);

  return <ApprovalQueue items={rows ?? []} gender={profile?.gender ?? null} />;
}
