import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Client-side entry point for AI features. Never calls the Gemini API
 * directly — the API key lives only in the Edge Function's environment.
 * See supabase/functions/<name> for the corresponding server-side code.
 */
export async function invokeGemini<TResponse = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const supabase = createBrowserSupabaseClient();

  const { data, error } = await supabase.functions.invoke<TResponse>(
    functionName,
    { body },
  );

  if (error) throw error;
  return data as TResponse;
}
