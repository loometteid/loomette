import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Season, TravelCompanion } from "@/lib/tripOptions";

export type UpdateTripInput = {
  id: string;
  userId: string;
  name: string | null;
  startDate: string;
  endDate: string;
  season: Season | null;
  companion: TravelCompanion | null;
};

export const updateTripMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      id,
      userId,
      name,
      startDate,
      endDate,
      season,
      companion,
    }: UpdateTripInput): Promise<void> => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("trip")
        .update({
          name: name?.trim() || null,
          start_date: startDate,
          end_date: endDate,
          season,
          travel_companion: companion,
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    },
  });
