import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getPaymentGateway,
  registerPaymentGateway,
  resetPaymentGateways,
  MidtransPaymentGateway,
  XenditPaymentGateway,
  StripePaymentGateway,
  MayarPaymentGateway,
  MockPaymentGateway,
  type CreateCheckoutSessionInput,
} from "./index";

const baseInput: CreateCheckoutSessionInput = {
  orderId: "ord_test_123",
  userId: "user_abc",
  customerEmail: "user@example.com",
  customerName: "Jane Doe",
  plan: "monthly",
  amount: 49000,
  currency: "IDR",
  successUrl: "https://loomette.com/profile/pricing?status=success",
  cancelUrl: "https://loomette.com/profile/pricing?status=canceled",
};

describe("PaymentGateway Factory", () => {
  const originalEnv = process.env.PAYMENT_GATEWAY_PROVIDER;

  beforeEach(() => {
    resetPaymentGateways();
    delete process.env.PAYMENT_GATEWAY_PROVIDER;
  });

  afterEach(() => {
    process.env.PAYMENT_GATEWAY_PROVIDER = originalEnv;
  });

  it("defaults to MockPaymentGateway when no env is configured", () => {
    const gw = getPaymentGateway();
    expect(gw.provider).toBe("mock");
    expect(gw).toBeInstanceOf(MockPaymentGateway);
  });

  it("resolves specific provider when passed explicitly", () => {
    const midtrans = getPaymentGateway("midtrans");
    expect(midtrans.provider).toBe("midtrans");
    expect(midtrans).toBeInstanceOf(MidtransPaymentGateway);

    const xendit = getPaymentGateway("xendit");
    expect(xendit.provider).toBe("xendit");
    expect(xendit).toBeInstanceOf(XenditPaymentGateway);

    const stripe = getPaymentGateway("stripe");
    expect(stripe.provider).toBe("stripe");
    expect(stripe).toBeInstanceOf(StripePaymentGateway);

    const mayar = getPaymentGateway("mayar");
    expect(mayar.provider).toBe("mayar");
    expect(mayar).toBeInstanceOf(MayarPaymentGateway);
  });

  it("resolves provider from PAYMENT_GATEWAY_PROVIDER env variable", () => {
    process.env.PAYMENT_GATEWAY_PROVIDER = "xendit";
    const gw = getPaymentGateway();
    expect(gw.provider).toBe("xendit");
    expect(gw).toBeInstanceOf(XenditPaymentGateway);
  });

  it("caches instances as singletons", () => {
    const first = getPaymentGateway("stripe");
    const second = getPaymentGateway("stripe");
    expect(first).toBe(second);
  });

  it("allows registering custom gateway overrides", () => {
    const customMock = new MockPaymentGateway({ simulateFailure: true });
    registerPaymentGateway("mock", customMock);
    const resolved = getPaymentGateway("mock");
    expect(resolved).toBe(customMock);
  });
});

describe("MockPaymentGateway", () => {
  it("creates a checkout session pointing to successUrl", async () => {
    const mockGw = new MockPaymentGateway();
    const result = await mockGw.createCheckoutSession(baseInput);

    expect(result.provider).toBe("mock");
    expect(result.sessionId).toBe("mock_session_ord_test_123");
    expect(result.checkoutUrl).toContain("mock_order_id=ord_test_123");
    expect(result.checkoutUrl).toContain("mock_status=paid");
  });

  it("verifies webhooks correctly", async () => {
    const mockGw = new MockPaymentGateway();
    const valid = await mockGw.verifyWebhook({
      rawBody: JSON.stringify({ orderId: "ord_test_123" }),
      headers: {},
    });
    expect(valid).toBe(true);

    const rejected = await mockGw.verifyWebhook({
      rawBody: JSON.stringify({ orderId: "ord_test_123" }),
      headers: { "x-mock-reject": "true" },
    });
    expect(rejected).toBe(false);
  });

  it("parses webhooks and checks status", async () => {
    const mockGw = new MockPaymentGateway();
    const event = await mockGw.parseWebhook({
      rawBody: JSON.stringify({
        orderId: "ord_test_123",
        status: "paid",
        amount: 49000,
      }),
      headers: {},
    });

    expect(event.eventType).toBe("payment.succeeded");
    expect(event.orderId).toBe("ord_test_123");
    expect(event.status).toBe("paid");

    const status = await mockGw.checkPaymentStatus("ord_test_123");
    expect(status.status).toBe("paid");
  });
});

