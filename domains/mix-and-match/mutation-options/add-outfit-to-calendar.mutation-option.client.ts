import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type AddOutfitToCalendarInput = {
  userId: string;
  outfitId: string;
  wornOn: string;
};

export const addOutfitToCalendarMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      userId,
      outfitId,
      wornOn,
    }: AddOutfitToCalendarInput) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from("wear_log").insert({
        user_id: userId,
        outfit_id: outfitId,
        worn_on: wornOn,
      });

      if (error) {
        throw error;
      }
    },
  });
