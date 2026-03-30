import { LogEntry } from "logora/module";

/**
 * Formats log events as JSON Lines records.
 */
export class FileJsonFormatter {
  /**
   * Formats a structured log entry as JSON.
   *
   * @param entry The log entry to serialize.
   * @returns A JSON string.
   */
  public formatLog(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      type: entry.type,
      message: entry.message,
      args: entry.args,
      scope: entry.scope ?? null,
    });
  }

  /**
   * Formats a raw print entry as JSON.
   *
   * @param message The raw message.
   * @param args The associated arguments.
   * @param timestamp The write timestamp.
   * @returns A JSON string.
   */
  public formatPrint(
    message: string,
    args: unknown[],
    timestamp: Date,
  ): string {
    return JSON.stringify({
      timestamp: timestamp.toISOString(),
      kind: "raw",
      message,
      args,
    });
  }

  /**
   * Formats a title entry as JSON.
   *
   * @param title The title.
   * @param timestamp The write timestamp.
   * @returns A JSON string.
   */
  public formatTitle(title: string, timestamp: Date): string {
    return JSON.stringify({
      timestamp: timestamp.toISOString(),
      kind: "title",
      title,
    });
  }
}
