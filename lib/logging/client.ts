import {
  configureSync,
  getConfig,
  getConsoleSink,
  getJsonLinesFormatter,
  type LogLevel,
} from "@logtape/logtape";

let clientInitialized = false;

export function initClientLogging(): void {
  if (
    clientInitialized ||
    getConfig() !== null
  ) {
    return;
  }

  const envLevel = (
    process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL
  )?.toLowerCase();

  const lowestLevel: LogLevel =
    envLevel === "warn"
      ? "warning"
      : ((envLevel as LogLevel) ??
        (process.env.NODE_ENV === "production" ? "info" : "debug"));

  try {
    configureSync({
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
    });
    clientInitialized = true;
  } catch (error) {
    console.error("Failed to initialize LogTape client logging:", error);
  }
}
