import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Gender } from "../types";

export const getUserGenderQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["user", "gender", userId] as const,
    queryFn: async (): Promise<Gender | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("user")
        .select("gender")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error(
          "Error fetching user gender in getUserGenderQueryOptionsForBrowser:",
          error,
        );
        return null;
      }

      return (data?.gender as Gender | null) ?? null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
