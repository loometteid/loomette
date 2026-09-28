import { describe, expect, it } from "vitest";
import { SEASON_OPTIONS, TRAVEL_COMPANION_OPTIONS } from "./tripOptions";

describe("tripOptions constants", () => {
  it("provides valid season options", () => {
    const seasonValues = SEASON_OPTIONS.map((s) => s.value);
    expect(seasonValues).toEqual(["winter", "spring", "summer", "autumn"]);
  });

  it("provides valid travel companion options", () => {
    const companionValues = TRAVEL_COMPANION_OPTIONS.map((c) => c.value);
    expect(companionValues).toEqual([
      "solo_trip",
      "couple",
      "family",
      "business",
    ]);
  });
});
