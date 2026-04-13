import { describe, expect, it } from "vitest";

import { RotationManager } from "../../src/core/rotation-manager";

describe("RotationManager", () => {
  it("should normalize policies and remove duplicates", () => {
    expect(
      RotationManager.normalizePolicies(["daily", "size", "daily"]),
    ).toEqual(["daily", "size"]);
  });

  it("should return an empty array when policies are missing", () => {
    expect(RotationManager.normalizePolicies()).toEqual([]);
  });

  it("should detect enabled policies", () => {
    expect(RotationManager.hasPolicy(["daily", "size"], "size")).toBe(true);
    expect(RotationManager.hasPolicy(["daily"], "startup")).toBe(false);
  });

  it("should detect startup rotation", () => {
    expect(RotationManager.shouldRotateOnStartup(["startup"])).toBe(true);
    expect(RotationManager.shouldRotateOnStartup(["daily"])).toBe(false);
  });

  it("should detect daily rotation only when the day changed", () => {
    expect(
      RotationManager.shouldRotateOnDaily(
        ["daily"],
        new Date(2026, 2, 29, 23, 59, 59, 0),
        new Date(2026, 2, 30, 0, 0, 0, 0),
      ),
    ).toBe(true);

    expect(
      RotationManager.shouldRotateOnDaily(
        ["daily"],
        new Date(2026, 2, 30, 10, 0, 0, 0),
        new Date(2026, 2, 30, 11, 0, 0, 0),
      ),
    ).toBe(false);
  });

  it("should not rotate daily when there is no previous date", () => {
    expect(
      RotationManager.shouldRotateOnDaily(
        ["daily"],
        null,
        new Date(2026, 2, 30, 10, 0, 0, 0),
      ),
    ).toBe(false);
  });

  it("should detect size rotation", () => {
    expect(RotationManager.shouldRotateOnSize(["size"], 10, 1, 10)).toBe(true);
  });

  it("should not rotate on size when disabled or invalid", () => {
    expect(RotationManager.shouldRotateOnSize(["daily"], 10, 1, 10)).toBe(
      false,
    );

    expect(RotationManager.shouldRotateOnSize(["size"], 10, 1)).toBe(false);
  });

  it("should build a rotation suffix", () => {
    expect(
      RotationManager.buildRotationSuffix(new Date(2026, 2, 30, 10, 0, 0, 123)),
    ).toBe("2026-03-30_10-00-00-123");
  });

  it("should build a day key", () => {
    expect(RotationManager.getDayKey(new Date(2026, 2, 30, 10, 0, 0, 0))).toBe(
      "2026-03-30",
    );
  });
});
