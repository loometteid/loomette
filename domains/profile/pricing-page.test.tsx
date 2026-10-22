import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PricingView } from "./pricing-page";
import * as checkoutActions from "./actions/create-checkout-session.action";
import * as cancelActions from "./actions/cancel-subscription.action";
import { getProfileQueryOptionsForBrowser } from "./query-options/get-profile.query-option.client";
import { getSubscriptionQueryOptionsForBrowser } from "./query-options/get-subscription.query-option.client";
import type { Database } from "@/types/database.types";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement, client?: QueryClient) {
  const queryClient =
    client ||
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("PricingView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Starter and Pro cards with monthly price selected by default", () => {
    renderWithClient(<PricingView />);

    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();

    const monthlyToggle = screen.getByTestId("billing-cycle-toggle-monthly");
    const annualToggle = screen.getByTestId("billing-cycle-toggle-annual");
    expect(monthlyToggle).toHaveAttribute("aria-checked", "true");
    expect(annualToggle).toHaveAttribute("aria-checked", "false");

    const priceDisplay = screen.getByTestId("pro-price-display");
    expect(priceDisplay).toHaveTextContent("Rp 49k");
    expect(screen.getByText("/month")).toBeInTheDocument();
  });

  it("switches to annual billing cycle when toggled", async () => {
    const user = userEvent.setup();
    renderWithClient(<PricingView />);

    const annualToggle = screen.getByTestId("billing-cycle-toggle-annual");
    await user.click(annualToggle);

    expect(annualToggle).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("billing-cycle-toggle-monthly")).toHaveAttribute(
      "aria-checked",
      "false",
    );

    const priceDisplay = screen.getByTestId("pro-price-display");
    expect(priceDisplay).toHaveTextContent("Rp 470k");
    expect(screen.getByText("/year")).toBeInTheDocument();
  });

  it("triggers createCheckoutSessionAction when Upgrade to Pro is clicked", async () => {
    const user = userEvent.setup();
    const actionSpy = vi
      .spyOn(checkoutActions, "createCheckoutSessionAction")
      .mockResolvedValue({
        success: true,
        checkoutUrl: "https://mock-checkout.com/pay",
        orderId: "ord_test",
      });

    renderWithClient(<PricingView />);

    const upgradeBtn = screen.getByTestId("upgrade-pro-button");
    await user.click(upgradeBtn);

    expect(actionSpy).toHaveBeenCalledWith("monthly");
  });

  it("triggers annual checkout session when annual is selected", async () => {
    const user = userEvent.setup();
    const actionSpy = vi
      .spyOn(checkoutActions, "createCheckoutSessionAction")
      .mockResolvedValue({
        success: true,
        checkoutUrl: "https://mock-checkout.com/pay",
        orderId: "ord_test_annual",
      });

    renderWithClient(<PricingView />);

    const annualToggle = screen.getByTestId("billing-cycle-toggle-annual");
    await user.click(annualToggle);

    const upgradeBtn = screen.getByTestId("upgrade-pro-button");
    await user.click(upgradeBtn);

    expect(actionSpy).toHaveBeenCalledWith("annual");
  });

  it("displays error toast when checkout action fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(checkoutActions, "createCheckoutSessionAction").mockResolvedValue({
      success: false,
      error: "Payment service currently unavailable",
    });

    renderWithClient(<PricingView />);

    const upgradeBtn = screen.getByTestId("upgrade-pro-button");
    await user.click(upgradeBtn);

    expect(toast.error).toHaveBeenCalledWith("Payment service currently unavailable");
  });

  it("displays Active Plan (Pro) and allows downgrade when user is subscribed to Pro", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const userId = "pro_user_123";

    queryClient.setQueryData(
      getProfileQueryOptionsForBrowser(userId).queryKey,
      {
        user_id: userId,
        subscription_tier: "premium",
      } as unknown as Database["public"]["Tables"]["user"]["Row"],
    );
    queryClient.setQueryData(
      getSubscriptionQueryOptionsForBrowser(userId).queryKey,
      {
        user_id: userId,
        tier: "premium",
        status: "active",
      } as unknown as Database["public"]["Tables"]["subscription"]["Row"],
    );

    const cancelSpy = vi
      .spyOn(cancelActions, "cancelSubscriptionAction")
      .mockResolvedValue({ success: true });

    renderWithClient(<PricingView userId={userId} />, queryClient);

    expect(screen.getByTestId("current-plan-button")).toHaveTextContent("Active Plan (Pro)");

    const downgradeBtn = screen.getByText("Downgrade to Free (Mock)");
    await user.click(downgradeBtn);

    expect(cancelSpy).toHaveBeenCalled();
  });
});
