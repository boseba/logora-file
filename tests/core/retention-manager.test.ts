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

  it("should keep only the configured number of rotated files", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const activeFilePath = path.join(tempDir, "app.log");

    fs.writeFileSync(
      path.join(tempDir, "app.2026-03-30_10-00-00-000.log"),
      "a",
    );
    fs.writeFileSync(
      path.join(tempDir, "app.2026-03-30_10-00-00-001.log"),
      "b",
    );
    fs.writeFileSync(
      path.join(tempDir, "app.2026-03-30_10-00-00-002.log"),
      "c",
    );

    await RetentionManager.apply(activeFilePath, 2);

    const files = fs
      .readdirSync(tempDir)
      .filter((fileName: string) => fileName !== "app.log");

    expect(files.length).toBe(2);
  });

  it("should delete rotated files older than the configured max age", async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logora-file-"));
    const activeFilePath = path.join(tempDir, "app.log");
    const rotatedFilePath = path.join(
      tempDir,
      "app.2026-03-30_10-00-00-000.log",
    );

    fs.writeFileSync(rotatedFilePath, "a");

    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    fs.utimesSync(rotatedFilePath, oldDate, oldDate);

    await RetentionManager.apply(activeFilePath, undefined, 1);

    expect(fs.existsSync(rotatedFilePath)).toBe(false);
  });

  it("should do nothing when the directory does not exist", async () => {
    tempDir = path.join(os.tmpdir(), `logora-file-missing-${Date.now()}`);
    const activeFilePath = path.join(tempDir, "app.log");

    await expect(
      RetentionManager.apply(activeFilePath, 1, 1),
    ).resolves.toBeUndefined();
  });
});
