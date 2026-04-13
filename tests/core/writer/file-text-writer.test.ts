import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { LogType } from "logora";
import { afterEach, describe, expect, it } from "vitest";

import { FileTextOutputOptions } from "../../../src/config";
import { FileTextWriter } from "../../../src/core/writer/file-text-writer";

describe("FileTextWriter", () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should write a structured text log", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        formatString: "[%timestamp%] %type%: %message%",
        timestampFormat: "HH:mm:ss",
        showDateHeader: false,
      }),
    );

    writer.log({
      timestamp: new Date("2026-03-30T10:20:30.000Z"),
      type: LogType.Info,
      message: "Hello {0}",
      args: ["World"],
    });

    await writer.flush();

    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toContain("Info");
    expect(content).toContain("Hello World");
  });

  it("should write a title", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
      }),
    );

    writer.title("Section");
    await writer.flush();

    expect(fs.readFileSync(filePath, "utf8")).toBe("Section\n");
  });

  it("should write empty lines", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
      }),
    );

    writer.empty(2);
    await writer.flush();

    expect(fs.readFileSync(filePath, "utf8")).toBe("\n\n");
  });

  it("should ignore non-positive empty line counts", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
      }),
    );

    writer.empty(0);
    await writer.flush();

    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("should write a print message", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
      }),
    );

    writer.print("Hello {0}", "World");
    await writer.flush();

    expect(fs.readFileSync(filePath, "utf8")).toBe("Hello World\n");
  });

  it("should keep clear as a no-op", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
      }),
    );

    expect(() => writer.clear()).not.toThrow();
  });

  it("should write a daily header only once for the same day", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: true,
        dailyHeaderFormatString: "--- %dailyHeader% ---",
        dailyHeaderDateFormat: "YYYY-MM-DD",
        formatString: "%message%",
      }),
    );

    writer.log({
      timestamp: new Date("2026-03-30T10:00:00.000Z"),
      type: LogType.Info,
      message: "First",
      args: [],
    });

    writer.log({
      timestamp: new Date("2026-03-30T11:00:00.000Z"),
      type: LogType.Info,
      message: "Second",
      args: [],
    });

    await writer.flush();

    const lines = fs.readFileSync(filePath, "utf8").trim().split("\n");

    expect(lines).toEqual(["--- 2026-03-30 ---", "First", "Second"]);
  });

  it("should close the writer pipeline", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const writer = new FileTextWriter(
      new FileTextOutputOptions({
        path: filePath,
        showDateHeader: false,
      }),
    );

    writer.title("Before close");
    await writer.close();

    expect(fs.readFileSync(filePath, "utf8")).toBe("Before close\n");
  });
});
