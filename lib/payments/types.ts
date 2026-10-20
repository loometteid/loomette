export type PaymentProvider = "midtrans" | "xendit" | "stripe" | "mayar" | "mock";

export type BillingCycle = "monthly" | "annual";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "canceled";

export interface CreateCheckoutSessionInput {
  orderId: string;
  userId: string;
  customerEmail: string;
  customerName?: string;
  plan: BillingCycle;
  amount: number; // In currency units (e.g. IDR 49000)
  currency: string; // e.g. "IDR"
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  provider: PaymentProvider;
  sessionId: string;
  checkoutUrl: string;
  token?: string; // Optional token for popups like Midtrans Snap
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface WebhookVerificationInput {
  rawBody: string;
  headers: Record<string, string | string[] | undefined>;
}

export interface PaymentWebhookEvent {
  eventType: "payment.succeeded" | "payment.failed" | "payment.pending" | "subscription.canceled";
  orderId: string;
  provider: PaymentProvider;
  providerTransactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt?: Date;
  rawPayload: unknown;
}

export interface PaymentStatusResult {
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  providerTransactionId?: string;
  amount?: number;
  paidAt?: Date;
  raw?: unknown;
}

/**
 * Common Payment Gateway Interface following Dependency Inversion Principle.
 * All payment providers (Midtrans, Xendit, Stripe, Mayar, Mock) implement this contract.
 */
export interface PaymentGateway {
  readonly provider: PaymentProvider;

  /**
   * Generates a checkout session / payment link for the customer.
   */
  createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult>;

  /**
   * Verifies the authenticity of incoming webhooks from the provider.
   */
  verifyWebhook(input: WebhookVerificationInput): Promise<boolean>;

  /**
   * Normalizes provider-specific webhook payloads into a unified domain event.
   */
  parseWebhook(
    input: WebhookVerificationInput,
  ): Promise<PaymentWebhookEvent>;

  /**
   * Queries the provider's API for the status of a transaction.
   */
  checkPaymentStatus(orderId: string): Promise<PaymentStatusResult>;
}
