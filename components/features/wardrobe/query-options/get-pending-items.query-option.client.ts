import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { PendingItem } from "../types";

export const PENDING_ITEM_SELECT =
  "id, created_at, size, price, purchase_location, occasions, image_url, item:item_id(item_id, name, category, subcategory, brand, color, image_url)";

export const getPendingWardrobeItemsQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["wardrobe", "pending-items", userId] as const,
    queryFn: async (): Promise<PendingItem[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("wardrobe_item")
        .select(PENDING_ITEM_SELECT)
        .eq("user_id", userId)
        .eq("is_approved", false)
        .order("created_at", { ascending: false })
        .returns<PendingItem[]>();

      if (error) {
        console.error(
          "Error fetching pending items in getPendingWardrobeItemsQueryOptionsForBrowser:",
          error,
        );
        return [];
      }

      return data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
