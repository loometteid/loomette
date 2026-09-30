import { describe, expect, it } from "vitest";
import { wardrobeItemFormSchema } from "./wardrobe-item.schema";

describe("wardrobeItemFormSchema", () => {
  it("validates a complete wardrobe item payload", () => {
    const validItem = {
      name: "Vintage Denim Jacket",
      brand: "Levi's",
      category: "outerwear",
      subcategory: "jackets",
      color: "blue",
      size: "M",
      occasions: ["casual", "weekend"],
      price: "1200000",
      purchaseLocation: "Jakarta",
    };

    const result = wardrobeItemFormSchema.safeParse(validItem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Vintage Denim Jacket");
      expect(result.data.brand).toBe("Levi's");
      expect(result.data.occasions).toEqual(["casual", "weekend"]);
    }
  });

  it("permits null or undefined for optional attributes", () => {
    const minimalItem = {
      name: "Plain White Tee",
      brand: "Uniqlo",
      category: null,
      subcategory: undefined,
      color: null,
      size: null,
      occasions: [],
      price: "",
      purchaseLocation: "",
    };

    const result = wardrobeItemFormSchema.safeParse(minimalItem);
    expect(result.success).toBe(true);
  });

  it("fails validation if required string properties are missing", () => {
    const invalidItem = {
      name: "Tee",
      // missing brand, price, purchaseLocation, occasions
    };

    const result = wardrobeItemFormSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });
});
