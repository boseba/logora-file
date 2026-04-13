import type { FileOutputOptions } from "../../config";
import type { FileWriteRecord } from "./file-write-record.interface";
import type { FileWriteSession } from "./file-write-session.interface";

/**
 * Async ordered write pipeline used by file outputs.
 *
 * The hot path only buffers records in memory and schedules a sequential
 * async flush. All file-system activity happens outside the caller path.
 */
export class FileWritePipeline {
  private readonly _queue: FileWriteRecord[] = [];

  private _isFlushing: boolean = false;

  private _isScheduled: boolean = false;

  private _isClosed: boolean = false;

  private readonly _drainResolvers: Array<() => void> = [];

  public constructor(
    private readonly _session: FileWriteSession,
    private readonly _options: FileOutputOptions,
  ) {}

  /**
   * Enqueues a single record for async persistence.
   *
   * @param record The record to enqueue.
   */
  public enqueue(record: FileWriteRecord): void {
    if (!this._canAcceptWrites()) {
      return;
    }

    this._enqueueInternal(record);
    this._scheduleFlush();
  }

  /**
   * Enqueues multiple ordered records for async persistence.
   *
   * @param records The records to enqueue.
   */
  public enqueueMany(records: FileWriteRecord[]): void {
    if (records.length === 0 || !this._canAcceptWrites()) {
      return;
    }

    for (const record of records) {
      this._enqueueInternal(record);
    }

    this._scheduleFlush();
  }

  /**
   * Flushes all currently buffered records.
   */
  public async flush(): Promise<void> {
    if (this._queue.length === 0 && !this._isFlushing) {
      return;
    }

    return new Promise<void>((resolve) => {
      this._drainResolvers.push(resolve);
      this._scheduleFlush();
    });
  }

  /**
   * Flushes pending records and prevents further writes.
   */
  public async close(): Promise<void> {
    this._isClosed = true;
    await this.flush();
  }

  private _canAcceptWrites(): boolean {
    if (!this._isClosed) {
      return true;
    }

    this._notifyError(
      new Error("The file write pipeline is closed and cannot accept writes."),
    );

    return false;
  }

  private _enqueueInternal(record: FileWriteRecord): void {
    if (this._queue.length >= this._options.maxBufferedRecords) {
      const error = new Error(
        `The file write pipeline buffer is full (${this._options.maxBufferedRecords} records).`,
      );

      this._notifyError(error);

      if (this._options.overflowStrategy === "drop-newest") {
        return;
      }

      this._queue.shift();
    }

    this._queue.push(record);
  }

  private _scheduleFlush(): void {
    if (this._isScheduled || this._isFlushing) {
      return;
    }

    this._isScheduled = true;

    queueMicrotask(() => {
      this._isScheduled = false;
      void this._flushLoop();
    });
  }

  private async _flushLoop(): Promise<void> {
    if (this._isFlushing) {
      return;
    }

    this._isFlushing = true;

    try {
      while (this._queue.length > 0) {
        const batch: FileWriteRecord[] = this._queue.splice(
          0,
          this._options.maxBatchSize,
        );

        await this._session.appendBatch(batch);
      }
    } catch (error: unknown) {
      this._notifyError(error);
    } finally {
      this._isFlushing = false;
    }

    if (this._queue.length > 0) {
      this._scheduleFlush();
    } else {
      this._resolveDrains();
    }
  }

  private _resolveDrains(): void {
    while (this._drainResolvers.length > 0) {
      const resolve = this._drainResolvers.shift();

      if (resolve) {
        resolve();
      }
    }
  }

  private _notifyError(error: unknown): void {
    this._options.onError?.(error);
  }
}
