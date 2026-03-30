import { FileOutputType } from "../enums";
import { FileOutputOptions } from "./file-output-options";

/**
 * Configuration options for JSON file outputs.
 */
export class FileJsonOutputOptions extends FileOutputOptions {
  public readonly type: FileOutputType = FileOutputType.Json;

  constructor(overrides?: Partial<FileJsonOutputOptions>) {
    super(overrides);
    Object.assign(this, overrides);
  }
}
