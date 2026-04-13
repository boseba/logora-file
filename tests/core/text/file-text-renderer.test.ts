import { LogType } from "logora";
import { describe, expect, it } from "vitest";

import { FileTextOutputOptions } from "../../../src/config";
import { FileTextRenderer } from "../../../src/core/text/file-text-renderer";

describe("FileTextRenderer", () => {
  it("should render a structured log entry", () => {
    const renderer = new FileTextRenderer(
      new FileTextOutputOptions({
        formatString: "[%timestamp%] %type%: %message%",
        timestampFormat: "HH:mm:ss",
      }),
    );

    const result = renderer.renderLog({
      timestamp: new Date("2026-03-30T10:20:30.000Z"),
      type: LogType.Info,
      message: "Hello {0}",
      args: ["World"],
    });

    expect(result).toContain("Info");
    expect(result).toContain("Hello World");
  });

  it("should render a raw message", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.renderPrint("Hello {0}", ["World"])).toBe("Hello World");
  });

  it("should render a title", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.renderTitle("Section")).toBe("Section");
  });

  it("should render a daily header", () => {
    const renderer = new FileTextRenderer(
      new FileTextOutputOptions({
        dailyHeaderFormatString: "%dailyHeader%",
        dailyHeaderDateFormat: "YYYY-MM-DD",
      }),
    );

    expect(
      renderer.renderDailyHeader(new Date("2026-03-30T10:00:00.000Z")),
    ).toBe("2026-03-30");
  });

  it("should format a timestamp", () => {
    const renderer = new FileTextRenderer(
      new FileTextOutputOptions({
        timestampFormat: "HH:mm:ss",
      }),
    );

    expect(renderer.formatTimestamp(new Date(2026, 2, 30, 10, 20, 30, 0))).toBe(
      "10:20:30",
    );
  });

  it("should format a type using LogType reverse mapping", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.formatType(LogType.Warning)).toBe("Warning");
  });

  it("should keep missing placeholders unchanged", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.formatMessage("Hello {0} {1}", ["World"])).toBe(
      "Hello World {1}",
    );
  });

  it("should stringify strings", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.stringify("hello")).toBe("hello");
  });

  it("should stringify errors", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());
    const error = new Error("failure");

    expect(renderer.stringify(error)).toContain("failure");
  });

  it("should stringify undefined", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.stringify(undefined)).toBe("undefined");
  });

  it("should stringify null", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.stringify(null)).toBe("null");
  });

  it("should stringify primitive values", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.stringify(42)).toBe("42");
    expect(renderer.stringify(true)).toBe("true");
  });

  it("should stringify named functions", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    function namedFunction(): void {
      // Intentionally empty.
    }

    expect(renderer.stringify(namedFunction)).toBe("namedFunction");
  });

  it("should stringify anonymous functions using a fallback value", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());
    const anonymousFunction = (() => {
      return;
    }) as (() => void) & { name: string };

    Object.defineProperty(anonymousFunction, "name", {
      value: "",
      configurable: true,
    });

    expect(renderer.stringify(anonymousFunction)).toBe("[anonymous]");
  });

  it("should stringify dates using ISO format", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.stringify(new Date("2026-03-30T10:00:00.000Z"))).toBe(
      "2026-03-30T10:00:00.000Z",
    );
  });

  it("should stringify objects as JSON", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());

    expect(renderer.stringify({ value: 1 })).toBe('{"value":1}');
  });

  it("should fallback for unserializable objects", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());
    const circular: Record<string, unknown> = {};

    circular.self = circular;

    expect(renderer.stringify(circular)).toBe("[Unserializable Object]");
  });

  it("should stringify errors using message when stack is missing", () => {
    const renderer = new FileTextRenderer(new FileTextOutputOptions());
    const error = new Error("failure");

    Object.defineProperty(error, "stack", {
      value: undefined,
      configurable: true,
    });

    expect(renderer.stringify(error)).toBe("failure");
  });
});
