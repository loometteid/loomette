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

  // Default mock handler for user table (e.g. gender profile or full onboarding profile)
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/user`, ({ request }) => {
    const url = new URL(request.url);
    const select = url.searchParams.get("select");
    const acceptHeader = request.headers.get("accept") ?? "";
    const isSingle = acceptHeader.includes("vnd.pgrst.object+json");

    if (select === "gender") {
      const mockGender = { gender: "female" };
      return isSingle
        ? HttpResponse.json(mockGender)
        : HttpResponse.json([mockGender]);
    }

    const mockUser = {
      user_id: "user-123",
      display_name: null,
      gender: null,
      birthday: null,
      occupation: null,
      work_setting: null,
      outfit_size: null,
      shoe_size: null,
      shoe_size_region: null,
      height: null,
      weight: null,
      bust_size: null,
      waist_size: null,
      high_hip_size: null,
      hip_size: null,
      style_tags: null,
    };

    if (isSingle) {
      return HttpResponse.json(mockUser);
    }
    return HttpResponse.json([mockUser]);
  }),

  // Default mock handler for user table updates (patch)
  http.patch(`${MOCK_SUPABASE_URL}/rest/v1/user`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // Default mock handler for wardrobe_item table queries
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, () => {
    return HttpResponse.json([]);
  }),

  // Mock handler for wardrobe_item insert
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/wardrobe_item`, async ({ request }) => {
    const body = (await request.json()) as
      | Record<string, unknown>
      | Record<string, unknown>[];

    if (Array.isArray(body)) {
      return HttpResponse.json(
        body.map((item, index) => ({
          id: `mock-wardrobe-item-${index + 1}`,
          ...item,
        })),
        { status: 201 },
      );
    }

    return HttpResponse.json({
      id: "mock-wardrobe-item-123",
      ...body,
    });
  }),

  // Mock handler for item table insert
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/item`, async ({ request }) => {
    const url = new URL(request.url);
    const body = (await request.json()) as
      | Record<string, unknown>
      | Record<string, unknown>[];
    const acceptHeader = request.headers.get("accept") ?? "";

    if (Array.isArray(body)) {
      const items = body.map((item, index) => ({
        item_id: `mock-item-${index + 1}`,
        ...item,
      }));
      return HttpResponse.json(items, { status: 201 });
    }

    const res = { item_id: "mock-item-123", ...body };
    if (
      acceptHeader.includes("vnd.pgrst.object+json") ||
      url.searchParams.get("select") === "item_id"
    ) {
      return HttpResponse.json(res);
    }
    return HttpResponse.json([res]);
  }),

  // Mock handler for wardrobe upload RPC
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/rpc/create_wardrobe_upload`, () => {
    return HttpResponse.json({
      wardrobe_item_id: "mock-wardrobe-item-123",
    });
  }),

  // Mock handler for Supabase storage upload
  http.post(`${MOCK_SUPABASE_URL}/storage/v1/object/wardrobe-images/*`, () => {
    return HttpResponse.json({ Key: "mock-key" });
  }),

  // Mock handler for outfit-photos storage upload
  http.post(`${MOCK_SUPABASE_URL}/storage/v1/object/outfit-photos/*`, () => {
    return HttpResponse.json({ Key: "mock-outfit-key" });
  }),

  // Mock handler for Supabase storage remove
  http.delete(`${MOCK_SUPABASE_URL}/storage/v1/object/wardrobe-images`, () => {
    return HttpResponse.json([{ name: "mock-file" }]);
  }),

  // Mock handler for outfit-photos storage remove
  http.delete(`${MOCK_SUPABASE_URL}/storage/v1/object/outfit-photos`, () => {
    return HttpResponse.json([{ name: "mock-outfit-file" }]);
  }),

  // Default mock handler for outfit table queries (e.g. looks count)
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/outfit`, () => {
    return HttpResponse.json([]);
  }),

  // Mock handler for outfit table insert
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/outfit`, async ({ request }) => {
    const url = new URL(request.url);
    const body = (await request.json()) as Record<string, unknown>;
    const mockOutfit = {
      id: "mock-outfit-123",
      cover_image_url: body.cover_image_url ?? null,
      name: body.name ?? null,
      is_saved: true,
      user_id: body.user_id ?? "user-123",
      ...body,
    };

    if (
      url.searchParams.has("select") ||
      request.headers.get("accept")?.includes("vnd.pgrst.object+json")
    ) {
      return HttpResponse.json(mockOutfit);
    }
    return HttpResponse.json([mockOutfit]);
  }),

  // Mock handler for outfit_item table insert
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/outfit_item`, async ({ request }) => {
    const body = (await request.json()) as
      | Record<string, unknown>
      | Record<string, unknown>[];

    if (Array.isArray(body)) {
      return HttpResponse.json(
        body.map((item, index) => ({
          id: `mock-outfit-item-${index + 1}`,
          ...item,
        })),
        { status: 201 },
      );
    }

    return HttpResponse.json({
      id: "mock-outfit-item-1",
      ...body,
    });
  }),

  // Mock handler for wear_log table insert
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/wear_log`, async ({ request }) => {
    const url = new URL(request.url);
    const body = (await request.json()) as Record<string, unknown>;
    const mockWearLog = {
      id: "mock-wear-log-123",
      user_id: body.user_id ?? "user-123",
      outfit_id: body.outfit_id ?? "mock-outfit-123",
      worn_on: body.worn_on ?? "2026-10-09",
      ...body,
    };

    if (
      url.searchParams.has("select") ||
      request.headers.get("accept")?.includes("vnd.pgrst.object+json")
    ) {
      return HttpResponse.json(mockWearLog);
    }
    return HttpResponse.json([mockWearLog]);
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

  // Default mock handlers for upload_job table
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, ({ request }) => {
    const acceptHeader = request.headers.get("accept") ?? "";
    const isSingle = acceptHeader.includes("vnd.pgrst.object+json");
    const mockJob = {
      id: "mock-job-123",
      user_id: "user-123",
      source_type: "wardrobe",
      original_image_url: "https://mock.supabase.co/storage/v1/object/public/wardrobe-images/original.jpg",
      status: "completed",
      item_count: 2,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (isSingle) return HttpResponse.json(mockJob);
    return HttpResponse.json([mockJob]);
  }),

  http.post(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const mockJob = {
      id: "mock-job-123",
      user_id: "user-123",
      source_type: "wardrobe",
      original_image_url: "https://mock.supabase.co/storage/v1/object/public/wardrobe-images/original.jpg",
      status: "pending",
      item_count: 0,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body,
    };
    return HttpResponse.json(mockJob);
  }),

  // Default mock handler for extract-garments Edge Function
  http.post(`${MOCK_SUPABASE_URL}/functions/v1/extract-garments`, () => {
    return HttpResponse.json({ success: true, count: 2 });
  }),

  // Default mock handler for wardrobe-images storage upload
  http.post(`${MOCK_SUPABASE_URL}/storage/v1/object/wardrobe-images/*`, () => {
    return HttpResponse.json({ Key: "wardrobe-images/mock-path" });
  }),

  // Default mock handler for waitlist table queries/insert
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/waitlist`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (
      body.email === "existing@example.com" ||
      body.email === "duplicate@example.com"
    ) {
      return HttpResponse.json(
        {
          code: "23505",
          details: `Key (email)=(${body.email}) already exists.`,
          message:
            'duplicate key value violates unique constraint "waitlist_email_key"',
        },
        { status: 409 },
      );
    }

    const mockWaitlistEntry = {
      id: "waitlist-mock-123",
      created_at: new Date().toISOString(),
      ...body,
    };
    return HttpResponse.json(mockWaitlistEntry, { status: 201 });
  }),

  // Default mock handler for send-waitlist-email Edge Function
  http.post(`${MOCK_SUPABASE_URL}/functions/v1/send-waitlist-email`, () => {
    return HttpResponse.json({ success: true });
  }),
];
