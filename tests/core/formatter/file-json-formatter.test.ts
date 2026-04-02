import { LogType } from "logora";
import { describe, expect, it } from "vitest";

import { FileJsonFormatter } from "../../../src/core/formatter/file-json-formatter";

type StructuredLogJson = {
  timestamp: string;
  type: LogType;
  message: string;
  args: unknown[];
  scope: string | null;
};

type RawPrintJson = {
  kind: "raw";
  message: string;
  args: unknown[];
};

type TitleJson = {
  kind: "title";
  title: string;
};

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

describe("FileJsonFormatter", () => {
  it("should format a structured log entry as JSON", () => {
    const formatter = new FileJsonFormatter();

    const result = formatter.formatLog({
      timestamp: new Date("2026-03-30T10:00:00.000Z"),
      type: LogType.Info,
      message: "Hello",
      args: ["World"],
      scope: "HTTP",
    });

    const parsed: StructuredLogJson = parseJson<StructuredLogJson>(result);

    expect(parsed.timestamp).toBe("2026-03-30T10:00:00.000Z");
    expect(parsed.type).toBe(LogType.Info);
    expect(parsed.message).toBe("Hello");
    expect(parsed.args).toEqual(["World"]);
    expect(parsed.scope).toBe("HTTP");
  });

  it("should format a structured log entry without scope", () => {
    const formatter = new FileJsonFormatter();

    const result = formatter.formatLog({
      timestamp: new Date("2026-03-30T10:00:00.000Z"),
      type: LogType.Info,
      message: "Hello",
      args: [],
    });

    const parsed: StructuredLogJson = parseJson<StructuredLogJson>(result);

    expect(parsed.scope).toBeNull();
  });

  it("should format a raw print entry as JSON", () => {
    const formatter = new FileJsonFormatter();

    const result = formatter.formatPrint(
      "Hello",
      ["World"],
      new Date("2026-03-30T10:00:00.000Z"),
    );

    const parsed: RawPrintJson = parseJson<RawPrintJson>(result);

    expect(parsed.kind).toBe("raw");
    expect(parsed.message).toBe("Hello");
    expect(parsed.args).toEqual(["World"]);
  });

  it("should format a title entry as JSON", () => {
    const formatter = new FileJsonFormatter();

    const result = formatter.formatTitle(
      "Section",
      new Date("2026-03-30T10:00:00.000Z"),
    );

    const parsed: TitleJson = parseJson<TitleJson>(result);

    expect(parsed.kind).toBe("title");
    expect(parsed.title).toBe("Section");
  });
});
