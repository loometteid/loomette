import { describe, expect, it } from "vitest";
import {
  layoutExtractedGarments,
  getPrimaryProcessedImageUrl,
  type StagedGarmentRow,
} from "./garmentComposition";

describe("layoutExtractedGarments", () => {
  it("returns empty array when staged rows are empty or have no image_url", () => {
    expect(layoutExtractedGarments([])).toEqual([]);
    expect(
      layoutExtractedGarments([
        { id: "1", item: null },
        { id: "2", item: { item_id: "i2", name: "No image", image_url: null, category: "Tops", subcategory: "Shirt" } },
      ]),
    ).toEqual([]);
  });

  it("correctly positions and layers a full formal suit outfit", () => {
    const staged: StagedGarmentRow[] = [
      {
        id: "w-jacket",
        item: {
          item_id: "i-jacket",
          name: "White Dinner Jacket with Black Satin Shawl Lapel",
          category: "Tops",
          subcategory: "Blazer",
          image_url: "https://example.com/jacket.png",
        },
      },
      {
        id: "w-shirt",
        item: {
          item_id: "i-shirt",
          name: "White Formal Tuxedo Dress Shirt",
          category: "Tops",
          subcategory: "Shirt",
          image_url: "https://example.com/shirt.png",
        },
      },
      {
        id: "w-tie",
        item: {
          item_id: "i-tie",
          name: "Classic Black Satin Bow Tie",
          category: "Accessories",
          subcategory: "Tie",
          image_url: "https://example.com/tie.png",
        },
      },
      {
        id: "w-pants",
        item: {
          item_id: "i-pants",
          name: "Black Tailored Tuxedo Trousers",
          category: "Bottoms",
          subcategory: "Pants",
          image_url: "https://example.com/pants.png",
        },
      },
      {
        id: "w-shoes",
        item: {
          item_id: "i-shoes",
          name: "Black Patent Leather Dress Shoes",
          category: "Shoes",
          subcategory: "Oxfords",
          image_url: "https://example.com/shoes.png",
        },
      },
    ];

    const result = layoutExtractedGarments(staged);
    expect(result).toHaveLength(5);

    const pants = result.find((i) => i.id === "w-pants")!;
    const shirt = result.find((i) => i.id === "w-shirt")!;
    const jacket = result.find((i) => i.id === "w-jacket")!;
    const tie = result.find((i) => i.id === "w-tie")!;
    const shoes = result.find((i) => i.id === "w-shoes")!;

    // Bottoms lower layer than shirt, shirt lower than jacket, tie over jacket/shirt collar
    expect(pants.layerOrder).toBeLessThan(shirt.layerOrder);
    expect(shirt.layerOrder).toBeLessThan(jacket.layerOrder);
    expect(jacket.layerOrder).toBeLessThan(tie.layerOrder);

    // Vertical spatial order from top to bottom
    expect(tie.y).toBeLessThan(shirt.y);
    expect(shirt.y).toBeLessThan(pants.y);
    expect(pants.y).toBeLessThan(shoes.y);

    // Primary processed image should prefer the jacket
    const primary = getPrimaryProcessedImageUrl(result, staged);
    expect(primary).toBe("https://example.com/jacket.png");
  });

  it("handles casual outfit with head and wrist accessories", () => {
    const staged: StagedGarmentRow[] = [
      {
        id: "w-tee",
        item: {
          item_id: "i-tee",
          name: "Graphic T-Shirt",
          category: "Tops",
          subcategory: "T-Shirt",
          image_url: "https://example.com/tee.png",
        },
      },
      {
        id: "w-cap",
        item: {
          item_id: "i-cap",
          name: "Baseball Cap",
          category: "Accessories",
          subcategory: "Cap",
          image_url: "https://example.com/cap.png",
        },
      },
      {
        id: "w-watch",
        item: {
          item_id: "i-watch",
          name: "Chronograph Watch",
          category: "Accessories",
          subcategory: "Watch",
          image_url: "https://example.com/watch.png",
        },
      },
    ];

    const result = layoutExtractedGarments(staged);
    const cap = result.find((i) => i.id === "w-cap")!;
    const watch = result.find((i) => i.id === "w-watch")!;
    const tee = result.find((i) => i.id === "w-tee")!;

    expect(cap.y).toBe(0.1); // Head level
    expect(watch.x).toBe(0.78); // Right wrist
    expect(tee.y).toBe(0.28);
  });
});
