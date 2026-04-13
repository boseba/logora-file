import { afterEach, describe, expect, it, vi } from "vitest";

import { FileTextOutputOptions } from "../../../src/config";
import { FileWritePipeline } from "../../../src/core/pipeline/file-write-pipeline";
import type { FileWriteRecord } from "../../../src/core/pipeline/file-write-record.interface";
import type { FileWriteSession } from "../../../src/core/pipeline/file-write-session.interface";

describe("FileWritePipeline", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function createSessionMock(): {
    session: FileWriteSession;
    appendBatch: ReturnType<typeof vi.fn<() => Promise<void>>>;
  } {
    const appendBatch = vi.fn<() => Promise<void>>(() => Promise.resolve());

    const session: FileWriteSession = {
      appendBatch,
    };

    return {
      session,
      appendBatch,
    };
  }

  it("should flush a single enqueued record", async () => {
    const { session, appendBatch } = createSessionMock();

    const pipeline = new FileWritePipeline(
      session,
      new FileTextOutputOptions(),
    );

    const record: FileWriteRecord = {
      content: "Hello",
      timestamp: new Date(2026, 2, 30, 10, 0, 0, 0),
    };

    pipeline.enqueue(record);
    await pipeline.flush();

    expect(appendBatch).toHaveBeenCalledTimes(1);
    expect(appendBatch).toHaveBeenCalledWith([record]);
  });

  it("should flush multiple records in batches", async () => {
    const { session, appendBatch } = createSessionMock();

    const pipeline = new FileWritePipeline(
      session,
      new FileTextOutputOptions({
        maxBatchSize: 2,
      }),
    );

    pipeline.enqueueMany([
      {
        content: "A",
        timestamp: new Date(2026, 2, 30, 10, 0, 0, 0),
      },
      {
        content: "B",
        timestamp: new Date(2026, 2, 30, 10, 0, 1, 0),
      },
      {
        content: "C",
        timestamp: new Date(2026, 2, 30, 10, 0, 2, 0),
      },
    ]);

    await pipeline.flush();

    expect(appendBatch).toHaveBeenCalledTimes(2);
    expect(appendBatch).toHaveBeenNthCalledWith(1, [
      expect.objectContaining({ content: "A" }),
      expect.objectContaining({ content: "B" }),
    ]);
    expect(appendBatch).toHaveBeenNthCalledWith(2, [
      expect.objectContaining({ content: "C" }),
    ]);
  });

  it("should resolve flush immediately when there is nothing to flush", async () => {
    const { session, appendBatch } = createSessionMock();

    const pipeline = new FileWritePipeline(
      session,
      new FileTextOutputOptions(),
    );

    await expect(pipeline.flush()).resolves.toBeUndefined();
    expect(appendBatch).not.toHaveBeenCalled();
  });

  it("should drop the newest record when the buffer is full and drop-newest is configured", async () => {
    const { session, appendBatch } = createSessionMock();

    const pipeline = new FileWritePipeline(
      session,
      new FileTextOutputOptions({
        maxBufferedRecords: 1,
        overflowStrategy: "drop-newest",
      }),
    );

    pipeline.enqueue({
      content: "A",
      timestamp: new Date(2026, 2, 30, 10, 0, 0, 0),
    });

    pipeline.enqueue({
      content: "B",
      timestamp: new Date(2026, 2, 30, 10, 0, 1, 0),
    });

    await pipeline.flush();

    expect(appendBatch).toHaveBeenCalledTimes(1);
    expect(appendBatch).toHaveBeenCalledWith([
      expect.objectContaining({ content: "A" }),
    ]);
  });

  it("should drop the oldest record when the buffer is full and drop-oldest is configured", async () => {
    const { session, appendBatch } = createSessionMock();

    const pipeline = new FileWritePipeline(
      session,
      new FileTextOutputOptions({
        maxBufferedRecords: 1,
        overflowStrategy: "drop-oldest",
      }),
    );

    pipeline.enqueue({
      content: "A",
      timestamp: new Date(2026, 2, 30, 10, 0, 0, 0),
    });

    pipeline.enqueue({
      content: "B",
      timestamp: new Date(2026, 2, 30, 10, 0, 1, 0),
    });

    await pipeline.flush();

    expect(appendBatch).toHaveBeenCalledTimes(1);
    expect(appendBatch).toHaveBeenCalledWith([
      expect.objectContaining({ content: "B" }),
    ]);
  });

  it("should notify errors thrown by the session", async () => {
    const onError = vi.fn();
    const appendBatch = vi.fn<() => Promise<void>>(() =>
      Promise.reject(new Error("write failure")),
    );

    const session: FileWriteSession = {
      appendBatch,
    };

    const pipeline = new FileWritePipeline(
      session,
      new FileTextOutputOptions({
        onError,
      }),
    );

    pipeline.enqueue({
      content: "A",
      timestamp: new Date(2026, 2, 30, 10, 0, 0, 0),
    });

    await pipeline.flush();

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("should reject new writes after close", async () => {
    const onError = vi.fn();
    const { session } = createSessionMock();

    const pipeline = new FileWritePipeline(
      session,
      new FileTextOutputOptions({
        onError,
      }),
    );

    await pipeline.close();

    pipeline.enqueue({
      content: "A",
      timestamp: new Date(2026, 2, 30, 10, 0, 0, 0),
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });
});
