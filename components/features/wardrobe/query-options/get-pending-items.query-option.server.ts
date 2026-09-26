import { queryOptions } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PENDING_ITEM_SELECT } from "./get-pending-items.query-option.client";
import type { PendingItem } from "../types";

export const getPendingWardrobeItemsQueryOptionsForServer = (userId: string) =>
  queryOptions({
    queryKey: ["wardrobe", "pending-items", userId] as const,
    queryFn: async (): Promise<PendingItem[]> => {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("wardrobe_item")
        .select(PENDING_ITEM_SELECT)
        .eq("user_id", userId)
        .eq("is_approved", false)
        .order("created_at", { ascending: false })
        .returns<PendingItem[]>();

      if (error) {
        console.error(
          "Error fetching pending items in getPendingWardrobeItemsQueryOptionsForServer:",
          error,
        );
        return [];
      }

      return data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
