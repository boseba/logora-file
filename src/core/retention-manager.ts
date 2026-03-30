import * as fs from "node:fs";
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
  public static apply(
    absolutePath: string,
    maxFiles?: number,
    maxAgeDays?: number,
  ): void {
    const resolved = PathResolver.resolve(absolutePath);

    if (!fs.existsSync(resolved.directoryPath)) {
      return;
    }

    const rotatedFiles: string[] = fs
      .readdirSync(resolved.directoryPath)
      .filter((fileName: string) =>
        PathResolver.isRotatedFileName(absolutePath, fileName),
      )
      .map((fileName: string) => path.join(resolved.directoryPath, fileName));

    if (rotatedFiles.length === 0) {
      return;
    }

    const fileStats = rotatedFiles
      .map((filePath: string) => ({
        filePath,
        stats: fs.statSync(filePath),
      }))
      .sort(
        (
          left: { filePath: string; stats: fs.Stats },
          right: { filePath: string; stats: fs.Stats },
        ) => right.stats.mtimeMs - left.stats.mtimeMs,
      );

    this._applyMaxAge(fileStats, maxAgeDays);
    this._applyMaxFiles(fileStats, maxFiles);
  }

  private static _applyMaxAge(
    files: Array<{ filePath: string; stats: fs.Stats }>,
    maxAgeDays?: number,
  ): void {
    if (!maxAgeDays || maxAgeDays <= 0) {
      return;
    }

    const nowMs: number = Date.now();
    const maxAgeMs: number = maxAgeDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const ageMs: number = nowMs - file.stats.mtimeMs;

      if (ageMs > maxAgeMs && fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    }
  }

  private static _applyMaxFiles(
    files: Array<{ filePath: string; stats: fs.Stats }>,
    maxFiles?: number,
  ): void {
    if (!maxFiles || maxFiles <= 0) {
      return;
    }

    const existingFiles = files.filter((file) => fs.existsSync(file.filePath));

    if (existingFiles.length <= maxFiles) {
      return;
    }

    const filesToDelete = existingFiles.slice(maxFiles);

    for (const file of filesToDelete) {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    }
  }
}
