import { describe, expect, it } from "vitest";
import { editTripSchema } from "./edit-trip.schema";

describe("editTripSchema", () => {
  it("validates successfully with valid date range and attributes", () => {
    const validData = {
      name: "Summer Vacation in Bali",
      startDate: "2026-07-01",
      endDate: "2026-07-10",
      season: "summer",
      companion: "family",
    };

    const result = editTripSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Summer Vacation in Bali");
      expect(result.data.startDate).toBe("2026-07-01");
      expect(result.data.endDate).toBe("2026-07-10");
    }
  });

  it("allows nullable and optional season and companion", () => {
    const minimalData = {
      name: "Quick Getaway",
      startDate: "2026-08-01",
      endDate: "2026-08-03",
      season: null,
      companion: null,
    };

    const result = editTripSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  it("fails when startDate or endDate is empty", () => {
    const missingDates = {
      name: "Trip Without Dates",
      startDate: "",
      endDate: "",
    };

    const result = editTripSchema.safeParse(missingDates);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.startDate).toContain(
        "Please pick both a start and end date.",
      );
      expect(fieldErrors.endDate).toContain(
        "Please pick both a start and end date.",
      );
    }
  });

  it("rejects an endDate that is earlier than startDate", () => {
    const invalidDateOrder = {
      name: "Time Travel Trip",
      startDate: "2026-10-15",
      endDate: "2026-10-10",
    };

    const result = editTripSchema.safeParse(invalidDateOrder);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.endDate).toContain(
        "End date can't be before the start date.",
      );
    }
  });

  it("accepts same-day trip (startDate equals endDate)", () => {
    const dayTrip = {
      name: "Day Trip to Bandung",
      startDate: "2026-09-28",
      endDate: "2026-09-28",
    };

    const result = editTripSchema.safeParse(dayTrip);
    expect(result.success).toBe(true);
  });
});
