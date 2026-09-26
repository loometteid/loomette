import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getLogger } from "@/lib/logging";

export async function proxy(request: NextRequest) {
  const startTime = performance.now();
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  // Forward x-request-id to downstream Server Components and Server Actions
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              supabaseResponse.headers.set(key, value);
            });
          }
        },
      },
    },
  );

  // Refreshes the session cookie if expired — required for Server
  // Components, which cannot write cookies themselves.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ensure x-request-id is attached to response headers
  supabaseResponse.headers.set("x-request-id", requestId);

  const durationMs = Math.round(performance.now() - startTime);
  const status = supabaseResponse.status;
  const method = request.method;
  const path = request.nextUrl.pathname;

  const httpLogger = getLogger(["http"]);
  httpLogger.info("{method} {path} {status} in {durationMs}ms", {
    requestId,
    method,
    path,
    status,
    durationMs,
    userId: user?.id ?? null,
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
