import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { LogType } from "logora";
import { afterEach, describe, expect, it } from "vitest";

import { FileJsonOutputOptions } from "../../../src/config";
import { FileJsonWriter } from "../../../src/core/writer/file-json-writer";

type StructuredLogJson = {
  timestamp: string;
  type: LogType;
  message: string;
  args: unknown[];
  scope: string | null;
};

type TitleJson = {
  kind: "title";
  title: string;
};

type RawJson = {
  kind: "raw";
  message: string;
  args: unknown[];
};

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

describe("FileJsonWriter", () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should write a structured JSON log entry", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.json");

    const writer = new FileJsonWriter(
      new FileJsonOutputOptions({
        path: filePath,
      }),
    );

    writer.log({
      timestamp: new Date("2026-03-30T10:00:00.000Z"),
      type: LogType.Info,
      message: "Hello",
      args: ["World"],
      scope: "HTTP",
    });

    const line = fs.readFileSync(filePath, "utf8").trim();
    const parsed: StructuredLogJson = parseJson<StructuredLogJson>(line);

    expect(parsed.type).toBe(LogType.Info);
    expect(parsed.message).toBe("Hello");
    expect(parsed.args).toEqual(["World"]);
    expect(parsed.scope).toBe("HTTP");
  });

  it("should write a JSON title record", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.json");

    const writer = new FileJsonWriter(
      new FileJsonOutputOptions({
        path: filePath,
      }),
    );

    writer.title("Section");

    const line = fs.readFileSync(filePath, "utf8").trim();
    const parsed: TitleJson = parseJson<TitleJson>(line);

    expect(parsed.kind).toBe("title");
    expect(parsed.title).toBe("Section");
  });

  it("should do nothing for empty", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.json");

    const writer = new FileJsonWriter(
      new FileJsonOutputOptions({
        path: filePath,
      }),
    );

    writer.empty(2);

    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("should not crash when clear is called", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.json");

    const writer = new FileJsonWriter(
      new FileJsonOutputOptions({
        path: filePath,
      }),
    );

    expect(() => writer.clear()).not.toThrow();
  });

  it("should write a JSON raw record", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.json");

    const writer = new FileJsonWriter(
      new FileJsonOutputOptions({
        path: filePath,
      }),
    );

    writer.print("Hello {0}", "World");

    const line = fs.readFileSync(filePath, "utf8").trim();
    const parsed: RawJson = parseJson<RawJson>(line);

    expect(parsed.kind).toBe("raw");
    expect(parsed.message).toBe("Hello {0}");
    expect(parsed.args).toEqual(["World"]);
  });
});
