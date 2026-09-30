import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { mockRouter } from "@/test/setup";
import { TripDetailView } from "./trip-detail-page";

vi.spyOn(toast, "info");

describe("TripDetailView (Component with TanStack Query + MSW)", () => {
  it("fetches trip details via useSuspenseQuery and renders elements with data-testid & data-entity-id", async () => {
    renderWithQueryClient(
      <Suspense fallback={<div>Loading trip details...</div>}>
        <TripDetailView userId="user-123" tripId="mock-trip-123" />
      </Suspense>,
    );

    // Initial state suspends while TanStack Query fetches via Supabase client
    expect(screen.getByText("Loading trip details...")).toBeInTheDocument();

    // After MSW resolves the trip and wear_log queries, Suspense completes
    const title = await screen.findByTestId("trip-detail__title");
    expect(title).toHaveTextContent("Summer Vacation");

    const container = screen.getByTestId("trip-detail");
    expect(container).toHaveAttribute("data-entity-id", "mock-trip-123");

    expect(screen.getByTestId("trip-detail__days-count")).toHaveTextContent(
      "5 Days",
    );

    // Verify day breakdown list items and attributes
    const dayItems = screen.getAllByTestId("trip-detail__day-item");
    expect(dayItems).toHaveLength(5);
    expect(dayItems[0]).toHaveAttribute("data-entity-id", "2026-10-01");
    expect(dayItems[4]).toHaveAttribute("data-entity-id", "2026-10-05");
  });

  it("dynamically renders custom trip data when MSW handler is overridden", async () => {
    // Override MSW to return a 2-day Kyoto trip
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/trip`, () => {
        return HttpResponse.json({
          id: "kyoto-456",
          name: "Weekend in Kyoto",
          start_date: "2026-11-14",
          end_date: "2026-11-15",
          season: "autumn",
          travel_companion: "solo",
          user_id: "user-123",
        });
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading trip...</div>}>
        <TripDetailView userId="user-123" tripId="kyoto-456" />
      </Suspense>,
    );

    const title = await screen.findByTestId("trip-detail__title");
    expect(title).toHaveTextContent("Weekend in Kyoto");

    const container = screen.getByTestId("trip-detail");
    expect(container).toHaveAttribute("data-entity-id", "kyoto-456");

    const dayItems = screen.getAllByTestId("trip-detail__day-item");
    expect(dayItems).toHaveLength(2);
    expect(dayItems[0]).toHaveAttribute("data-entity-id", "2026-11-14");
    expect(dayItems[1]).toHaveAttribute("data-entity-id", "2026-11-15");
  });

  it("navigates back when clicking the back button", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <Suspense fallback={<div>Loading trip...</div>}>
        <TripDetailView userId="user-123" tripId="mock-trip-123" />
      </Suspense>,
    );

    await screen.findByTestId("trip-detail__title");

    const backButton = screen.getByTestId("trip-detail__back-button");
    await user.click(backButton);

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});
