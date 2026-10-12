import { describe, expect, it } from "vitest";
import { normalizeImageForUpload } from "./imageNormalization";

describe("normalizeImageForUpload", () => {
  it("returns original blob safely if canvas is not available or decoding fails", async () => {
    const fakeBlob = new Blob(["test-data"], { type: "image/avif" });
    const result = await normalizeImageForUpload(fakeBlob);
    expect(result).toBeDefined();
    expect(result.size).toBe(fakeBlob.size);
  });

  it("handles standard image types gracefully", async () => {
    const jpegBlob = new Blob(["dummy-jpeg-bytes"], { type: "image/jpeg" });
    const result = await normalizeImageForUpload(jpegBlob);
    expect(result).toBeDefined();
    expect(result.size).toBe(jpegBlob.size);
  });
});
