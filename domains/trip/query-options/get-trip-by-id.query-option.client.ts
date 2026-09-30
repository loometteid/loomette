import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import type { Trip } from "../types";

export const getTripByIdQueryOptionsForBrowser = (
  userId: string,
  tripId: string,
) =>
  queryOptions({
    queryKey: ["trip", tripId, userId] as const,
    queryFn: async (): Promise<Trip | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("trip")
        .select("id, name, start_date, end_date, season, travel_companion")
        .eq("id", tripId)
        .eq("user_id", userId)
        .single()
        .returns<Trip>();

      if (error) {
        const logger = getLogger(["query", "trip"]);
        logger.error(
          "Error fetching trip by id in getTripByIdQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
            tripId,
          },
        );
        return null;
      }

      return data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
