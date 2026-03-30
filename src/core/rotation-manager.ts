import dayjs from "dayjs";

import type { FileRotationPolicy } from "../enums";

/**
 * Encapsulates file rotation policy checks and helpers.
 */
export class RotationManager {
  /**
   * Normalizes a rotation policy array by removing duplicates
   * while preserving the original order.
   *
   * @param policies The configured rotation policies.
   * @returns A normalized array.
   */
  public static normalizePolicies(
    policies?: FileRotationPolicy[],
  ): FileRotationPolicy[] {
    if (!policies || policies.length === 0) {
      return [];
    }

    return [...new Set(policies)];
  }

  /**
   * Determines whether a specific rotation policy is enabled.
   *
   * @param policies The configured policies.
   * @param policy The policy to test.
   * @returns True when enabled.
   */
  public static hasPolicy(
    policies: FileRotationPolicy[],
    policy: FileRotationPolicy,
  ): boolean {
    return policies.includes(policy);
  }

  /**
   * Determines whether startup rotation is enabled.
   *
   * @param policies The configured policies.
   * @returns True when startup rotation is enabled.
   */
  public static shouldRotateOnStartup(policies: FileRotationPolicy[]): boolean {
    return this.hasPolicy(policies, "startup");
  }

  /**
   * Determines whether daily rotation should occur.
   *
   * @param policies The configured policies.
   * @param previousDate The previous active day reference.
   * @param currentDate The current write date.
   * @returns True when the day changed and daily rotation is enabled.
   */
  public static shouldRotateOnDaily(
    policies: FileRotationPolicy[],
    previousDate: Date | null,
    currentDate: Date,
  ): boolean {
    if (!this.hasPolicy(policies, "daily")) {
      return false;
    }

    if (!previousDate) {
      return false;
    }

    return this.getDayKey(previousDate) !== this.getDayKey(currentDate);
  }

  /**
   * Determines whether size rotation should occur.
   *
   * @param policies The configured policies.
   * @param currentFileSize The current file size in bytes.
   * @param incomingBytes The number of bytes to append.
   * @param maxSizeBytes The configured size limit.
   * @returns True when size rotation must occur.
   */
  public static shouldRotateOnSize(
    policies: FileRotationPolicy[],
    currentFileSize: number,
    incomingBytes: number,
    maxSizeBytes?: number,
  ): boolean {
    if (!this.hasPolicy(policies, "size")) {
      return false;
    }

    if (!maxSizeBytes || maxSizeBytes <= 0) {
      return false;
    }

    return (
      currentFileSize > 0 && currentFileSize + incomingBytes > maxSizeBytes
    );
  }

  /**
   * Builds a deterministic rotation suffix.
   *
   * @param date The rotation date.
   * @returns A timestamp suffix.
   */
  public static buildRotationSuffix(date: Date): string {
    return dayjs(date).format("YYYY-MM-DD_HH-mm-ss-SSS");
  }

  /**
   * Builds a day key used for day-based comparisons.
   *
   * @param date The source date.
   * @returns A normalized day key.
   */
  public static getDayKey(date: Date): string {
    return dayjs(date).format("YYYY-MM-DD");
  }
}
