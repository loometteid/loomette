import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DesktopNav, DesktopNavFallback } from "./desktop-nav";
import { renderWithQueryClient } from "@/test/test-utils";

describe("DesktopNav", () => {
  it("renders DesktopNavFallback with sticky positioning and correct navigation links", () => {
    render(<DesktopNavFallback />);

    const header = screen.getByTestId("desktop-nav");
    expect(header).toBeInTheDocument();
    expect(header.className).toContain("sticky");
    expect(header.className).toContain("top-0");
    expect(header.className).toContain("z-40");

    expect(screen.getByTestId("desktop-nav__brand")).toHaveAttribute("href", "/home");
    expect(screen.getByTestId("desktop-nav__tab-home")).toHaveAttribute("href", "/home");
    expect(screen.getByTestId("desktop-nav__tab-calendar")).toHaveAttribute("href", "/calendar");
    expect(screen.getByTestId("desktop-nav__tab-wardrobe")).toHaveAttribute("href", "/wardrobe");
    expect(screen.getByTestId("desktop-nav__profile")).toHaveAttribute("href", "/profile");
  });

  it("renders DesktopNav with sticky positioning and custom display name", () => {
    renderWithQueryClient(<DesktopNav displayName="Alex" />);

    const header = screen.getByTestId("desktop-nav");
    expect(header).toBeInTheDocument();
    expect(header.className).toContain("sticky");
    expect(header.className).toContain("top-0");
    expect(header.className).toContain("z-40");

    expect(screen.getByText("Alex")).toBeInTheDocument();
  });
});
