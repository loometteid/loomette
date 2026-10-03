import { Suspense } from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { mockRedirect } from "@/test/setup";
import { createTestQueryClient, renderWithQueryClient } from "@/test/test-utils";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { getWardrobeItemsQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-wardrobe-items.query-option.client";
import type { UserProfile } from "@/domains/profile/types";
import { getLooksCountQueryOptionsForBrowser } from "./query-options/get-looks-count.query-option.client";
import { HomeView } from "./home-page";

describe("HomeView (Route Lifecycle & Onboarding Guard)", () => {
  it("redirects un-onboarded user to /onboarding/1 and does not render home dashboard", async () => {
    mockRedirect.mockClear();
    const queryClient = createTestQueryClient();

    // Seed query cache with profile that hasn't completed onboarding (missing display_name)
    queryClient.setQueryData(
      getProfileQueryOptionsForBrowser("user-123").queryKey,
      {
        user_id: "user-123",
        display_name: null,
        gender: null,
        birthday: null,
      } as unknown as UserProfile,
    );
    queryClient.setQueryData(
      getWardrobeItemsQueryOptionsForBrowser("user-123").queryKey,
      [],
    );
    queryClient.setQueryData(
      getLooksCountQueryOptionsForBrowser("user-123").queryKey,
      0,
    );

    expect(() => {
      renderWithQueryClient(
        <Suspense fallback={<div>Loading...</div>}>
          <HomeView userId="user-123" />
        </Suspense>,
        { queryClient },
      );
    }).toThrow();

    // Assert that the client-side redirect was triggered
    expect(mockRedirect).toHaveBeenCalledWith("/onboarding/1");
    // Assert that home content is not rendered
    expect(screen.queryByText(/Ready to/i)).not.toBeInTheDocument();
  });

  it("renders home dashboard and does not redirect when user is onboarded", async () => {
    mockRedirect.mockClear();
    const queryClient = createTestQueryClient();

    // Seed query cache with completed onboarding profile
    queryClient.setQueryData(
      getProfileQueryOptionsForBrowser("user-456").queryKey,
      {
        user_id: "user-456",
        display_name: "Rebecca",
        gender: "female",
        birthday: "1998-05-15",
        profile_photo: null,
        style_tags: [],
      } as unknown as UserProfile,
    );
    queryClient.setQueryData(
      getWardrobeItemsQueryOptionsForBrowser("user-456").queryKey,
      [],
    );
    queryClient.setQueryData(
      getLooksCountQueryOptionsForBrowser("user-456").queryKey,
      3,
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading...</div>}>
        <HomeView userId="user-456" />
      </Suspense>,
      { queryClient },
    );

    // Should NOT redirect
    expect(mockRedirect).not.toHaveBeenCalled();

    // Should render personalized headline with display_name
    expect(await screen.findByText(/Rebecca\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Your preferences/i)).toBeInTheDocument();
  });
});
