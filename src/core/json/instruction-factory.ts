import type { LogEntry } from "logora/module";

import type { FileInstructionSerializer } from "../../models/file-instruction-serializer.interface";
import type {
  FileEmptyInstruction,
  FileLogInstruction,
  FilePrintInstruction,
  FileTitleInstruction,
} from "../../models/file-instruction.interface";

/**
 * Creates structured file instructions from Logora writer calls.
 */
export class FileInstructionFactory {
  private readonly _serializer: FileInstructionSerializer;

  /**
   * Creates a new instruction factory instance.
   *
   * @param serializer The serializer used to convert log entries and arguments.
   */
  public constructor(serializer: FileInstructionSerializer) {
    this._serializer = serializer;
  }

  /**
   * Creates a structured log instruction from a Logora entry.
   *
   * @param entry The log entry to convert.
   * @returns A structured log instruction.
   */
  public createLogInstruction(entry: LogEntry): FileLogInstruction {
    return {
      kind: "log",
      entry: this._serializer.serializeLogEntry(entry),
    };
  }

  /**
   * Creates a structured print instruction.
   *
   * @param message The raw print message.
   * @param args The runtime arguments associated with the message.
   * @returns A structured print instruction.
   */
  public createPrintInstruction(
    message: string,
    args: unknown[],
  ): FilePrintInstruction {
    return {
      kind: "print",
      message,
      args: args.map((arg: unknown): string =>
        this._serializer.serializeArg(arg),
      ),
    };
  }

  /**
   * Creates a structured title instruction.
   *
   * @param title The title to emit.
   * @returns A structured title instruction.
   */
  public createTitleInstruction(title: string): FileTitleInstruction {
    return {
      kind: "title",
      title,
    };
  }

  /**
   * Creates a structured empty-line instruction.
   *
   * @param count The requested number of empty lines.
   * @returns A structured empty instruction.
   */
  public createEmptyInstruction(count: number): FileEmptyInstruction {
    return {
      kind: "empty",
      count,
    };
  }
}
