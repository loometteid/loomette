import type {
  CheckoutSessionResult,
  CreateCheckoutSessionInput,
  PaymentGateway,
  PaymentStatusResult,
  PaymentWebhookEvent,
  WebhookVerificationInput,
} from "../types";

export interface MidtransConfig {
  serverKey?: string;
  clientKey?: string;
  isProduction?: boolean;
}

export class MidtransPaymentGateway implements PaymentGateway {
  readonly provider = "midtrans" as const;
  private readonly serverKey: string;
  private readonly isProduction: boolean;

  constructor(config?: MidtransConfig) {
    this.serverKey =
      config?.serverKey ?? process.env.MIDTRANS_SERVER_KEY ?? "dummy_midtrans_server_key";
    this.isProduction =
      config?.isProduction ?? process.env.MIDTRANS_IS_PRODUCTION === "true";
  }

  private get snapBaseUrl(): string {
    return this.isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  }

  private get coreBaseUrl(): string {
    return this.isProduction
      ? "https://api.midtrans.com/v2"
      : "https://api.sandbox.midtrans.com/v2";
  }

  private get authHeader(): string {
    const encoded = Buffer.from(`${this.serverKey}:`).toString("base64");
    return `Basic ${encoded}`;
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    const payload = {
      transaction_details: {
        order_id: input.orderId,
        gross_amount: Math.round(input.amount),
      },
      item_details: [
        {
          id: `loomette-pro-${input.plan}`,
          price: Math.round(input.amount),
          quantity: 1,
          name: `Loomette Pro (${input.plan.toUpperCase()})`,
        },
      ],
      customer_details: {
        email: input.customerEmail,
        first_name: input.customerName || "Customer",
      },
      callbacks: {
        finish: input.successUrl,
        error: input.cancelUrl,
        close: input.cancelUrl,
      },
    };

    const response = await fetch(this.snapBaseUrl, {
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
      throw new Error(`Midtrans createCheckoutSession failed (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      token: string;
      redirect_url: string;
    };

    return {
      provider: this.provider,
      sessionId: data.token,
      token: data.token,
      checkoutUrl: data.redirect_url,
      metadata: {
        orderId: input.orderId,
        plan: input.plan,
        amount: input.amount,
      },
    };
  }

  async verifyWebhook(input: WebhookVerificationInput): Promise<boolean> {
    try {
      const body = JSON.parse(input.rawBody) as {
        order_id?: string;
        status_code?: string;
        gross_amount?: string;
        signature_key?: string;
      };

      if (!body.order_id || !body.status_code || !body.gross_amount || !body.signature_key) {
        return false;
      }

      // Midtrans SHA512 signature: SHA512(order_id + status_code + gross_amount + ServerKey)
      const dataToSign = `${body.order_id}${body.status_code}${body.gross_amount}${this.serverKey}`;
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-512", encoder.encode(dataToSign));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const calculatedSignature = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return calculatedSignature.toLowerCase() === body.signature_key.toLowerCase();
    } catch {
      return false;
    }
  }

  async parseWebhook(input: WebhookVerificationInput): Promise<PaymentWebhookEvent> {
    const body = JSON.parse(input.rawBody) as {
      order_id: string;
      transaction_id: string;
      transaction_status: string;
      fraud_status?: string;
      gross_amount: string;
      settlement_time?: string;
      transaction_time?: string;
    };

    let status: PaymentWebhookEvent["status"] = "pending";
    let eventType: PaymentWebhookEvent["eventType"] = "payment.pending";

    const ts = body.transaction_status;
    const fs = body.fraud_status;

    if (ts === "capture") {
      if (fs === "challenge") {
        status = "pending";
        eventType = "payment.pending";
      } else if (fs === "accept") {
        status = "paid";
        eventType = "payment.succeeded";
      }
    } else if (ts === "settlement") {
      status = "paid";
      eventType = "payment.succeeded";
    } else if (ts === "cancel" || ts === "deny" || ts === "expire") {
      status = "failed";
      eventType = "payment.failed";
    } else if (ts === "pending") {
      status = "pending";
      eventType = "payment.pending";
    }

    const paidAtStr = body.settlement_time || body.transaction_time;

    return {
      eventType,
      orderId: body.order_id,
      provider: this.provider,
      providerTransactionId: body.transaction_id,
      status,
      amount: parseFloat(body.gross_amount || "0"),
      currency: "IDR",
      paidAt: paidAtStr ? new Date(paidAtStr) : undefined,
      rawPayload: body,
    };
  }

  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
    const response = await fetch(`${this.coreBaseUrl}/${orderId}/status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: this.authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Midtrans checkPaymentStatus failed (${response.status})`);
    }

    const data = (await response.json()) as {
      order_id: string;
      transaction_id?: string;
      transaction_status: string;
      fraud_status?: string;
      gross_amount?: string;
      settlement_time?: string;
    };

    let status: PaymentStatusResult["status"] = "pending";
    if (data.transaction_status === "settlement" || (data.transaction_status === "capture" && data.fraud_status === "accept")) {
      status = "paid";
    } else if (["cancel", "deny", "expire"].includes(data.transaction_status)) {
      status = "failed";
    }

    return {
      orderId: data.order_id,
      provider: this.provider,
      status,
      providerTransactionId: data.transaction_id,
      amount: data.gross_amount ? parseFloat(data.gross_amount) : undefined,
      paidAt: data.settlement_time ? new Date(data.settlement_time) : undefined,
      raw: data,
    };
  }
}
