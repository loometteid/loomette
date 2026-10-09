import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthPage } from "./auth-page";
import * as supabaseClientModule from "@/lib/supabase/client";
import SignInPage from "@/app/sign-in/page";
import SignUpPage from "@/app/sign-up/page";
import { mockPermanentRedirect } from "@/test/setup";

describe("AuthPage (Component & Integration Tier)", () => {
  it("renders all elements with proper BEM data-testid attributes per ADR 0004", () => {
    render(<AuthPage />);

    expect(screen.getByTestId("auth-page")).toBeInTheDocument();
    expect(screen.getByTestId("auth-page__visual-panel")).toBeInTheDocument();
    expect(screen.getByTestId("auth-page__content-panel")).toBeInTheDocument();

    const title = screen.getByTestId("auth-page__title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(/Register\s*or\s*Sign in\s*now/i);

    const privacyLink = screen.getByTestId("auth-page__privacy-link");
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacy");

    expect(screen.getByTestId("auth-page__google-button")).toBeInTheDocument();
  });

  it("initiates Google OAuth flow when clicking the Google SSO button", async () => {
    const user = userEvent.setup();
    const mockSignInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });

    vi.spyOn(supabaseClientModule, "createBrowserSupabaseClient").mockReturnValue({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
      },
    } as unknown as ReturnType<typeof supabaseClientModule.createBrowserSupabaseClient>);

    render(<AuthPage />);

    const googleButton = screen.getByTestId("auth-page__google-button");
    await user.click(googleButton);

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: expect.objectContaining({
        redirectTo: expect.stringContaining("/auth/callback"),
      }),
    });
  });

  it("permanently redirects /sign-in and /sign-up to /waitlist", () => {
    mockPermanentRedirect.mockClear();

    SignInPage();
    expect(mockPermanentRedirect).toHaveBeenCalledWith("/waitlist");

    mockPermanentRedirect.mockClear();

    SignUpPage();
    expect(mockPermanentRedirect).toHaveBeenCalledWith("/waitlist");
  });
});
