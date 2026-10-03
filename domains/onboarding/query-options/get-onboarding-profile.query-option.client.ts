import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import type { Database } from "@/types/database.types";

export type OnboardingUserProfile = Database["public"]["Tables"]["user"]["Row"];

export const getOnboardingProfileQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["user", "profile", userId] as const,
    queryFn: async (): Promise<OnboardingUserProfile | null> => {
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
    staleTime: 1000 * 60 * 5,
  });
