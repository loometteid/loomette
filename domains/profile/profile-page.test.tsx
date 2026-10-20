import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { ProfileView } from "./profile-page";

vi.spyOn(toast, "success");

describe("ProfileView (Component & Integration Tier)", () => {
  it("renders profile header, sidebar, and allows switching between tabs and opening wishlist dialog", async () => {
    // Arrange: Mock user profile data, outfits, trips, and wishlist
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/user`, ({ request }) => {
        const url = new URL(request.url);
        const accept = request.headers.get("accept") ?? "";
        const isSingle = accept.includes("vnd.pgrst.object+json");

        const mockUser = {
          user_id: "user-123",
          username: "janedoe",
          display_name: "Jane Doe",
          gender: "female",
          birthday: "1995-05-12",
          outfit_size: "m",
          shoe_size: "38",
          profile_photo: null,
        };

        return isSingle
          ? HttpResponse.json(mockUser)
          : HttpResponse.json([mockUser]);
      }),
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit`, () => {
        return HttpResponse.json([
          {
            id: "outfit-1",
            name: "Classic Beige Coat Look",
            cover_image_url: "/outfits/beige-coat.png",
            is_saved: true,
            user_id: "user-123",
          },
        ]);
      }),
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/trip`, () => {
        return HttpResponse.json([
          {
            id: "trip-999",
            name: "Tokyo Autumn Trip",
            start_date: "2026-11-01",
            end_date: "2026-11-08",
            season: "autumn",
            travel_companion: "solo",
            user_id: "user-123",
          },
        ]);
      }),
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
        return HttpResponse.json([
          {
            id: "wishlist-item-1",
            user_id: "user-123",
            is_wishlist: true,
            item: {
              name: "Cashmere Sweater",
              image_url: "/wardrobe/cashmere.png",
            },
          },
        ]);
      }),
    );

    const user = userEvent.setup();

    renderWithQueryClient(
      <Suspense fallback={<div>Loading profile...</div>}>
        <ProfileView userId="user-123" />
      </Suspense>,
    );

    // Initial loading suspense
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();

    // Assert: User information rendered
    const displayName = await screen.findByTestId("profile-page__display-name");
    expect(displayName).toHaveTextContent("Jane Doe");

    const username = screen.getByTestId("profile-page__username");
    expect(username).toHaveTextContent("@janedoe");

    // Assert: Favorite tab content is active by default
    const favoriteItem = await screen.findByTestId("profile-page__favorite-item");
    expect(favoriteItem).toHaveAttribute("data-entity-id", "outfit-1");
    expect(screen.getByText("Classic Beige Coat Look")).toBeInTheDocument();

    // Act: Switch to Travel tab
    const travelTabs = screen.getAllByTestId("profile-page__tab");
    const travelTab = travelTabs.find(
      (el) => el.getAttribute("data-entity-id") === "travels",
    );
    expect(travelTab).toBeDefined();
    await user.click(travelTab!);

    // Assert: Tokyo trip is visible
    const tripItem = await screen.findByTestId("profile-page__trip-item");
    expect(tripItem).toHaveAttribute("data-entity-id", "trip-999");
    expect(screen.getByText("Tokyo Autumn Trip")).toBeInTheDocument();

    // Act: Switch to Wishlist tab
    const wishlistTab = travelTabs.find(
      (el) => el.getAttribute("data-entity-id") === "wishlist",
    );
    expect(wishlistTab).toBeDefined();
    await user.click(wishlistTab!);

    // Assert: Cashmere sweater is visible
    const wishlistItem = await screen.findByTestId("profile-page__wishlist-item");
    expect(wishlistItem).toHaveAttribute("data-entity-id", "wishlist-item-1");
    expect(screen.getByText("Cashmere Sweater")).toBeInTheDocument();

    // Act: Click wishlist item to open Add To Wardrobe dialog
    await user.click(wishlistItem);

    // Assert: Add to wardrobe dialog is rendered
    expect(screen.getByTestId("add-to-wardrobe-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("add-to-wardrobe-dialog__title")).toHaveTextContent(
      "Cashmere Sweater",
    );

    // Act: Confirm add to wardrobe
    await user.click(screen.getByTestId("add-to-wardrobe-dialog__confirm"));

    // Assert: Toast success message triggered
    expect(toast.success).toHaveBeenCalledWith(
      '"Cashmere Sweater" added to your wardrobe',
    );
  });
});
