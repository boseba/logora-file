import dayjs from "dayjs";
import { LogEntry } from "logora/module";

import { LogType } from "logora";
import { FileTextOutputOptions } from "../../config";
import { TemplateEngine } from "../template-engine";

/**
 * Formats log events for text file output.
 *
 * This formatter is intentionally aligned with the console output approach:
 * - the log type label is derived from the LogType enum
 * - message placeholders are resolved before template rendering
 * - the final line is rendered through the template engine
 *
 * Unlike the console formatter, this implementation does not apply colors
 * or visual modifiers, and also supports rendering a daily file header.
 */
export class FileTextFormatter {
  constructor(private readonly _options: FileTextOutputOptions) {}

  /**
   * Formats a structured log entry into a single text line.
   *
   * @param entry The log entry to format.
   * @returns The rendered log line.
   */
  public formatLog(entry: LogEntry): string {
    const formattedTimestamp: string = this.formatTimestamp(entry.timestamp);
    const formattedType: string = this.formatType(entry.type);
    const formattedMessage: string = this.formatMessage(
      entry.message,
      entry.args,
    );

    return TemplateEngine.render(
      this._options.formatString,
      TemplateEngine.createValueMap(
        formattedTimestamp,
        entry.scope ?? "",
        formattedType,
        formattedMessage,
        "",
      ),
    );
  }

  /**
   * Formats a raw printed message.
   *
   * @param message The raw message template.
   * @param args The message arguments.
   * @returns The rendered raw message line.
   */
  public formatPrint(message: string, args: unknown[]): string {
    return this.formatMessage(message, args);
  }

  /**
   * Formats a title line.
   *
   * @param title The title value.
   * @returns The rendered title line.
   */
  public formatTitle(title: string): string {
    return title;
  }

  /**
   * Formats the daily header line used in text log files.
   *
   * @param date The header date.
   * @returns The rendered daily header line.
   */
  public formatDailyHeader(date: Date): string {
    const formattedDate: string = dayjs(date).format(
      this._options.dailyHeaderDateFormat,
    );

    return TemplateEngine.render(
      this._options.dailyHeaderFormatString,
      TemplateEngine.createValueMap("", "", "", "", formattedDate),
    );
  }

  /**
   * Formats a timestamp according to the configured timestamp format.
   *
   * @param date The source date.
   * @returns The formatted timestamp.
   */
  public formatTimestamp(date: Date): string {
    return dayjs(date).format(this._options.timestampFormat);
  }

  /**
   * Formats a log type label.
   *
   * This follows the same idea as logora-console by relying on the
   * LogType enum reverse mapping.
   *
   * @param type The log type.
   * @returns The formatted type label.
   */
  public formatType(type: LogType): string {
    return LogType[type];
  }

  /**
   * Formats a message template by replacing indexed placeholders.
   *
   * Example:
   * "User {0} created" with ["Alice"] => "User Alice created"
   *
   * @param message The message template.
   * @param args The placeholder arguments.
   * @returns The formatted message.
   */
  public formatMessage(message: string, args: unknown[]): string {
    return message.replace(/\{(\d+)\}/g, (match: string, index: string) => {
      const numericIndex: number = Number(index);

      if (numericIndex >= args.length) {
        return match;
      }

      return this.stringify(args[numericIndex]);
    });
  }

  /**
   * Converts an arbitrary value to a string suitable for file output.
   *
   * @param value The value to stringify.
   * @returns A string representation.
   */
  public stringify(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }

    if (value instanceof Error) {
      return value.stack ?? value.message;
    }

    if (value === undefined) {
      return "undefined";
    }

    if (value === null) {
      return "null";
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }

    return String(value);
  }
}
