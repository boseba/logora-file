import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FileTextOutputOptions } from "../../src/config";
import { FileSession } from "../../src/core/file-session";
import type { FileWriteRecord } from "../../src/core/pipeline/file-write-record.interface";

describe("FileSession", () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should append a batch to the active file", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        mkdir: true,
      }),
    );

    const records: FileWriteRecord[] = [
      {
        content: "Hello",
        timestamp: new Date("2026-03-30T10:00:00.000Z"),
      },
    ];

    await session.appendBatch(records);

    expect(fs.readFileSync(filePath, "utf8")).toBe("Hello\n");
  });

  it("should append multiple records in order", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        mkdir: true,
      }),
    );

    const records: FileWriteRecord[] = [
      {
        content: "Line 1",
        timestamp: new Date("2026-03-30T10:00:00.000Z"),
      },
      {
        content: "",
        timestamp: new Date("2026-03-30T10:00:01.000Z"),
      },
      {
        content: "Line 2",
        timestamp: new Date("2026-03-30T10:00:02.000Z"),
      },
    ];

    await session.appendBatch(records);

    expect(fs.readFileSync(filePath, "utf8")).toBe("Line 1\n\nLine 2\n");
  });

  it("should do nothing when appending an empty batch", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        mkdir: true,
      }),
    );

    await session.appendBatch([]);

    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("should rotate on startup when enabled", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "Old content\n");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        rotation: ["startup"],
      }),
    );

    const records: FileWriteRecord[] = [
      {
        content: "New content",
        timestamp: new Date("2026-03-30T10:00:00.000Z"),
      },
    ];

    await session.appendBatch(records);

    const files: string[] = fs.readdirSync(tempDir);

    expect(
      files.some(
        (fileName: string) =>
          fileName.startsWith("app.") && fileName.endsWith(".log"),
      ),
    ).toBe(true);
    expect(fs.readFileSync(filePath, "utf8")).toBe("New content\n");
  });

  it("should truncate the active file when append is false", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "Old content\n");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        append: false,
      }),
    );

    const records: FileWriteRecord[] = [
      {
        content: "New content",
        timestamp: new Date("2026-03-30T10:00:00.000Z"),
      },
    ];

    await session.appendBatch(records);

    expect(fs.readFileSync(filePath, "utf8")).toBe("New content\n");
  });

  it("should rotate on size when enabled", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "1234567890");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        rotation: ["size"],
        maxSizeBytes: 10,
      }),
    );

    const records: FileWriteRecord[] = [
      {
        content: "A",
        timestamp: new Date("2026-03-30T10:00:00.000Z"),
      },
    ];

    await session.appendBatch(records);

    const files: string[] = fs.readdirSync(tempDir);

    expect(
      files.some(
        (fileName: string) =>
          fileName.startsWith("app.") && fileName.endsWith(".log"),
      ),
    ).toBe(true);
    expect(fs.readFileSync(filePath, "utf8")).toBe("A\n");
  });

  it("should throw when size rotation is enabled without maxSizeBytes", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    expect(() => {
      return new FileSession(
        new FileTextOutputOptions({
          path: filePath,
          rotation: ["size"],
        }),
      );
    }).toThrow("File size rotation requires a positive maxSizeBytes value.");
  });

  it("should not fail when the target file does not exist", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        rotation: ["daily"],
      }),
    );

    const records: FileWriteRecord[] = [
      {
        content: "Hello",
        timestamp: new Date("2026-03-30T10:00:00.000Z"),
      },
    ];

    await expect(session.appendBatch(records)).resolves.toBeUndefined();
    expect(fs.readFileSync(filePath, "utf8")).toBe("Hello\n");
  });

  it("should not rotate an empty file", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        rotation: ["startup"],
      }),
    );

    const records: FileWriteRecord[] = [
      {
        content: "Hello",
        timestamp: new Date("2026-03-30T10:00:00.000Z"),
      },
    ];

    await session.appendBatch(records);

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, "utf8")).toBe("Hello\n");
  });

  it("should create a unique rotated file name when a collision exists", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");
    const rotationDate = new Date(2026, 2, 30, 10, 0, 0, 0);

    fs.writeFileSync(filePath, "active");

    const suffix = "2026-03-30_10-00-00-000";
    fs.writeFileSync(path.join(tempDir, `app.${suffix}.log`), "existing");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        rotation: ["size"],
        maxSizeBytes: 6,
      }),
    );

    const records: FileWriteRecord[] = [
      {
        content: "next",
        timestamp: rotationDate,
      },
    ];

    await session.appendBatch(records);

    const files: string[] = fs.readdirSync(tempDir);

    expect(files).toContain(`app.${suffix}.log`);
    expect(files).toContain(`app.${suffix}.1.log`);
  });
});
