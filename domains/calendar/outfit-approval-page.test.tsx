import { Suspense } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { mockRouter } from "@/test/setup";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { OutfitApproval } from "./outfit-approval-page";

describe("OutfitApproval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOutfitDiaryUploadStore.setState({
      draft: null,
      result: null,
      savedEntry: null,
    });
  });

  it("renders processed items in composition and allows viewing original photo", async () => {
    const user = userEvent.setup();

    useOutfitDiaryUploadStore.setState({
      draft: {
        userId: "user-123",
        file: new File(["dummy"], "ootd.jpg", { type: "image/jpeg" }),
        wornOn: "2026-10-09",
      },
      result: {
        originalUrl: "https://mock.supabase.co/storage/original-camera.jpg",
        originalPath: "user-123/original.jpg",
        previewUrl: "https://mock.supabase.co/storage/jacket-cutout.png",
        items: [
          {
            id: "w-jacket",
            name: "Dinner Jacket",
            image_url: "https://mock.supabase.co/storage/jacket-cutout.png",
            x: 0.5,
            y: 0.3,
            layerOrder: 25,
          },
          {
            id: "w-pants",
            name: "Tuxedo Pants",
            image_url: "https://mock.supabase.co/storage/pants-cutout.png",
            x: 0.5,
            y: 0.58,
            layerOrder: 10,
          },
        ],
      },
    });

    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <OutfitApproval userId="user-123" />
      </Suspense>,
    );

    // Should display the processed items in the composition
    const jacketImage = await screen.findByAltText("Dinner Jacket");
    expect(jacketImage).toBeInTheDocument();
    expect(screen.getByAltText("Tuxedo Pants")).toBeInTheDocument();

    // Check "See Original Photo" button
    const seeOriginalBtn = screen.getByRole("button", {
      name: /see original photo/i,
    });
    expect(seeOriginalBtn).toBeInTheDocument();

    await user.click(seeOriginalBtn);

    // Dialog showing original photo should open
    expect(screen.getByText("Source Preview")).toBeInTheDocument();
    expect(screen.getByAltText("Original outfit photo")).toBeInTheDocument();
  });

  it("saves outfit with processed items and navigates to calendar details page", async () => {
    const user = userEvent.setup();
    let capturedOutfitItemBody: unknown = null;

    server.use(
      http.post(`${MOCK_SUPABASE_URL}/rest/v1/outfit_item`, async ({ request }) => {
        capturedOutfitItemBody = await request.json();
        return HttpResponse.json([{ id: "mock-outfit-item-1" }], { status: 201 });
      }),
    );

    useOutfitDiaryUploadStore.setState({
      draft: {
        userId: "user-123",
        file: new File(["dummy"], "ootd.jpg", { type: "image/jpeg" }),
        wornOn: "2026-10-09",
      },
      result: {
        originalUrl: "https://mock.supabase.co/storage/original-camera.jpg",
        originalPath: "user-123/original.jpg",
        previewUrl: "https://mock.supabase.co/storage/jacket-cutout.png",
        items: [
          {
            id: "w-jacket",
            name: "Dinner Jacket",
            image_url: "https://mock.supabase.co/storage/jacket-cutout.png",
            x: 0.5,
            y: 0.3,
            layerOrder: 25,
          },
        ],
      },
    });

    const { queryClient } = renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <OutfitApproval userId="user-123" />
      </Suspense>,
    );

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const saveButtons = await screen.findAllByRole("button", { name: /^save$/i });
    expect(saveButtons.length).toBeGreaterThan(0);

    await user.click(saveButtons[0]);

    // Should insert outfit_item
    expect(capturedOutfitItemBody).toEqual([
      {
        outfit_id: "mock-outfit-123",
        wardrobe_item_id: "w-jacket",
        layer_order: 25,
        position_x: 0.5,
        position_y: 0.3,
      },
    ]);

    // Should invalidate calendar, outfits, and wardrobe queries
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["calendar"] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["outfits"] }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["wardrobe"] }),
    );

    // Should navigate to outfits details page
    expect(mockRouter.push).toHaveBeenCalledWith("/calendar/outfits/2026-10-09");
  });
});
