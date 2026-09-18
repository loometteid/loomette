import { createClient } from "@/lib/supabase/client";

/**
 * Client-side entry point for AI features. Never calls the Gemini API
 * directly — the API key lives only in the Edge Function's environment.
 * See supabase/functions/<name> for the corresponding server-side code.
 */
export async function invokeGemini<TResponse = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke<TResponse>(
    functionName,
    { body },
  );

  if (error) {
    let message = error.message;
    const context = "context" in error ? error.context : null;
    if (context instanceof Response) {
      try {
        const payload = (await context.clone().json()) as { error?: unknown };
        if (typeof payload.error === "string") message = payload.error;
      } catch {
        // Preserve the SDK error when the function did not return JSON.
      }
    }
    throw new Error(message);
  }
  return data as TResponse;
}
