import SongList from "../../../../source/logic/songs/songList";
import Db from "../../../../source/logic/db/db";
import { SongListModel, SongListSongModel } from "../../../../source/logic/db/models/SongListModel";
import { Song } from "../../../../source/logic/db/models/Songs";

describe("test cleaning up song list", () => {
  const spy = jest.spyOn(SongList, "unifyIndices").mockImplementation(() => undefined);

  beforeEach(() => {
    Db.songs.realm.mockClear();
    spy.mockClear();
  });

  it("keeps all non-null songs in list", () => {
    const list1 = new SongListModel("Default");
    list1.songs.push(new SongListSongModel(0, new Song()));
    list1.songs.push(new SongListSongModel(1, new Song()));
    list1.songs.push(new SongListSongModel(2, new Song()));

    SongList.cleanUpSongListFromNullsAndCorrectIndices(list1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(Db.songs.realm).toHaveBeenCalledTimes(1);
    expect(list1.songs.length).toBe(3);
  });

  it("removes all null songs in list", () => {
    const list1 = new SongListModel("Default");
    list1.songs.push(new SongListSongModel(0, new Song()));
    list1.songs.push(new SongListSongModel(1, null));
    list1.songs.push(new SongListSongModel(2, new Song()));

    SongList.cleanUpSongListFromNullsAndCorrectIndices(list1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(Db.songs.realm).toHaveBeenCalledTimes(2);
    expect(list1.songs.length).toBe(2);
  });
});
