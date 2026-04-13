import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { LogType } from "logora";
import { afterEach, describe, expect, it } from "vitest";

import { FileJsonOutputOptions } from "../../../src/config";
import { FileJsonWriter } from "../../../src/core/writer/file-json-writer";
import type { FileInstruction } from "../../../src/models/file-instruction.interface";

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

  it("should write a structured log instruction", async () => {
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

    await writer.flush();

    const line = fs.readFileSync(filePath, "utf8").trim();
    const parsed: FileInstruction = parseJson<FileInstruction>(line);

    expect(parsed).toEqual({
      kind: "log",
      entry: {
        timestamp: "2026-03-30T10:00:00.000Z",
        type: LogType.Info,
        typeName: "Info",
        message: "Hello",
        args: ["World"],
        scope: "HTTP",
      },
    });
  });

  it("should write a title instruction", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.json");

    const writer = new FileJsonWriter(
      new FileJsonOutputOptions({
        path: filePath,
      }),
    );

    writer.title("Section");
    await writer.flush();

    const line = fs.readFileSync(filePath, "utf8").trim();
    const parsed: FileInstruction = parseJson<FileInstruction>(line);

    expect(parsed).toEqual({
      kind: "title",
      title: "Section",
    });
  });

  it("should write an empty instruction", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.json");

    const writer = new FileJsonWriter(
      new FileJsonOutputOptions({
        path: filePath,
      }),
    );

    writer.empty(2);
    await writer.flush();

    const line = fs.readFileSync(filePath, "utf8").trim();
    const parsed: FileInstruction = parseJson<FileInstruction>(line);

    expect(parsed).toEqual({
      kind: "empty",
      count: 2,
    });
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

  it("should write a print instruction", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.json");

    const writer = new FileJsonWriter(
      new FileJsonOutputOptions({
        path: filePath,
      }),
    );

    writer.print("Hello {0}", "World");
    await writer.flush();

    const line = fs.readFileSync(filePath, "utf8").trim();
    const parsed: FileInstruction = parseJson<FileInstruction>(line);

    expect(parsed).toEqual({
      kind: "print",
      message: "Hello {0}",
      args: ["World"],
    });
  });

  it("should flush pending records when close is called", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.json");

    const writer = new FileJsonWriter(
      new FileJsonOutputOptions({
        path: filePath,
      }),
    );

    writer.title("Before close");
    await writer.close();

    const line = fs.readFileSync(filePath, "utf8").trim();
    const parsed: FileInstruction = parseJson<FileInstruction>(line);

    expect(parsed).toEqual({
      kind: "title",
      title: "Before close",
    });
  });
});
