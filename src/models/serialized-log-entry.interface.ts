import type { LogType } from "logora";

/**
 * Represents a transport-safe serialized Logora entry.
 */
export interface SerializedLogEntry {
  /**
   * The entry timestamp as an ISO string.
   */
  timestamp: string;

  /**
   * The original log type.
   */
  type: LogType;

  /**
   * The log type as a string.
   */
  typeName: string;

  /**
   * The log message.
   */
  message: string;

  /**
   * The serialized arguments attached to the log entry.
   */
  args: string[];

  /**
   * The optional log scope.
   */
  scope?: string;
}
