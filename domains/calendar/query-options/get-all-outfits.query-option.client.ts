import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { DiaryOutfitItem } from "../types";

export type OutfitHistoryItem = {
  id: string;
  name: string;
  addedAt: string;
  isSaved: boolean;
  wearCount: number;
  coverImageUrl: string | null;
  items: DiaryOutfitItem[];
};

export const getAllOutfitsQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["calendar", "all-outfits", userId] as const,
    queryFn: async (): Promise<OutfitHistoryItem[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("outfit")
        .select(
          "id, name, is_saved, added_at, cover_image_url, wear_count, outfit_item(layer_order, position_x, position_y, wardrobe_item:wardrobe_item_id(id, item:item_id(item_id, name, image_url)))",
        )
        .eq("user_id", userId)
        .order("added_at", { ascending: false });

      if (error) {
        throw error;
      }

      type RawOutfitRow = {
        id: string;
        name: string | null;
        is_saved: boolean | null;
        added_at: string | null;
        cover_image_url: string | null;
        wear_count: number | null;
        outfit_item:
          | {
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
            }[]
          | null;
      };

      const rows = (data ?? []) as unknown as RawOutfitRow[];
      return rows.map((row) => ({
        id: row.id,
        name: row.name || "My Look",
        addedAt: row.added_at || new Date().toISOString(),
        isSaved: row.is_saved ?? false,
        wearCount: row.wear_count ?? 0,
        coverImageUrl: row.cover_image_url,
        items: (row.outfit_item ?? [])
          .filter((oi) => oi.wardrobe_item?.item)
          .map((oi) => ({
            id: oi.wardrobe_item!.id,
            image_url: oi.wardrobe_item!.item!.image_url,
            name: oi.wardrobe_item!.item!.name,
            x: oi.position_x ?? 0.5,
            y: oi.position_y ?? 0.5,
            layerOrder: oi.layer_order ?? 0,
          })),
      }));
    },
  });
