import { Placeholder } from "../enums/placeholder.enum";

/**
 * Defines the default formatting constants used by the file output system.
 *
 * These defaults can be overridden by the user through configuration options.
 */
export class FileDefaults {
  /**
   * Default format string for the daily header inserted when the date changes.
   *
   * Content: Placeholder for the formatted date (`%dailyHeader%`).
   */
  static readonly DailyHeader = `${Placeholder.DailyHeader}`;

  /**
   * Default format used to render the date inside the daily header.
   *
   * Example output: "April 29th 2025, 03:45:12"
   */
  static readonly DailyHeaderDateFormat: string = "MMMM Do YYYY, hh:mm:ss";

  /**
   * Default format for timestamps displayed in each log entry.
   *
   * Example output: "15:27:48"
   */
  static readonly TimestampFormat: string = "HH:mm:ss";

  /**
   * Default log entry structure format string.
   *
   * Supported placeholders:
   * - %timestamp% : formatted current time
   * - %scope%     : optional context or module name
   * - %type%      : log level (info, warning, error, etc.)
   * - %message%   : actual message content
   *
   * Example after substitution: "[15:27:48] [AuthService] info: User logged in"
   */
  static readonly Log = `[${Placeholder.Timestamp}] {[${Placeholder.Scope}] }${Placeholder.Type}: ${Placeholder.Message}`;
}
