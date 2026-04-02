import type { FileJsonOutputOptions, FileTextOutputOptions } from "./config";
import { FileJsonOutput, FileTextOutput } from "./core/output";

export * from "./config";
export * from "./enums";

/**
 * Creates a new text file output transport for Logora.
 *
 * @param config Optional partial configuration to customize text file output behavior.
 * @returns A fully initialized FileTextOutput instance ready to use with Logora.
 */
export function createFileTextOutput(
  config?: Partial<FileTextOutputOptions>,
): FileTextOutput {
  return new FileTextOutput(config);
}

/**
 * Creates a new JSON file output transport for Logora.
 *
 * The JSON output uses a JSON Lines style: one JSON object per line.
 *
 * @param config Optional partial configuration to customize JSON file output behavior.
 * @returns A fully initialized FileJsonOutput instance ready to use with Logora.
 */
export function createFileJsonOutput(
  config?: Partial<FileJsonOutputOptions>,
): FileJsonOutput {
  return new FileJsonOutput(config);
}
