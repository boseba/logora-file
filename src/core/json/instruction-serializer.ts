import { LogType } from "logora";
import type { LogEntry } from "logora/module";

import type { FileInstructionSerializer } from "../../models/file-instruction-serializer.interface";
import type { SerializedLogEntry } from "../../models/serialized-log-entry.interface";

/**
 * Default serializer used by the JSON file output.
 *
 * It converts log entries into lightweight transport-safe payloads
 * suitable for structured persistence and strict alignment with
 * logora-socketio.
 */
export class DefaultFileInstructionSerializer implements FileInstructionSerializer {
  /**
   * Serializes a Logora log entry into a transport-safe structure.
   *
   * @param entry The log entry to serialize.
   * @returns A serialized log entry.
   */
  public serializeLogEntry(entry: LogEntry): SerializedLogEntry {
    return {
      timestamp: entry.timestamp.toISOString(),
      type: entry.type,
      typeName: this._getTypeName(entry.type),
      message: entry.message,
      args: entry.args.map((arg: unknown): string => this.serializeArg(arg)),
      scope: entry.scope,
    };
  }

  /**
   * Serializes a single log argument into a string representation.
   *
   * @param value The value to serialize.
   * @returns A string representation suitable for transport and display.
   */
  public serializeArg(value: unknown): string {
    if (value instanceof Error) {
      return value.stack || value.message || value.toString();
    }

    if (typeof value === "string") {
      return value;
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "bigint" ||
      typeof value === "symbol"
    ) {
      return String(value);
    }

    if (typeof value === "function") {
      return value.name || "[anonymous]";
    }

    if (value === undefined) {
      return "undefined";
    }

    if (value === null) {
      return "null";
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "[Unserializable Object]";
    }
  }

  /**
   * Returns the string representation of a Logora log type.
   *
   * @param type The log type value.
   * @returns The corresponding log type name.
   */
  private _getTypeName(type: LogType): string {
    switch (type) {
      case LogType.Debug:
        return "Debug";

      case LogType.Info:
        return "Info";

      case LogType.Success:
        return "Success";

      case LogType.Warning:
        return "Warning";

      case LogType.Error:
        return "Error";

      case LogType.Highlight:
        return "Highlight";

      case LogType.Raw:
        return "Raw";
    }
  }
}
