import { LogType } from "logora";
import { describe, expect, it, vi } from "vitest";

import { FileInstructionFactory } from "../../../src/core/json/instruction-factory";
import type { FileInstructionSerializer } from "../../../src/models/file-instruction-serializer.interface";

describe("FileInstructionFactory", () => {
  it("should create a log instruction", () => {
    const serializer: FileInstructionSerializer = {
      serializeLogEntry: vi.fn().mockReturnValue({
        timestamp: "2026-03-30T10:00:00.000Z",
        type: LogType.Info,
        typeName: "Info",
        message: "Hello",
        args: ["World"],
        scope: "HTTP",
      }),
      serializeArg: vi.fn(),
    };

    const factory = new FileInstructionFactory(serializer);

    const result = factory.createLogInstruction({
      timestamp: new Date("2026-03-30T10:00:00.000Z"),
      type: LogType.Info,
      message: "Hello",
      args: ["World"],
      scope: "HTTP",
    });

    expect(result).toEqual({
      kind: "log",
      entry: {
        timestamp: "2026-03-30T10:00:00.000Z",
        type: LogType.Info,
        typeName: "Info",
        message: "Hello",
        args: ["World"],
        scope: "HTTP",
      },
    });
  });

  it("should create a print instruction and serialize each argument", () => {
    const serializeArg = vi
      .fn<(value: unknown) => string>()
      .mockImplementation((value: unknown) => String(value));

    const serializer: FileInstructionSerializer = {
      serializeLogEntry: vi.fn(),
      serializeArg,
    };

    const factory = new FileInstructionFactory(serializer);

    const result = factory.createPrintInstruction("Hello", ["World", 42]);

    expect(result).toEqual({
      kind: "print",
      message: "Hello",
      args: ["World", "42"],
    });
    expect(serializeArg).toHaveBeenCalledTimes(2);
  });

  it("should create a title instruction", () => {
    const serializer: FileInstructionSerializer = {
      serializeLogEntry: vi.fn(),
      serializeArg: vi.fn(),
    };

    const factory = new FileInstructionFactory(serializer);

    expect(factory.createTitleInstruction("Section")).toEqual({
      kind: "title",
      title: "Section",
    });
  });

  it("should create an empty instruction", () => {
    const serializer: FileInstructionSerializer = {
      serializeLogEntry: vi.fn(),
      serializeArg: vi.fn(),
    };

    const factory = new FileInstructionFactory(serializer);

    expect(factory.createEmptyInstruction(3)).toEqual({
      kind: "empty",
      count: 3,
    });
  });
});
