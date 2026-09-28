import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type AddOutfitToCollectionInput = {
  outfitId: string;
};

export const addOutfitToCollectionMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ outfitId }: AddOutfitToCollectionInput) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("outfit")
        .update({ is_saved: true })
        .eq("id", outfitId);

      if (error) {
        throw error;
      }
    },
  });
