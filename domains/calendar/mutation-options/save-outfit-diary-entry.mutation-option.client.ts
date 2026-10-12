import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { CompositionItem } from "@/domains/outfit/components/outfit-composition";

export type SaveOutfitDiaryEntryVariables = {
  userId: string;
  previewUrl: string;
  wornOn: string;
  name?: string;
  items?: CompositionItem[];
};

export type SaveOutfitDiaryEntryResult = {
  wearLogId: string;
  outfitId: string;
  coverImageUrl: string;
  wornOn: string;
  name?: string | null;
};

export const saveOutfitDiaryEntryMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      userId,
      previewUrl,
      wornOn,
      name,
      items,
    }: SaveOutfitDiaryEntryVariables): Promise<SaveOutfitDiaryEntryResult> => {
      const supabase = createBrowserSupabaseClient();

      const { data: outfitRow, error: outfitError } = await supabase
        .from("outfit")
        .insert({
          user_id: userId,
          cover_image_url: previewUrl,
          is_saved: true,
          name: name ?? null,
        })
        .select("id, cover_image_url, name")
        .single();

      if (outfitError) throw outfitError;

      if (items && items.length > 0) {
        const { error: itemsError } = await supabase.from("outfit_item").insert(
          items.map((item) => ({
            outfit_id: outfitRow.id,
            wardrobe_item_id: item.id,
            layer_order: item.layerOrder,
            position_x: item.x,
            position_y: item.y,
          })),
        );

        if (itemsError) throw itemsError;
      }

      const { data: wearLogRow, error: wearLogError } = await supabase
        .from("wear_log")
        .insert({
          user_id: userId,
          outfit_id: outfitRow.id,
          worn_on: wornOn,
        })
        .select("id, worn_on")
        .single();

      if (wearLogError) throw wearLogError;

      return {
        wearLogId: wearLogRow.id,
        outfitId: outfitRow.id,
        coverImageUrl: outfitRow.cover_image_url ?? previewUrl,
        wornOn: wearLogRow.worn_on,
        name: outfitRow.name,
      };
    },
  });
