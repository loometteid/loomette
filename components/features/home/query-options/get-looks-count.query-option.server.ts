import { queryOptions } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getLooksCountQueryOptionsForServer = (userId: string) =>
  queryOptions({
    queryKey: ["outfits", "saved-count", userId] as const,
    queryFn: async (): Promise<number> => {
      const supabase = await createServerSupabaseClient();
      const { count, error } = await supabase
        .from("outfit")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_saved", true);

      if (error) {
        console.error(
          "Error fetching looks count in getLooksCountQueryOptionsForServer:",
          error,
        );
        return 0;
      }

      return count ?? 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
