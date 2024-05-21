import { SongBundle as ServerSongBundle } from "../../../../source/logic/server/models/ServerSongsModel";
import { SongProcessor } from "../../../../source/logic/songs/songProcessor";
import { SongBundle } from "../../../../source/logic/db/models/Songs";
import { mockDb } from "../../../testUtils";

jest.mock("hymnbook2/source/logic/db/db");
mockDb();

describe("test getting all languages from multiple song bundles", () => {

  const serverBundle1 = new ServerSongBundle(1, "", "", "EN");
  const serverBundle2 = new ServerSongBundle(1, "", "", "EN");
  const serverBundle3 = new ServerSongBundle(1, "", "", "AF");
  const serverBundle4 = new ServerSongBundle(1, "", "", "AF");
  const serverBundle5 = new ServerSongBundle(1, "", "", "NL");

  const bundle1 = new SongBundle("", "","EN");
  const bundle2 = new SongBundle("", "","EN");
  const bundle3 = new SongBundle("", "","AF");
  const bundle4 = new SongBundle("", "","AF");
  const bundle5 = new SongBundle("", "","NL");

  it("collects 0 languages from empty bundle", () => {
    expect(SongProcessor.getAllLanguagesFromBundles([])).toStrictEqual([])
  });

  it("collects all languages from local bundles", () => {
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1])).toStrictEqual(["EN"])
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1, bundle2])).toStrictEqual(["EN"])
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1, bundle2, bundle3])).toStrictEqual(["EN", "AF"])
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1, bundle2, bundle3, bundle5])).toStrictEqual(["EN", "AF", "NL"])
  });

  it("collects all languages from server bundles", () => {
    expect(SongProcessor.getAllLanguagesFromBundles([serverBundle1])).toStrictEqual(["EN"])
    expect(SongProcessor.getAllLanguagesFromBundles([serverBundle1, serverBundle2])).toStrictEqual(["EN"])
    expect(SongProcessor.getAllLanguagesFromBundles([serverBundle1, serverBundle2, serverBundle3])).toStrictEqual(["EN", "AF"])
    expect(SongProcessor.getAllLanguagesFromBundles([serverBundle1, serverBundle2, serverBundle3, serverBundle5])).toStrictEqual(["EN", "AF", "NL"])
  });

  it("collects all languages from mixed bundles", () => {
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1, serverBundle1])).toStrictEqual(["EN"])
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1, serverBundle1, serverBundle2])).toStrictEqual(["EN"])
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1, serverBundle3])).toStrictEqual(["EN", "AF"])
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1, bundle2, bundle3, serverBundle5])).toStrictEqual(["EN", "AF", "NL"])
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1, bundle2, serverBundle4, serverBundle5])).toStrictEqual(["EN", "AF", "NL"])
    expect(SongProcessor.getAllLanguagesFromBundles([bundle1, bundle2, bundle3, serverBundle4, serverBundle5])).toStrictEqual(["EN", "AF", "NL"])
  });
});
