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

  // Default mock handler for trip_packing_item table queries
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/trip_packing_item`, () => {
    return HttpResponse.json([
      {
        id: "pack-1",
        trip_id: "mock-trip-123",
        user_id: "user-123",
        name: "Red Cardigan",
        is_packed: false,
        created_at: "2026-10-01T00:00:00Z",
      },
      {
        id: "pack-2",
        trip_id: "mock-trip-123",
        user_id: "user-123",
        name: "Stripes Blue Blouse",
        is_packed: true,
        created_at: "2026-10-01T00:01:00Z",
      },
    ]);
  }),

  http.post(`${MOCK_SUPABASE_URL}/rest/v1/trip_packing_item`, async ({ request }) => {
    const body = (await request.json()) as {
      trip_id: string;
      user_id: string;
      name: string;
      is_packed?: boolean;
    };
    const newItem = {
      id: "pack-new-1",
      trip_id: body.trip_id,
      user_id: body.user_id,
      name: body.name,
      is_packed: body.is_packed ?? false,
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.patch(`${MOCK_SUPABASE_URL}/rest/v1/trip_packing_item`, () => {
    return HttpResponse.json({}, { status: 200 });
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

  // Mock handler for outfit table update (patch)
  http.patch(`${MOCK_SUPABASE_URL}/rest/v1/outfit`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(body);
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
  // Default mock handler for subscription table (defaults to null / free tier user)
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/subscription`, ({ request }) => {
    const acceptHeader = request.headers.get("accept") ?? "";
    const isSingle = acceptHeader.includes("vnd.pgrst.object+json");
    if (isSingle) return HttpResponse.json(null);
    return HttpResponse.json([]);
  }),

  // Default mock handler for Supabase auth user
  http.get(`${MOCK_SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      id: "user-123",
      email: "hello@gmail.com",
      app_metadata: { provider: "google" },
      user_metadata: {},
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
      created_at: "2026-01-01T00:00:00Z",
    });
  }),

  // Default mock handler for Supabase OAuth link identity (pending dashboard setup)
  http.get(`${MOCK_SUPABASE_URL}/auth/v1/user/identities/authorize`, () => {
    return HttpResponse.json(
      { message: "Provider not enabled", code: 400 },
      { status: 400 },
    );
  }),

  // Default mock handler for payment_order table
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/payment_order`, ({ request }) => {
    const acceptHeader = request.headers.get("accept") ?? "";
    const isSingle = acceptHeader.includes("vnd.pgrst.object+json");
    const mockOrder = {
      id: "mock-order-uuid",
      order_id: "ord_123",
      user_id: "user-123",
      provider: "mock",
      plan: "monthly",
      amount: 49000,
      currency: "IDR",
      status: "paid",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (isSingle) return HttpResponse.json(mockOrder);
    return HttpResponse.json([mockOrder]);
  }),
  // Default mock handler for mock payment webhook
  http.post("*/api/webhooks/payment/mock", async ({ request }) => {
    const body = (await request.json()) as { orderId?: string; status?: string };
    return HttpResponse.json({
      received: true,
      orderId: body.orderId ?? "mock_order_123",
      status: body.status ?? "paid",
    });
  }),
];
