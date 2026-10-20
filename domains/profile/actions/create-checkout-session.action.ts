"use server";

import { headers } from "next/headers";
import { getLogger } from "@/lib/logging";
import { getPaymentGateway, type BillingCycle } from "@/lib/payments";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const logger = getLogger(["payment", "action"]);

export interface CreateCheckoutSessionResult {
  success: boolean;
  checkoutUrl?: string;
  orderId?: string;
  token?: string;
  provider?: string;
  error?: string;
}

export async function createCheckoutSessionAction(
  plan: BillingCycle = "monthly",
): Promise<CreateCheckoutSessionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to upgrade." };
  }

  // Get user profile name and email
  const { data: profile } = await supabase
    .from("user")
    .select("display_name, email")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerEmail = profile?.email || user.email || "";
  const customerName =
    profile?.display_name ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "Customer");

  const reqHeaders = await headers();
  const host = reqHeaders.get("host") || "localhost:3000";
  const protocol = reqHeaders.get("x-forwarded-proto") || "http";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const amount = plan === "annual" ? 470000 : 49000;
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const successUrl = `${baseUrl}/profile/settings/pricing?payment_status=success&order_id=${orderId}`;
  const cancelUrl = `${baseUrl}/profile/settings/pricing?payment_status=canceled&order_id=${orderId}`;

  try {
    const gateway = getPaymentGateway();
    logger.info("Initiating checkout session via {provider} for user {userId}, plan {plan}", {
      provider: gateway.provider,
      userId: user.id,
      plan,
    });

    const session = await gateway.createCheckoutSession({
      orderId,
      userId: user.id,
      customerEmail,
      customerName,
      plan,
      amount,
      currency: "IDR",
      successUrl,
      cancelUrl,
    });

    const { error: insertError } = await supabase.from("payment_order").insert({
      order_id: orderId,
      user_id: user.id,
      provider: gateway.provider,
      plan,
      amount,
      currency: "IDR",
      status: "pending",
      checkout_url: session.checkoutUrl,
      provider_session_id: session.sessionId,
      metadata: (session.metadata ?? null) as import("@/types/database.types").Json | null,
    });

    if (insertError) {
      logger.error("Failed to store payment_order: {error}", {
        error: insertError.message,
      });
    }

    return {
      success: true,
      checkoutUrl: session.checkoutUrl,
      orderId,
      token: session.token,
      provider: gateway.provider,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("Failed to create checkout session: {error}", { error: errorMsg });
    return {
      success: false,
      error: "Failed to initiate payment session. Please try again.",
    };
  }
}