describe("MidtransPaymentGateway", () => {
  const serverKey = "midtrans_test_server_key";
  const midtrans = new MidtransPaymentGateway({
    serverKey,
    isProduction: false,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates Snap checkout session via API", async () => {
    const fakeResponse = {
      token: "snap_token_123",
      redirect_url: "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap_token_123",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await midtrans.createCheckoutSession(baseInput);

    expect(result.provider).toBe("midtrans");
    expect(result.sessionId).toBe("snap_token_123");
    expect(result.checkoutUrl).toBe(fakeResponse.redirect_url);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
        }),
      }),
    );
  });

  it("verifies SHA512 webhook signature", async () => {
    const orderId = "ord_test_123";
    const statusCode = "200";
    const grossAmount = "49000.00";

    // Expected SHA512 hash of orderId + statusCode + grossAmount + serverKey
    const dataToSign = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const hashBuffer = await crypto.subtle.digest(
      "SHA-512",
      new TextEncoder().encode(dataToSign),
    );
    const validSignature = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const valid = await midtrans.verifyWebhook({
      rawBody: JSON.stringify({
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: validSignature,
      }),
      headers: {},
    });
    expect(valid).toBe(true);

    const invalid = await midtrans.verifyWebhook({
      rawBody: JSON.stringify({
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: "invalid_signature",
      }),
      headers: {},
    });
    expect(invalid).toBe(false);
  });

  it("parses settlement webhook into unified event", async () => {
    const payload = {
      order_id: "ord_test_123",
      transaction_id: "midtrans_trx_999",
      transaction_status: "settlement",
      gross_amount: "49000.00",
      settlement_time: "2026-10-20 20:00:00",
    };

    const event = await midtrans.parseWebhook({
      rawBody: JSON.stringify(payload),
      headers: {},
    });

    expect(event.eventType).toBe("payment.succeeded");
    expect(event.status).toBe("paid");
    expect(event.orderId).toBe("ord_test_123");
    expect(event.amount).toBe(49000);
    expect(event.providerTransactionId).toBe("midtrans_trx_999");
  });
});

describe("XenditPaymentGateway", () => {
  const secretKey = "xendit_test_secret_key";
  const callbackToken = "xendit_test_callback_token";
  const xendit = new XenditPaymentGateway({ secretKey, callbackToken });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates invoice via Xendit API", async () => {
    const fakeInvoice = {
      id: "inv_123",
      invoice_url: "https://checkout.xendit.co/web/inv_123",
      expiry_date: "2026-10-21T00:00:00.000Z",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeInvoice,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await xendit.createCheckoutSession(baseInput);

    expect(result.provider).toBe("xendit");
    expect(result.sessionId).toBe("inv_123");
    expect(result.checkoutUrl).toBe(fakeInvoice.invoice_url);
  });

  it("verifies webhook with x-callback-token header", async () => {
    const valid = await xendit.verifyWebhook({
      rawBody: "{}",
      headers: { "x-callback-token": callbackToken },
    });
    expect(valid).toBe(true);

    const invalid = await xendit.verifyWebhook({
      rawBody: "{}",
      headers: { "x-callback-token": "wrong_token" },
    });
    expect(invalid).toBe(false);
  });

  it("parses PAID invoice webhook into unified event", async () => {
    const payload = {
      id: "inv_123",
      external_id: "ord_test_123",
      status: "PAID",
      amount: 49000,
      paid_at: "2026-10-20T20:00:00.000Z",
    };

    const event = await xendit.parseWebhook({
      rawBody: JSON.stringify(payload),
      headers: {},
    });

    expect(event.eventType).toBe("payment.succeeded");
    expect(event.status).toBe("paid");
    expect(event.orderId).toBe("ord_test_123");
    expect(event.providerTransactionId).toBe("inv_123");
  });
});

