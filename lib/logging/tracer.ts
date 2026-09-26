import "server-only";
import { getLogger, withContext } from "@logtape/logtape";
import { contextLocalStorage } from "./server";
import type { Span, SpanStatus } from "./types";

export class Tracer {
  private readonly name: string;
  private readonly category: readonly string[];

  constructor(name: string, category?: readonly string[]) {
    this.name = name;
    this.category = category ?? ["action", name];
  }

  async startActiveSpan<T>(
    spanName: string,
    fn: (span: Span) => Promise<T> | T,
  ): Promise<T> {
    const logger = getLogger(this.category);
    const attributes: Record<string, unknown> = {
      tracer: this.name,
      spanName,
    };
    let spanStatus: SpanStatus = { code: "ok" };
    let recordedError: unknown = null;

    let currentRequestId = contextLocalStorage?.getStore()?.requestId as
      string | undefined;

    if (!currentRequestId) {
      try {
        const { headers } = await import("next/headers");
        const h = await headers();
        currentRequestId = h.get("x-request-id") ?? undefined;
      } catch {
        // Outside request lifecycle or headers() unavailable
      }
    }

    if (currentRequestId) {
      attributes.requestId = currentRequestId;
    }

    const span: Span = {
      setAttribute(key: string, value: unknown) {
        attributes[key] = value;
        return span;
      },
      setAttributes(newAttributes: Record<string, unknown>) {
        Object.assign(attributes, newAttributes);
        return span;
      },
      recordException(error: unknown) {
        recordedError = error;
        spanStatus = { code: "error" };
        return span;
      },
      setStatus(status: SpanStatus) {
        spanStatus = status;
        return span;
      },
    };

    const startTime = performance.now();
    logger.debug("Started span {spanName}", { ...attributes });

    const spanContext: Record<string, unknown> = {
      ...attributes,
      spanName,
    };

    try {
      const result = await withContext(spanContext, () => fn(span));
      const durationMs = Math.round(performance.now() - startTime);

      if (spanStatus.code === "error") {
        logger.warn(
          "Completed span {spanName} with error status in {durationMs}ms",
          {
            ...attributes,
            durationMs,
            statusMessage: spanStatus.message,
            error:
              recordedError instanceof Error
                ? {
                    message: recordedError.message,
                    stack: recordedError.stack,
                  }
                : recordedError,
          },
        );
      } else {
        logger.info("Completed span {spanName} in {durationMs}ms", {
          ...attributes,
          durationMs,
        });
      }

      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        "Failed span {spanName} after {durationMs}ms: {errorMessage}",
        {
          ...attributes,
          durationMs,
          errorMessage,
          errorStack,
        },
      );

      throw error;
    }
  }
}

export function getTracer(name: string, category?: readonly string[]): Tracer {
  return new Tracer(name, category);
}
