import { http, HttpResponse } from "msw";

export const MOCK_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";

export const handlers = [
  // Default mock handler for Supabase PostgREST trip table queries
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/trip`, ({ request }) => {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get("accept") ?? "";
    const isSingle =
      acceptHeader.includes("vnd.pgrst.object+json") ||
      url.searchParams.has("id");

    const mockTrip = {
      id: url.searchParams.get("id")?.replace(/^eq\./, "") || "mock-trip-123",
      name: "Summer Vacation",
      start_date: "2026-10-01",
      end_date: "2026-10-05",
      season: "summer",
      travel_companion: "friends",
      user_id: "user-123",
    };

    if (isSingle) {
      return HttpResponse.json(mockTrip);
    }

    return HttpResponse.json([mockTrip]);
  }),

  // Default mock handler for wear_log table queries
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/wear_log`, () => {
    return HttpResponse.json([]);
  }),

  // Default mock handler for user table (e.g. gender profile)
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/user`, ({ request }) => {
    const acceptHeader = request.headers.get("accept") ?? "";
    const isSingle = acceptHeader.includes("vnd.pgrst.object+json");
    const mockUser = {
      user_id: "user-123",
      gender: "female",
    };

    if (isSingle) {
      return HttpResponse.json(mockUser);
    }
    return HttpResponse.json([mockUser]);
  }),

  // Default mock handler for wardrobe_item table queries
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
    return HttpResponse.json([]);
  }),

  // Default mock handler for creating a trip (insert)
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/trip`, async ({ request }) => {
    const url = new URL(request.url);
    const body = (await request.json()) as Record<string, unknown>;

    // Emulate Supabase PostgREST returning single object when select=id and Prefer: return=representation
    if (url.searchParams.get("select") === "id") {
      return HttpResponse.json({
        id: "mock-trip-123",
        ...body,
      });
    }

    return HttpResponse.json([
      {
        id: "mock-trip-123",
        ...body,
      },
    ]);
  }),
];
