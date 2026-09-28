import { describe, expect, it } from "vitest";
import { STYLE_TAG_OPTIONS, styleTagLabel, type StyleTag } from "./styleTags";

describe("styleTags utility", () => {
  it("returns human-readable label for a valid style tag", () => {
    expect(styleTagLabel("clean_minimal")).toBe("Clean & Minimal");
    expect(styleTagLabel("office_ready")).toBe("Office-Ready");
    expect(styleTagLabel("bold_expressive")).toBe("Bold & Expressive");
  });

  it("falls back to the raw tag string if unknown", () => {
    expect(styleTagLabel("unknown_tag" as StyleTag)).toBe("unknown_tag");
  });

  it("contains all expected style tag options", () => {
    const values = STYLE_TAG_OPTIONS.map((opt) => opt.value);
    expect(values).toContain("clean_minimal");
    expect(values).toContain("effortlessly_casual");
    expect(values).toContain("soft_feminine");
    expect(values).toContain("street_inspired");
    expect(values).toContain("still_figuring_it_out");
  });
});
