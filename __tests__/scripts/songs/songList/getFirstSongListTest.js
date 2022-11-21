import SongList from "../../../../source/logic/songs/songList";
import Db from "../../../../source/logic/db/db";
import { SongListModel } from "../../../../source/logic/db/models/SongListModel";

jest.mock("hymnbook2/source/logic/db/db");

describe("test getting first song list", () => {
  Db.songs.getIncrementedPrimaryKey.mockImplementation(() => 1);
  Db.songs.realm.mockImplementation(() => {
    return {
      objects: () => [],
      write: (callback) => callback ? callback() : undefined,
      create: () => undefined,
      delete: () => undefined,
    };
  });

  const list1 = new SongListModel();
  const list2 = new SongListModel();

  it("returns undefined if db is empty", () => {
    Db.songs.realm.mockImplementation(() => {
      return { objects: () => [] };
    });

    expect(SongList.getFirstSongList()).toBe(undefined);
  });

  it("returns first if list has length==1", () => {
    Db.songs.realm.mockImplementation(() => {
      return { objects: () => [list1] };
    });

    expect(SongList.getFirstSongList()).toStrictEqual(list1);
  });

  it("returns first if list is longer than 1", () => {
    Db.songs.realm.mockImplementation(() => {
      return { objects: () => [list1, list2] };
    });

    expect(SongList.getFirstSongList()).toStrictEqual(list1);
  });
});
