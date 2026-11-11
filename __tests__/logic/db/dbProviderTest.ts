import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { DatabaseProvider } from "../../../source/logic/db/dbProvider";

describe("DatabaseProvider disconnect and queueDisconnect", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("queueDisconnect closes realm after timeout and preserves 'this' context", () => {
    const provider = new DatabaseProvider({
      label: "TestDb",
      path: "test_db",
      schemas: [],
      schemaVersion: 1
    });

    const mockClose = jest.fn();
    provider._realm = { close: mockClose, isClosed: false } as any;
    provider._isConnected = true;

    provider.queueDisconnect();
    expect(provider._isQueuedForDisconnect).toBe(true);
    expect(provider._disconnectTimeout).toBeDefined();
    expect(mockClose).not.toHaveBeenCalled();

    // Advance timers to trigger the disconnect
    jest.advanceTimersByTime(300);

    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(provider._realm).toBeNull();
    expect(provider._isConnected).toBe(false);
    expect(provider._isQueuedForDisconnect).toBe(false);
  });

  it("cancelQueuedDisconnect cancels the pending disconnect", () => {
    const provider = new DatabaseProvider({
      label: "TestDb",
      path: "test_db",
      schemas: [],
      schemaVersion: 1
    });

    const mockClose = jest.fn();
    provider._realm = { close: mockClose, isClosed: false } as any;
    provider._isConnected = true;

    provider.queueDisconnect();
    expect(provider._isQueuedForDisconnect).toBe(true);

    provider.cancelQueuedDisconnect();
    expect(provider._isQueuedForDisconnect).toBe(false);
    expect(provider._disconnectTimeout).toBeUndefined();

    // Advance time past 300ms
    jest.advanceTimersByTime(500);

    expect(mockClose).not.toHaveBeenCalled();
    expect(provider._realm).not.toBeNull();
    expect(provider._isConnected).toBe(true);
  });

  it("disconnect can be invoked as an unbound function without losing this context", () => {
    const provider = new DatabaseProvider({
      label: "TestDb",
      path: "test_db",
      schemas: [],
      schemaVersion: 1
    });

    const mockClose = jest.fn();
    provider._realm = { close: mockClose, isClosed: false } as any;
    provider._isConnected = true;

    // Call disconnect without `provider.` context
    const unboundDisconnect = provider.disconnect;
    unboundDisconnect();

    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(provider._realm).toBeNull();
    expect(provider._isConnected).toBe(false);
  });
});
