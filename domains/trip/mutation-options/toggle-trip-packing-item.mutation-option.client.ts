import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type ToggleTripPackingItemInput = {
  id: string;
  userId: string;
  isPacked: boolean;
};

export const toggleTripPackingItemMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      id,
      userId,
      isPacked,
    }: ToggleTripPackingItemInput): Promise<void> => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("trip_packing_item")
        .update({
          is_packed: isPacked,
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    },
  });
