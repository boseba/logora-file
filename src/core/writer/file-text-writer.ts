import * as fs from "node:fs";

import type { LogEntry } from "logora/module";

import type { FileTextOutputOptions } from "../../config";
import { FileSession } from "../file-session";
import { PathResolver } from "../path-resolver";
import { FileWritePipeline } from "../pipeline/file-write-pipeline";
import type { FileWriteRecord } from "../pipeline/file-write-record.interface";
import { RotationManager } from "../rotation-manager";
import { FileTextRenderer } from "../text/file-text-renderer";
import type { FileManagedWriter } from "./file-managed-writer.interface";

/**
 * Text writer implementation for file output.
 */
export class FileTextWriter implements FileManagedWriter {
  private readonly _pipeline: FileWritePipeline;

  private readonly _renderer: FileTextRenderer;

  private _lastHeaderDayKey: string | null = null;

  public constructor(private readonly _options: FileTextOutputOptions) {
    const session = new FileSession(this._options);

    this._pipeline = new FileWritePipeline(session, this._options);
    this._renderer = new FileTextRenderer(this._options);
    this._lastHeaderDayKey = this._resolveInitialHeaderDayKey(new Date());
  }

  /**
   * Writes a structured log entry.
   *
   * @param entry The log entry to write.
   */
  public log(entry: LogEntry): void {
    const records: FileWriteRecord[] = [
      ...this._createHeaderRecordsIfNeeded(entry.timestamp),
      {
        content: this._renderer.renderLog(entry),
        timestamp: entry.timestamp,
      },
    ];

    this._pipeline.enqueueMany(records);
  }

  /**
   * Writes a title line.
   *
   * @param title The title to write.
   */
  public title(title: string): void {
    const timestamp: Date = new Date();

    const records: FileWriteRecord[] = [
      ...this._createHeaderRecordsIfNeeded(timestamp),
      {
        content: this._renderer.renderTitle(title),
        timestamp,
      },
    ];

    this._pipeline.enqueueMany(records);
  }

  /**
   * Writes one or more empty lines.
   *
   * @param count Number of empty lines to write.
   */
  public empty(count: number = 1): void {
    if (count <= 0) {
      return;
    }

    const timestamp: Date = new Date();
    const records: FileWriteRecord[] = [];

    for (let index = 0; index < count; index++) {
      records.push({
        content: "",
        timestamp,
      });
    }

    this._pipeline.enqueueMany(records);
  }

  /**
   * No-op for file outputs.
   */
  public clear(): void {
    // Intentionally a no-op.
  }

  /**
   * Writes a raw message line.
   *
   * @param message The raw message.
   * @param args The message arguments.
   */
  public print(message: string, ...args: unknown[]): void {
    const timestamp: Date = new Date();

    const records: FileWriteRecord[] = [
      ...this._createHeaderRecordsIfNeeded(timestamp),
      {
        content: this._renderer.renderPrint(message, args),
        timestamp,
      },
    ];

    this._pipeline.enqueueMany(records);
  }

  /**
   * Flushes all buffered records.
   */
  public flush(): Promise<void> {
    return this._pipeline.flush();
  }

  /**
   * Flushes all buffered records and closes the writer.
   */
  public close(): Promise<void> {
    return this._pipeline.close();
  }

  private _createHeaderRecordsIfNeeded(timestamp: Date): FileWriteRecord[] {
    if (!this._options.showDateHeader) {
      return [];
    }

    const currentDayKey: string = RotationManager.getDayKey(timestamp);

    if (this._lastHeaderDayKey === currentDayKey) {
      return [];
    }

    this._lastHeaderDayKey = currentDayKey;

    return [
      {
        content: this._renderer.renderDailyHeader(timestamp),
        timestamp,
      },
    ];
  }

  private _resolveInitialHeaderDayKey(referenceDate: Date): string | null {
    if (!this._options.append) {
      return null;
    }

    const absolutePath: string = PathResolver.resolve(
      this._options.path,
    ).absolutePath;

    if (!fs.existsSync(absolutePath)) {
      return null;
    }

    const stats: fs.Stats = fs.statSync(absolutePath);

    if (stats.size <= 0) {
      return null;
    }

    const fileDayKey: string = RotationManager.getDayKey(stats.mtime);
    const referenceDayKey: string = RotationManager.getDayKey(referenceDate);

    return fileDayKey === referenceDayKey ? fileDayKey : null;
  }
}
