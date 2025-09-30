import {beforeEach, describe, expect, it} from '@jest/globals';
import {rollbar} from "../../source/logic/rollbar";
import {Analytics} from "../../source/logic/analytics";
import settings from "../../source/settings";

describe("test analytics", () => {
  beforeEach(() => {
    rollbar.debug.mockClear();
  });

  it("don't upload data when settings is disabled", () => {
    settings.shareUsageData = false;
    Analytics.uploadSettings();
    expect(rollbar.debug.mock.calls.length).toBe(0);
  });

  it("upload data when settings is enabled", () => {
    settings.shareUsageData = true;
    Analytics.uploadSettings();
    expect(rollbar.debug.mock.calls.length).toBe(1);
  });
});
