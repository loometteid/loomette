import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { mutationOptions } from "@tanstack/react-query";
import type { WaitlistFormValues } from "../schemas/waitlist.schema";

export const joinWaitlistMutationOptions = () =>
  mutationOptions({
    mutationFn: async (values: WaitlistFormValues) => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("waitlist")
        .upsert(
          {
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            hurdles: values.hurdles.trim(),
          },
          { onConflict: "email" },
        );

      if (error) {
        throw error;
      }
    },
  });
