import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { PathResolver } from "../../src/core/path-resolver";

describe("PathResolver", () => {
  let tempDir: string | null = null;

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    tempDir = null;
  });

  it("should resolve a relative path", () => {
    const result = PathResolver.resolve("./logs/app.log");

    expect(path.isAbsolute(result.absolutePath)).toBe(true);
    expect(result.fileName).toBe("app.log");
    expect(result.fileExtension).toBe(".log");
    expect(result.fileBaseName).toBe("app");
  });

  it("should resolve an absolute path", () => {
    const absolutePath = path.join(process.cwd(), "logs", "app.log");
    const result = PathResolver.resolve(absolutePath);

    expect(result.absolutePath).toBe(path.normalize(absolutePath));
  });

  it("should ensure a directory exists", () => {
    tempDir = path.join(os.tmpdir(), `logora-file-${Date.now()}`, "nested");

    PathResolver.ensureDirectory(tempDir);

    expect(fs.existsSync(tempDir)).toBe(true);
  });

  it("should build a rotated path", () => {
    const filePath = path.join(process.cwd(), "logs", "app.log");
    const rotatedPath = PathResolver.buildRotatedPath(
      filePath,
      "2026-03-30_22-10-00-123",
    );

    expect(
      rotatedPath.endsWith(
        path.join("logs", "app.2026-03-30_22-10-00-123.log"),
      ),
    ).toBe(true);
  });

  it("should detect rotated file names", () => {
    const filePath = path.join(process.cwd(), "logs", "app.log");

    expect(PathResolver.isRotatedFileName(filePath, "app.2026-03-30.log")).toBe(
      true,
    );
    expect(PathResolver.isRotatedFileName(filePath, "app.log")).toBe(false);
    expect(
      PathResolver.isRotatedFileName(filePath, "other.2026-03-30.log"),
    ).toBe(false);
    expect(PathResolver.isRotatedFileName(filePath, "app.2026-03-30.txt")).toBe(
      false,
    );
  });
});
