import type { ILogoraWriter, LogEntry } from "logora/module";

import { FileTextOutputOptions } from "../../config";
import { FileSession } from "../file-session";
import { FileTextFormatter } from "../formatter/file-text-formatter";
import { RotationManager } from "../rotation-manager";

/**
 * Text writer implementation for file output.
 */
export class FileTextWriter implements ILogoraWriter {
  private readonly _session: FileSession;

  private readonly _formatter: FileTextFormatter;

  private _lastHeaderDayKey: string | null = null;

  constructor(private readonly _options: FileTextOutputOptions) {
    this._session = new FileSession(this._options);
    this._formatter = new FileTextFormatter(this._options);
    this._lastHeaderDayKey = this._session.getInitialHeaderDayKey(new Date());
  }

  /**
   * Writes a structured log entry.
   *
   * @param entry The log entry to write.
   */
  public log(entry: LogEntry): void {
    this._writeHeaderIfNeeded(entry.timestamp);
    this._session.appendLine(this._formatter.formatLog(entry), entry.timestamp);
  }

  /**
   * Writes a title line.
   *
   * @param title The title to write.
   */
  public title(title: string): void {
    const timestamp: Date = new Date();

    this._writeHeaderIfNeeded(timestamp);
    this._session.appendLine(this._formatter.formatTitle(title), timestamp);
  }

  /**
   * Writes one or more empty lines.
   *
   * @param count Number of empty lines to write.
   */
  public empty(count: number = 1): void {
    this._session.appendEmptyLines(count);
  }

  /**
   * No-op for file outputs.
   */
  public clear(): void {
    // No-op for file outputs.
  }

  /**
   * Writes a raw message line.
   *
   * @param message The raw message.
   * @param args The message arguments.
   */
  public print(message: string, ...args: unknown[]): void {
    const timestamp: Date = new Date();

    this._writeHeaderIfNeeded(timestamp);
    this._session.appendLine(
      this._formatter.formatPrint(message, args),
      timestamp,
    );
  }

  private _writeHeaderIfNeeded(timestamp: Date): void {
    if (!this._options.showDateHeader) {
      return;
    }

    const currentDayKey: string = RotationManager.getDayKey(timestamp);

    if (this._lastHeaderDayKey === currentDayKey) {
      return;
    }

    this._session.appendLine(
      this._formatter.formatDailyHeader(timestamp),
      timestamp,
    );
    this._lastHeaderDayKey = currentDayKey;
  }
}
