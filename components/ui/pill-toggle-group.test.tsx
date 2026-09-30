import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PillToggleGroup } from "./pill-toggle-group";

describe("PillToggleGroup component", () => {
  const options = [
    { value: "casual", label: "Casual" },
    { value: "formal", label: "Formal" },
    { value: "party", label: "Party" },
  ] as const;

  it("renders all options with data-testid and data-entity-id attributes", () => {
    render(
      <PillToggleGroup
        options={options}
        isSelected={(val) => val === "casual"}
        onToggle={() => {}}
        data-testid="onboarding__style-pills"
      />,
    );

    const group = screen.getByTestId("onboarding__style-pills");
    expect(group).toBeInTheDocument();

    const pills = screen.getAllByTestId("pill-toggle-group__option");
    expect(pills).toHaveLength(3);
    expect(pills[0]).toHaveAttribute("data-entity-id", "casual");
    expect(pills[1]).toHaveAttribute("data-entity-id", "formal");
    expect(pills[2]).toHaveAttribute("data-entity-id", "party");
  });

  it("applies active styles to selected pill", () => {
    const { container } = render(
      <PillToggleGroup
        options={options}
        isSelected={(val) => val === "formal"}
        onToggle={() => {}}
      />,
    );

    const formalButton = container.querySelector(
      '[data-testid="pill-toggle-group__option"][data-entity-id="formal"]',
    );
    const casualButton = container.querySelector(
      '[data-testid="pill-toggle-group__option"][data-entity-id="casual"]',
    );

    expect(formalButton).toHaveClass("border-foreground", "text-foreground");
    expect(casualButton).toHaveClass("text-muted-foreground");
  });

  it("calls onToggle with the clicked option value", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    const { container } = render(
      <PillToggleGroup
        options={options}
        isSelected={(val) => val === "casual"}
        onToggle={handleToggle}
      />,
    );

    const partyButton = container.querySelector(
      '[data-testid="pill-toggle-group__option"][data-entity-id="party"]',
    );
    expect(partyButton).not.toBeNull();
    await user.click(partyButton!);

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith("party");
  });
});
