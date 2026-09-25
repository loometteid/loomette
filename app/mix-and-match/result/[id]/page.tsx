import { notFound, redirect } from "next/navigation";
import { MixAndMatchResult } from "@/components/features/mix-and-match/result-view";
import type { ResultItem } from "@/components/features/mix-and-match/result-types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type OutfitItemRow = {
  layer_order: number | null;
  position_x: number | null;
  position_y: number | null;
  wardrobe_item: {
    id: string;
    item: {
      item_id: string;
      name: string | null;
      image_url: string | null;
    } | null;
  } | null;
};

export default async function MixAndMatchResultPage({
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

  const { data: outfit } = await supabase
    .from("outfit")
    .select("id, name, user_id, is_saved")
    .eq("id", id)
    .single();

  if (!outfit || outfit.user_id !== user.id) {
    notFound();
  }

  const { data: rows } = await supabase
    .from("outfit_item")
    .select(
      "layer_order, position_x, position_y, wardrobe_item:wardrobe_item_id(id, item:item_id(item_id, name, image_url))",
    )
    .eq("outfit_id", id)
    .returns<OutfitItemRow[]>();

  const items: ResultItem[] = (rows ?? [])
    .filter((row) => row.wardrobe_item)
    .map((row) => ({
      id: row.wardrobe_item!.id,
      name: row.wardrobe_item!.item?.name ?? null,
      image_url: row.wardrobe_item!.item?.image_url ?? null,
      x: row.position_x ?? 0.5,
      y: row.position_y ?? 0.5,
      layerOrder: row.layer_order ?? 0,
    }));

  return (
    <MixAndMatchResult
      outfitId={outfit.id}
      initialName={outfit.name}
      initialIsSaved={outfit.is_saved ?? false}
      items={items}
    />
  );
}
