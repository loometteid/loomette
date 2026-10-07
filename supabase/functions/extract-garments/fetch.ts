import { Logger } from "./logger.ts";

export function createFetch(
  log: Logger,
  model = "gemini-3.6-flash",
): {
  fetch: typeof fetch;
  /**
   * 0 means no attempt,
   * 1 means the 1st attempt,
   * and so on
   * @returns
   */
  getAttempt: () => number;
} {
  let attemptIndex = 0;

  const loggedFetch: typeof fetch = async (input, init) => {
    attemptIndex += 1;
    const currentAttempt = attemptIndex;
    const attemptTimer = performance.now();

    log.info("Gemini API request attempt initiated", {
      attempt: currentAttempt,
      model,
    });

    try {
      const res = await fetch(input, init);
      const durationMs = Math.round(performance.now() - attemptTimer);

      if (res.ok) {
        log.info("Gemini API request attempt succeeded", {
          attempt: currentAttempt,
          status: res.status,
          durationMs,
        });
      } else {
        log.warn("Gemini API request attempt returned error status", {
          attempt: currentAttempt,
          status: res.status,
          statusText: res.statusText,
          durationMs,
        });
      }

      return res;
    } catch (fetchErr) {
      const durationMs = Math.round(performance.now() - attemptTimer);
      log.warn("Gemini API request attempt failed with network/timeout error", {
        attempt: currentAttempt,
        durationMs,
        error: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
      });
      throw fetchErr;
    }
  };

  return {
    fetch: loggedFetch,
    getAttempt: () => attemptIndex,
  };
}
