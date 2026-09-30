import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { mutationOptions } from "@tanstack/react-query";

export type UpdatePrivacySettingVariables = {
  userId: string;
  isPrivate: boolean;
};

export const updatePrivacySettingMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ userId, isPrivate }: UpdatePrivacySettingVariables) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("user")
        .update({ is_private: isPrivate })
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    },
  });
