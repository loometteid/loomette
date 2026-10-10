import { Suspense } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { mockRouter } from "@/test/setup";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { OutfitLoading } from "./outfit-approval-loading";

describe("OutfitLoading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOutfitDiaryUploadStore.setState({
      draft: null,
      result: null,
      savedEntry: null,
    });
  });

  it("processes outfit photo, invokes extract-garments, invalidates wardrobe queries, and routes to approval", async () => {
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json([
          {
            id: "w-item-1",
            item: {
              item_id: "i-item-1",
              name: "Denim Jacket",
              image_url: "https://mock.supabase.co/storage/jacket.png",
              category: "Tops",
              subcategory: "Jacket",
            },
          },
        ]);
      }),
    );

    useOutfitDiaryUploadStore.setState({
      draft: {
        userId: "user-123",
        file: new File(["image data"], "look.jpg", { type: "image/jpeg" }),
        wornOn: "2026-10-09",
      },
    });

    const { queryClient } = renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <OutfitLoading userId="user-123" />
      </Suspense>,
    );

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    expect(
      await screen.findByRole("heading", {
        name: /generating your gorgeous look/i,
      }),
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          "/calendar/outfit-approval",
        );
      },
      { timeout: 3000 },
    );

    // Verify wardrobe queries were invalidated when extract-garments completed
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["wardrobe"] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["wardrobe", "pending-count", "user-123"],
      }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["wardrobe", "pending-items", "user-123"],
      }),
    );
  });
});
