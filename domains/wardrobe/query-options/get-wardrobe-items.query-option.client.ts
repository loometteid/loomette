import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import type { WardrobeItem } from "../types";

export const WARDROBE_ITEM_SELECT =
  "id, created_at, wear_count, occasions, item:item_id(item_id, name, category, subcategory, brand, color, image_url)";

export const getWardrobeItemsQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["wardrobe", "items", userId] as const,
    queryFn: async (): Promise<WardrobeItem[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("wardrobe_item")
        .select(WARDROBE_ITEM_SELECT)
        .eq("user_id", userId)
        .eq("is_approved", true)
        .returns<WardrobeItem[]>();

      if (error) {
        const logger = getLogger(["query", "wardrobe"]);
        logger.error(
          "Error fetching wardrobe items in getWardrobeItemsQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
          },
        );
        return [];
      }

      return data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
