import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import {
  DIARY_ENTRY_SELECT,
  toDiaryEntries,
  type RawDiaryRow,
} from "@/components/features/calendar/diary-query";
import { eachDateInRange } from "@/components/features/trip/trip-dates";
import type { Trip, TripDayOutfit, TripDetail } from "../types";

export const getTripDetailQueryOptionsForBrowser = (
  userId: string,
  tripId: string,
) =>
  queryOptions({
    queryKey: ["trip", "detail", tripId, userId] as const,
    queryFn: async (): Promise<TripDetail | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data: trip, error: tripError } = await supabase
        .from("trip")
        .select(
          "id, name, start_date, end_date, season, travel_companion, user_id",
        )
        .eq("id", tripId)
        .eq("user_id", userId)
        .single();

      if (tripError || !trip) {
        const logger = getLogger(["query", "trip"]);
        logger.error(
          "Error fetching trip detail in getTripDetailQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: tripError?.message ?? "Trip not found",
            error: tripError,
            userId,
            tripId,
          },
        );
        return null;
      }

      const days = eachDateInRange(trip.start_date, trip.end_date);

      const { data: rows, error: rowsError } = await supabase
        .from("wear_log")
        .select(DIARY_ENTRY_SELECT)
        .eq("user_id", userId)
        .in("worn_on", days)
        .order("worn_on", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<RawDiaryRow[]>();

      if (rowsError) {
        const logger = getLogger(["query", "trip"]);
        logger.error(
          "Error fetching wear logs for trip in getTripDetailQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: rowsError.message,
            error: rowsError,
            userId,
            tripId,
          },
        );
      }

      const entries = toDiaryEntries(rows ?? []);
      const outfitsByDay = new Map<string, TripDayOutfit[]>();
      for (const entry of entries) {
        if (!entry.outfit) continue;
        const list = outfitsByDay.get(entry.worn_on) ?? [];
        list.push({
          wearLogId: entry.id,
          outfitId: entry.outfit.id,
          items: entry.outfit.items,
        });
        outfitsByDay.set(entry.worn_on, list);
      }

      const tripData: Trip = {
        id: trip.id,
        name: trip.name,
        start_date: trip.start_date,
        end_date: trip.end_date,
        season: trip.season,
        travel_companion: trip.travel_companion,
      };

      return {
        trip: tripData,
        days,
        outfitsByDay: Object.fromEntries(outfitsByDay),
      };
    },
    staleTime: 1000 * 60 * 5,
  });
