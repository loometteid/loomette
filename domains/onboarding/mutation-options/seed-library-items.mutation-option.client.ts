import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { LibraryBasicItem } from "../data/library-basics";

export interface SeedLibraryItemsVariables {
  userId: string;
  items: LibraryBasicItem[];
}

export const seedLibraryItemsMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ userId, items }: SeedLibraryItemsVariables) => {
      const supabase = createBrowserSupabaseClient();

      if (!items.length) return;

      // 1. Bulk insert items into catalog
      const { data: insertedItems, error: itemsError } = await supabase
        .from("item")
        .insert(
          items.map((basic) => ({
            name: basic.name,
            category: basic.category,
            subcategory: basic.subcategory,
            created_by_user_id: userId,
            source_type: "catalog" as const,
          })),
        )
        .select("item_id");

      if (itemsError) {
        throw itemsError;
      }

      // 2. Bulk insert wardrobe_item records linking user to each item
      if (insertedItems && insertedItems.length > 0) {
        const { error: wardrobeError } = await supabase
          .from("wardrobe_item")
          .insert(
            insertedItems.map((item) => ({
              user_id: userId,
              item_id: item.item_id,
              is_approved: true,
              source: "Original" as const,
            })),
          );

        if (wardrobeError) {
          throw wardrobeError;
        }
      }
    },
  });
