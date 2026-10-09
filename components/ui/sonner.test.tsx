import { render, screen, act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Toaster, useIsDesktop } from "./sonner";
import { toast } from "sonner";

describe("Responsive Toaster", () => {
  beforeEach(() => {
    toast.dismiss();
  });

  function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  it("detects mobile viewport when media query does not match", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);
  });

  it("detects desktop viewport when media query matches (min-width: 1024px)", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });

  it("renders toast at top middle on mobile viewport", async () => {
    mockMatchMedia(false);
    render(<Toaster richColors />);

    act(() => {
      toast("Mobile notification");
    });

    const toastItem = await screen.findByText("Mobile notification");
    const toastContainer = toastItem.closest("[data-sonner-toaster]");
    expect(toastContainer).toHaveAttribute("data-y-position", "top");
    expect(toastContainer).toHaveAttribute("data-x-position", "center");
  });

  it("renders toast at bottom middle on desktop viewport", async () => {
    mockMatchMedia(true);
    render(<Toaster richColors />);

    act(() => {
      toast("Desktop notification");
    });

    const toastItem = await screen.findByText("Desktop notification");
    const toastContainer = toastItem.closest("[data-sonner-toaster]");
    expect(toastContainer).toHaveAttribute("data-y-position", "bottom");
    expect(toastContainer).toHaveAttribute("data-x-position", "center");
  });

  it("honors explicit position override when provided", async () => {
    mockMatchMedia(true);
    render(<Toaster position="top-right" richColors />);

    act(() => {
      toast("Explicit position notification");
    });

    const toastItem = await screen.findByText("Explicit position notification");
    const toastContainer = toastItem.closest("[data-sonner-toaster]");
    expect(toastContainer).toHaveAttribute("data-y-position", "top");
    expect(toastContainer).toHaveAttribute("data-x-position", "right");
  });
});
