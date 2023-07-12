import { deepLinkPathToSegments, deepLinkValidatePath } from "../../../source/logic/app";
import config from "../../../source/config";

describe("deepLink utilities", () => {
  it("deepLinkValidatePath validates valid urls", () => {
    expect(deepLinkValidatePath("https://my.domain.com/")).toBe(false);
    expect(deepLinkValidatePath("https://my.domain.com/open/download/songs/1")).toBe(false);
    expect(deepLinkValidatePath("myscheme://open/download/songs/1/")).toBe(false);
    expect(deepLinkValidatePath("invalid/open/download/songs/1/")).toBe(false);

    config.deepLinkPaths.forEach(path => {
      expect(deepLinkValidatePath(`${path}`)).toBe(true);
      expect(deepLinkValidatePath(`${path}/download/songs/1`)).toBe(true);
      expect(deepLinkValidatePath(`${path}/download/songs/1/`)).toBe(true);
      expect(deepLinkValidatePath(`${path}/download/songs/1///`)).toBe(true);
      expect(deepLinkValidatePath(`${path.replace(/^./, "X")}/download/songs/1`)).toBe(false);
      expect(deepLinkValidatePath(`${path.replace(/.$/, "X")}`)).toBe(false);
      expect(deepLinkValidatePath(`https://false.com?s=${path}`)).toBe(false);
    });
  });

  it("deepLinkPathToSegments parses correctly", () => {
    const backup = [...config.deepLinkPaths];
    config.deepLinkPaths = ["https://my.domain.com/open", "myscheme://open"];

    expect(deepLinkPathToSegments("https://my.domain.com/open/download/songs/1")).toStrictEqual(["download", "songs", "1"]);
    expect(deepLinkPathToSegments("https://my.domain.com/open/download/songs/1/")).toStrictEqual(["download", "songs", "1"]);
    expect(deepLinkPathToSegments("https://my.domain.com/open/download/songs/1///")).toStrictEqual(["download", "songs", "1"]);
    expect(deepLinkPathToSegments("myscheme://open/download/songs/1/")).toStrictEqual(["download", "songs", "1"]);
    expect(deepLinkPathToSegments("invalid/open/download/songs/1/")).toStrictEqual(["invalid", "open", "download", "songs", "1"]);
  });
});
