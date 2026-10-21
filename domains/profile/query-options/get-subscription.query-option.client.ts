import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export const getSubscriptionQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["user", "subscription", userId] as const,
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("subscription")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
  });
