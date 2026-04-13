import { describe, expect, it } from "vitest";

import { FileJsonOutputOptions, FileTextOutputOptions } from "../../src/config";
import { FileJsonOutput, FileTextOutput } from "../../src/core/output";

describe("File outputs", () => {
  it("should create a FileTextOutput", () => {
    const output = new FileTextOutput(
      new FileTextOutputOptions({
        path: "./logs/app.log",
      }),
    );

    expect(output.name).toBe("file-text");
    expect(output.options).toBeInstanceOf(FileTextOutputOptions);
    expect(typeof output.writer.log).toBe("function");
  });

  it("should create a FileJsonOutput", () => {
    const output = new FileJsonOutput(
      new FileJsonOutputOptions({
        path: "./logs/app.jsonl",
      }),
    );

    expect(output.name).toBe("file-json");
    expect(output.options).toBeInstanceOf(FileJsonOutputOptions);
    expect(typeof output.writer.log).toBe("function");
  });
});
