import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import type { WishlistEntry, WishlistRow } from "../types";

export const getWishlistQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["profile", "wishlist", userId] as const,
    queryFn: async (): Promise<WishlistEntry[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("wardrobe_item")
        .select("id, item:item_id(name, image_url)")
        .eq("user_id", userId)
        .eq("is_wishlist", true)
        .returns<WishlistRow[]>();

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.item?.name ?? null,
        image_url: row.item?.image_url ?? null,
      }));
    },
  });
