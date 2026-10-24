import type {
  CheckoutSessionResult,
  CreateCheckoutSessionInput,
  PaymentGateway,
  PaymentStatusResult,
  PaymentWebhookEvent,
  WebhookVerificationInput,
} from "../types";

export interface XenditConfig {
  secretKey?: string;
  callbackToken?: string;
}

export class XenditPaymentGateway implements PaymentGateway {
  readonly provider = "xendit" as const;
  private readonly secretKey: string;
  private readonly callbackToken: string;

  constructor(config?: XenditConfig) {
    this.secretKey =
      config?.secretKey ?? process.env.XENDIT_SECRET_KEY ?? "dummy_xendit_secret_key";
    this.callbackToken =
      config?.callbackToken ?? process.env.XENDIT_CALLBACK_TOKEN ?? "dummy_xendit_callback_token";
  }

  private get authHeader(): string {
    const encoded = Buffer.from(`${this.secretKey}:`).toString("base64");
    return `Basic ${encoded}`;
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    const payload = {
      external_id: input.orderId,
      amount: Math.round(input.amount),
      description: `Loomette Pro Subscription (${input.plan.toUpperCase()})`,
      payer_email: input.customerEmail,
      currency: input.currency || "IDR",
      success_redirect_url: input.successUrl,
      failure_redirect_url: input.cancelUrl,
      customer: {
        email: input.customerEmail,
        given_names: input.customerName || "Customer",
      },
    };

    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: this.authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Xendit createCheckoutSession failed (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      id: string;
      invoice_url: string;
      expiry_date?: string;
    };

    return {
      provider: this.provider,
      sessionId: data.id,
      checkoutUrl: data.invoice_url,
      expiresAt: data.expiry_date ? new Date(data.expiry_date) : undefined,
      metadata: {
        orderId: input.orderId,
        plan: input.plan,
        amount: input.amount,
      },
    };
  }

  async verifyWebhook(input: WebhookVerificationInput): Promise<boolean> {
    // Xendit signs webhook with an x-callback-token header matching the merchant's configured token
    const tokenHeader =
      input.headers["x-callback-token"] || input.headers["X-CALLBACK-TOKEN"];
    if (!tokenHeader) {
      return false;
    }
    const token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;
    return token === this.callbackToken;
  }

  async parseWebhook(input: WebhookVerificationInput): Promise<PaymentWebhookEvent> {
    const body = JSON.parse(input.rawBody) as {
      id: string;
      external_id: string;
      status: string;
      amount: number;
      currency?: string;
      paid_at?: string;
    };

    let status: PaymentWebhookEvent["status"] = "pending";
    let eventType: PaymentWebhookEvent["eventType"] = "payment.pending";

    if (body.status === "PAID" || body.status === "SETTLED") {
      status = "paid";
      eventType = "payment.succeeded";
    } else if (body.status === "EXPIRED") {
      status = "expired";
      eventType = "payment.failed";
    } else if (body.status === "PENDING") {
      status = "pending";
      eventType = "payment.pending";
    }

    return {
      eventType,
      orderId: body.external_id,
      provider: this.provider,
      providerTransactionId: body.id,
      status,
      amount: body.amount,
      currency: body.currency || "IDR",
      paidAt: body.paid_at ? new Date(body.paid_at) : undefined,
      rawPayload: body,
    };
  }

  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
    // List invoices by external_id
    const response = await fetch(
      `https://api.xendit.co/v2/invoices?external_id=${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: this.authHeader,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Xendit checkPaymentStatus failed (${response.status})`);
    }

    const invoices = (await response.json()) as Array<{
      id: string;
      external_id: string;
      status: string;
      amount: number;
      paid_at?: string;
    }>;

    if (!invoices || invoices.length === 0) {
      return {
        orderId,
        provider: this.provider,
        status: "pending",
      };
    }

    const latest = invoices[0];
    let status: PaymentStatusResult["status"] = "pending";
    if (latest.status === "PAID" || latest.status === "SETTLED") {
      status = "paid";
    } else if (latest.status === "EXPIRED") {
      status = "expired";
    }

    return {
      orderId,
      provider: this.provider,
      status,
      providerTransactionId: latest.id,
      amount: latest.amount,
      paidAt: latest.paid_at ? new Date(latest.paid_at) : undefined,
      raw: latest,
    };
  }
}
