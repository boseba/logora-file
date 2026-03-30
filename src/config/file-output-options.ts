import type { ILogoraOutputOptions, LogLevel } from "logora";

import type { FileRotationPolicy } from "../enums";
import { FileOutputType } from "../enums";

/**
 * Base configuration for file outputs.
 *
 * This class contains options shared by both text and JSON file outputs.
 */
export abstract class FileOutputOptions implements ILogoraOutputOptions {
  /**
   * Discriminant used to identify the concrete file output type.
   */
  public abstract readonly type: FileOutputType;

  /**
   * Minimum log level to write for this output.
   * If undefined, the logger global level will be used.
   */
  public level?: LogLevel;

  /**
   * Destination file path.
   *
   * Relative paths are resolved from process.cwd().
   */
  public path: string = "./logs/app.log";

  /**
   * Whether parent directories should be created automatically.
   *
   * Default: true
   */
  public mkdir: boolean = true;

  /**
   * Whether to append to an existing active file.
   *
   * Default: true
   */
  public append: boolean = true;

  /**
   * File encoding used when writing logs.
   *
   * Default: "utf8"
   */
  public encoding: BufferEncoding = "utf8";

  /**
   * End-of-line sequence appended after each written record.
   *
   * Default: "\n"
   */
  public eol: string = "\n";

  /**
   * Rotation policies to enable for this output.
   *
   * Supported values:
   * - "daily"
   * - "size"
   * - "startup"
   *
   * If undefined or empty, no rotation is applied.
   */
  public rotation?: FileRotationPolicy[];

  /**
   * Maximum allowed size of the active file in bytes before rotating.
   * Used only when "size" rotation is enabled.
   */
  public maxSizeBytes?: number;

  /**
   * Maximum number of rotated files to keep.
   * Older files beyond this limit are deleted.
   */
  public maxFiles?: number;

  /**
   * Maximum age in days for rotated files.
   * Older files are deleted.
   */
  public maxAgeDays?: number;

  protected constructor(overrides?: Partial<FileOutputOptions>) {
    Object.assign(this, overrides);
  }
}
