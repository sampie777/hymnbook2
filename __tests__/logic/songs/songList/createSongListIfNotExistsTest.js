import SongList from "../../../../source/logic/songs/songList";
import Db from "../../../../source/logic/db/db";
import { SongListModel } from "../../../../source/logic/db/models/SongListModel";
import { mockDb } from "../../../testUtils";

jest.mock("hymnbook2/source/logic/db/db");
mockDb();

describe("test creating songlist if not exist", () => {

  const list1 = new SongListModel("name1");
  const list2 = new SongListModel("name2");

  beforeEach(() => {
    Db.songs.realm.mockClear();
  });

  it("dont create new entry if name already exists", () => {
    jest.spyOn(SongList, "getAllSongLists").mockImplementation(() => {
      return { filtered: (query) => [list1, list2].filter(it => query.includes(`"${it.name}"`)) };
    });

    SongList.createSongListIfNotExists("name1");
    expect(Db.songs.realm).toHaveBeenCalledTimes(0);
  });

  it("create new entry if there are no lists", () => {
    jest.spyOn(SongList, "getAllSongLists").mockImplementation(() => {
      return { filtered: () => [] };
    });

    SongList.createSongListIfNotExists("name1");
    expect(Db.songs.realm).toHaveBeenCalledTimes(2);
  });

  it("create new entry if name doesnt exists", () => {
    jest.spyOn(SongList, "getAllSongLists").mockImplementation(() => {
      return { filtered: (query) => [list2].filter(it => query.includes(`"${it.name}"`)) };
    });

    SongList.createSongListIfNotExists("name1");
    expect(Db.songs.realm).toHaveBeenCalledTimes(2);
  });
});
