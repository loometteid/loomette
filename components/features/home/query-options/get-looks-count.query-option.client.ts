import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export const getLooksCountQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["outfits", "saved-count", userId] as const,
    queryFn: async (): Promise<number> => {
      const supabase = createBrowserSupabaseClient();
      const { count, error } = await supabase
        .from("outfit")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_saved", true);

      if (error) {
        console.error(
          "Error fetching looks count in getLooksCountQueryOptionsForBrowser:",
          error,
        );
        return 0;
      }

      return count ?? 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
