import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";

export const getUnreadNotificationsCountQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["notifications", "unread-count", userId] as const,
    queryFn: async (): Promise<number> => {
      const supabase = createBrowserSupabaseClient();
      const { count, error } = await supabase
        .from("notification")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        const logger = getLogger(["query", "notifications"]);
        logger.error(
          "Error fetching unread notifications count in getUnreadNotificationsCountQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
          },
        );
        return 0;
      }

      return count ?? 0;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
