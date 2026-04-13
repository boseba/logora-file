import * as fs from "node:fs/promises";
import * as path from "node:path";

import { PathResolver } from "./path-resolver";

/**
 * Applies retention policies to rotated log files.
 */
export class RetentionManager {
  /**
   * Deletes rotated files exceeding the configured retention limits.
   *
   * @param absolutePath The active file absolute path.
   * @param maxFiles Maximum number of rotated files to keep.
   * @param maxAgeDays Maximum age in days for rotated files.
   */
  public static async apply(
    absolutePath: string,
    maxFiles?: number,
    maxAgeDays?: number,
  ): Promise<void> {
    const resolved = PathResolver.resolve(absolutePath);

    if (!(await this._exists(resolved.directoryPath))) {
      return;
    }

    const directoryEntries: string[] = await fs.readdir(resolved.directoryPath);
    const rotatedFiles: string[] = directoryEntries
      .filter((fileName: string) =>
        PathResolver.isRotatedFileName(absolutePath, fileName),
      )
      .map((fileName: string) => path.join(resolved.directoryPath, fileName));

    if (rotatedFiles.length === 0) {
      return;
    }

    const fileStats = await Promise.all(
      rotatedFiles.map(async (filePath: string) => ({
        filePath,
        stats: await fs.stat(filePath),
      })),
    );

    fileStats.sort(
      (
        left: { filePath: string; stats: { mtimeMs: number } },
        right: { filePath: string; stats: { mtimeMs: number } },
      ) => right.stats.mtimeMs - left.stats.mtimeMs,
    );

    await this._applyMaxAge(fileStats, maxAgeDays);
    await this._applyMaxFiles(fileStats, maxFiles);
  }

  private static async _applyMaxAge(
    files: Array<{ filePath: string; stats: { mtimeMs: number } }>,
    maxAgeDays?: number,
  ): Promise<void> {
    if (!maxAgeDays || maxAgeDays <= 0) {
      return;
    }

    const nowMs: number = Date.now();
    const maxAgeMs: number = maxAgeDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const ageMs: number = nowMs - file.stats.mtimeMs;

      if (ageMs > maxAgeMs && (await this._exists(file.filePath))) {
        await fs.unlink(file.filePath);
      }
    }
  }

  private static async _applyMaxFiles(
    files: Array<{ filePath: string; stats: { mtimeMs: number } }>,
    maxFiles?: number,
  ): Promise<void> {
    if (!maxFiles || maxFiles <= 0) {
      return;
    }

    const existingFiles: Array<{
      filePath: string;
      stats: { mtimeMs: number };
    }> = [];

    for (const file of files) {
      if (await this._exists(file.filePath)) {
        existingFiles.push(file);
      }
    }

    if (existingFiles.length <= maxFiles) {
      return;
    }

    const filesToDelete = existingFiles.slice(maxFiles);

    for (const file of filesToDelete) {
      if (await this._exists(file.filePath)) {
        await fs.unlink(file.filePath);
      }
    }
  }

  private static async _exists(targetPath: string): Promise<boolean> {
    try {
      await fs.stat(targetPath);
      return true;
    } catch (error: unknown) {
      return typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code !== undefined &&
        (error as { code?: string }).code !== "EACCES"
        ? (error as { code?: string }).code !== "ENOENT"
        : false;
    }
  }
}
