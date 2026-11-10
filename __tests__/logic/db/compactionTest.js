import {describe, expect, it} from "@jest/globals";
import {COMPACTION_MAX_USAGE_RATIO, COMPACTION_MIN_BYTES, DatabaseProvider} from "../../../source/logic/db/dbProvider";

describe("Database compaction on launch", () => {
  it("exports sensible compaction thresholds", () => {
    expect(COMPACTION_MIN_BYTES).toBe(2 * 1024 * 1024);
    expect(COMPACTION_MAX_USAGE_RATIO).toBe(0.8);
  });

  it("shouldCompact callback decides correctly based on size and free space", () => {
    const provider = new DatabaseProvider({
      label: "TestDb",
      path: "test_db",
      schemas: [],
      schemaVersion: 1
    });

    const shouldCompactFn = provider.config.shouldCompact;
    expect(typeof shouldCompactFn).toBe("function");

    // Case 1: Small file (< 2 MB) with lots of slack -> should NOT compact
    const resultSmall = shouldCompactFn(1024 * 1024, 100 * 1024);
    expect(resultSmall).toBe(false);

    // Case 2: Large file (5 MB) with high utilization (90%) -> should NOT compact
    const resultHighUsage = shouldCompactFn(5 * 1024 * 1024, 4.5 * 1024 * 1024);
    expect(resultHighUsage).toBe(false);

    // Case 3: Large file (5 MB) with low utilization (50%) -> SHOULD compact
    const resultLowUsage = shouldCompactFn(5 * 1024 * 1024, 2.5 * 1024 * 1024);
    expect(resultLowUsage).toBe(true);
  });
});
