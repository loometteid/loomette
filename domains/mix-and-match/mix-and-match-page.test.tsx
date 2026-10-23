import { Suspense } from "react";
import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { mockRouter } from "@/test/setup";
import { MixAndMatchCanvas } from "./mix-and-match-page";

const mockWardrobeRows = [
  {
    id: "wardrobe-top-1",
    user_id: "user-123",
    is_approved: true,
    item: {
      item_id: "item-top-1",
      name: "White Linen Shirt",
      category: "Tops",
      subcategory: "Shirt",
      image_url: "https://example.com/shirt.png",
    },
  },
  {
    id: "wardrobe-bottom-1",
    user_id: "user-123",
    is_approved: true,
    item: {
      item_id: "item-bottom-1",
      name: "Beige Trousers",
      category: "Bottoms",
      subcategory: "Pants",
      image_url: "https://example.com/pants.png",
    },
  },
  {
    id: "wardrobe-shoes-1",
    user_id: "user-123",
    is_approved: true,
    item: {
      item_id: "item-shoes-1",
      name: "Leather Loafers",
      category: "Shoes",
      subcategory: "Sandals",
      image_url: "https://example.com/shoes.png",
    },
  },
];

describe("MixAndMatchCanvas (Component & Integration Tier)", () => {
  it("renders page header, canvas, category tabs, and subcategories", async () => {
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json(mockWardrobeRows);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading canvas...</div>}>
        <MixAndMatchCanvas userId="user-123" />
      </Suspense>,
    );

    expect(await screen.findByTestId("mix-and-match__title")).toHaveTextContent(
      "Mix & Match",
    );

    expect(screen.getByTestId("mix-and-match__canvas")).toBeInTheDocument();
    expect(
      screen.getByTestId("mix-and-match__empty-state"),
    ).toHaveTextContent("Tap or drag wardrobe items here to start your look.");

    // Verify category tabs exist
    const tabs = screen.getAllByTestId("mix-and-match__category-tab");
    expect(tabs.length).toBeGreaterThanOrEqual(4);
    expect(tabs[0]).toHaveTextContent("Tops");
  });

  it("adds an item to the canvas when tapped from the picker, allows selecting and moving layers", async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json(mockWardrobeRows);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading canvas...</div>}>
        <MixAndMatchCanvas userId="user-123" />
      </Suspense>,
    );

    // Wait for wardrobe items to load in picker
    const pickerItem = await screen.findByTestId("mix-and-match__picker-item");
    expect(pickerItem).toHaveAttribute("data-entity-id", "wardrobe-top-1");

    // Click picker item to add to canvas
    await user.click(pickerItem);

    // Verify item is now rendered on canvas
    const canvasItem = await screen.findByTestId("mix-and-match__canvas-item");
    expect(canvasItem).toHaveAttribute("data-entity-id", "wardrobe-top-1");

    // Selection border is visible
    expect(
      screen.getByTestId("mix-and-match__selection-border"),
    ).toBeInTheDocument();

    // Empty state should be gone
    expect(
      screen.queryByTestId("mix-and-match__empty-state"),
    ).not.toBeInTheDocument();
  });

  it("deletes a selected item when trash button is clicked", async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json(mockWardrobeRows);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading canvas...</div>}>
        <MixAndMatchCanvas userId="user-123" />
      </Suspense>,
    );

    const pickerItem = await screen.findByTestId("mix-and-match__picker-item");
    await user.click(pickerItem);

    const canvasItem = await screen.findByTestId("mix-and-match__canvas-item");
    expect(canvasItem).toBeInTheDocument();

    // Click trash button
    const trashBtn = screen.getByTestId("mix-and-match__trash-button");
    expect(trashBtn).not.toBeDisabled();
    await user.click(trashBtn);

    // Item should be removed from canvas
    expect(
      screen.queryByTestId("mix-and-match__canvas-item"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("mix-and-match__empty-state"),
    ).toBeInTheDocument();
  });

  it("shuffles outfit items onto canvas when shuffle button is clicked", async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json(mockWardrobeRows);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading canvas...</div>}>
        <MixAndMatchCanvas userId="user-123" />
      </Suspense>,
    );

    await screen.findByTestId("mix-and-match__picker-item");

    const shuffleBtn = screen.getByTestId("mix-and-match__shuffle-button");
    await user.click(shuffleBtn);

    // Should place items for tops, bottoms, shoes
    const canvasItems = await screen.findAllByTestId("mix-and-match__canvas-item");
    expect(canvasItems.length).toBeGreaterThanOrEqual(2);
  });

  it("saves the outfit and routes to the result page", async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json(mockWardrobeRows);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading canvas...</div>}>
        <MixAndMatchCanvas userId="user-123" />
      </Suspense>,
    );

    const pickerItem = await screen.findByTestId("mix-and-match__picker-item");
    await user.click(pickerItem);

    const saveBtn = screen.getByTestId("mix-and-match__save-button");
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/mix-and-match/result/mock-outfit-123",
      );
    });
  });
});
