import SongList from "../../../../source/logic/songs/songList";
import Db from "../../../../source/logic/db/db";
import { SongListModel, SongListSongModel } from "../../../../source/logic/db/models/SongListModel";

jest.mock("hymnbook2/source/logic/db/db");

describe("test cleaning up song list", () => {
  Db.songs.getIncrementedPrimaryKey.mockImplementation(() => 1);
  Db.songs.realm.mockImplementation(() => {
    return {
      objects: () => [],
      write: (callback) => callback ? callback() : undefined,
      create: () => undefined,
      delete: () => undefined,
    };
  });

  const list1 = new SongListModel("Default");

  beforeEach(() => {
    Db.songs.realm.mockClear();
  });

  it("Reassings new indeces based on array order", () => {
    list1.songs.sorted = () => list1.songs;

    list1.songs.push(new SongListSongModel(0));
    list1.songs.push(new SongListSongModel(1));
    list1.songs.push(new SongListSongModel(0));

    SongList.unifyIndices(list1);
    expect(Db.songs.realm).toHaveBeenCalledTimes(1);
    expect(list1.songs[0].index).toBe(0);
    expect(list1.songs[1].index).toBe(1);
    expect(list1.songs[2].index).toBe(2);
  });
});
