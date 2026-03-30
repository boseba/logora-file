import type { ILogoraOutput } from "logora";
import type { ILogoraWriter } from "logora/module";

import { FileJsonOutputOptions, FileTextOutputOptions } from "../config";
import { FileJsonWriter, FileTextWriter } from "./writer";

/**
 * FileTextOutput writes text-formatted logs to a file.
 */
export class FileTextOutput implements ILogoraOutput {
  public name: string = "file-text";
  public options: FileTextOutputOptions;
  public writer: ILogoraWriter;

  constructor(config?: Partial<FileTextOutputOptions>) {
    this.options = new FileTextOutputOptions(config);
    this.writer = new FileTextWriter(this.options);
  }
}

/**
 * FileJsonOutput writes JSON Lines formatted logs to a file.
 */
export class FileJsonOutput implements ILogoraOutput {
  public name: string = "file-json";
  public options: FileJsonOutputOptions;
  public writer: ILogoraWriter;

  constructor(config?: Partial<FileJsonOutputOptions>) {
    this.options = new FileJsonOutputOptions(config);
    this.writer = new FileJsonWriter(this.options);
  }
}
