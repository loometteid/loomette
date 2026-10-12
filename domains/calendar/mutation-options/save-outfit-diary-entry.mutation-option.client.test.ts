import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import {
  saveOutfitDiaryEntryMutationOptions,
  type SaveOutfitDiaryEntryVariables,
} from "./save-outfit-diary-entry.mutation-option.client";

describe("saveOutfitDiaryEntryMutationOptions", () => {
  it("creates outfit, outfit_item rows, and wear_log record with processed cutouts", async () => {
    let capturedOutfitItemBody: unknown = null;

    server.use(
      http.post(`${MOCK_SUPABASE_URL}/rest/v1/outfit_item`, async ({ request }) => {
        capturedOutfitItemBody = await request.json();
        return HttpResponse.json([{ id: "mock-outfit-item-1" }], { status: 201 });
      }),
    );

    const input: SaveOutfitDiaryEntryVariables = {
      userId: "user-123",
      previewUrl: "https://example.com/processed-jacket.png",
      wornOn: "2026-10-09",
      name: "Chic Evening Suit",
      items: [
        {
          id: "w-jacket",
          name: "White Dinner Jacket",
          image_url: "https://example.com/processed-jacket.png",
          x: 0.5,
          y: 0.3,
          layerOrder: 25,
        },
        {
          id: "w-pants",
          name: "Black Tuxedo Trousers",
          image_url: "https://example.com/processed-pants.png",
          x: 0.5,
          y: 0.58,
          layerOrder: 10,
        },
      ],
    };

    const options = saveOutfitDiaryEntryMutationOptions();
    expect(options.mutationFn).toBeDefined();

    const result = await options.mutationFn!(input, {} as never);

    expect(result).toBeDefined();
    expect(result.outfitId).toBe("mock-outfit-123");
    expect(result.wearLogId).toBe("mock-wear-log-123");
    expect(result.coverImageUrl).toBe("https://example.com/processed-jacket.png");
    expect(result.wornOn).toBe("2026-10-09");
    expect(result.name).toBe("Chic Evening Suit");

    // Verify outfit_item was inserted with correct positions and layer orders
    expect(capturedOutfitItemBody).toEqual([
      {
        outfit_id: "mock-outfit-123",
        wardrobe_item_id: "w-jacket",
        layer_order: 25,
        position_x: 0.5,
        position_y: 0.3,
      },
      {
        outfit_id: "mock-outfit-123",
        wardrobe_item_id: "w-pants",
        layer_order: 10,
        position_x: 0.5,
        position_y: 0.58,
      },
    ]);
  });

  it("handles fallback when no items are passed", async () => {
    let outfitItemCalled = false;
    server.use(
      http.post(`${MOCK_SUPABASE_URL}/rest/v1/outfit_item`, () => {
        outfitItemCalled = true;
        return HttpResponse.json([], { status: 201 });
      }),
    );

    const input: SaveOutfitDiaryEntryVariables = {
      userId: "user-123",
      previewUrl: "https://example.com/fallback-photo.jpg",
      wornOn: "2026-10-09",
    };

    const options = saveOutfitDiaryEntryMutationOptions();
    const result = await options.mutationFn!(input, {} as never);

    expect(result).toBeDefined();
    expect(outfitItemCalled).toBe(false);
  });
});
