import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Season, TravelCompanion } from "@/lib/tripOptions";

export type CreateTripInput = {
  userId: string;
  name: string | null;
  startDate: string;
  endDate: string;
  season: Season | null;
  companion: TravelCompanion | null;
};

export const createTripMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      userId,
      name,
      startDate,
      endDate,
      season,
      companion,
    }: CreateTripInput): Promise<{ id: string }> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("trip")
        .insert({
          user_id: userId,
          name: name?.trim() || null,
          start_date: startDate,
          end_date: endDate,
          season,
          travel_companion: companion,
        })
        .select("id")
        .single();

      if (error || !data) {
        throw error ?? new Error("Failed to create trip");
      }

      return data;
    },
  });
