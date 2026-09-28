import { describe, expect, it } from "vitest";
import { generateOutfitName } from "./outfitNames";

describe("generateOutfitName", () => {
  it("generates a non-empty two-word string", () => {
    const name = generateOutfitName();
    expect(name).toBeTruthy();
    const parts = name.trim().split(" ");
    expect(parts.length).toBeGreaterThanOrEqual(2);
  });

  it("produces variations over multiple calls", () => {
    const names = new Set(
      Array.from({ length: 15 }, () => generateOutfitName()),
    );
    expect(names.size).toBeGreaterThan(1);
  });
});
