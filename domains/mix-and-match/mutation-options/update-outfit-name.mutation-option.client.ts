import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type UpdateOutfitNameInput = {
  outfitId: string;
  name: string;
};

export const updateOutfitNameMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ outfitId, name }: UpdateOutfitNameInput) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("outfit")
        .update({ name })
        .eq("id", outfitId);

      if (error) {
        throw error;
      }
    },
  });
