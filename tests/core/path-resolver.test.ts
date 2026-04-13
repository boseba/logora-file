import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { PathResolver } from "../../src/core/path-resolver";

describe("PathResolver", () => {
  it("should resolve a relative file path", () => {
    const result = PathResolver.resolve("./logs/app.log");

    expect(result.absolutePath).toBe(
      path.resolve(process.cwd(), "./logs/app.log"),
    );
    expect(result.directoryPath).toBe(path.dirname(result.absolutePath));
    expect(result.fileName).toBe("app.log");
    expect(result.fileExtension).toBe(".log");
    expect(result.fileBaseName).toBe("app");
  });

  it("should build a rotated file path", () => {
    const absolutePath = path.join(process.cwd(), "logs", "app.log");

    const result = PathResolver.buildRotatedPath(
      absolutePath,
      "2026-03-30_10-00-00-000",
    );

    expect(result).toBe(
      path.join(process.cwd(), "logs", "app.2026-03-30_10-00-00-000.log"),
    );
  });

  it("should detect rotated file names", () => {
    const absolutePath = path.join(process.cwd(), "logs", "app.log");

    expect(
      PathResolver.isRotatedFileName(
        absolutePath,
        "app.2026-03-30_10-00-00-000.log",
      ),
    ).toBe(true);
  });

  it("should reject non-rotated file names", () => {
    const absolutePath = path.join(process.cwd(), "logs", "app.log");

    expect(PathResolver.isRotatedFileName(absolutePath, "app.log")).toBe(false);
    expect(
      PathResolver.isRotatedFileName(absolutePath, "other.2026-03-30.log"),
    ).toBe(false);
  });
});
