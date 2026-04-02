import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { RetentionManager } from "../../src/core/retention-manager";

describe("RetentionManager", () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("should do nothing when directory does not exist", () => {
    const filePath = path.join(
      os.tmpdir(),
      `logora-file-${Date.now()}`,
      "app.log",
    );

    expect(() => {
      RetentionManager.apply(filePath, 2, 2);
    }).not.toThrow();
  });

  it("should delete old rotated files by maxFiles", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const activePath = path.join(tempDir, "app.log");

    fs.writeFileSync(path.join(tempDir, "app.1.log"), "1");
    fs.writeFileSync(path.join(tempDir, "app.2.log"), "2");
    fs.writeFileSync(path.join(tempDir, "app.3.log"), "3");

    const now = Date.now();
    fs.utimesSync(
      path.join(tempDir, "app.1.log"),
      now / 1000 - 30,
      now / 1000 - 30,
    );
    fs.utimesSync(
      path.join(tempDir, "app.2.log"),
      now / 1000 - 20,
      now / 1000 - 20,
    );
    fs.utimesSync(
      path.join(tempDir, "app.3.log"),
      now / 1000 - 10,
      now / 1000 - 10,
    );

    RetentionManager.apply(activePath, 2, undefined);

    expect(fs.existsSync(path.join(tempDir, "app.3.log"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "app.2.log"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "app.1.log"))).toBe(false);
  });

  it("should delete old rotated files by maxAgeDays", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const activePath = path.join(tempDir, "app.log");
    const recentFile = path.join(tempDir, "app.recent.log");
    const oldFile = path.join(tempDir, "app.old.log");

    fs.writeFileSync(recentFile, "recent");
    fs.writeFileSync(oldFile, "old");

    const nowSeconds = Date.now() / 1000;
    fs.utimesSync(recentFile, nowSeconds, nowSeconds);
    fs.utimesSync(
      oldFile,
      nowSeconds - 3 * 24 * 60 * 60,
      nowSeconds - 3 * 24 * 60 * 60,
    );

    RetentionManager.apply(activePath, undefined, 1);

    expect(fs.existsSync(recentFile)).toBe(true);
    expect(fs.existsSync(oldFile)).toBe(false);
  });

  it("should ignore unrelated files", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const activePath = path.join(tempDir, "app.log");
    const unrelatedFile = path.join(tempDir, "other.1.log");

    fs.writeFileSync(unrelatedFile, "other");

    RetentionManager.apply(activePath, 1, 1);

    expect(fs.existsSync(unrelatedFile)).toBe(true);
  });

  it("should do nothing when maxFiles is zero", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const activePath = path.join(tempDir, "app.log");

    fs.writeFileSync(path.join(tempDir, "app.1.log"), "1");
    fs.writeFileSync(path.join(tempDir, "app.2.log"), "2");

    RetentionManager.apply(activePath, 0, undefined);

    expect(fs.existsSync(path.join(tempDir, "app.1.log"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "app.2.log"))).toBe(true);
  });

  it("should do nothing when rotated file count is within maxFiles", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const activePath = path.join(tempDir, "app.log");

    fs.writeFileSync(path.join(tempDir, "app.1.log"), "1");
    fs.writeFileSync(path.join(tempDir, "app.2.log"), "2");

    RetentionManager.apply(activePath, 2, undefined);

    expect(fs.existsSync(path.join(tempDir, "app.1.log"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "app.2.log"))).toBe(true);
  });
});
