import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input component", () => {
  it("renders with default styling and data-slot", () => {
    render(<Input placeholder="Enter your name" />);
    const input = screen.getByPlaceholderText("Enter your name");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("data-slot", "input");
    expect(input).toHaveClass("border-transparent");
  });

  it("applies border-black when outlined is true", () => {
    render(<Input placeholder="Outlined field" outlined />);
    const input = screen.getByPlaceholderText("Outlined field");
    expect(input).toHaveClass("border-black");
  });

  it("uses black focus outline classes instead of pink ring", () => {
    render(<Input placeholder="Focus test" />);
    const input = screen.getByPlaceholderText("Focus test");
    expect(input).toHaveClass("focus-visible:border-black");
    expect(input).toHaveClass("focus-visible:ring-black/20");
    expect(input).not.toHaveClass("focus-visible:border-ring");
  });

  it("renders endIcon correctly when provided", () => {
    render(
      <Input
        placeholder="With icon"
        endIcon={<span data-testid="test-icon">🔍</span>}
      />,
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("With icon");
    expect(input).toHaveClass("pr-8");
  });
});
