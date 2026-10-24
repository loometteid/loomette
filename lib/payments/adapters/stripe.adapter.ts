import type {
  CheckoutSessionResult,
  CreateCheckoutSessionInput,
  PaymentGateway,
  PaymentStatusResult,
  PaymentWebhookEvent,
  WebhookVerificationInput,
} from "../types";

export interface StripeConfig {
  secretKey?: string;
  webhookSecret?: string;
}

export class StripePaymentGateway implements PaymentGateway {
  readonly provider = "stripe" as const;
  private readonly secretKey: string;
  private readonly webhookSecret: string;

  constructor(config?: StripeConfig) {
    this.secretKey =
      config?.secretKey ?? process.env.STRIPE_SECRET_KEY ?? "dummy_stripe_secret_key";
    this.webhookSecret =
      config?.webhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET ?? "dummy_stripe_webhook_secret";
  }

  private get authHeader(): string {
    return `Bearer ${this.secretKey}`;
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("client_reference_id", input.orderId);
    params.append("customer_email", input.customerEmail);
    params.append("success_url", input.successUrl);
    params.append("cancel_url", input.cancelUrl);

    // Line items
    params.append(
      "line_items[0][price_data][product_data][name]",
      `Loomette Pro (${input.plan.toUpperCase()})`,
    );
    params.append(
      "line_items[0][price_data][currency]",
      (input.currency || "idr").toLowerCase(),
    );
    params.append(
      "line_items[0][price_data][unit_amount]",
      Math.round(input.amount).toString(),
    );
    params.append("line_items[0][quantity]", "1");

    // Metadata
    params.append("metadata[orderId]", input.orderId);
    params.append("metadata[userId]", input.userId);
    params.append("metadata[plan]", input.plan);

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: this.authHeader,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Stripe createCheckoutSession failed (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      id: string;
      url: string;
      expires_at?: number;
    };

    return {
      provider: this.provider,
      sessionId: data.id,
      checkoutUrl: data.url,
      expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : undefined,
      metadata: {
        orderId: input.orderId,
        plan: input.plan,
        amount: input.amount,
      },
    };
  }

  async verifyWebhook(input: WebhookVerificationInput): Promise<boolean> {
    try {
      const sigHeader =
        input.headers["stripe-signature"] || input.headers["STRIPE-SIGNATURE"];
      if (!sigHeader) {
        return false;
      }

      const sigValue = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;
      const parts = sigValue.split(",");
      let timestamp = "";
      const signatures: string[] = [];

      for (const part of parts) {
        const [k, v] = part.trim().split("=");
        if (k === "t") timestamp = v;
        if (k === "v1") signatures.push(v);
      }

      if (!timestamp || signatures.length === 0) {
        return false;
      }

      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(this.webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );

      const signedPayload = `${timestamp}.${input.rawBody}`;
      const signatureBytes = await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        encoder.encode(signedPayload),
      );

      const calculatedHex = Array.from(new Uint8Array(signatureBytes))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return signatures.some((s) => s.toLowerCase() === calculatedHex.toLowerCase());
    } catch {
      return false;
    }
  }

  async parseWebhook(input: WebhookVerificationInput): Promise<PaymentWebhookEvent> {
    const event = JSON.parse(input.rawBody) as {
      type: string;
      data: {
        object: {
          id: string;
          client_reference_id?: string;
          amount_total?: number;
          amount?: number;
          currency?: string;
          metadata?: { orderId?: string };
        };
      };
    };

    const obj = event.data?.object || {};
    const orderId = obj.client_reference_id || obj.metadata?.orderId || obj.id;
    const amount = (obj.amount_total ?? obj.amount ?? 0);

    let status: PaymentWebhookEvent["status"] = "pending";
    let eventType: PaymentWebhookEvent["eventType"] = "payment.pending";

    switch (event.type) {
      case "checkout.session.completed":
      case "payment_intent.succeeded":
      case "charge.succeeded":
        status = "paid";
        eventType = "payment.succeeded";
        break;
      case "payment_intent.payment_failed":
      case "charge.failed":
        status = "failed";
        eventType = "payment.failed";
        break;
      case "customer.subscription.deleted":
        status = "canceled";
        eventType = "subscription.canceled";
        break;
      default:
        status = "pending";
        eventType = "payment.pending";
    }

    return {
      eventType,
      orderId,
      provider: this.provider,
      providerTransactionId: obj.id,
      status,
      amount,
      currency: (obj.currency || "idr").toUpperCase(),
      paidAt: status === "paid" ? new Date() : undefined,
      rawPayload: event,
    };
  }

  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
    // Search or list sessions matching client_reference_id
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions?limit=5`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: this.authHeader,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Stripe checkPaymentStatus failed (${response.status})`);
    }

    const data = (await response.json()) as {
      data: Array<{
        id: string;
        client_reference_id?: string;
        payment_status: string;
        amount_total?: number;
      }>;
    };

    const session = data.data.find((s) => s.client_reference_id === orderId || s.id === orderId);

    if (!session) {
      return {
        orderId,
        provider: this.provider,
        status: "pending",
      };
    }

    let status: PaymentStatusResult["status"] = "pending";
    if (session.payment_status === "paid") {
      status = "paid";
    } else if (session.payment_status === "unpaid") {
      status = "pending";
    }

    return {
      orderId,
      provider: this.provider,
      status,
      providerTransactionId: session.id,
      amount: session.amount_total,
      raw: session,
    };
  }
}
