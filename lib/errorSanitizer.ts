/**
 * Sanitizes technical, network, and Supabase Edge Function errors
 * into clear, human-friendly messages suitable for UI toasts.
 *
 * Prevents raw infrastructure messages like:
 * - "Edge Function returned a non-2xx status code"
 * - "Failed to fetch"
 * - "504 Gateway Timeout"
 */
export async function sanitizeErrorMessage(error: unknown): Promise<string> {
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }

  // Check if error is Supabase FunctionsHttpError with response context
  if (typeof error === "object" && error !== null) {
    const errObj = error as {
      message?: string;
      context?: Response | { status?: number; json?: () => Promise<unknown> };
    };

    if (errObj.context) {
      try {
        const ctx = errObj.context;
        const status = ctx.status;

        // Try extracting JSON payload error message if available
        if (typeof ctx.json === "function") {
          const body = (await ctx.json().catch(() => null)) as {
            error?: string;
            message?: string;
          } | null;

          if (body?.error && typeof body.error === "string") {
            return body.error;
          }
          if (body?.message && typeof body.message === "string") {
            return body.message;
          }
        }

        if (status === 504 || status === 408) {
          return "Outfit analysis took longer than expected. Please try again with a clearer photo.";
        }
        if (status === 500 || status === 502 || status === 503) {
          return "AI processing service is temporarily unavailable. Please try again in a moment.";
        }
      } catch {
        // Ignore context inspection errors
      }
    }

    const message = errObj.message || "";
    if (
      message.includes("non-2xx") ||
      message.includes("FunctionsHttpError") ||
      message.includes("Edge Function returned")
    ) {
      return "Outfit analysis took longer than expected. Please try again with a clearer photo.";
    }

    if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
      return "Network connection issue. Please check your internet and try again.";
    }

    if (message.includes("AbortError") || message.includes("timed out")) {
      return "Processing timed out. Please try again with a smaller or clearer photo.";
    }

    if (message) {
      return message;
    }
  }

  if (typeof error === "string") {
    if (error.includes("non-2xx")) {
      return "Outfit analysis took longer than expected. Please try again with a clearer photo.";
    }
    return error;
  }

  return "Couldn't process your outfit. Please try again.";
}
