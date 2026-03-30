import type { ILogoraWriter, LogEntry } from "logora/module";

import { FileJsonOutputOptions } from "../../config";
import { FileSession } from "../file-session";
import { FileJsonFormatter } from "../formatter/file-json-formatter";

/**
 * JSON Lines writer implementation for file output.
 */
export class FileJsonWriter implements ILogoraWriter {
  private readonly _session: FileSession;

  private readonly _formatter: FileJsonFormatter;

  constructor(private readonly _options: FileJsonOutputOptions) {
    this._session = new FileSession(this._options);
    this._formatter = new FileJsonFormatter();
  }

  /**
   * Writes a structured log entry.
   *
   * @param entry The log entry to write.
   */
  public log(entry: LogEntry): void {
    this._session.appendLine(this._formatter.formatLog(entry), entry.timestamp);
  }

  /**
   * Writes a title record.
   *
   * @param title The title to write.
   */
  public title(title: string): void {
    const timestamp: Date = new Date();

    this._session.appendLine(
      this._formatter.formatTitle(title, timestamp),
      timestamp,
    );
  }

  /**
   * No-op for JSON outputs.
   *
   * @param _count Unused.
   */
  public empty(_count?: number): void {
    // No-op for JSON outputs.
  }

  /**
   * No-op for file outputs.
   */
  public clear(): void {
    // No-op for file outputs.
  }

  /**
   * Writes a raw record.
   *
   * @param message The raw message.
   * @param args The message arguments.
   */
  public print(message: string, ...args: unknown[]): void {
    const timestamp: Date = new Date();

    this._session.appendLine(
      this._formatter.formatPrint(message, args, timestamp),
      timestamp,
    );
  }
}
