import { Suspense } from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { ApprovalQueue } from "./wardrobe-approval-page";

describe("ApprovalQueue (Wardrobe Approval Feature)", () => {
  it("renders empty state when there are no pending wardrobe items", async () => {
    renderWithQueryClient(
      <Suspense fallback={<div>Loading approval queue...</div>}>
        <ApprovalQueue userId="user-123" />
      </Suspense>,
    );

    expect(screen.getByText("Loading approval queue...")).toBeInTheDocument();

    const mainContainer = await screen.findByTestId("approval-queue");
    expect(mainContainer).toHaveAttribute("data-entity-id", "user-123");

    expect(screen.getByTestId("approval-queue__title")).toBeInTheDocument();
    expect(screen.getByTestId("approval-queue__count")).toHaveTextContent(
      "0 items",
    );
    expect(
      screen.getByTestId("approval-queue__empty-state"),
    ).toBeInTheDocument();
  });

  it("renders pending wardrobe items when MSW returns pending items", async () => {
    const mockPendingItems = [
      {
        id: "pending-1",
        created_at: "2026-09-28T10:00:00Z",
        size: "M",
        price: "250000",
        purchase_location: "Shopee",
        occasions: ["casual"],
        image_url: "https://example.com/item1.jpg",
        item: {
          item_id: "item-1",
          name: "Linen Shirt",
          category: "top",
          subcategory: "shirts",
          brand: "Zara",
          color: "beige",
          image_url: "https://example.com/item1.jpg",
        },
      },
    ];

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json(mockPendingItems);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading queue...</div>}>
        <ApprovalQueue userId="user-123" />
      </Suspense>,
    );

    await screen.findByTestId("approval-queue__title");

    expect(screen.getByTestId("approval-queue__count")).toHaveTextContent(
      "1 item",
    );

    const items = screen.getAllByTestId("approval-queue__item");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveAttribute("data-entity-id", "pending-1");

    const checkbox = screen.getByTestId("approval-queue__item-checkbox");
    expect(checkbox).toHaveAttribute("data-entity-id", "pending-1");

    expect(
      screen.getByTestId("approval-queue__approve-button"),
    ).toBeInTheDocument();
  });
});
