import { Suspense } from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { ApprovalQueue } from "./approval-queue";

describe("ApprovalQueue (Wardrobe Approval Feature)", () => {
  it("renders empty state when there are no pending wardrobe items", async () => {
    renderWithQueryClient(
      <Suspense fallback={<div>Loading approval queue...</div>}>
        <ApprovalQueue userId="user-123" />
      </Suspense>,
    );

    expect(screen.getByText("Loading approval queue...")).toBeInTheDocument();

    const heading = await screen.findByRole("heading", {
      name: "Approval Queue",
    });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("0 items")).toBeInTheDocument();
    expect(
      screen.getByText("All caught up. Nothing to review."),
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

    await screen.findByRole("heading", { name: "Approval Queue" });

    expect(screen.getByText("1 item")).toBeInTheDocument();
    expect(screen.getByText("Linen Shirt")).toBeInTheDocument();
    expect(screen.getByText(/Zara/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /approve/i }),
    ).toBeInTheDocument();
  });
});
