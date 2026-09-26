import "server-only";
import {
  configure,
  getConfig,
  getConsoleSink,
  getJsonLinesFormatter,
  type ContextLocalStorage,
  type LogLevel,
} from "@logtape/logtape";
import { AsyncLocalStorage } from "node:async_hooks";

export const contextLocalStorage: ContextLocalStorage<Record<string, unknown>> =
  new AsyncLocalStorage();

export { Tracer, getTracer } from "./tracer";

let initPromise: Promise<void> | null = null;

export async function initServerLogging(): Promise<void> {
  if (getConfig() !== null) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      const envLevel = process.env.LOG_LEVEL?.toLowerCase();
      const lowestLevel: LogLevel =
        envLevel === "warn"
          ? "warning"
          : ((envLevel as LogLevel) ??
            (process.env.NODE_ENV === "production" ? "info" : "debug"));

      await configure({
        sinks: {
          console: getConsoleSink({
            formatter: getJsonLinesFormatter(),
          }),
        },
        loggers: [
          {
            category: [],
            sinks: ["console"],
            lowestLevel,
          },
          {
            category: ["logtape", "meta"],
            sinks: ["console"],
            lowestLevel: "warning",
          },
        ],
        contextLocalStorage,
      });
    })();
  }

  return initPromise;
}
