import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import type { UserProfile } from "../types";

export const getProfileQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["user", "profile", userId] as const,
    queryFn: async (): Promise<UserProfile | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });
