import { HomeView } from "@/components/features/home/home-view";
import type { FavoriteItem } from "@/components/features/home/types";
import type { StyleTag } from "@/lib/styleTags";
import { createClient } from "@/lib/supabase/server";

type WardrobeRow = {
  id: string;
  wear_count: number | null;
  created_at: string;
  item: {
    item_id: string;
    name: string | null;
    category: string | null;
    image_url: string | null;
  } | null;
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: wardrobeRows }, { count: looksCount }] =
    await Promise.all([
      supabase
        .from("user")
        .select("display_name, profile_photo, style_tags")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("wardrobe_item")
        .select(
          "id, wear_count, created_at, item:item_id(item_id, name, category, image_url)",
        )
        .eq("user_id", user.id)
        .eq("is_approved", true)
        .order("wear_count", { ascending: false })
        .order("created_at", { ascending: false })
        .returns<WardrobeRow[]>(),
      supabase
        .from("outfit")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_saved", true),
    ]);

  const rows = wardrobeRows ?? [];

  // Rows are already ordered wear_count desc, created_at desc, so the
  // first match per category is "the favorite" -- most-worn, falling
  // back to most-recently-added when nothing has been worn yet.
  function favoriteIn(category: string): FavoriteItem | null {
    const row = rows.find((r) => r.item?.category === category);
    if (!row?.item) return null;
    return {
      id: row.item.item_id,
      name: row.item.name,
      category: row.item.category,
      image_url: row.item.image_url,
    };
  }

  const categoryCounts = new Map<string, number>();
  for (const row of rows) {
    const category = row.item?.category;
    if (!category) continue;
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }
  let topCategory: string | null = null;
  let topCategoryCount = 0;
  for (const [category, count] of categoryCounts) {
    if (count > topCategoryCount) {
      topCategory = category;
      topCategoryCount = count;
    }
  }

  return (
    <HomeView
      displayName={profile?.display_name ?? null}
      profilePhoto={profile?.profile_photo ?? null}
      styleTags={(profile?.style_tags ?? []) as StyleTag[]}
      favoriteTop={favoriteIn("Tops")}
      favoriteBottom={favoriteIn("Bottoms")}
      topCategory={topCategory}
      looksCount={looksCount ?? 0}
    />
  );
}
