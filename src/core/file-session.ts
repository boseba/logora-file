import * as fs from "node:fs/promises";

import type { FileOutputOptions } from "../config";
import type { FileRotationPolicy } from "../enums";
import { PathResolver } from "./path-resolver";
import type { FileWriteRecord } from "./pipeline/file-write-record.interface";
import type { FileWriteSession } from "./pipeline/file-write-session.interface";
import { RetentionManager } from "./retention-manager";
import { RotationManager } from "./rotation-manager";

/**
 * Manages the active file lifecycle, including initialization,
 * async append, rotation and retention enforcement.
 */
export class FileSession implements FileWriteSession {
  private readonly _absolutePath: string;

  private readonly _policies: FileRotationPolicy[];

  private _initialized: boolean = false;

  private _lastWriteDate: Date | null = null;

  private _activeFileSize: number = 0;

  public constructor(private readonly _options: FileOutputOptions) {
    this._absolutePath = PathResolver.resolve(this._options.path).absolutePath;
    this._policies = RotationManager.normalizePolicies(this._options.rotation);

    if (
      RotationManager.hasPolicy(this._policies, "size") &&
      (!this._options.maxSizeBytes || this._options.maxSizeBytes <= 0)
    ) {
      throw new Error(
        "File size rotation requires a positive maxSizeBytes value.",
      );
    }
  }

  public async appendBatch(records: FileWriteRecord[]): Promise<void> {
    if (records.length === 0) {
      return;
    }

    await this._initialize(records[0].timestamp);

    let pendingChunks: string[] = [];
    let pendingBytes: number = 0;
    let previousWriteDate: Date | null = this._lastWriteDate;

    for (const record of records) {
      const line: string = `${record.content}${this._options.eol}`;
      const lineBytes: number = Buffer.byteLength(line, this._options.encoding);

      const shouldRotateDaily: boolean = RotationManager.shouldRotateOnDaily(
        this._policies,
        previousWriteDate,
        record.timestamp,
      );

      const shouldRotateSize: boolean = RotationManager.shouldRotateOnSize(
        this._policies,
        this._activeFileSize + pendingBytes,
        lineBytes,
        this._options.maxSizeBytes,
      );

      if (shouldRotateDaily || shouldRotateSize) {
        await this._flushPendingChunk(pendingChunks, pendingBytes);

        pendingChunks = [];
        pendingBytes = 0;

        await this._rotate(record.timestamp);
        previousWriteDate = this._lastWriteDate;
      }

      pendingChunks.push(line);
      pendingBytes += lineBytes;
      previousWriteDate = record.timestamp;
    }

    await this._flushPendingChunk(pendingChunks, pendingBytes);
    this._lastWriteDate = records[records.length - 1].timestamp;
  }

  private async _initialize(referenceDate: Date): Promise<void> {
    if (this._initialized) {
      return;
    }

    const resolved = PathResolver.resolve(this._absolutePath);

    if (this._options.mkdir) {
      await fs.mkdir(resolved.directoryPath, { recursive: true });
    }

    const fileExists: boolean = await this._exists(this._absolutePath);

    if (fileExists) {
      const stats = await fs.stat(this._absolutePath);

      if (
        RotationManager.shouldRotateOnStartup(this._policies) &&
        stats.size > 0
      ) {
        this._activeFileSize = stats.size;
        this._lastWriteDate = stats.mtime;

        await this._rotate(referenceDate);
      } else if (!this._options.append) {
        await fs.writeFile(this._absolutePath, "", {
          encoding: this._options.encoding,
        });

        this._activeFileSize = 0;
        this._lastWriteDate = null;
      } else {
        this._activeFileSize = stats.size;
        this._lastWriteDate = stats.size > 0 ? stats.mtime : null;
      }
    } else {
      this._activeFileSize = 0;
      this._lastWriteDate = null;
    }

    this._initialized = true;
  }

  private async _flushPendingChunk(
    pendingChunks: string[],
    pendingBytes: number,
  ): Promise<void> {
    if (pendingChunks.length === 0) {
      return;
    }

    await fs.appendFile(this._absolutePath, pendingChunks.join(""), {
      encoding: this._options.encoding,
    });

    this._activeFileSize += pendingBytes;
  }

  private async _rotate(rotationDate: Date): Promise<void> {
    if (this._activeFileSize <= 0) {
      return;
    }

    if (!(await this._exists(this._absolutePath))) {
      this._activeFileSize = 0;
      return;
    }

    const suffix: string = RotationManager.buildRotationSuffix(rotationDate);
    let rotatedPath: string = PathResolver.buildRotatedPath(
      this._absolutePath,
      suffix,
    );
    let collisionIndex: number = 1;

    while (await this._exists(rotatedPath)) {
      rotatedPath = PathResolver.buildRotatedPath(
        this._absolutePath,
        `${suffix}.${collisionIndex}`,
      );
      collisionIndex++;
    }

    await fs.rename(this._absolutePath, rotatedPath);

    await RetentionManager.apply(
      this._absolutePath,
      this._options.maxFiles,
      this._options.maxAgeDays,
    );

    this._activeFileSize = 0;
    this._lastWriteDate = rotationDate;
  }

  private async _exists(targetPath: string): Promise<boolean> {
    try {
      await fs.stat(targetPath);
      return true;
    } catch (error: unknown) {
      if (this._isNotFoundError(error)) {
        return false;
      }

      throw error;
    }
  }

  private _isNotFoundError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    );
  }
}
