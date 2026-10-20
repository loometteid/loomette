import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./[provider]/route";
import { registerPaymentGateway, MockPaymentGateway } from "@/lib/payments";

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({
    data: {
      order_id: "ord_123",
      user_id: "user_456",
      plan: "monthly",
      amount: 49000,
      currency: "IDR",
    },
    error: null,
  }),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
};

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe("POST /api/webhooks/payment/[provider]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for unsupported payment provider", async () => {
    const req = new NextRequest("http://localhost:3000/api/webhooks/payment/invalid_provider", {
      method: "POST",
      body: "{}",
    });

    const res = await POST(req, {
      params: Promise.resolve({ provider: "invalid_provider" }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Unsupported payment provider");
  });

  it("returns 401 when webhook signature fails verification", async () => {
    const mockGw = new MockPaymentGateway();
    registerPaymentGateway("mock", mockGw);

    const req = new NextRequest("http://localhost:3000/api/webhooks/payment/mock", {
      method: "POST",
      headers: {
        "x-mock-reject": "true",
      },
      body: JSON.stringify({ orderId: "ord_123" }),
    });

    const res = await POST(req, {
      params: Promise.resolve({ provider: "mock" }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Invalid webhook signature");
  });

  it("successfully verifies and processes valid webhook", async () => {
    const mockGw = new MockPaymentGateway();
    registerPaymentGateway("mock", mockGw);

    const req = new NextRequest("http://localhost:3000/api/webhooks/payment/mock", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        orderId: "ord_123",
        status: "paid",
        amount: 49000,
      }),
    });

    const res = await POST(req, {
      params: Promise.resolve({ provider: "mock" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
    expect(data.orderId).toBe("ord_123");
    expect(data.status).toBe("paid");

    // Supabase update checks
    expect(mockSupabase.from).toHaveBeenCalledWith("payment_order");
    expect(mockSupabase.from).toHaveBeenCalledWith("user");
    expect(mockSupabase.from).toHaveBeenCalledWith("subscription");
  });
});
