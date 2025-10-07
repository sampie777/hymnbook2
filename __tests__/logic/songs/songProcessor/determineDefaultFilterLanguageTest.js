import {describe, expect, it, jest} from '@jest/globals';
import {SongBundle as ServerSongBundle} from "../../../../source/logic/server/models/ServerSongsModel";
import {SongBundle} from "../../../../source/logic/db/models/songs/Songs";
import {SongProcessor} from "../../../../source/logic/songs/songProcessor";
import {mockDb} from "../../../testUtils";

jest.mock("hymnbook2/source/logic/db/db");
mockDb();

describe("test get most used language from all bundles", () => {

  const serverBundle1 = new ServerSongBundle(1, "", "", "EN");
  const serverBundle2 = new ServerSongBundle(1, "", "", "EN");
  const serverBundle3 = new ServerSongBundle(1, "", "", "AF");
  const serverBundle4 = new ServerSongBundle(1, "", "", "AF");
  const serverBundle5 = new ServerSongBundle(1, "", "", "NL");

  const bundle1 = new SongBundle("", "", "EN");
  const bundle2 = new SongBundle("", "", "EN");
  const bundle3 = new SongBundle("", "", "AF");
  const bundle4 = new SongBundle("", "", "AF");
  const bundle5 = new SongBundle("", "", "NL");

  it("no bundles give empty language", () => {
    expect(SongProcessor.determineDefaultFilterLanguage([])).toBe("");
  });

  it("use language of server", () => {
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, serverBundle2])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, serverBundle2, serverBundle3])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, serverBundle2, serverBundle3, serverBundle4])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, serverBundle3, serverBundle4])).toBe("AF");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, serverBundle2, serverBundle3, serverBundle4, serverBundle5])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, serverBundle2, serverBundle4, serverBundle5])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, serverBundle4, serverBundle5])).toBe("EN");
  });

  it("is dependent on input order for server bundles", () => {
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, serverBundle3])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle3, serverBundle1])).toBe("AF");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, serverBundle2, serverBundle3, serverBundle4])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle3, serverBundle4, serverBundle1, serverBundle2])).toBe("AF");
  });

  it("use language of local", () => {
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle2])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle2, bundle3])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle2, bundle3, bundle4])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle3, bundle4])).toBe("AF");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle2, bundle3, bundle4, bundle5])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle2, bundle4, bundle5])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle4, bundle5])).toBe("EN");
  });

  it("is dependent on input order for local bundles", () => {
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle3])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle3, bundle1])).toBe("AF");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle2, bundle3, bundle4])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle3, bundle4, bundle1, bundle2])).toBe("AF");
  });

  it("use language of local and server combined", () => {
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, serverBundle1])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, serverBundle3])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([serverBundle1, bundle3])).toBe("EN");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, serverBundle3, serverBundle4])).toBe("AF");
    expect(SongProcessor.determineDefaultFilterLanguage([bundle1, bundle2, serverBundle3, serverBundle4])).toBe("EN");
  });
});
