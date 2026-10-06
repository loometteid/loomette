import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { MOCK_SUPABASE_URL } from "@/test/mocks/handlers";
import {
  createUploadJobMutationOptions,
  type CreateUploadJobInput,
} from "./create-upload-job.mutation-option.client";

describe("createUploadJobMutationOptions", () => {
  it("creates upload_job and invokes extract-garments Edge Function with correct payload", async () => {
    let capturedFunctionPayload: Record<string, unknown> | null = null;

    server.use(
      http.post(
        `${MOCK_SUPABASE_URL}/functions/v1/extract-garments`,
        async ({ request }) => {
          capturedFunctionPayload = (await request.json()) as Record<
            string,
            unknown
          >;
          return HttpResponse.json({ success: true, count: 2 });
        },
      ),
    );

    const testFile = new File(["fake-image-bytes"], "test.jpg", {
      type: "image/jpeg",
    });

    const input: CreateUploadJobInput = {
      userId: "user-test-123",
      file: testFile,
      sourceType: "wardrobe",
    };

    const options = createUploadJobMutationOptions();
    expect(options.mutationFn).toBeDefined();

    const result = await options.mutationFn!(input, {} as never);

    expect(result).toBeDefined();
    expect(result.id).toBe("mock-job-123");
    expect(result.status).toBe("pending");
    expect(result.user_id).toBe("user-test-123");

    // Verify extract-garments Edge Function received correct payload
    await vi.waitFor(() => {
      expect(capturedFunctionPayload).toEqual({
        uploadJobId: "mock-job-123",
        imageUrl: expect.stringContaining("https://"),
        userId: "user-test-123",
      });
    });
  });

  it("handles Edge Function invocation failure gracefully without throwing from mutationFn", async () => {
    server.use(
      http.post(
        `${MOCK_SUPABASE_URL}/functions/v1/extract-garments`,
        () => {
          return HttpResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
          );
        },
      ),
    );

    const testFile = new File(["fake-image-bytes"], "test.jpg", {
      type: "image/jpeg",
    });

    const input: CreateUploadJobInput = {
      userId: "user-test-123",
      file: testFile,
    };

    const options = createUploadJobMutationOptions();
    const result = await options.mutationFn!(input, {} as never);

    // Job is still created successfully despite background trigger failure
    expect(result).toBeDefined();
    expect(result.id).toBe("mock-job-123");
  });

  it("throws error when database insert of upload_job fails", async () => {
    server.use(
      http.post(
        `${MOCK_SUPABASE_URL}/rest/v1/upload_job`,
        () => {
          return HttpResponse.json(
            { message: "DB Error", code: "500" },
            { status: 500 },
          );
        },
      ),
    );

    const testFile = new File(["fake-image-bytes"], "test.jpg", {
      type: "image/jpeg",
    });

    const input: CreateUploadJobInput = {
      userId: "user-test-123",
      file: testFile,
    };

    const options = createUploadJobMutationOptions();
    await expect(options.mutationFn!(input, {} as never)).rejects.toThrow();
  });
});
