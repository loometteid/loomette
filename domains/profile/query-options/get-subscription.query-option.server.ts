import { createServerSupabaseClient } from "@/lib/supabase/server";
import { queryOptions } from "@tanstack/react-query";

export const getSubscriptionQueryOptionsForServer = (userId: string) =>
  queryOptions({
    queryKey: ["user", "subscription", userId] as const,
    queryFn: async () => {
      const supabase = await createServerSupabaseClient();
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
