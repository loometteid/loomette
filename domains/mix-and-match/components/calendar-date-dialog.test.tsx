import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDateDialog } from "./calendar-date-dialog";

describe("CalendarDateDialog (Component Tier)", () => {
  it("renders month, weekdays, and allows selecting date and saving", async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <CalendarDateDialog
        open={true}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
        saving={false}
      />,
    );

    expect(screen.getByTestId("calendar-date-dialog")).toBeInTheDocument();
    expect(
      screen.getByTestId("calendar-date-dialog__month-year"),
    ).toBeInTheDocument();

    // Select a day cell
    const dayButtons = screen.getAllByTestId("calendar-date-dialog__day");
    expect(dayButtons.length).toBeGreaterThan(0);

    const firstDay = dayButtons[0];
    const dayKey = firstDay.getAttribute("data-entity-id")!;
    await user.click(firstDay);

    // Click save button
    const saveBtn = screen.getByTestId("calendar-date-dialog__save-button");
    await user.click(saveBtn);

    expect(handleConfirm).toHaveBeenCalledWith(dayKey);
  });

  it("navigates months using previous and next buttons", async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <CalendarDateDialog
        open={true}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
        saving={false}
      />,
    );

    const monthYear = screen.getByTestId("calendar-date-dialog__month-year");
    const initialText = monthYear.textContent;

    // Click next month
    await user.click(screen.getByTestId("calendar-date-dialog__next-month"));
    expect(monthYear.textContent).not.toBe(initialText);

    // Click previous month
    await user.click(screen.getByTestId("calendar-date-dialog__prev-month"));
    expect(monthYear.textContent).toBe(initialText);
  });

  it("calls onOpenChange(false) when close button is clicked", async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <CalendarDateDialog
        open={true}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
        saving={false}
      />,
    );

    const closeBtn = screen.getByTestId("calendar-date-dialog__close-button");
    await user.click(closeBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
