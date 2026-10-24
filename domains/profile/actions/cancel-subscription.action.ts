"use server";

import { getLogger } from "@/lib/logging";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const logger = getLogger(["payment", "cancel-action"]);

export interface CancelSubscriptionResult {
  success: boolean;
  error?: string;
}

export async function cancelSubscriptionAction(): Promise<CancelSubscriptionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to manage your subscription.",
    };
  }

  try {
    const adminSupabase = createAdminSupabaseClient();

    // Reset user tier to free
    const { error: userError } = await adminSupabase
      .from("user")
      .update({ subscription_tier: "free" })
      .eq("user_id", user.id);

    if (userError) {
      logger.error("Failed to reset user subscription_tier: {error}", {
        error: userError.message,
      });
    }

    // Update subscription record to canceled / inactive
    const { error: subError } = await adminSupabase
      .from("subscription")
      .update({
        status: "canceled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (subError) {
      logger.error("Failed to update subscription status: {error}", {
        error: subError.message,
      });
    }

    logger.info("Subscription canceled successfully for user {userId}", {
      userId: user.id,
    });
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("Failed to cancel subscription: {error}", { error: errorMsg });
    return { success: false, error: "Failed to cancel subscription." };
  }
}
