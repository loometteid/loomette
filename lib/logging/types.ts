import type { LogLevel } from "@logtape/logtape";

export type { LogLevel };

export interface SpanStatus {
  code: "ok" | "error";
  message?: string;
}

export interface Span {
  setAttribute(key: string, value: unknown): this;
  setAttributes(attributes: Record<string, unknown>): this;
  recordException(error: unknown): this;
  setStatus(status: SpanStatus): this;
}

export type LogCategory =
  | readonly ["http"]
  | readonly ["action", string]
  | readonly ["query", string]
  | readonly ["mutation", string]
  | readonly ["auth"]
  | readonly string[];
