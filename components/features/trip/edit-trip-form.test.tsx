import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { mockRouter } from "@/test/setup";
import { renderWithQueryClient } from "@/test/test-utils";
import { EditTripForm } from "./edit-trip-form";

vi.spyOn(toast, "error");

describe("EditTripForm integration", () => {
  it("renders the empty form in create mode", () => {
    renderWithQueryClient(<EditTripForm userId="user-123" />);

    expect(
      screen.getByRole("button", { name: /go back/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("navigates back when clicking the back button", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<EditTripForm userId="user-123" />);

    const backButton = screen.getByRole("button", { name: /go back/i });
    await user.click(backButton);

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it("shows an error and blocks submission if dates are omitted", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<EditTripForm userId="user-123" />);

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please pick both a start and end date.",
      );
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("submits valid trip, calls Supabase via MSW, and routes to created trip", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<EditTripForm userId="user-123" />);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    const saveButton = screen.getByRole("button", { name: /save/i });

    // Fill in valid dates
    await user.type(startDateInput, "2026-10-01");
    await user.type(endDateInput, "2026-10-08");

    await user.click(saveButton);

    // Wait for the mutation to finish and router.push to be invoked with the created ID
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/trip/mock-trip-123");
    });
  });
});
