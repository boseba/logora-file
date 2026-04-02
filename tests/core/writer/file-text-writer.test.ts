import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { LogType } from "logora";
import { afterEach, describe, expect, it } from "vitest";
import { FileTextOutputOptions } from "../../../src";
import { FileTextWriter } from "../../../src/core/writer";

describe("FileTextWriter", () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should write a structured log entry", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
        formatString: "[%timestamp%] %type%: %message%",
        timestampFormat: "HH:mm:ss",
      }),
    );

    writer.log({
      timestamp: new Date("2026-03-30T10:20:30.000Z"),
      type: LogType.Info,
      message: "Hello {0}",
      args: ["World"],
    });

    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toContain("Info");
    expect(content).toContain("Hello World");
  });

  it("should write a title", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
      }),
    );

    writer.title("Section");

    expect(fs.readFileSync(filePath, "utf8")).toBe("Section\n");
  });

  it("should write empty lines", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
      }),
    );

    writer.empty(2);

    expect(fs.readFileSync(filePath, "utf8")).toBe("\n\n");
  });

  it("should not crash when clear is called", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
      }),
    );

    expect(() => writer.clear()).not.toThrow();
  });

  it("should write a raw message", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
      }),
    );

    writer.print("Hello {0}", "World");

    expect(fs.readFileSync(filePath, "utf8")).toBe("Hello World\n");
  });

  it("should write the daily header only once per day", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: true,
        dailyHeaderFormatString: "%dailyHeader%",
        dailyHeaderDateFormat: "YYYY-MM-DD",
      }),
    );

    const timestamp = new Date("2026-03-30T10:00:00.000Z");

    writer.log({
      timestamp,
      type: LogType.Info,
      message: "First",
      args: [],
    });

    writer.log({
      timestamp,
      type: LogType.Info,
      message: "Second",
      args: [],
    });

    const lines = fs.readFileSync(filePath, "utf8").trim().split("\n");

    expect(lines[0]).toBe("2026-03-30");
    expect(lines.filter((line) => line === "2026-03-30")).toHaveLength(1);
  });
});
