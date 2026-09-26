import { redirect } from "next/navigation";
import { MixAndMatchCanvas } from "@/components/features/mix-and-match/canvas";
import type { WardrobeOption } from "@/components/features/mix-and-match/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type WardrobeRow = {
  id: string;
  item: {
    item_id: string;
    name: string | null;
    category: string | null;
    subcategory: string | null;
    image_url: string | null;
  } | null;
};

export default async function MixAndMatchPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: rows } = await supabase
    .from("wardrobe_item")
    .select("id, item:item_id(item_id, name, category, subcategory, image_url)")
    .eq("user_id", user.id)
    .eq("is_approved", true)
    .returns<WardrobeRow[]>();

  const wardrobeOptions: WardrobeOption[] = (rows ?? [])
    .filter((row) => row.item?.category && row.item?.subcategory)
    .map((row) => ({
      wardrobeItemId: row.id,
      itemId: row.item!.item_id,
      name: row.item!.name,
      category: row.item!.category!,
      subcategory: row.item!.subcategory!,
      image_url: row.item!.image_url,
    }));

  return <MixAndMatchCanvas userId={user.id} wardrobeOptions={wardrobeOptions} />;
}
