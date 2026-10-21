import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrivacyPolicyView } from "./privacy-policy-page";

const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: vi.fn(),
  }),
}));

describe("PrivacyPolicyView (D.4.5.1 and 4.5.1)", () => {
  it("renders page title, subtitle, and all 8 sections", () => {
    render(<PrivacyPolicyView />);

    expect(
      screen.getByRole("heading", { name: "Privacy & Policy" }),
    ).toBeInTheDocument();
    expect(screen.getByText("LAST UPDATE: JUNE 2026")).toBeInTheDocument();

    expect(screen.getByText("What we collect")).toBeInTheDocument();
    expect(screen.getByText("How we use it")).toBeInTheDocument();
    expect(screen.getByText("What we don't do")).toBeInTheDocument();
    expect(screen.getByText("Third-party services")).toBeInTheDocument();
    expect(screen.getByText("Your rights")).toBeInTheDocument();
    expect(screen.getByText("How we keep it safe")).toBeInTheDocument();
    expect(screen.getByText("Under 13")).toBeInTheDocument();
    expect(screen.getByText("When this policy changes")).toBeInTheDocument();

    expect(
      screen.getByText("loomette · privacy & policy · version 0.0.1"),
    ).toBeInTheDocument();
  });

  it("renders desktop Table of Contents navigation items", async () => {
    const user = userEvent.setup();
    render(<PrivacyPolicyView />);

    const toc = screen.getByTestId("privacy-policy__toc");
    expect(toc).toBeInTheDocument();

    const tocItem1 = screen.getByTestId("privacy-policy__toc-item-section-01");
    const tocItem2 = screen.getByTestId("privacy-policy__toc-item-section-02");
    expect(tocItem1).toBeInTheDocument();
    expect(tocItem2).toBeInTheDocument();

    // Default active item has warm pill background
    expect(tocItem1).toHaveClass("bg-[#F2EDE5]");

    // Clicking item 2 switches active state
    await user.click(tocItem2);
    expect(tocItem2).toHaveClass("bg-[#F2EDE5]");
  });

  it("triggers router.back when clicking mobile back button", async () => {
    const user = userEvent.setup();
    render(<PrivacyPolicyView />);

    const backBtn = screen.getByTestId("privacy-policy__back-button");
    await user.click(backBtn);
    expect(mockBack).toHaveBeenCalled();
  });
});
