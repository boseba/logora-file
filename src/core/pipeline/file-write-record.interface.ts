/**
 * Represents a single internal file write request.
 *
 * The content is stored without the trailing end-of-line sequence.
 */
export interface FileWriteRecord {
  /**
   * The record content without trailing end-of-line.
   */
  content: string;

  /**
   * The logical timestamp associated with the record.
   *
   * This timestamp is used for deterministic daily and size-based
   * rotation decisions.
   */
  timestamp: Date;
}
