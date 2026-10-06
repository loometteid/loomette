import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./mocks/server";

// Default test environment variables for isolated local & CI runs
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

if (typeof window !== "undefined") {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => "blob:mock-url";
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {};
  }
}

// Global mock for Next.js App Router navigation
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const mockRedirect = vi.fn(
  (url?: unknown) => new Error(`NEXT_REDIRECT: ${String(url)}`),
);
export const mockPermanentRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
  redirect: (...args: unknown[]) => mockRedirect(...args),
  permanentRedirect: (...args: unknown[]) => mockPermanentRedirect(...args),
}));

// Start MSW mock server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Reset handlers and DOM cleanup after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
});

// Close MSW mock server after all tests
afterAll(() => {
  server.close();
});
