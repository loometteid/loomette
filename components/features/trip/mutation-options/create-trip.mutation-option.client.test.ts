import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import {
  createTripMutationOptions,
  type CreateTripInput,
} from "./create-trip.mutation-option.client";

describe("createTripMutationOptions", () => {
  it("successfully creates a trip via Supabase client and MSW interception", async () => {
    const input: CreateTripInput = {
      userId: "user-456",
      name: "Tokyo Adventure",
      startDate: "2026-11-01",
      endDate: "2026-11-10",
      season: "autumn",
      companion: "family",
    };

    const options = createTripMutationOptions();
    expect(options.mutationFn).toBeDefined();

    const result = await options.mutationFn!(input, {} as never);

    expect(result).toBeDefined();
    expect(result.id).toBe("mock-trip-123");
  });

  it("throws an error when Supabase PostgREST responds with an error status", async () => {
    // Override MSW handler for this specific test to return a 500 error
    server.use(
      http.post(`${MOCK_SUPABASE_URL}/rest/v1/trip`, () => {
        return HttpResponse.json(
          { message: "Database connection failed", code: "500" },
          { status: 500 },
        );
      }),
    );

    const input: CreateTripInput = {
      userId: "user-456",
      name: "Failing Trip",
      startDate: "2026-11-01",
      endDate: "2026-11-10",
      season: null,
      companion: null,
    };

    const options = createTripMutationOptions();
    expect(options.mutationFn).toBeDefined();

    await expect(options.mutationFn!(input, {} as never)).rejects.toThrow();
  });
});
