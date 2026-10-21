import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("Label component", () => {
  it("renders with default slate text color and data-slot", () => {
    render(<Label htmlFor="test-input">Test Label</Label>);
    const label = screen.getByText("Test Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("data-slot", "label");
    expect(label).toHaveAttribute("for", "test-input");
    expect(label).toHaveClass("text-slate");
  });

  it("allows custom class overrides while preserving base styling", () => {
    render(
      <Label className="uppercase tracking-wider font-semibold">
        Custom Label
      </Label>,
    );
    const label = screen.getByText("Custom Label");
    expect(label).toHaveClass("uppercase");
    expect(label).toHaveClass("tracking-wider");
    expect(label).toHaveClass("font-semibold");
    expect(label).toHaveClass("text-slate");
  });
});
