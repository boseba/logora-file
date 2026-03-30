import * as fs from "node:fs";
import * as path from "node:path";

export type ResolvedFilePath = {
  absolutePath: string;
  directoryPath: string;
  fileName: string;
  fileExtension: string;
  fileBaseName: string;
};

/**
 * Resolves and normalizes file-system paths for file outputs.
 */
export class PathResolver {
  /**
   * Resolves a destination file path.
   *
   * Relative paths are resolved from process.cwd().
   *
   * @param targetPath The configured output path.
   * @returns The resolved file path metadata.
   */
  public static resolve(targetPath: string): ResolvedFilePath {
    const normalizedInput: string = targetPath.trim();
    const absolutePath: string = path.isAbsolute(normalizedInput)
      ? path.normalize(normalizedInput)
      : path.resolve(process.cwd(), normalizedInput);

    const directoryPath: string = path.dirname(absolutePath);
    const fileName: string = path.basename(absolutePath);
    const fileExtension: string = path.extname(fileName);
    const fileBaseName: string = path.basename(fileName, fileExtension);

    return {
      absolutePath,
      directoryPath,
      fileName,
      fileExtension,
      fileBaseName,
    };
  }

  /**
   * Ensures that the parent directory exists.
   *
   * @param directoryPath The directory to create if missing.
   */
  public static ensureDirectory(directoryPath: string): void {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  /**
   * Builds a rotated file path using a timestamp suffix.
   *
   * Example:
   * app.log -> app.2026-03-30_22-10-00-123.log
   *
   * @param absolutePath The active file absolute path.
   * @param suffix The suffix to append before the file extension.
   * @returns The rotated file path.
   */
  public static buildRotatedPath(absolutePath: string, suffix: string): string {
    const resolved: ResolvedFilePath = this.resolve(absolutePath);

    return path.join(
      resolved.directoryPath,
      `${resolved.fileBaseName}.${suffix}${resolved.fileExtension}`,
    );
  }

  /**
   * Determines whether a file name belongs to the rotated files of
   * the provided active file path.
   *
   * @param absolutePath The active file absolute path.
   * @param candidateFileName The file name to test.
   * @returns True when the file belongs to the rotated set.
   */
  public static isRotatedFileName(
    absolutePath: string,
    candidateFileName: string,
  ): boolean {
    const resolved: ResolvedFilePath = this.resolve(absolutePath);
    const expectedPrefix: string = `${resolved.fileBaseName}.`;
    const expectedSuffix: string = resolved.fileExtension;

    if (!candidateFileName.startsWith(expectedPrefix)) {
      return false;
    }

    if (!candidateFileName.endsWith(expectedSuffix)) {
      return false;
    }

    const middle: string = candidateFileName.slice(
      expectedPrefix.length,
      candidateFileName.length - expectedSuffix.length,
    );

    return middle.length > 0;
  }
}
