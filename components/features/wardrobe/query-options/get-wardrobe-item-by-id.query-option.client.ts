import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import { PENDING_ITEM_SELECT } from "./get-pending-items.query-option.client";
import type { PendingItem } from "../types";

export const getWardrobeItemByIdQueryOptionsForBrowser = (
  userId: string,
  id: string,
) =>
  queryOptions({
    queryKey: ["wardrobe", "item", userId, id] as const,
    queryFn: async (): Promise<PendingItem | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("wardrobe_item")
        .select(PENDING_ITEM_SELECT)
        .eq("id", id)
        .eq("user_id", userId)
        .single()
        .returns<PendingItem>();

      if (error) {
        const logger = getLogger(["query", "wardrobe"]);
        logger.error(
          "Error fetching wardrobe item by id in getWardrobeItemByIdQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
            id,
          },
        );
        return null;
      }

      return data ?? null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
