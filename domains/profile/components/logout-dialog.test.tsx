import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutDialog } from "./logout-dialog";

describe("LogoutDialog (Component Tier)", () => {
  it("renders title, description, and action buttons when open", () => {
    // Arrange
    const onOpenChange = vi.fn();
    const onConfirmLogout = vi.fn();

    // Act
    render(
      <LogoutDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirmLogout={onConfirmLogout}
      />,
    );

    // Assert
    expect(screen.getByTestId("logout-dialog")).toBeInTheDocument();
    expect(screen.getByText("Log Out?")).toBeInTheDocument();
    expect(
      screen.getByText("Your wardrobe will still be here when you come back."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("logout-dialog__confirm")).toBeInTheDocument();
    expect(screen.getByTestId("logout-dialog__cancel")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when clicking 'Stay in'", async () => {
    // Arrange
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirmLogout = vi.fn();

    render(
      <LogoutDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirmLogout={onConfirmLogout}
      />,
    );

    // Act
    await user.click(screen.getByTestId("logout-dialog__cancel"));

    // Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirmLogout).not.toHaveBeenCalled();
  });

  it("calls onConfirmLogout when clicking 'Yes, log out'", async () => {
    // Arrange
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirmLogout = vi.fn();

    render(
      <LogoutDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirmLogout={onConfirmLogout}
      />,
    );

    // Act
    await user.click(screen.getByTestId("logout-dialog__confirm"));

    // Assert
    expect(onConfirmLogout).toHaveBeenCalledOnce();
  });

  it("disables buttons and shows logging out state when isLoggingOut is true", () => {
    // Arrange & Act
    render(
      <LogoutDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirmLogout={vi.fn()}
        isLoggingOut={true}
      />,
    );

    // Assert
    expect(screen.getByTestId("logout-dialog__confirm")).toBeDisabled();
    expect(screen.getByTestId("logout-dialog__confirm")).toHaveTextContent("Logging out…");
    expect(screen.getByTestId("logout-dialog__cancel")).toBeDisabled();
  });
});
