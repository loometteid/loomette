import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type SaveOutfitDiaryEntryVariables = {
  userId: string;
  previewUrl: string;
  wornOn: string;
};

export type SaveOutfitDiaryEntryResult = {
  wearLogId: string;
  outfitId: string;
  coverImageUrl: string;
  wornOn: string;
};

export const saveOutfitDiaryEntryMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      userId,
      previewUrl,
      wornOn,
    }: SaveOutfitDiaryEntryVariables): Promise<SaveOutfitDiaryEntryResult> => {
      const supabase = createBrowserSupabaseClient();


      const { data: outfitRow, error: outfitError } = await supabase
        .from("outfit")
        .insert({
          user_id: userId,
          cover_image_url: previewUrl,
          is_saved: true,
        })
        .select("id, cover_image_url")
        .single();

      if (outfitError) throw outfitError;

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
      };
    },
  });
