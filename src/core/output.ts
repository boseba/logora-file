import type { ILogoraOutput } from "logora";

import { FileJsonOutputOptions, FileTextOutputOptions } from "../config";
import { FileJsonWriter, FileTextWriter } from "./writer";
import type { FileManagedWriter } from "./writer/file-managed-writer.interface";

/**
 * FileTextOutput writes text-formatted logs to a file.
 */
export class FileTextOutput implements ILogoraOutput {
  public readonly name: string = "file-text";

  public readonly options: FileTextOutputOptions;

  public readonly writer: FileManagedWriter;

  public constructor(config?: Partial<FileTextOutputOptions>) {
    this.options = new FileTextOutputOptions(config);
    this.writer = new FileTextWriter(this.options);
  }

  /**
   * Flushes the internal async write pipeline.
   */
  public flush(): Promise<void> {
    return this.writer.flush();
  }

  /**
   * Flushes pending records and closes the output pipeline.
   */
  public close(): Promise<void> {
    return this.writer.close();
  }
}

/**
 * FileJsonOutput writes JSON Lines formatted logs to a file.
 */
export class FileJsonOutput implements ILogoraOutput {
  public readonly name: string = "file-json";

  public readonly options: FileJsonOutputOptions;

  public readonly writer: FileManagedWriter;

  public constructor(config?: Partial<FileJsonOutputOptions>) {
    this.options = new FileJsonOutputOptions(config);
    this.writer = new FileJsonWriter(this.options);
  }

  /**
   * Flushes the internal async write pipeline.
   */
  public flush(): Promise<void> {
    return this.writer.flush();
  }

  /**
   * Flushes pending records and closes the output pipeline.
   */
  public close(): Promise<void> {
    return this.writer.close();
  }
}
