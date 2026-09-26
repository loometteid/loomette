import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { deleteWardrobeImages, pathFromPublicUrl } from "@/lib/wardrobeStorage";

export type DiscardItemEntry = {
  id: string;
  imageUrls?: (string | null | undefined)[];
};

export type DiscardWardrobeItemsVariables = {
  items: DiscardItemEntry[];
};

export const discardWardrobeItemsMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ items }: DiscardWardrobeItemsVariables): Promise<void> => {
      if (items.length === 0) return;
      const supabase = createBrowserSupabaseClient();
      const errors: string[] = [];

      await Promise.all(
        items.map(async (item) => {
          const { error } = await supabase.rpc("discard_wardrobe_item", {
            p_wardrobe_item_id: item.id,
          });
          if (error) errors.push(error.message);
        }),
      );

      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      // Best-effort storage cleanup — DB rows are already gone
      const paths = items
        .flatMap((item) => (item.imageUrls ?? []).map(pathFromPublicUrl))
        .filter((p): p is string => !!p);

      if (paths.length > 0) {
        deleteWardrobeImages(paths).catch(() => { });
      }
    },
  });
