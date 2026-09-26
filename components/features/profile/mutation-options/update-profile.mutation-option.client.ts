import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { mutationOptions } from "@tanstack/react-query";
import type { Database } from "@/types/database.types";

export type UpdateProfileVariables = {
  userId: string;
  update: Database["public"]["Tables"]["user"]["Update"];
};

export const updateProfileMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ userId, update }: UpdateProfileVariables) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("user")
        .update(update)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    },
  });
