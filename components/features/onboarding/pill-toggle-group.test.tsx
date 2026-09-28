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

  it("renders all options as buttons", () => {
    render(
      <PillToggleGroup
        options={options}
        isSelected={(val) => val === "casual"}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Casual" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Formal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Party" })).toBeInTheDocument();
  });

  it("applies active styles to selected pill", () => {
    render(
      <PillToggleGroup
        options={options}
        isSelected={(val) => val === "formal"}
        onToggle={() => {}}
      />,
    );

    const formalButton = screen.getByRole("button", { name: "Formal" });
    const casualButton = screen.getByRole("button", { name: "Casual" });

    expect(formalButton).toHaveClass("border-foreground", "text-foreground");
    expect(casualButton).toHaveClass("text-muted-foreground");
  });

  it("calls onToggle with the clicked option value", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(
      <PillToggleGroup
        options={options}
        isSelected={(val) => val === "casual"}
        onToggle={handleToggle}
      />,
    );

    const partyButton = screen.getByRole("button", { name: "Party" });
    await user.click(partyButton);

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith("party");
  });
});
