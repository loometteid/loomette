import { queryOptions } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { WARDROBE_ITEM_SELECT } from "./get-wardrobe-items.query-option.client";
import type { WardrobeItem } from "../types";

export const getWardrobeItemsQueryOptionsForServer = (userId: string) =>
  queryOptions({
    queryKey: ["wardrobe", "items", userId] as const,
    queryFn: async (): Promise<WardrobeItem[]> => {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("wardrobe_item")
        .select(WARDROBE_ITEM_SELECT)
        .eq("user_id", userId)
        .eq("is_approved", true)
        .returns<WardrobeItem[]>();

      if (error) {
        console.error(
          "Error fetching wardrobe items in getWardrobeItemsQueryOptionsForServer:",
          error,
        );
        return [];
      }

      return data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
