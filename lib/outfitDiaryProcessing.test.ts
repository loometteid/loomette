import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { processOutfitPhoto } from "./outfitDiaryProcessing";

describe("processOutfitPhoto", () => {
  it("processes outfit photo, invokes extract-garments, and returns staged cutouts and composition", async () => {
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json([
          {
            id: "w-jacket",
            item: {
              item_id: "i-jacket",
              name: "Dinner Jacket",
              image_url: "https://mock.supabase.co/storage/v1/object/public/wardrobe-images/jacket-cutout.png",
              category: "Tops",
              subcategory: "Blazer",
            },
          },
          {
            id: "w-pants",
            item: {
              item_id: "i-pants",
              name: "Tuxedo Pants",
              image_url: "https://mock.supabase.co/storage/v1/object/public/wardrobe-images/pants-cutout.png",
              category: "Bottoms",
              subcategory: "Pants",
            },
          },
        ]);
      }),
    );

    const stepChanges: string[] = [];
    const mockFile = new File(["dummy image"], "photo.jpg", {
      type: "image/jpeg",
    });

    const result = await processOutfitPhoto("user-123", mockFile, {
      onStepChange: (step) => stepChanges.push(step),
    });

    expect(stepChanges).toEqual(["uploading", "extracting", "completed"]);
    expect(result).toBeDefined();
    expect(result.uploadJobId).toBe("mock-job-123");
    // previewUrl should be the primary processed cutout (jacket), NOT the raw photo
    expect(result.previewUrl).toBe(
      "https://mock.supabase.co/storage/v1/object/public/wardrobe-images/jacket-cutout.png",
    );
    // originalUrl should still be the raw photo for "See Original Photo"
    expect(result.originalUrl).toContain("outfit-photos");
    // items should be populated with composition items
    expect(result.items).toHaveLength(2);
    expect(result.items![0].name).toBe("Tuxedo Pants");
    expect(result.items![1].name).toBe("Dinner Jacket");
  });
});
