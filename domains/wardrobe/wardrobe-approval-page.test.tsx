import { Suspense } from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    expect(screen.getByTestId("approval-queue__title")).toHaveTextContent(
      "We found these pieces.",
    );
    expect(
      screen.getByTestId("approval-queue__empty-state"),
    ).toBeInTheDocument();
  });

  it("renders pending wardrobe items with duplicate badges and selection", async () => {
    const mockPendingItems = [
      {
        id: "pending-1",
        created_at: "2026-09-28T10:00:00Z",
        size: "m",
        price: 250000,
        purchase_location: "Shopee",
        occasions: ["everyday"],
        image_url: "https://example.com/item1.jpg",
        is_duplicate: true,
        item: {
          item_id: "item-1",
          name: "Linen Shirt",
          category: "Tops",
          subcategory: "Shirt",
          brand: "Zara",
          color: "blue",
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

    const items = screen.getAllByTestId("approval-queue__item");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveAttribute("data-entity-id", "pending-1");

    expect(screen.getByTestId("approval-queue__item-name")).toHaveTextContent(
      "Linen Shirt",
    );
    expect(
      screen.getByTestId("approval-queue__duplicate-badge"),
    ).toHaveTextContent("Possible duplicate");

    const checkbox = screen.getByTestId("approval-queue__item-checkbox");
    expect(checkbox).toHaveAttribute("data-entity-id", "pending-1");

    expect(
      screen.getByTestId("approval-queue__approve-button"),
    ).toBeInTheDocument();
  });

  it("blocks approval and highlights missing category/subcategory (User Story 2.11)", async () => {
    const mockItemMissingCategory = [
      {
        id: "pending-incomplete",
        created_at: "2026-09-28T10:00:00Z",
        size: null,
        price: null,
        purchase_location: null,
        occasions: [],
        image_url: "https://example.com/item2.jpg",
        is_duplicate: false,
        item: {
          item_id: "item-2",
          name: "Untagged Piece",
          category: null,
          subcategory: null,
          brand: null,
          color: null,
          image_url: "https://example.com/item2.jpg",
        },
      },
    ];

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json(mockItemMissingCategory);
      }),
    );

    const user = userEvent.setup();

    renderWithQueryClient(
      <Suspense fallback={<div>Loading queue...</div>}>
        <ApprovalQueue userId="user-123" />
      </Suspense>,
    );

    await screen.findByTestId("approval-queue__title");

    // Validation warning should be shown on the item
    expect(
      screen.getByTestId("approval-queue__validation-warning"),
    ).toHaveTextContent("Needs Category & Subcategory");

    // Select the item
    const checkbox = screen.getByTestId("approval-queue__item-checkbox");
    await user.click(checkbox);

    // Approve button should be disabled because required fields are missing
    const approveBtn = screen.getByTestId("approval-queue__approve-button");
    expect(approveBtn).toBeDisabled();
  });

  it("opens delete confirmation modal when trash button is clicked (User Story 2.10 / Figma 3.1.2)", async () => {
    const mockPendingItems = [
      {
        id: "pending-del",
        created_at: "2026-09-28T10:00:00Z",
        size: "s",
        price: null,
        purchase_location: null,
        occasions: [],
        image_url: "https://example.com/item3.jpg",
        is_duplicate: false,
        item: {
          item_id: "item-3",
          name: "Discardable Shirt",
          category: "Tops",
          subcategory: "Shirt",
          brand: null,
          color: null,
          image_url: "https://example.com/item3.jpg",
        },
      },
    ];

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json(mockPendingItems);
      }),
    );

    const user = userEvent.setup();

    renderWithQueryClient(
      <Suspense fallback={<div>Loading queue...</div>}>
        <ApprovalQueue userId="user-123" />
      </Suspense>,
    );

    await screen.findByTestId("approval-queue__title");

    // Select the item
    const checkbox = screen.getByTestId("approval-queue__item-checkbox");
    await user.click(checkbox);

    // Trash button should be enabled
    const discardBtn = screen.getByTestId("approval-queue__discard-button");
    expect(discardBtn).toBeEnabled();

    // Click trash button
    await user.click(discardBtn);

    // Confirmation dialog opens
    expect(screen.getByTestId("delete-confirm-dialog")).toBeInTheDocument();
    expect(
      screen.getByTestId("delete-confirm-dialog__title"),
    ).toHaveTextContent("Delete item?");
    expect(
      screen.getByTestId("delete-confirm-dialog__confirm-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("delete-confirm-dialog__cancel-button"),
    ).toBeInTheDocument();
  });
});
