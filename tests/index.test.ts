import { describe, expect, it } from "vitest";

import { createFileJsonOutput, createFileTextOutput } from "../src";
import { FileJsonFormatter } from "../src/core/formatter/file-json-formatter";
import { FileTextFormatter } from "../src/core/formatter/file-text-formatter";
import { FileJsonOutput, FileTextOutput } from "../src/core/output";

describe("createFileTextOutput", () => {
  it("should create a FileTextOutput instance", () => {
    const output = createFileTextOutput();

    expect(output).toBeInstanceOf(FileTextOutput);
  });
});

describe("createFileJsonOutput", () => {
  it("should create a FileJsonOutput instance", () => {
    const output = createFileJsonOutput();

    expect(output).toBeInstanceOf(FileJsonOutput);
  });
});

describe("core/formatter index", () => {
  it("should export formatter classes", () => {
    expect(FileTextFormatter).toBeDefined();
    expect(FileJsonFormatter).toBeDefined();
  });
});
