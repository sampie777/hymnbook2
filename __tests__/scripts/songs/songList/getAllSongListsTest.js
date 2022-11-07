import SongList from "../../../../source/logic/songs/songList";
import Db from "../../../../source/logic/db/db";
import { SongListModel } from "../../../../source/logic/db/models/SongListModel";

describe("test getting all song lists", () => {
  const list1 = new SongListModel();
  const list2 = new SongListModel();

  it("returns empty list if db is empty", () => {
    Db.songs.realm.mockImplementation(() => {
      return { objects: () => [] };
    });

    expect(SongList.getAllSongLists()).toStrictEqual([]);
  });

  it("returns list of all in db", () => {
    Db.songs.realm.mockImplementation(() => {
      return { objects: () => [list1] };
    });

    expect(SongList.getAllSongLists()).toStrictEqual([list1]);
  });

  it("returns list of all in db", () => {
    Db.songs.realm.mockImplementation(() => {
      return { objects: () => [list1, list2] };
    });

    expect(SongList.getAllSongLists()).toStrictEqual([list1, list2]);
  });
});
