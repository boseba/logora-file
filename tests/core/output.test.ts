import { describe, expect, it } from "vitest";

import { FileJsonOutput, FileTextOutput } from "../../src/core/output";

describe("FileTextOutput", () => {
  it("should create a FileTextOutput instance", () => {
    const output = new FileTextOutput();

    expect(output.name).toBe("file-text");
    expect(output.options).toBeDefined();
    expect(output.writer).toBeDefined();
    expect(output.options.type).toBe("text");
  });
});

describe("FileJsonOutput", () => {
  it("should create a FileJsonOutput instance", () => {
    const output = new FileJsonOutput();

    expect(output.name).toBe("file-json");
    expect(output.options).toBeDefined();
    expect(output.writer).toBeDefined();
    expect(output.options.type).toBe("json");
  });
});
