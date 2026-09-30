import { queryOptions } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLogger } from "@/lib/logging";
import { PENDING_ITEM_SELECT } from "./get-pending-items.query-option.client";
import type { PendingItem } from "../types";
import { notFound } from "next/navigation";

export const getWardrobeItemByIdQueryOptionsForServer = (
  userId: string,
  id: string,
) =>
  queryOptions({
    queryKey: ["wardrobe", "item", userId, id] as const,
    queryFn: async (): Promise<PendingItem | null> => {
      const supabase = await createServerSupabaseClient();
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
          "Error fetching wardrobe item by id in getWardrobeItemByIdQueryOptionsForServer: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
            id,
          },
        );
        throw notFound();
      }

      if (!data) {
        throw notFound();
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
