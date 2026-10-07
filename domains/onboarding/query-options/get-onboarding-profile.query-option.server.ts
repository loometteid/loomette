import { createServerSupabaseClient } from "@/lib/supabase/server";
import { queryOptions } from "@tanstack/react-query";
import type { OnboardingUserProfile } from "./get-onboarding-profile.query-option.client";

export const getOnboardingProfileQueryOptionsForServer = (userId: string) =>
  queryOptions({
    queryKey: ["user", "profile", userId] as const,
    queryFn: async (): Promise<OnboardingUserProfile | null> => {
      const supabase = await createServerSupabaseClient();
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
