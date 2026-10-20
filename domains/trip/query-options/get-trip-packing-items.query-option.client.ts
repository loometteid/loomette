import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import type { TripPackingItem } from "../types";

export const getTripPackingItemsQueryOptionsForBrowser = (
  userId: string,
  tripId: string,
) =>
  queryOptions({
    queryKey: ["trip", "packing-items", tripId, userId] as const,
    queryFn: async (): Promise<TripPackingItem[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("trip_packing_item")
        .select("id, trip_id, user_id, name, is_packed, created_at")
        .eq("trip_id", tripId)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        const logger = getLogger(["query", "trip", "packing"]);
        logger.error(
          "Error fetching trip packing items in getTripPackingItemsQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
            tripId,
          },
        );
        return [];
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        tripId: row.trip_id,
        userId: row.user_id,
        name: row.name,
        isPacked: row.is_packed,
        createdAt: row.created_at,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
