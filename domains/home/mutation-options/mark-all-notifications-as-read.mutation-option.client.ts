import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type MarkAllNotificationsAsReadInput = {
  userId: string;
};

export const markAllNotificationsAsReadMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ userId }: MarkAllNotificationsAsReadInput) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("notification")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) {
        throw error;
      }
    },
  });
