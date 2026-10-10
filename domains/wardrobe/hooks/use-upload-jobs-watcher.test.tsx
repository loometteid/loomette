import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { useUploadJobsWatcher } from "./use-upload-jobs-watcher";
import type { UploadJob } from "../types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/home",
}));

describe("useUploadJobsWatcher", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("identifies active and completed jobs correctly", async () => {
    const mockJobs: UploadJob[] = [
      {
        id: "job-active-1",
        user_id: "user-123",
        source_type: "wardrobe",
        original_image_url: "https://example.com/photo1.jpg",
        status: "analyzing",
        item_count: 0,
        error_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "job-done-1",
        user_id: "user-123",
        source_type: "wardrobe",
        original_image_url: "https://example.com/photo2.jpg",
        status: "completed",
        item_count: 3,
        error_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, () => {
        return HttpResponse.json(mockJobs);
      }),
    );

    const { result } = renderHook(() => useUploadJobsWatcher("user-123"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.jobs.length).toBe(2);
    });

    expect(result.current.hasActiveJobs).toBe(true);
    expect(result.current.activeJobs.length).toBe(1);
    expect(result.current.activeJobs[0].id).toBe("job-active-1");
  });

  it("triggers toast and invalidates queries when a job transitions from analyzing to completed", async () => {
    const toastSuccessSpy = vi.spyOn(toast, "success");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    let status = "analyzing";
    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, () => {
        return HttpResponse.json([
          {
            id: "job-1",
            user_id: "user-123",
            source_type: "wardrobe",
            original_image_url: "https://example.com/photo.jpg",
            status,
            item_count: 2,
            error_message: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }),
    );

    const { result, rerender } = renderHook(
      () => useUploadJobsWatcher("user-123"),
      { wrapper },
    );

    // Wait for initial analyzing job to be loaded and tracked
    await waitFor(() => {
      expect(result.current.jobs.length).toBe(1);
      expect(result.current.jobs[0]?.status).toBe("analyzing");
    });

    expect(invalidateSpy).not.toHaveBeenCalled();

    // Simulate status transition to completed
    status = "completed";
    await queryClient.refetchQueries();
    rerender();

    await waitFor(() => {
      expect(toastSuccessSpy).toHaveBeenCalledWith(
        "Outfit analyzed!",
        expect.objectContaining({
          description: "2 items added to your approval queue.",
        }),
      );
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["wardrobe"] }),
    );
  });
});
