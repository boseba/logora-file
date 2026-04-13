import type { ILogoraWriter } from "logora/module";

/**
 * Extended writer contract used by file outputs.
 *
 * In addition to the Logora writer contract, file writers expose explicit
 * flush and close lifecycle methods for the internal async pipeline.
 */
export interface FileManagedWriter extends ILogoraWriter {
  /**
   * Flushes all buffered records.
   */
  flush(): Promise<void>;

  /**
   * Flushes all buffered records and closes the writer.
   */
  close(): Promise<void>;
}
