import { NextResponse, type NextRequest } from "next/server";
import { getLogger } from "@/lib/logging";
import { getPaymentGateway, type PaymentProvider } from "@/lib/payments";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const logger = getLogger(["payment", "webhook"]);
const VALID_PROVIDERS: readonly PaymentProvider[] = [
  "midtrans",
  "xendit",
  "stripe",
  "mayar",
  "mock",
];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
): Promise<NextResponse> {
  const { provider } = await context.params;

  if (!VALID_PROVIDERS.includes(provider as PaymentProvider)) {
    logger.warn("Invalid payment provider received: {provider}", { provider });
    return NextResponse.json(
      { error: `Unsupported payment provider: ${provider}` },
      { status: 400 },
    );
  }

  const paymentProvider = provider as PaymentProvider;

  try {
    const rawBody = await request.text();
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    const gateway = getPaymentGateway(paymentProvider);
    const isValid = await gateway.verifyWebhook({ rawBody, headers });

    if (!isValid) {
      logger.warn("Payment webhook signature verification failed for {provider}", {
        provider: paymentProvider,
      });
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    const event = await gateway.parseWebhook({ rawBody, headers });
    logger.info("Processing verified payment webhook: {eventType} for order {orderId}", {
      eventType: event.eventType,
      orderId: event.orderId,
      provider: paymentProvider,
    });

    const supabase = createAdminSupabaseClient();

    // 1. Update the payment_order record
    let { data: order, error: orderFetchError } = await supabase
      .from("payment_order")
      .select("*")
      .eq("order_id", event.orderId)
      .maybeSingle();

    if (!order) {
      // Small pause in case the caller's pre-insert is settling in parallel
      await new Promise((resolve) => setTimeout(resolve, 150));
      const retry = await supabase
        .from("payment_order")
        .select("*")
        .eq("order_id", event.orderId)
        .maybeSingle();
      order = retry.data;
    }

    if (orderFetchError && !order) {
      logger.error("Error looking up order {orderId}: {error}", {
        orderId: event.orderId,
        error: orderFetchError.message,
      });
    }

    const now = new Date();
    const paidAt = event.status === "paid" ? (event.paidAt ?? now).toISOString() : null;

    if (order) {
      const { error: updateOrderError } = await supabase
        .from("payment_order")
        .update({
          status: event.status,
          provider_transaction_id: event.providerTransactionId,
          paid_at: paidAt,
          updated_at: now.toISOString(),
        })
        .eq("order_id", event.orderId);

      if (updateOrderError) {
        logger.error("Failed to update payment_order: {error}", {
          error: updateOrderError.message,
        });
      }
    }

    // 2. If payment succeeded, upgrade user subscription
    if (event.eventType === "payment.succeeded" && order) {
      const plan = order.plan === "annual" ? "annual" : "monthly";
      const periodEnd = new Date(now.getTime());
      if (plan === "annual") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Update user subscription_tier to premium
      const { error: userUpdateError } = await supabase
        .from("user")
        .update({ subscription_tier: "premium" })
        .eq("user_id", order.user_id);

      if (userUpdateError) {
        logger.error("Failed to update user subscription tier: {error}", {
          error: userUpdateError.message,
          userId: order.user_id,
        });
      }

      // Upsert subscription table record
      const { error: subUpsertError } = await supabase
        .from("subscription")
        .upsert(
          {
            user_id: order.user_id,
            tier: "premium",
            status: "active",
            billing_cycle: plan,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            cancel_at_period_end: false,
            latest_order_id: order.order_id,
            updated_at: now.toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (subUpsertError) {
        logger.error("Failed to upsert subscription record: {error}", {
          error: subUpsertError.message,
          userId: order.user_id,
        });
      }
    }

    return NextResponse.json({
      received: true,
      orderId: event.orderId,
      status: event.status,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("Unhandled error processing payment webhook: {error}", {
      error: errorMsg,
      provider: paymentProvider,
    });
    return NextResponse.json(
      { error: "Internal webhook processing error" },
      { status: 500 },
    );
  }
}
