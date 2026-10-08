import { queryOptions } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLogger } from "@/lib/logging";
import type { AppNotification } from "../types";

export const getNotificationsQueryOptionsForServer = (userId: string) =>
  queryOptions({
    queryKey: ["notifications", userId] as const,
    queryFn: async (): Promise<AppNotification[]> => {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("notification")
        .select("id, user_id, title, description, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        const logger = getLogger(["query", "notifications"]);
        logger.error(
          "Error fetching notifications in getNotificationsQueryOptionsForServer: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
          },
        );
        return [];
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        isRead: row.is_read,
        createdAt: row.created_at,
      }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
