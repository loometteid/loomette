import { Suspense } from "react";
import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { MixAndMatchResult } from "./mix-and-match-result-page";

const mockOutfitData = {
  id: "outfit-123",
  name: "Chic Kinda Day",
  user_id: "user-123",
  is_saved: false,
};

const mockOutfitItems = [
  {
    layer_order: 1,
    position_x: 0.5,
    position_y: 0.3,
    wardrobe_item: {
      id: "wardrobe-top-1",
      item: {
        item_id: "item-1",
        name: "Linen Shirt",
        image_url: "https://example.com/shirt.png",
      },
    },
  },
  {
    layer_order: 2,
    position_x: 0.5,
    position_y: 0.6,
    wardrobe_item: {
      id: "wardrobe-bottom-1",
      item: {
        item_id: "item-2",
        name: "Wide Leg Pants",
        image_url: "https://example.com/pants.png",
      },
    },
  },
];

describe("MixAndMatchResult (Component & Integration Tier)", () => {
  it("renders outfit result view with title, composition, and editable name", async () => {
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit`, ({ request }) => {
        const acceptHeader = request.headers.get("accept") ?? "";
        const isSingle = acceptHeader.includes("vnd.pgrst.object+json");
        return isSingle
          ? HttpResponse.json(mockOutfitData)
          : HttpResponse.json([mockOutfitData]);
      }),
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit_item`, () => {
        return HttpResponse.json(mockOutfitItems);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading result...</div>}>
        <MixAndMatchResult userId="user-123" outfitId="outfit-123" />
      </Suspense>,
    );

    expect(
      await screen.findByTestId("mix-and-match-result__title"),
    ).toHaveTextContent("What a Match!");

    expect(
      screen.getByTestId("mix-and-match-result__outfit-name"),
    ).toHaveTextContent("Chic Kinda Day");

    expect(
      screen.getByTestId("mix-and-match-result__add-collection-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("mix-and-match-result__add-calendar-button"),
    ).toBeInTheDocument();
  });

  it("edits the outfit name inline and commits on blur or Enter", async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit`, ({ request }) => {
        const acceptHeader = request.headers.get("accept") ?? "";
        const isSingle = acceptHeader.includes("vnd.pgrst.object+json");
        return isSingle
          ? HttpResponse.json(mockOutfitData)
          : HttpResponse.json([mockOutfitData]);
      }),
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit_item`, () => {
        return HttpResponse.json(mockOutfitItems);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading result...</div>}>
        <MixAndMatchResult userId="user-123" outfitId="outfit-123" />
      </Suspense>,
    );

    const nameBtn = await screen.findByTestId("mix-and-match-result__outfit-name");
    await user.click(nameBtn);

    const input = screen.getByTestId("mix-and-match-result__name-input");
    expect(input).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "Parisian Sunset{Enter}");

    expect(
      await screen.findByTestId("mix-and-match-result__outfit-name"),
    ).toHaveTextContent("Parisian Sunset");
  });

  it("adds outfit to collection and opens the success modal", async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit`, ({ request }) => {
        const acceptHeader = request.headers.get("accept") ?? "";
        const isSingle = acceptHeader.includes("vnd.pgrst.object+json");
        return isSingle
          ? HttpResponse.json(mockOutfitData)
          : HttpResponse.json([mockOutfitData]);
      }),
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit_item`, () => {
        return HttpResponse.json(mockOutfitItems);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading result...</div>}>
        <MixAndMatchResult userId="user-123" outfitId="outfit-123" />
      </Suspense>,
    );

    const addCollectionBtn = await screen.findByTestId(
      "mix-and-match-result__add-collection-button",
    );
    await user.click(addCollectionBtn);

    // Verify success modal opens with mascot and "Stay In" button
    const successModal = await screen.findByTestId(
      "mix-and-match-result__success-dialog",
    );
    expect(successModal).toBeInTheDocument();
    expect(
      screen.getByTestId("mix-and-match-result__stay-in-button"),
    ).toBeInTheDocument();

    // Close success dialog
    await user.click(screen.getByTestId("mix-and-match-result__stay-in-button"));
    await waitFor(() => {
      expect(
        screen.queryByTestId("mix-and-match-result__success-dialog"),
      ).not.toBeInTheDocument();
    });

    expect(addCollectionBtn).toHaveTextContent("Added ✓");
  });

  it("opens calendar date dialog, selects date, and opens success modal", async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit`, ({ request }) => {
        const acceptHeader = request.headers.get("accept") ?? "";
        const isSingle = acceptHeader.includes("vnd.pgrst.object+json");
        return isSingle
          ? HttpResponse.json(mockOutfitData)
          : HttpResponse.json([mockOutfitData]);
      }),
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit_item`, () => {
        return HttpResponse.json(mockOutfitItems);
      }),
    );

    renderWithQueryClient(
      <Suspense fallback={<div>Loading result...</div>}>
        <MixAndMatchResult userId="user-123" outfitId="outfit-123" />
      </Suspense>,
    );

    const addCalendarBtn = await screen.findByTestId(
      "mix-and-match-result__add-calendar-button",
    );
    await user.click(addCalendarBtn);

    // Verify calendar dialog is opened
    const calendarDialog = await screen.findByTestId("calendar-date-dialog");
    expect(calendarDialog).toBeInTheDocument();

    // Confirm date
    const saveDateBtn = screen.getByTestId("calendar-date-dialog__save-button");
    await user.click(saveDateBtn);

    // Success modal appears
    expect(
      await screen.findByTestId("mix-and-match-result__success-dialog"),
    ).toBeInTheDocument();
  });
});
