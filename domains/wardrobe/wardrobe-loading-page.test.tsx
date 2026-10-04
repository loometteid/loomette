import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { renderWithQueryClient } from "@/test/test-utils";
import { WardrobeLoadingView } from "./wardrobe-loading-page";

const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams("jobId=mock-job-123"),
  usePathname: () => "/wardrobe/loading",
}));

describe("WardrobeLoadingView (Screen 3.2.3 / D.3.2.3)", () => {
  it("renders progress checklist and Got It button during active analysis", async () => {
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, () => {
        return HttpResponse.json({
          id: "mock-job-123",
          user_id: "user-123",
          status: "analyzing",
          item_count: 0,
          created_at: new Date().toISOString(),
        });
      }),
    );

    renderWithQueryClient(<WardrobeLoadingView userId="user-123" />);

    expect(
      await screen.findByTestId("wardrobe-loading-page"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("wardrobe-loading-page__title")).toHaveTextContent(
      "We're working on your look.",
    );
    expect(screen.getByTestId("wardrobe-loading-page__steps")).toBeInTheDocument();
    expect(
      screen.getByTestId("wardrobe-loading-page__got-it-button"),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByTestId("wardrobe-loading-page__got-it-button"));
    expect(mockPush).toHaveBeenCalledWith("/wardrobe/approval");
  });

  it("renders failed state with retry button when upload_job fails", async () => {
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, () => {
        return HttpResponse.json({
          id: "mock-job-123",
          user_id: "user-123",
          status: "failed",
          error_message: "No garments could be detected in this photo.",
          created_at: new Date().toISOString(),
        });
      }),
    );

    renderWithQueryClient(<WardrobeLoadingView userId="user-123" />);

    expect(
      await screen.findByTestId("wardrobe-loading-page__failed-state"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No garments could be detected in this photo."),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("wardrobe-loading-page__retry-button"),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByTestId("wardrobe-loading-page__retry-button"));
    expect(mockPush).toHaveBeenCalledWith("/wardrobe/add");
  });

  it("automatically redirects to /wardrobe/approval when upload_job completes", async () => {
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, () => {
        return HttpResponse.json({
          id: "mock-job-123",
          user_id: "user-123",
          status: "completed",
          item_count: 2,
          created_at: new Date().toISOString(),
        });
      }),
    );

    renderWithQueryClient(<WardrobeLoadingView userId="user-123" />);

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/wardrobe/approval");
      },
      { timeout: 2000 },
    );
  });
});
