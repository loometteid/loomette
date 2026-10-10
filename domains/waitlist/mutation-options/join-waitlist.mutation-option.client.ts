import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { mutationOptions } from "@tanstack/react-query";
import type { WaitlistFormValues } from "../schemas/waitlist.schema";

export const WAITLIST_DUPLICATE_EMAIL_ERROR =
  "This email is already on the waitlist.";

export const joinWaitlistMutationOptions = () =>
  mutationOptions({
    mutationFn: async (values: WaitlistFormValues) => {
      const supabase = createBrowserSupabaseClient();

      // 1. Insert the subscriber into the waitlist table (rejects duplicate email)
      const { error: dbError } = await supabase
        .from("waitlist")
        .insert({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          hurdles: values.hurdles.trim(),
        });

      if (dbError) {
        if (
          dbError.code === "23505" ||
          dbError.message?.toLowerCase().includes("unique") ||
          dbError.message?.toLowerCase().includes("already exists") ||
          dbError.message?.includes("waitlist_email_key")
        ) {
          throw new Error(WAITLIST_DUPLICATE_EMAIL_ERROR);
        }
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
