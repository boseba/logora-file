/**
 * Placeholders used within log formatting strings.
 *
 * These placeholders are dynamically replaced with actual runtime values
 * (e.g., timestamps, log message content, etc.) when rendering a log entry.
 */
export enum Placeholder {
  /**
   * Placeholder for the daily header date.
   * Typically used to insert a separator when the date changes.
   * Example substitution: "April 29th 2025"
   */
  DailyHeader = "%dailyHeader%",

  /**
   * Placeholder for the main message content of the log entry.
   * Example substitution: "User successfully logged in"
   */
  Message = "%message%",

  /**
   * Placeholder for the log level type.
   * Example substitution: "info", "warning", "error"
   */
  Type = "%type%",

  /**
   * Placeholder for the logging scope or module name.
   * Example substitution: "AuthService", "DatabaseManager"
   */
  Scope = "%scope%",

  /**
   * Placeholder for the timestamp when the log entry was created.
   * Example substitution: "15:27:48"
   */
  Timestamp = "%timestamp%",
}
