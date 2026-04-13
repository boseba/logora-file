import { DefaultFileInstructionSerializer } from "../core/json/instruction-serializer";
import { FileOutputType } from "../enums";
import type { FileInstructionSerializer } from "../models/file-instruction-serializer.interface";
import { FileOutputOptions } from "./file-output-options";

/**
 * Configuration options for JSON file outputs.
 */
export class FileJsonOutputOptions extends FileOutputOptions {
  public readonly type: FileOutputType = FileOutputType.Json;

  /**
   * The serializer responsible for converting log entries and values
   * into transport-safe JSON payloads.
   */
  public serializer: FileInstructionSerializer =
    new DefaultFileInstructionSerializer();

  public constructor(overrides?: Partial<FileJsonOutputOptions>) {
    super(overrides);
    Object.assign(this, overrides);
  }
}
