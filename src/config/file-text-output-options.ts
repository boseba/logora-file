import { FileDefaults } from "../core/defaults";
import { FileOutputType } from "../enums";
import { FileOutputOptions } from "./file-output-options";

/**
 * Configuration options for text file outputs.
 */
export class FileTextOutputOptions extends FileOutputOptions {
  public readonly type: FileOutputType = FileOutputType.Text;

  /**
   * Whether to automatically insert a daily header when the date changes.
   *
   * Default: true
   */
  public showDateHeader: boolean = true;

  /**
   * Format string describing how each text log entry is structured.
   *
   * Supported placeholders:
   * - %timestamp%
   * - %scope%
   * - %type%
   * - %message%
   *
   * Optional blocks using single braces are also supported.
   *
   * Default: FileDefaults.Log
   */
  public formatString: string = FileDefaults.Log;

  /**
   * Date format used to render the daily header value.
   *
   * Default: FileDefaults.DailyHeaderDateFormat
   */
  public dailyHeaderDateFormat: string = FileDefaults.DailyHeaderDateFormat;

  /**
   * Format string used to render the daily header line.
   *
   * Default: FileDefaults.DailyHeader
   */
  public dailyHeaderFormatString: string = FileDefaults.DailyHeader;

  /**
   * Timestamp format used in text log entries.
   *
   * Default: FileDefaults.TimestampFormat
   */
  public timestampFormat: string = FileDefaults.TimestampFormat;

  constructor(overrides?: Partial<FileTextOutputOptions>) {
    super(overrides);
    Object.assign(this, overrides);
  }
}
