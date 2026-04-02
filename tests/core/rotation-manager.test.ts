import { describe, expect, it } from "vitest";

import type { FileRotationPolicy } from "../../src";
import { RotationManager } from "../../src/core/rotation-manager";

describe("RotationManager", () => {
  it("should normalize rotation policies", () => {
    const result = RotationManager.normalizePolicies([
      "daily",
      "size",
      "daily",
      "startup",
    ]);

    expect(result).toEqual(["daily", "size", "startup"]);
  });

  it("should return an empty array when no policies are defined", () => {
    expect(RotationManager.normalizePolicies()).toEqual([]);
    expect(RotationManager.normalizePolicies([])).toEqual([]);
  });

  it("should detect enabled policies", () => {
    const policies: FileRotationPolicy[] = ["daily", "size"];

    expect(RotationManager.hasPolicy(policies, "daily")).toBe(true);
    expect(RotationManager.hasPolicy(policies, "startup")).toBe(false);
  });

  it("should detect startup rotation", () => {
    expect(RotationManager.shouldRotateOnStartup(["startup"])).toBe(true);
    expect(RotationManager.shouldRotateOnStartup(["daily"])).toBe(false);
  });

  it("should detect daily rotation when day changes", () => {
    const previousDate = new Date("2026-03-30T10:00:00.000Z");
    const currentDate = new Date("2026-03-31T10:00:00.000Z");

    expect(
      RotationManager.shouldRotateOnDaily(["daily"], previousDate, currentDate),
    ).toBe(true);
  });

  it("should not rotate daily when policy is disabled", () => {
    const previousDate = new Date("2026-03-30T10:00:00.000Z");
    const currentDate = new Date("2026-03-31T10:00:00.000Z");

    expect(
      RotationManager.shouldRotateOnDaily(["size"], previousDate, currentDate),
    ).toBe(false);
  });

  it("should not rotate daily without previous date", () => {
    const currentDate = new Date("2026-03-31T10:00:00.000Z");

    expect(
      RotationManager.shouldRotateOnDaily(["daily"], null, currentDate),
    ).toBe(false);
  });

  it("should detect size rotation", () => {
    expect(RotationManager.shouldRotateOnSize(["size"], 100, 50, 120)).toBe(
      true,
    );
  });

  it("should not rotate on size when policy is disabled", () => {
    expect(RotationManager.shouldRotateOnSize(["daily"], 100, 50, 120)).toBe(
      false,
    );
  });

  it("should not rotate on size when maxSizeBytes is invalid", () => {
    expect(
      RotationManager.shouldRotateOnSize(["size"], 100, 50, undefined),
    ).toBe(false);

    expect(RotationManager.shouldRotateOnSize(["size"], 100, 50, 0)).toBe(
      false,
    );
  });

  it("should not rotate on size when the file is empty", () => {
    expect(RotationManager.shouldRotateOnSize(["size"], 0, 50, 10)).toBe(false);
  });

  it("should build a rotation suffix", () => {
    const result = RotationManager.buildRotationSuffix(
      new Date("2026-03-30T22:10:00.123Z"),
    );

    expect(result).toBeTypeOf("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should build a day key", () => {
    const result = RotationManager.getDayKey(
      new Date(2026, 2, 30, 22, 10, 0, 123),
    );

    expect(result).toBe("2026-03-30");
  });
});
