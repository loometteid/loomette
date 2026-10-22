import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mockNotFound } from "@/test/setup";
import NotificationsPage from "./page";

describe("NotificationsPage (Route Lifecycle Tier)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws notFound() when NODE_ENV is production", async () => {
    // Arrange: Simulate production environment via Vitest env stubbing
    vi.stubEnv("NODE_ENV", "production");

    // Act & Assert
    await expect(NotificationsPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });
});
