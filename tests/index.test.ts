import { describe, expect, it } from "vitest";

import { createFileJsonOutput, createFileTextOutput } from "../src/index";

describe("index exports", () => {
  it("should create a text output through the public factory", () => {
    const output = createFileTextOutput({
      path: "./logs/app.log",
    });

    expect(output.name).toBe("file-text");
  });

  it("should create a JSON output through the public factory", () => {
    const output = createFileJsonOutput({
      path: "./logs/app.jsonl",
    });

    expect(output.name).toBe("file-json");
  });
});
