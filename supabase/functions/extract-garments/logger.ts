export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  jobId?: string;
  userId?: string;
  step?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export interface Logger {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
  child: (context: Record<string, unknown>) => Logger;
  startTimer: (step: string) => {
    elapsedMs: () => number;
    done: (message: string, context?: Record<string, unknown>) => number;
  };
}

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(typeof err === "object" && err !== null ? { ...err } : {}),
    };
  }
  if (typeof err === "object" && err !== null) {
    return { ...err };
  }
  return { message: String(err) };
}

export function createLogger(
  initialContext: Record<string, unknown> = {},
  service = "extract-garments"
): Logger {
  const baseContext = { ...initialContext };
  const isPretty = Deno.env.get("LOG_FORMAT") === "pretty";

  function write(
    level: LogLevel,
    message: string,
    context: Record<string, unknown> = {}
  ) {
    const timestamp = new Date().toISOString();
    const merged = { ...baseContext, ...context };

    if ("error" in merged && merged.error) {
      merged.error = serializeError(merged.error);
    }

    if (isPretty) {
      const jobIdStr = merged.jobId ? ` [${merged.jobId}]` : "";
      const stepStr = merged.step ? ` [${merged.step}]` : "";
      const durationStr =
        typeof merged.durationMs === "number" ? ` (${merged.durationMs}ms)` : "";
      const meta = Object.keys(merged).filter(
        (k) => !["jobId", "userId", "step", "durationMs"].includes(k)
      );
      const metaStr =
        meta.length > 0
          ? ` ${JSON.stringify(Object.fromEntries(meta.map((k) => [k, merged[k]])))}`
          : "";

      const formatted = `[${timestamp}] [${level.toUpperCase()}] [${service}]${jobIdStr}${stepStr} ${message}${durationStr}${metaStr}`;

      switch (level) {
        case "error":
          console.error(formatted);
          break;
        case "warn":
          console.warn(formatted);
          break;
        case "debug":
          console.debug(formatted);
          break;
        case "info":
        default:
          console.log(formatted);
          break;
      }
      return;
    }

    const entry: LogEntry = {
      timestamp,
      level,
      service,
      message,
      ...merged,
    };

    const jsonString = JSON.stringify(entry);

    switch (level) {
      case "error":
        console.error(jsonString);
        break;
      case "warn":
        console.warn(jsonString);
        break;
      case "debug":
        console.debug(jsonString);
        break;
      case "info":
      default:
        console.log(jsonString);
        break;
    }
  }

  const logger: Logger = {
    debug: (msg, ctx) => write("debug", msg, ctx),
    info: (msg, ctx) => write("info", msg, ctx),
    warn: (msg, ctx) => write("warn", msg, ctx),
    error: (msg, ctx) => write("error", msg, ctx),
    child: (ctx) => createLogger({ ...baseContext, ...ctx }, service),
    startTimer: (step: string) => {
      const start = performance.now();
      return {
        elapsedMs: () => Math.round(performance.now() - start),
        done: (msg: string, ctx: Record<string, unknown> = {}) => {
          const durationMs = Math.round(performance.now() - start);
          write("info", msg, { step, durationMs, ...ctx });
          return durationMs;
        },
      };
    },
  };

  return logger;
}
