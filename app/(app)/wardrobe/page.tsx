import { WardrobeView } from "@/components/features/wardrobe/wardrobe-view";
import { createClient } from "@/lib/supabase/server";
import type { WardrobeItem } from "@/components/features/wardrobe/types";

export default async function WardrobePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: rows }, { count: pendingCount }, { data: profile }] =
    await Promise.all([
      supabase
        .from("wardrobe_item")
        .select(
          "id, created_at, wear_count, occasions, item:item_id(item_id, name, category, subcategory, brand, color, image_url)",
        )
        .eq("user_id", user.id)
        .eq("is_approved", true)
        .returns<WardrobeItem[]>(),
      supabase
        .from("wardrobe_item")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_approved", false),
      supabase.from("user").select("gender").eq("user_id", user.id).single(),
    ]);

  return (
    <WardrobeView
      items={rows ?? []}
      pendingCount={pendingCount ?? 0}
      gender={profile?.gender ?? null}
    />
  );
}
