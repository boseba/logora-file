import * as fs from "node:fs";

import type { FileOutputOptions } from "../config";
import type { FileRotationPolicy } from "../enums";
import { PathResolver } from "./path-resolver";
import { RetentionManager } from "./retention-manager";
import { RotationManager } from "./rotation-manager";

/**
 * Manages the active file lifecycle, including initialization,
 * rotation and retention enforcement.
 */
export class FileSession {
  private readonly _absolutePath: string;

  private readonly _policies: FileRotationPolicy[];

  private _initialized: boolean = false;

  private _lastWriteDate: Date | null = null;

  constructor(private readonly _options: FileOutputOptions) {
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

  /**
   * Returns the active file absolute path.
   *
   * @returns The active file absolute path.
   */
  public get absolutePath(): string {
    return this._absolutePath;
  }

  /**
   * Returns the initial day key to use for daily header tracking.
   *
   * When appending to an existing file that was already written today,
   * this prevents writing a duplicate header at startup.
   *
   * @param referenceDate The current reference date.
   * @returns A day key or null.
   */
  public getInitialHeaderDayKey(referenceDate: Date): string | null {
    if (!this._options.append) {
      return null;
    }

    if (!fs.existsSync(this._absolutePath)) {
      return null;
    }

    const stats: fs.Stats = fs.statSync(this._absolutePath);

    if (stats.size <= 0) {
      return null;
    }

    const fileDayKey: string = RotationManager.getDayKey(stats.mtime);
    const referenceDayKey: string = RotationManager.getDayKey(referenceDate);

    return fileDayKey === referenceDayKey ? fileDayKey : null;
  }

  /**
   * Appends a single line to the active file.
   *
   * @param content The content to write, without end-of-line.
   * @param writeDate The associated write date.
   */
  public appendLine(content: string, writeDate: Date): void {
    this._initialize(writeDate);

    const record: string = `${content}${this._options.eol}`;
    const recordSize: number = Buffer.byteLength(
      record,
      this._options.encoding,
    );

    this._rotateIfNeeded(writeDate, recordSize);

    fs.appendFileSync(this._absolutePath, record, {
      encoding: this._options.encoding,
    });

    this._lastWriteDate = writeDate;
  }

  /**
   * Appends multiple empty lines to the active file.
   *
   * @param count The number of empty lines to append.
   */
  public appendEmptyLines(count: number): void {
    if (count <= 0) {
      return;
    }

    const writeDate: Date = new Date();

    this._initialize(writeDate);

    const content: string = this._options.eol.repeat(count);

    this._rotateIfNeeded(
      writeDate,
      Buffer.byteLength(content, this._options.encoding),
    );

    fs.appendFileSync(this._absolutePath, content, {
      encoding: this._options.encoding,
    });

    this._lastWriteDate = writeDate;
  }

  private _initialize(referenceDate: Date): void {
    if (this._initialized) {
      return;
    }

    const resolved = PathResolver.resolve(this._absolutePath);

    if (this._options.mkdir) {
      PathResolver.ensureDirectory(resolved.directoryPath);
    }

    const fileExists: boolean = fs.existsSync(this._absolutePath);

    if (
      fileExists &&
      RotationManager.shouldRotateOnStartup(this._policies) &&
      fs.statSync(this._absolutePath).size > 0
    ) {
      this._rotate(referenceDate);
    } else if (fileExists && !this._options.append) {
      fs.writeFileSync(this._absolutePath, "", {
        encoding: this._options.encoding,
      });
    }

    if (fs.existsSync(this._absolutePath)) {
      this._lastWriteDate = fs.statSync(this._absolutePath).mtime;
    } else {
      this._lastWriteDate = referenceDate;
    }

    this._initialized = true;
  }

  private _rotateIfNeeded(writeDate: Date, incomingBytes: number): void {
    const currentFileSize: number = fs.existsSync(this._absolutePath)
      ? fs.statSync(this._absolutePath).size
      : 0;

    const shouldRotateDaily: boolean = RotationManager.shouldRotateOnDaily(
      this._policies,
      this._lastWriteDate,
      writeDate,
    );

    const shouldRotateSize: boolean = RotationManager.shouldRotateOnSize(
      this._policies,
      currentFileSize,
      incomingBytes,
      this._options.maxSizeBytes,
    );

    if (shouldRotateDaily || shouldRotateSize) {
      this._rotate(writeDate);
    }
  }

  private _rotate(rotationDate: Date): void {
    if (!fs.existsSync(this._absolutePath)) {
      return;
    }

    const stats: fs.Stats = fs.statSync(this._absolutePath);

    if (stats.size <= 0) {
      return;
    }

    const suffix: string = RotationManager.buildRotationSuffix(rotationDate);
    let rotatedPath: string = PathResolver.buildRotatedPath(
      this._absolutePath,
      suffix,
    );
    let collisionIndex: number = 1;

    while (fs.existsSync(rotatedPath)) {
      rotatedPath = PathResolver.buildRotatedPath(
        this._absolutePath,
        `${suffix}.${collisionIndex}`,
      );
      collisionIndex++;
    }

    fs.renameSync(this._absolutePath, rotatedPath);

    RetentionManager.apply(
      this._absolutePath,
      this._options.maxFiles,
      this._options.maxAgeDays,
    );

    this._lastWriteDate = rotationDate;
  }
}
