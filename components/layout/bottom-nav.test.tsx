import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BottomNav } from "./bottom-nav";

describe("BottomNav", () => {
  it("renders mobile navigation bar with 4 core tabs", () => {
    render(<BottomNav />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass("lg:hidden");

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/home",
    );
    expect(screen.getByRole("link", { name: /calendar/i })).toHaveAttribute(
      "href",
      "/calendar",
    );
    expect(screen.getByRole("link", { name: /wardrobe/i })).toHaveAttribute(
      "href",
      "/wardrobe",
    );
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/profile",
    );
  });
});
