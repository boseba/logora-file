import { describe, expect, it } from "vitest";

import { TemplateEngine } from "../../src/core/template-engine";
import { Placeholder } from "../../src/enums";

describe("TemplateEngine", () => {
  it("should replace placeholders", () => {
    const result = TemplateEngine.render(
      "[%timestamp%] %type%: %message%",
      TemplateEngine.createValueMap("12:00:00", "HTTP", "Info", "Hello", ""),
    );

    expect(result).toBe("[12:00:00] Info: Hello");
  });

  it("should keep optional blocks when values are present", () => {
    const result = TemplateEngine.render(
      "{[%scope%] }%message%",
      TemplateEngine.createValueMap("", "HTTP", "", "Hello", ""),
    );

    expect(result).toBe("[HTTP] Hello");
  });

  it("should remove optional blocks when values are missing", () => {
    const result = TemplateEngine.render(
      "{[%scope%] }%message%",
      TemplateEngine.createValueMap("", "", "", "Hello", ""),
    );

    expect(result).toBe("Hello");
  });

  it("should keep static optional block content without placeholders", () => {
    const result = TemplateEngine.render(
      "{static }%message%",
      TemplateEngine.createValueMap("", "", "", "Hello", ""),
    );

    expect(result).toBe("static Hello");
  });

  it("should return empty string for unknown placeholders", () => {
    const result = TemplateEngine.render(
      "%unknown% %message%",
      TemplateEngine.createValueMap("", "", "", "Hello", ""),
    );

    expect(result).toBe(" Hello");
  });

  it("should create a valid placeholder value map", () => {
    const result = TemplateEngine.createValueMap(
      "12:00:00",
      "Scope",
      "Info",
      "Message",
      "Header",
    );

    expect(result[Placeholder.Timestamp]).toBe("12:00:00");
    expect(result[Placeholder.Scope]).toBe("Scope");
    expect(result[Placeholder.Type]).toBe("Info");
    expect(result[Placeholder.Message]).toBe("Message");
    expect(result[Placeholder.DailyHeader]).toBe("Header");
  });
});
