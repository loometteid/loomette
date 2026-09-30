import { createServerSupabaseClient } from "@/lib/supabase/server";
import { queryOptions } from "@tanstack/react-query";
import type { FavoriteEntry } from "../types";

export const getFavoriteOutfitsQueryOptionsForServer = (userId: string) =>
  queryOptions({
    queryKey: ["profile", "favorite-outfits", userId] as const,
    queryFn: async (): Promise<FavoriteEntry[]> => {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("outfit")
        .select("id, name, cover_image_url")
        .eq("user_id", userId)
        .eq("is_saved", true)
        .order("added_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        image_url: row.cover_image_url,
      }));
    },
  });
