import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges standard class names and handles conditionals", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    expect(cn("px-4", false && "hidden", null, undefined, "text-sm")).toBe(
      "px-4 text-sm",
    );
  });

  it("resolves conflicting standard Tailwind utility classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("preserves custom typography scale when combined with color utilities", () => {
    // Verified against custom twMerge config in lib/utils.ts:
    // text-mega-title, text-title, text-h1, text-subtitle must not be stripped by text-white
    expect(cn("text-title", "text-white")).toBe("text-title text-white");
    expect(cn("text-h1", "text-primary")).toBe("text-h1 text-primary");
    expect(cn("text-mega-title", "text-foreground")).toBe(
      "text-mega-title text-foreground",
    );
    expect(cn("text-subtitle", "text-muted-foreground")).toBe(
      "text-subtitle text-muted-foreground",
    );
  });
});
