import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { generateOutfitName } from "@/lib/outfitNames";
import type { CanvasItem } from "../types";

export type SaveOutfitInput = {
  userId: string;
  items: CanvasItem[];
  tripId?: string | null;
  tripDay?: string | null;
};

export const saveOutfitMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      userId,
      items,
      tripId,
      tripDay,
    }: SaveOutfitInput): Promise<{ outfitId: string }> => {
      const supabase = createBrowserSupabaseClient();

      const topItem = [...items].sort((a, b) => b.layerOrder - a.layerOrder)[0];

      const { data: outfitRow, error: outfitError } = await supabase
        .from("outfit")
        .insert({
          user_id: userId,
          name: generateOutfitName(),
          is_saved: false,
          cover_image_url: topItem?.image_url ?? null,
        })
        .select("id")
        .single();

      if (outfitError || !outfitRow) {
        throw outfitError ?? new Error("Failed to create outfit");
      }

      const { error: itemsError } = await supabase.from("outfit_item").insert(
        items.map((item) => ({
          outfit_id: outfitRow.id,
          wardrobe_item_id: item.wardrobeItemId,
          layer_order: item.layerOrder,
          position_x: item.x,
          position_y: item.y,
        })),
      );

      if (itemsError) {
        throw itemsError;
      }

      if (tripId && tripDay) {
        // NOTE: sequential insert is non-atomic; if wear_log insert fails, the outfit row
        // is created but unlinked to the trip. Consider a transactional DB RPC function in the future.
        const { error: wearLogError } = await supabase.from("wear_log").insert({
          user_id: userId,
          outfit_id: outfitRow.id,
          worn_on: tripDay,
        });

        if (wearLogError) {
          throw wearLogError;
        }
      }

      return { outfitId: outfitRow.id };
    },
  });
