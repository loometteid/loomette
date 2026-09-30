import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type ApproveWardrobeItemsVariables = {
  itemIds: string[];
};

export const approveWardrobeItemsMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ itemIds }: ApproveWardrobeItemsVariables): Promise<void> => {
      if (itemIds.length === 0) return;
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("wardrobe_item")
        .update({ is_approved: true })
        .in("id", itemIds);

      if (error) throw error;
    },
  });
