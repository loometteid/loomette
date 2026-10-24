import { Suspense } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { renderWithQueryClient } from "@/test/test-utils";
import { ConnectedAccountsView } from "./connected-accounts-page";

vi.spyOn(toast, "error");
vi.spyOn(toast, "info");
vi.spyOn(toast, "success");

const MOCK_USER = {
  id: "user-123",
  email: "hello@gmail.com",
  app_metadata: { provider: "google" },
  identities: [
    {
      id: "google-123",
      identity_id: "google-123",
      user_id: "user-123",
      provider: "google",
      identity_data: {},
      created_at: "2026-01-01T00:00:00Z",
      last_sign_in_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ],
};

describe("ConnectedAccountsView (Component & Integration Tier)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title, subtitle, and all three providers (Google, Facebook, X)", async () => {
    // Arrange & Act
    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <ConnectedAccountsView initialUser={MOCK_USER} />
      </Suspense>,
    );

    // Assert: Check header and description
    const title = await screen.findByTestId("connected-accounts__title");
    expect(title).toHaveTextContent("Connected Account");

    expect(
      screen.getByText(/Link your accounts to log in faster/i),
    ).toBeInTheDocument();

    // Assert: Check providers list
    const items = screen.getAllByTestId("connected-accounts__item");
    expect(items).toHaveLength(3);

    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("prevents disconnecting the only authenticated provider and displays error toast", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <ConnectedAccountsView initialUser={MOCK_USER} />
      </Suspense>,
    );

    await screen.findByTestId("connected-accounts__title");

    // Act: Click disconnect on Google
    const googleToggle = screen.getByTestId("connected-accounts__google-toggle");
    await user.click(googleToggle);

    // Assert: Error toast is triggered because Google is the sole provider
    expect(toast.error).toHaveBeenCalledWith(
      "You cannot disconnect your only sign-in method.",
    );
  });

  it("handles connect action on unlinked providers with user feedback", async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <ConnectedAccountsView initialUser={MOCK_USER} />
      </Suspense>,
    );

    await screen.findByTestId("connected-accounts__title");

    // Act: Click connect on Facebook
    const facebookToggle = screen.getByTestId("connected-accounts__facebook-toggle");
    await user.click(facebookToggle);

    // Assert: Info or error feedback triggered
    expect(toast.info).toHaveBeenCalled();
  });
});
