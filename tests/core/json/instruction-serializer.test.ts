import { LogType } from "logora";
import { describe, expect, it } from "vitest";

import { DefaultFileInstructionSerializer } from "../../../src/core/json/instruction-serializer";

describe("DefaultFileInstructionSerializer", () => {
  it("should serialize a log entry", () => {
    const serializer = new DefaultFileInstructionSerializer();

    const result = serializer.serializeLogEntry({
      timestamp: new Date("2026-03-30T10:00:00.000Z"),
      type: LogType.Info,
      message: "Hello",
      args: ["World"],
      scope: "HTTP",
    });

    expect(result).toEqual({
      timestamp: "2026-03-30T10:00:00.000Z",
      type: LogType.Info,
      typeName: "Info",
      message: "Hello",
      args: ["World"],
      scope: "HTTP",
    });
  });

  it("should serialize an error using its stack", () => {
    const serializer = new DefaultFileInstructionSerializer();
    const error = new Error("failure");

    expect(serializer.serializeArg(error)).toContain("failure");
  });

  it("should serialize a string as-is", () => {
    const serializer = new DefaultFileInstructionSerializer();

    expect(serializer.serializeArg("hello")).toBe("hello");
  });

  it("should serialize primitive values using String", () => {
    const serializer = new DefaultFileInstructionSerializer();

    expect(serializer.serializeArg(42)).toBe("42");
    expect(serializer.serializeArg(true)).toBe("true");
    expect(serializer.serializeArg(10n)).toBe("10");
    expect(serializer.serializeArg(Symbol.for("test"))).toBe("Symbol(test)");
  });

  it("should serialize a function using its name", () => {
    const serializer = new DefaultFileInstructionSerializer();

    function namedFunction(): void {
      // Intentionally empty.
    }

    expect(serializer.serializeArg(namedFunction)).toBe("namedFunction");
  });

  it("should serialize an anonymous function using a fallback value", () => {
    const serializer = new DefaultFileInstructionSerializer();
    const anonymousFunction = (() => {
      return;
    }) as (() => void) & { name: string };

    Object.defineProperty(anonymousFunction, "name", {
      value: "",
      configurable: true,
    });

    expect(serializer.serializeArg(anonymousFunction)).toBe("[anonymous]");
  });

  it("should serialize undefined", () => {
    const serializer = new DefaultFileInstructionSerializer();

    expect(serializer.serializeArg(undefined)).toBe("undefined");
  });

  it("should serialize null", () => {
    const serializer = new DefaultFileInstructionSerializer();

    expect(serializer.serializeArg(null)).toBe("null");
  });

  it("should serialize dates using ISO format", () => {
    const serializer = new DefaultFileInstructionSerializer();

    expect(serializer.serializeArg(new Date("2026-03-30T10:00:00.000Z"))).toBe(
      "2026-03-30T10:00:00.000Z",
    );
  });

  it("should serialize objects as JSON strings", () => {
    const serializer = new DefaultFileInstructionSerializer();

    expect(serializer.serializeArg({ value: 1 })).toBe('{"value":1}');
  });

  it("should fallback for unserializable objects", () => {
    const serializer = new DefaultFileInstructionSerializer();
    const circular: Record<string, unknown> = {};

    circular.self = circular;

    expect(serializer.serializeArg(circular)).toBe("[Unserializable Object]");
  });
});
