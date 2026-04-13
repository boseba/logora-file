import type { LogEntry } from "logora/module";

import type { SerializedLogEntry } from "./serialized-log-entry.interface";

/**
 * Defines the contract used to serialize Logora entries and arguments
 * into lightweight JSON file payloads.
 */
export interface FileInstructionSerializer {
  /**
   * Serializes a Logora log entry.
   *
   * @param entry The log entry to serialize.
   * @returns A transport-safe serialized log entry.
   */
  serializeLogEntry(entry: LogEntry): SerializedLogEntry;

  /**
   * Serializes a single runtime argument into a string representation.
   *
   * @param value The value to serialize.
   * @returns A string representation suitable for persistence and display.
   */
  serializeArg(value: unknown): string;
}
