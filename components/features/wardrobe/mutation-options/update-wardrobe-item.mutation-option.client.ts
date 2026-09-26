import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Occasion, OutfitSize } from "../types";

export type UpdateWardrobeItemVariables = {
  wardrobeItemId: string;
  itemId?: string | null;
  name?: string | null;
  brand?: string | null;
  category?: string | null;
  subcategory?: string | null;
  color?: string | null;
  size?: OutfitSize | null;
  occasions?: Occasion[] | null;
  price?: number | null;
  purchaseLocation?: string | null;
};

export const updateWardrobeItemMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      wardrobeItemId,
      itemId,
      name,
      brand,
      category,
      subcategory,
      color,
      size,
      occasions,
      price,
      purchaseLocation,
    }: UpdateWardrobeItemVariables): Promise<void> => {
      const supabase = createBrowserSupabaseClient();

      if (itemId) {
        const { error: itemError } = await supabase
          .from("item")
          .update({
            name: name?.trim() || null,
            brand: brand?.trim() || null,
            category: category ?? null,
            subcategory: subcategory ?? null,
            color: color ?? null,
          })
          .eq("item_id", itemId);

        if (itemError) throw itemError;
      }

      const { error: wardrobeError } = await supabase
        .from("wardrobe_item")
        .update({
          size: size ?? null,
          occasions: occasions ?? null,
          price: price !== undefined ? price : null,
          purchase_location: purchaseLocation?.trim() || null,
        })
        .eq("id", wardrobeItemId);

      if (wardrobeError) throw wardrobeError;
    },
  });
