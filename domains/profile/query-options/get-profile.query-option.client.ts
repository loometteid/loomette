import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export const getProfileQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["user", "profile", userId] as const,
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("User profile not found");
      }

      return data;
    },
  });
