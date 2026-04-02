import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FileTextOutputOptions } from "../../src/config";
import { FileSession } from "../../src/core/file-session";

describe("FileSession", () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should append a line to the active file", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        mkdir: true,
      }),
    );

    session.appendLine("Hello", new Date("2026-03-30T10:00:00.000Z"));

    expect(fs.readFileSync(filePath, "utf8")).toBe("Hello\n");
  });

  it("should append empty lines", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        mkdir: true,
      }),
    );

    session.appendEmptyLines(2);

    expect(fs.readFileSync(filePath, "utf8")).toBe("\n\n");
  });

  it("should not append empty lines when count is zero", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        mkdir: true,
      }),
    );

    session.appendEmptyLines(0);

    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("should return null header day key when append is false", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "Hello\n");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        append: false,
      }),
    );

    const result = session.getInitialHeaderDayKey(new Date());

    expect(result).toBeNull();
  });

  it("should return null header day key when file does not exist", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
      }),
    );

    const result = session.getInitialHeaderDayKey(new Date());

    expect(result).toBeNull();
  });

  it("should return null header day key when file is empty", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
      }),
    );

    const result = session.getInitialHeaderDayKey(new Date());

    expect(result).toBeNull();
  });

  it("should return the current day key when append is enabled and file was modified today", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");
    const referenceDate = new Date("2026-03-30T10:00:00.000Z");

    fs.writeFileSync(filePath, "Hello\n");
    fs.utimesSync(filePath, referenceDate, referenceDate);

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        append: true,
      }),
    );

    const result = session.getInitialHeaderDayKey(referenceDate);

    expect(result).toBe("2026-03-30");
  });

  it("should rotate on startup when enabled", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "Old content\n");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        rotation: ["startup"],
      }),
    );

    session.appendLine("New content", new Date("2026-03-30T10:00:00.000Z"));

    const files = fs.readdirSync(tempDir);

    expect(
      files.some((file) => file.startsWith("app.") && file.endsWith(".log")),
    ).toBe(true);
    expect(fs.readFileSync(filePath, "utf8")).toBe("New content\n");
  });

  it("should truncate the active file when append is false", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "Old content\n");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        append: false,
      }),
    );

    session.appendLine("New content", new Date("2026-03-30T10:00:00.000Z"));

    expect(fs.readFileSync(filePath, "utf8")).toBe("New content\n");
  });

  it("should rotate on size when enabled", () => {
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

    session.appendLine("A", new Date("2026-03-30T10:00:00.000Z"));

    const files = fs.readdirSync(tempDir);

    expect(
      files.some((file) => file.startsWith("app.") && file.endsWith(".log")),
    ).toBe(true);
    expect(fs.readFileSync(filePath, "utf8")).toBe("A\n");
  });

  it("should throw when size rotation is enabled without maxSizeBytes", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    expect(() => {
      new FileSession(
        new FileTextOutputOptions({
          path: filePath,
          rotation: ["size"],
        }),
      );
    }).toThrow("File size rotation requires a positive maxSizeBytes value.");
  });

  it("should return null header day key when file was not modified on the same day", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "Hello\n");

    const fileDate = new Date(2026, 2, 29, 10, 0, 0, 0);
    const referenceDate = new Date(2026, 2, 30, 10, 0, 0, 0);

    fs.utimesSync(filePath, fileDate, fileDate);

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        append: true,
      }),
    );

    const result = session.getInitialHeaderDayKey(referenceDate);

    expect(result).toBeNull();
  });

  it("should not fail when rotating a non-existing file", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        rotation: ["daily"],
      }),
    );

    expect(() => {
      (session as unknown as { _rotate(date: Date): void })._rotate(new Date());
    }).not.toThrow();
  });

  it("should not rotate an empty file", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");

    fs.writeFileSync(filePath, "");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        rotation: ["daily"],
      }),
    );

    expect(() => {
      (session as unknown as { _rotate(date: Date): void })._rotate(new Date());
    }).not.toThrow();

    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should create a unique rotated file name when a collision exists", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const filePath = path.join(tempDir, "app.log");
    const rotationDate = new Date(2026, 2, 30, 10, 0, 0, 0);

    fs.writeFileSync(filePath, "active");

    const session = new FileSession(
      new FileTextOutputOptions({
        path: filePath,
        rotation: ["startup"],
      }),
    );

    const suffix = "2026-03-30_10-00-00-000";
    fs.writeFileSync(path.join(tempDir, `app.${suffix}.log`), "existing");

    expect(() => {
      (session as unknown as { _rotate(date: Date): void })._rotate(
        rotationDate,
      );
    }).not.toThrow();

    const files = fs.readdirSync(tempDir);

    expect(files).toContain(`app.${suffix}.log`);
    expect(files.some((file) => file === `app.${suffix}.1.log`)).toBe(true);
  });
});
