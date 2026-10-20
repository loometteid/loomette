import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { PlanOutfitDialog } from "./plan-outfit-dialog";

vi.spyOn(toast, "info");

describe("PlanOutfitDialog (Component Tier)", () => {
  it("renders modal with title, description, and action buttons when open", () => {
    // Arrange & Act
    render(
      <PlanOutfitDialog
        tripId="trip-456"
        day="2026-10-02"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByTestId("plan-outfit-dialog__title")).toHaveTextContent(
      "Planning outfits for your day?",
    );
    expect(
      screen.getByText(/Pick how you want to build your travel looks/i),
    ).toBeInTheDocument();

    const mixAndMatch = screen.getByTestId("plan-outfit-dialog__mix-and-match");
    expect(mixAndMatch).toHaveAttribute(
      "href",
      "/mix-and-match?tripId=trip-456&day=2026-10-02&returnTo=%2Ftrip%2Ftrip-456",
    );

    const pickCollection = screen.getByTestId("plan-outfit-dialog__pick-collection");
    expect(pickCollection).toBeInTheDocument();
  });

  it("handles pick collection action and closes dialog", async () => {
    // Arrange
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    render(
      <PlanOutfitDialog
        tripId="trip-456"
        day="2026-10-02"
        open={true}
        onOpenChange={handleOpenChange}
      />,
    );

    // Act
    const pickCollection = screen.getByTestId("plan-outfit-dialog__pick-collection");
    await user.click(pickCollection);

    // Assert
    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(toast.info).toHaveBeenCalledWith(
      "Wardrobe collection selection coming soon!",
    );
  });
});
