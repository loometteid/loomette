import { describe, expect, it } from "vitest";
import { sanitizeErrorMessage } from "./errorSanitizer";

describe("sanitizeErrorMessage", () => {
  it("sanitizes Edge Function returned a non-2xx status code into a friendly message", async () => {
    const error = new Error("Edge Function returned a non-2xx status code");
    const sanitized = await sanitizeErrorMessage(error);
    expect(sanitized).toBe(
      "Outfit analysis took longer than expected. Please try again with a clearer photo.",
    );
  });

  it("extracts error payload from context if available", async () => {
    const error = {
      message: "Edge Function returned a non-2xx status code",
      context: {
        status: 400,
        json: async () => ({ error: "No garments detected in photo" }),
      },
    };
    const sanitized = await sanitizeErrorMessage(error);
    expect(sanitized).toBe("No garments detected in photo");
  });

  it("handles 504 gateway timeout with friendly message", async () => {
    const error = {
      message: "Edge Function returned a non-2xx status code",
      context: {
        status: 504,
      },
    };
    const sanitized = await sanitizeErrorMessage(error);
    expect(sanitized).toBe(
      "Outfit analysis took longer than expected. Please try again with a clearer photo.",
    );
  });

  it("handles network error gracefully", async () => {
    const error = new Error("Failed to fetch");
    const sanitized = await sanitizeErrorMessage(error);
    expect(sanitized).toBe(
      "Network connection issue. Please check your internet and try again.",
    );
  });

  it("preserves standard user-facing messages", async () => {
    const error = new Error("Please select at least one item");
    const sanitized = await sanitizeErrorMessage(error);
    expect(sanitized).toBe("Please select at least one item");
  });
});
