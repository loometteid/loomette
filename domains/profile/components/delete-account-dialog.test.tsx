import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteAccountDialog } from "./delete-account-dialog";

describe("DeleteAccountDialog (Component Tier)", () => {
  it("renders step 1 with warning and navigation buttons", () => {
    // Arrange
    const onOpenChange = vi.fn();
    const onConfirmDelete = vi.fn();

    // Act
    render(
      <DeleteAccountDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirmDelete={onConfirmDelete}
      />,
    );

    // Assert
    expect(screen.getByTestId("delete-account-dialog")).toBeInTheDocument();
    expect(screen.getByText("Before you go.")).toBeInTheDocument();
    expect(
      screen.getByTestId("delete-account-dialog__continue-step-1"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("delete-account-dialog__cancel-step-1"),
    ).toBeInTheDocument();
  });

  it(
    "progresses through 3 steps and submits after confirmation typing",
    async () => {
    // Arrange
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirmDelete = vi.fn();

    render(
      <DeleteAccountDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirmDelete={onConfirmDelete}
      />,
    );

    // Act 1: Click Continue on Step 1
    await user.click(screen.getByTestId("delete-account-dialog__continue-step-1"));

    // Assert 1: Step 2 is shown
    expect(screen.getByText("What's not working?")).toBeInTheDocument();
    const reasonOption = screen.getByText("I don't use it enough");
    expect(reasonOption).toBeInTheDocument();

    // Act 2: Select a reason and type feedback
    await user.click(reasonOption);
    await user.type(
      screen.getByTestId("delete-account-dialog__feedback-input"),
      "Not enough winter outfits",
    );
    await user.click(screen.getByTestId("delete-account-dialog__continue-step-2"));

    // Assert 2: Step 3 is shown and submit button is initially disabled
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    const submitBtn = screen.getByTestId("delete-account-dialog__submit-button");
    expect(submitBtn).toBeDisabled();

    // Act 3: Type 'DELETE' into the confirmation input
    await user.type(
      screen.getByTestId("delete-account-dialog__confirm-input"),
      "DELETE",
    );

    // Assert 3: Submit button is now enabled
    expect(submitBtn).toBeEnabled();

    // Act 4: Submit deletion
    await user.click(submitBtn);

    // Assert 4: onConfirmDelete called with captured survey data
    expect(onConfirmDelete).toHaveBeenCalledWith({
      reasons: ["I don't use it enough"],
      feedback: "Not enough winter outfits",
    });
  }, 15000);

  it("calls onOpenChange(false) when cancelling on step 1", async () => {
    // Arrange
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <DeleteAccountDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirmDelete={vi.fn()}
      />,
    );

    // Act
    await user.click(screen.getByTestId("delete-account-dialog__cancel-step-1"));

    // Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
