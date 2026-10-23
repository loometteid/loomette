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

  // HTMLCanvasElement 2D context mock for Konva / Vitest happy-dom
  if (typeof HTMLCanvasElement !== "undefined") {
    const createMockContext2D = (canvas: HTMLCanvasElement) => {
      const context: Record<string, unknown> = {
        canvas,
        imageSmoothingEnabled: true,
        fillStyle: "#000000",
        strokeStyle: "#000000",
        lineWidth: 1,
        lineCap: "butt",
        lineJoin: "miter",
        globalAlpha: 1.0,
        globalCompositeOperation: "source-over",
        font: "10px sans-serif",
        textAlign: "start",
        textBaseline: "alphabetic",
        shadowColor: "rgba(0, 0, 0, 0)",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        measureText: vi.fn(() => ({
          width: 0,
          actualBoundingBoxAscent: 0,
          actualBoundingBoxDescent: 0,
        })),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        createPattern: vi.fn(() => null),
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        arcTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        rect: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        clip: vi.fn(),
        drawImage: vi.fn(),
        transform: vi.fn(),
        setTransform: vi.fn(),
        resetTransform: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        isPointInPath: vi.fn(() => false),
        isPointInStroke: vi.fn(() => false),
      };

      return new Proxy(context, {
        get(target, prop) {
          if (prop in target) {
            return target[prop as string];
          }
          return vi.fn();
        },
        set(target, prop, value) {
          target[prop as string] = value;
          return true;
        },
      });
    };

    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextType: string,
    ) {
      if (contextType === "2d") {
        const self = this as unknown as { __mock2dContext?: unknown };
        if (!self.__mock2dContext) {
          self.__mock2dContext = createMockContext2D(this);
        }
        return self.__mock2dContext;
      }
      return null;
    } as unknown as typeof HTMLCanvasElement.prototype.getContext;

    if (!HTMLCanvasElement.prototype.toDataURL) {
      HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,";
    }
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

export const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  notFound: () => mockNotFound(),
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
