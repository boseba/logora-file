import type { FileWriteRecord } from "./file-write-record.interface";

/**
 * Minimal contract required by the async file write pipeline.
 */
export interface FileWriteSession {
  /**
   * Appends an ordered batch of records to the active file.
   *
   * @param records The ordered records to persist.
   */
  appendBatch(records: FileWriteRecord[]): Promise<void>;
}
