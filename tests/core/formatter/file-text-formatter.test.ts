import { LogType } from "logora";
import { describe, expect, it } from "vitest";

import { FileTextOutputOptions } from "../../../src/config";
import { FileTextFormatter } from "../../../src/core/formatter/file-text-formatter";

describe("FileTextFormatter", () => {
  it("should format a structured log entry", () => {
    const formatter = new FileTextFormatter(
      new FileTextOutputOptions({
        formatString: "[%timestamp%] %type%: %message%",
        timestampFormat: "HH:mm:ss",
      }),
    );

    const result = formatter.formatLog({
      timestamp: new Date("2026-03-30T10:20:30.000Z"),
      type: LogType.Info,
      message: "Hello {0}",
      args: ["World"],
    });

    expect(result).toContain("Info");
    expect(result).toContain("Hello World");
  });

  it("should format a raw message", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());

    expect(formatter.formatPrint("Hello {0}", ["World"])).toBe("Hello World");
  });

  it("should format a title", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());

    expect(formatter.formatTitle("Section")).toBe("Section");
  });

  it("should format a daily header", () => {
    const formatter = new FileTextFormatter(
      new FileTextOutputOptions({
        dailyHeaderFormatString: "%dailyHeader%",
        dailyHeaderDateFormat: "YYYY-MM-DD",
      }),
    );

    expect(
      formatter.formatDailyHeader(new Date("2026-03-30T10:00:00.000Z")),
    ).toBe("2026-03-30");
  });

  it("should format a timestamp", () => {
    const formatter = new FileTextFormatter(
      new FileTextOutputOptions({
        timestampFormat: "HH:mm:ss",
      }),
    );

    expect(
      formatter.formatTimestamp(new Date(2026, 2, 30, 10, 20, 30, 0)),
    ).toBe("10:20:30");
  });

  it("should format a type using LogType reverse mapping", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());

    expect(formatter.formatType(LogType.Warning)).toBe("Warning");
  });

  it("should keep missing placeholders unchanged", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());

    expect(formatter.formatMessage("Hello {0} {1}", ["World"])).toBe(
      "Hello World {1}",
    );
  });

  it("should stringify strings", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());

    expect(formatter.stringify("hello")).toBe("hello");
  });

  it("should stringify errors", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());
    const error = new Error("failure");

    expect(formatter.stringify(error)).toContain("failure");
  });

  it("should stringify undefined", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());

    expect(formatter.stringify(undefined)).toBe("undefined");
  });

  it("should stringify null", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());

    expect(formatter.stringify(null)).toBe("null");
  });

  it("should stringify objects as JSON", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());

    expect(formatter.stringify({ value: 1 })).toBe('{"value":1}');
  });

  it("should fallback to String for unserializable objects", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());
    const circular: Record<string, unknown> = {};
    circular["self"] = circular;

    expect(formatter.stringify(circular)).toBe("[Unserializable Object]");
  });

  it("should stringify primitive values", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());

    expect(formatter.stringify(42)).toBe("42");
  });

  it("should stringify errors using message when stack is missing", () => {
    const formatter = new FileTextFormatter(new FileTextOutputOptions());
    const error = new Error("failure");

    Object.defineProperty(error, "stack", {
      value: undefined,
      configurable: true,
    });

    expect(formatter.stringify(error)).toBe("failure");
  });
});
