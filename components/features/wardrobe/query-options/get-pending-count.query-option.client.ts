import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export const getPendingWardrobeCountQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["wardrobe", "pending-count", userId] as const,
    queryFn: async (): Promise<number> => {
      const supabase = createBrowserSupabaseClient();
      const { count, error } = await supabase
        .from("wardrobe_item")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_approved", false);

      if (error) {
        console.error(
          "Error fetching pending wardrobe count in getPendingWardrobeCountQueryOptionsForBrowser:",
          error,
        );
        return 0;
      }

      return count ?? 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
