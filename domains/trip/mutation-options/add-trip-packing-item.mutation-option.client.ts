import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { TripPackingItem } from "../types";

export type AddTripPackingItemInput = {
  tripId: string;
  userId: string;
  name: string;
};

export const addTripPackingItemMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      tripId,
      userId,
      name,
    }: AddTripPackingItemInput): Promise<TripPackingItem> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("trip_packing_item")
        .insert({
          trip_id: tripId,
          user_id: userId,
          name: name.trim(),
          is_packed: false,
        })
        .select("id, trip_id, user_id, name, is_packed, created_at")
        .single();

      if (error || !data) {
        throw error ?? new Error("Failed to create packing item");
      }

      return {
        id: data.id,
        tripId: data.trip_id,
        userId: data.user_id,
        name: data.name,
        isPacked: data.is_packed,
        createdAt: data.created_at,
      };
    },
  });
