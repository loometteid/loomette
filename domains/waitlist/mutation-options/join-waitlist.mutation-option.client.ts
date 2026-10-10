import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { mutationOptions } from "@tanstack/react-query";
import type { WaitlistFormValues } from "../schemas/waitlist.schema";

export const joinWaitlistMutationOptions = () =>
  mutationOptions({
    mutationFn: async (values: WaitlistFormValues) => {
      const supabase = createBrowserSupabaseClient();

      // 1. Save or update the subscriber in the waitlist table
      const { error: dbError } = await supabase
        .from("waitlist")
        .upsert(
          {
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            hurdles: values.hurdles.trim(),
          },
          { onConflict: "email" },
        );

      if (dbError) {
        throw dbError;
      }

      // 2. Trigger the Supabase Edge Function to dispatch confirmation email
      try {
        await supabase.functions.invoke("send-waitlist-email", {
          body: {
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            hurdles: values.hurdles.trim(),
          },
        });
      } catch (emailErr) {
        // Non-blocking warning: ensures user signup completes even if email provider is offline or key is pending
        console.warn("Failed to send waitlist confirmation email via Edge Function:", emailErr);
      }
    },
  });
