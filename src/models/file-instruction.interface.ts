import type { SerializedLogEntry } from "./serialized-log-entry.interface";

/**
 * Represents a structured log instruction.
 */
export interface FileLogInstruction {
  /**
   * The instruction discriminator.
   */
  kind: "log";

  /**
   * The serialized log entry.
   */
  entry: SerializedLogEntry;
}

/**
 * Represents a structured print instruction.
 */
export interface FilePrintInstruction {
  /**
   * The instruction discriminator.
   */
  kind: "print";

  /**
   * The raw message.
   */
  message: string;

  /**
   * The serialized print arguments.
   */
  args: string[];
}

/**
 * Represents a structured title instruction.
 */
export interface FileTitleInstruction {
  /**
   * The instruction discriminator.
   */
  kind: "title";

  /**
   * The title content.
   */
  title: string;
}

/**
 * Represents a structured empty-line instruction.
 */
export interface FileEmptyInstruction {
  /**
   * The instruction discriminator.
   */
  kind: "empty";

  /**
   * The number of empty lines requested.
   */
  count: number;
}

/**
 * Represents every instruction that can be written by the JSON file output.
 */
export type FileInstruction =
  | FileLogInstruction
  | FilePrintInstruction
  | FileTitleInstruction
  | FileEmptyInstruction;
