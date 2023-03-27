import { SongBundle as ServerSongBundle } from "../../../../source/logic/server/models/ServerSongsModel";
import { SongProcessor } from "../../../../source/logic/songs/songProcessor";
import { SongBundle } from "../../../../source/logic/db/models/Songs";
import Db from "../../../../source/logic/db/db";

jest.mock("hymnbook2/source/logic/db/db");

describe("test check if bundle has update", () => {
  Db.songs.getIncrementedPrimaryKey.mockImplementation(() => 1);
  Db.songs.realm.mockImplementation(() => {
    return {
      objects: () => [],
      write: (callback) => callback ? callback() : undefined,
      create: () => undefined,
      delete: () => undefined,
    };
  });

  const serverBundle1 = new ServerSongBundle(0, "", "", "EN", "", "", [], new Date(), new Date(), "uuid1", "abc1");
  const serverBundle2 = new ServerSongBundle(1, "", "", "EN", "", "", [], new Date(), new Date(), "uuid2", "abc2");
  const serverBundle3 = new ServerSongBundle(2, "", "", "NL", "", "", [], new Date(), new Date(), "uuid3", "abc3");

  const increaseDate = (from = new Date()) => new Date(from.getTime() + 1000 * 60 * 60);
  const decreaseDate = (from = new Date()) => new Date(from.getTime() - 1000 * 60 * 60);

  it("has update if UUID is same and server hash different", () => {
    const bundle = new SongBundle("", "", "EN", "", "", new Date(), new Date(), "uuid1", "");
    expect(SongProcessor.hasUpdate([serverBundle1, serverBundle2, serverBundle3], bundle)).toBe(true);
  });

  it("has update if UUID is same and name is different and server hash different", () => {
    const bundle = new SongBundle("abbreviation", "name", "EN", "", "", new Date(), new Date(), "uuid1", "");
    expect(SongProcessor.hasUpdate([serverBundle1, serverBundle2, serverBundle3], bundle)).toBe(true);
  });

  it("has update if UUID is same and server hash different and dates the same", () => {
    const bundle = new SongBundle("", "", "EN", "", "", serverBundle1.createdAt, serverBundle1.modifiedAt, "uuid1", "");
    expect(SongProcessor.hasUpdate([serverBundle1, serverBundle2, serverBundle3], bundle)).toBe(true);
  });

  it("has no update if UUID is same and hash is same", () => {
    const bundle = new SongBundle("", "", "EN", "", "", new Date(), new Date(), "uuid5", serverBundle1.hash);
    expect(SongProcessor.hasUpdate([serverBundle1, serverBundle2, serverBundle3], bundle)).toBe(false);
  });

  it("has no update if UUID is different and hash is different", () => {
    const bundle = new SongBundle("", "", "EN", "", "", new Date(), new Date(), "uuid5", "");
    expect(SongProcessor.hasUpdate([serverBundle1, serverBundle2, serverBundle3], bundle)).toBe(false);
  });
});
