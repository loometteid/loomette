import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import type { Trip } from "@/components/features/trip/types";

export const getTripsQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["trips", userId] as const,
    queryFn: async (): Promise<Trip[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("trip")
        .select("id, name, start_date, end_date, season, travel_companion")
        .eq("user_id", userId)
        .order("start_date", { ascending: false })
        .returns<Trip[]>();

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
