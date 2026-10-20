import type {
  CheckoutSessionResult,
  CreateCheckoutSessionInput,
  PaymentGateway,
  PaymentStatusResult,
  PaymentWebhookEvent,
  WebhookVerificationInput,
} from "../types";

export interface MayarConfig {
  apiKey?: string;
  webhookToken?: string;
  baseUrl?: string;
}

export class MayarPaymentGateway implements PaymentGateway {
  readonly provider = "mayar" as const;
  private readonly apiKey: string;
  private readonly webhookToken: string;
  private readonly baseUrl: string;

  constructor(config?: MayarConfig) {
    this.apiKey =
      config?.apiKey ?? process.env.MAYAR_API_KEY ?? "dummy_mayar_api_key";
    this.webhookToken =
      config?.webhookToken ?? process.env.MAYAR_WEBHOOK_TOKEN ?? "dummy_mayar_webhook_token";
    this.baseUrl = config?.baseUrl ?? "https://api.mayar.id/hl/v1";
  }

  private get authHeader(): string {
    return `Bearer ${this.apiKey}`;
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    const payload = {
      name: input.customerName || "Customer",
      email: input.customerEmail,
      amount: Math.round(input.amount),
      description: `Loomette Pro (${input.plan.toUpperCase()})`,
      redirectUrl: input.successUrl,
      extraData: {
        orderId: input.orderId,
        plan: input.plan,
        userId: input.userId,
      },
    };

    const response = await fetch(`${this.baseUrl}/payment/create`, {
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
      throw new Error(`Mayar createCheckoutSession failed (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      data: {
        id: string;
        link: string;
        expiredAt?: string;
      };
    };

    const paymentData = data.data || {};

    return {
      provider: this.provider,
      sessionId: paymentData.id,
      checkoutUrl: paymentData.link,
      expiresAt: paymentData.expiredAt ? new Date(paymentData.expiredAt) : undefined,
      metadata: {
        orderId: input.orderId,
        plan: input.plan,
        amount: input.amount,
      },
    };
  }

  async verifyWebhook(input: WebhookVerificationInput): Promise<boolean> {
    const tokenHeader =
      input.headers["x-mayar-token"] ||
      input.headers["X-MAYAR-TOKEN"] ||
      input.headers["x-callback-token"];
    if (!tokenHeader) {
      return false;
    }
    const token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;
    return token === this.webhookToken;
  }

  async parseWebhook(input: WebhookVerificationInput): Promise<PaymentWebhookEvent> {
    const body = JSON.parse(input.rawBody) as {
      event: string;
      data: {
        id: string;
        transactionId?: string;
        status?: string;
        amount: number;
        extraData?: { orderId?: string };
        createdAt?: string;
      };
    };

    const payloadData = body.data || { id: "", amount: 0 };
    const orderId = payloadData.extraData?.orderId || payloadData.id;

    let status: PaymentWebhookEvent["status"] = "pending";
    let eventType: PaymentWebhookEvent["eventType"] = "payment.pending";

    const evt = body.event?.toLowerCase() || "";
    const rawStatus = (payloadData.status || "").toUpperCase();

    if (evt.includes("success") || evt.includes("received") || rawStatus === "PAID" || rawStatus === "SETTLED") {
      status = "paid";
      eventType = "payment.succeeded";
    } else if (evt.includes("fail") || evt.includes("expire") || rawStatus === "EXPIRED" || rawStatus === "FAILED") {
      status = "failed";
      eventType = "payment.failed";
    }

    return {
      eventType,
      orderId,
      provider: this.provider,
      providerTransactionId: payloadData.transactionId || payloadData.id,
      status,
      amount: payloadData.amount,
      currency: "IDR",
      paidAt: status === "paid" ? new Date(payloadData.createdAt || Date.now()) : undefined,
      rawPayload: body,
    };
  }

  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
    const response = await fetch(`${this.baseUrl}/payment/${orderId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: this.authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Mayar checkPaymentStatus failed (${response.status})`);
    }

    const json = (await response.json()) as {
      data: {
        id: string;
        status: string;
        amount?: number;
        extraData?: { orderId?: string };
      };
    };

    const d = json.data;
    let status: PaymentStatusResult["status"] = "pending";
    const rawStatus = (d.status || "").toUpperCase();

    if (rawStatus === "PAID" || rawStatus === "SETTLED") {
      status = "paid";
    } else if (rawStatus === "FAILED" || rawStatus === "EXPIRED") {
      status = "failed";
    }

    return {
      orderId: d.extraData?.orderId || orderId,
      provider: this.provider,
      status,
      providerTransactionId: d.id,
      amount: d.amount,
      raw: d,
    };
  }
}
