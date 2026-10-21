import type {
  CheckoutSessionResult,
  CreateCheckoutSessionInput,
  PaymentGateway,
  PaymentStatusResult,
  PaymentWebhookEvent,
  WebhookVerificationInput,
} from "../types";

export interface MockPaymentConfig {
  simulateFailure?: boolean;
  autoDispatchWebhook?: boolean;
}

export class MockPaymentGateway implements PaymentGateway {
  readonly provider = "mock" as const;
  private simulateFailure: boolean;
  private autoDispatchWebhook: boolean;

  constructor(config?: MockPaymentConfig) {
    this.simulateFailure = config?.simulateFailure ?? false;
    this.autoDispatchWebhook = config?.autoDispatchWebhook ?? true;
  }

  setSimulateFailure(fail: boolean): void {
    this.simulateFailure = fail;
  }

  setAutoDispatchWebhook(auto: boolean): void {
    this.autoDispatchWebhook = auto;
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    if (this.simulateFailure) {
      throw new Error("Simulated mock payment checkout failure");
    }

    const sessionId = `mock_session_${input.orderId}`;
    const separator = input.successUrl.includes("?") ? "&" : "?";
    const checkoutUrl = `${input.successUrl}${separator}mock_order_id=${encodeURIComponent(
      input.orderId,
    )}&mock_status=paid`;

    if (this.autoDispatchWebhook) {
      await this.postMockWebhook(input);
    }

    return {
      provider: this.provider,
      sessionId,
      token: `mock_snap_token_${input.orderId}`,
      checkoutUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      metadata: {
        orderId: input.orderId,
        plan: input.plan,
        amount: input.amount,
      },
    };
  }

  private async postMockWebhook(
    input: CreateCheckoutSessionInput,
  ): Promise<void> {
    try {
      let webhookUrl: string;
      try {
        const parsed = new URL(input.successUrl);
        webhookUrl = `${parsed.origin}/api/webhooks/payment/mock`;
      } catch {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        webhookUrl = `${siteUrl}/api/webhooks/payment/mock`;
      }

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: input.orderId,
          status: "paid",
          amount: input.amount,
          currency: input.currency,
          plan: input.plan,
        }),
      });
    } catch {
      // Ignore network errors in test/offline environments
    }
  }

  async verifyWebhook(input: WebhookVerificationInput): Promise<boolean> {
    if (input.headers["x-mock-reject"] === "true") {
      return false;
    }
    return true;
  }

  async parseWebhook(input: WebhookVerificationInput): Promise<PaymentWebhookEvent> {
    try {
      const body = JSON.parse(input.rawBody) as {
        orderId?: string;
        amount?: number;
        currency?: string;
        status?: "paid" | "failed" | "pending";
      };

      const status = body.status ?? "paid";
      return {
        eventType: status === "paid" ? "payment.succeeded" : "payment.failed",
        orderId: body.orderId || "mock_order_default",
        provider: this.provider,
        providerTransactionId: `mock_trx_${Date.now()}`,
        status,
        amount: body.amount ?? 49000,
        currency: body.currency ?? "IDR",
        paidAt: status === "paid" ? new Date() : undefined,
        rawPayload: body,
      };
    } catch {
      return {
        eventType: "payment.succeeded",
        orderId: "mock_order_fallback",
        provider: this.provider,
        providerTransactionId: `mock_trx_${Date.now()}`,
        status: "paid",
        amount: 49000,
        currency: "IDR",
        paidAt: new Date(),
        rawPayload: { raw: input.rawBody },
      };
    }
  }

  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
    if (this.simulateFailure) {
      return {
        orderId,
        provider: this.provider,
        status: "failed",
      };
    }

    return {
      orderId,
      provider: this.provider,
      status: "paid",
      providerTransactionId: `mock_trx_${orderId}`,
      amount: 49000,
      paidAt: new Date(),
    };
  }
}