describe("StripePaymentGateway", () => {
  const secretKey = "sk_test_123";
  const webhookSecret = "whsec_test_stripe";
  const stripe = new StripePaymentGateway({ secretKey, webhookSecret });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates Stripe checkout session via form-urlencoded payload", async () => {
    const fakeSession = {
      id: "cs_test_123",
      url: "https://checkout.stripe.com/pay/cs_test_123",
      expires_at: 1761000000,
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeSession,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await stripe.createCheckoutSession(baseInput);

    expect(result.provider).toBe("stripe");
    expect(result.sessionId).toBe("cs_test_123");
    expect(result.checkoutUrl).toBe(fakeSession.url);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.stripe.com/v1/checkout/sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      }),
    );
  });

  it("verifies HMAC-SHA256 stripe-signature header", async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const rawBody = JSON.stringify({ id: "evt_123" });

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${timestamp}.${rawBody}`),
    );
    const validHex = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const valid = await stripe.verifyWebhook({
      rawBody,
      headers: {
        "stripe-signature": `t=${timestamp},v1=${validHex}`,
      },
    });
    expect(valid).toBe(true);

    const invalid = await stripe.verifyWebhook({
      rawBody,
      headers: {
        "stripe-signature": `t=${timestamp},v1=badsignature`,
      },
    });
    expect(invalid).toBe(false);
  });

  it("parses checkout.session.completed event into unified event", async () => {
    const payload = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          client_reference_id: "ord_test_123",
          amount_total: 49000,
          currency: "idr",
        },
      },
    };

    const event = await stripe.parseWebhook({
      rawBody: JSON.stringify(payload),
      headers: {},
    });

    expect(event.eventType).toBe("payment.succeeded");
    expect(event.status).toBe("paid");
    expect(event.orderId).toBe("ord_test_123");
    expect(event.amount).toBe(49000);
  });
});

describe("MayarPaymentGateway", () => {
  const apiKey = "mayar_api_key_123";
  const webhookToken = "mayar_token_abc";
  const mayar = new MayarPaymentGateway({ apiKey, webhookToken });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates Mayar payment link via API", async () => {
    const fakeResp = {
      statusCode: 200,
      data: {
        id: "pay_mayar_123",
        link: "https://mayar.link/pay_mayar_123",
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResp,
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await mayar.createCheckoutSession(baseInput);

    expect(result.provider).toBe("mayar");
    expect(result.sessionId).toBe("pay_mayar_123");
    expect(result.checkoutUrl).toBe(fakeResp.data.link);
  });

  it("verifies webhook token", async () => {
    const valid = await mayar.verifyWebhook({
      rawBody: "{}",
      headers: { "x-mayar-token": webhookToken },
    });
    expect(valid).toBe(true);

    const invalid = await mayar.verifyWebhook({
      rawBody: "{}",
      headers: { "x-mayar-token": "wrong_token" },
    });
    expect(invalid).toBe(false);
  });

  it("parses Mayar payment event", async () => {
    const payload = {
      event: "payment.received",
      data: {
        id: "pay_mayar_123",
        transactionId: "trx_mayar_789",
        status: "PAID",
        amount: 49000,
        extraData: { orderId: "ord_test_123" },
      },
    };

    const event = await mayar.parseWebhook({
      rawBody: JSON.stringify(payload),
      headers: {},
    });

    expect(event.eventType).toBe("payment.succeeded");
    expect(event.status).toBe("paid");
    expect(event.orderId).toBe("ord_test_123");
    expect(event.providerTransactionId).toBe("trx_mayar_789");
  });
});
