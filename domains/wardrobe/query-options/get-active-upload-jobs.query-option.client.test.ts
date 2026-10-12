import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { QueryClient } from "@tanstack/react-query";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import { getActiveUploadJobsQueryOptionsForBrowser } from "./get-active-upload-jobs.query-option.client";

describe("getActiveUploadJobsQueryOptionsForBrowser", () => {
  const queryClient = new QueryClient();

  it("returns active and recent upload jobs for user", async () => {
    const mockJobs = [
      {
        id: "job-1",
        user_id: "user-123",
        status: "analyzing",
      },
      {
        id: "job-2",
        user_id: "user-123",
        status: "completed",
      },
    ];

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, () => {
        return HttpResponse.json(mockJobs);
      }),
    );

    const options = getActiveUploadJobsQueryOptionsForBrowser("user-123");
    const result = await queryClient.fetchQuery(options);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("job-1");
  });

  it("reconciles jobs stuck in analyzing for >60s to failed status", async () => {
    const staleDate = new Date(Date.now() - 70 * 1000).toISOString();
    const mockJobs = [
      {
        id: "job-stuck",
        user_id: "user-123",
        status: "analyzing",
        created_at: staleDate,
      },
    ];

    server.use(
      http.get(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, () => {
        return HttpResponse.json(mockJobs);
      }),
      http.patch(`${MOCK_SUPABASE_URL}/rest/v1/upload_job`, () => {
        return HttpResponse.json({ success: true });
      }),
    );

    const options = getActiveUploadJobsQueryOptionsForBrowser("user-123");
    const result = await queryClient.fetchQuery(options);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("failed");
    expect(result[0].error_message).toContain("timed out");
  });

  it("returns empty array when userId is null", async () => {
    const options = getActiveUploadJobsQueryOptionsForBrowser(null);
    expect(options.enabled).toBe(false);
  });
});
