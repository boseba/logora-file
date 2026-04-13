import type { LogEntry } from "logora/module";

import type { FileJsonOutputOptions } from "../../config";
import type { FileInstruction } from "../../models/file-instruction.interface";
import { FileSession } from "../file-session";
import { FileInstructionFactory } from "../json/instruction-factory";
import { FileWritePipeline } from "../pipeline/file-write-pipeline";
import type { FileWriteRecord } from "../pipeline/file-write-record.interface";
import type { FileManagedWriter } from "./file-managed-writer.interface";

/**
 * JSON Lines writer implementation for file output.
 *
 * The written payloads are intentionally aligned with the structured
 * instructions emitted by logora-socketio.
 */
export class FileJsonWriter implements FileManagedWriter {
  private readonly _pipeline: FileWritePipeline;

  private readonly _factory: FileInstructionFactory;

  public constructor(private readonly _options: FileJsonOutputOptions) {
    const session = new FileSession(this._options);

    this._pipeline = new FileWritePipeline(session, this._options);
    this._factory = new FileInstructionFactory(this._options.serializer);
  }

  /**
   * Writes a structured log instruction.
   *
   * @param entry The log entry to write.
   */
  public log(entry: LogEntry): void {
    this._pipeline.enqueue(
      this._createRecord(
        this._factory.createLogInstruction(entry),
        entry.timestamp,
      ),
    );
  }

  /**
   * Writes a structured title instruction.
   *
   * @param title The title to write.
   */
  public title(title: string): void {
    const timestamp: Date = new Date();

    this._pipeline.enqueue(
      this._createRecord(
        this._factory.createTitleInstruction(title),
        timestamp,
      ),
    );
  }

  /**
   * Writes a structured empty-line instruction.
   *
   * This intentionally mirrors the Socket.IO JSON contract instead of
   * becoming a no-op, so both outputs remain strictly aligned.
   *
   * @param count The number of empty lines to represent.
   */
  public empty(count: number = 1): void {
    const timestamp: Date = new Date();

    this._pipeline.enqueue(
      this._createRecord(
        this._factory.createEmptyInstruction(count),
        timestamp,
      ),
    );
  }

  /**
   * No-op for file outputs.
   */
  public clear(): void {
    // Intentionally a no-op.
  }

  /**
   * Writes a structured print instruction.
   *
   * @param message The raw message.
   * @param args The message arguments.
   */
  public print(message: string, ...args: unknown[]): void {
    const timestamp: Date = new Date();

    this._pipeline.enqueue(
      this._createRecord(
        this._factory.createPrintInstruction(message, args),
        timestamp,
      ),
    );
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

  private _createRecord(
    instruction: FileInstruction,
    timestamp: Date,
  ): FileWriteRecord {
    return {
      content: JSON.stringify(instruction),
      timestamp,
    };
  }
}
