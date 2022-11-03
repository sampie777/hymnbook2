import SongList from "../../../../source/logic/songs/songList";
import Db from "../../../../source/logic/db/db";
import { SongListModel, SongListSongModel } from "../../../../source/logic/db/models/SongListModel";
import { Song } from "../../../../source/logic/db/models/Songs";

describe("test adding song to song list", () => {
  const list1 = new SongListModel("Default");

  // Mocks
  Db.songs.realm.mockImplementation(() => {
    const list = [list1];
    list.filtered = (query) => list.filter(it => query.includes(`"${it.name}"`));
    return {
      objects: () => list,
      write: (callback) => callback ? callback() : undefined,
      create: () => undefined,
      delete: () => undefined,
    };
  });
  const spy = jest.spyOn(SongList, "cleanUpSongListFromNullsAndCorrectIndices").mockImplementation(() => undefined);

  beforeEach(() => {
    Db.songs.realm.mockClear();
    spy.mockClear();
    list1.songs = [];
  });

  it("adds song to the end of an already filled list", () => {
    list1.songs.push(new SongListSongModel(0));
    list1.songs.push(new SongListSongModel(1));
    list1.songs.push(new SongListSongModel(0));

    const song = new Song();

    const songListSong = SongList.addSong(song);
    expect(Db.songs.realm).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(songListSong.index).toBe(3);
    expect(songListSong.song).toBe(song);
    expect(list1.songs.length).toBe(4);
  });

  it("adds song to begin of the list if list is empty", () => {
    const song = new Song();

    const songListSong = SongList.addSong(song);
    expect(Db.songs.realm).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(songListSong.index).toBe(0);
    expect(songListSong.song).toBe(song);
    expect(list1.songs.length).toBe(1);
  });

  it("creates new list and add song to it", () => {
    Db.songs.realm
      .mockImplementationOnce(() => {
        const list = [];
        list.filtered = (query) => list.filter(it => query.includes(`"${it.name}"`));
        return { objects: () => list };
      })
      .mockImplementationOnce(() => {
        return { write: (callback) => callback ? callback() : undefined };
      })
      .mockImplementationOnce(() => {
        return { create: () => undefined };
      })
      .mockImplementationOnce(() => {
        return { objects: () => [list1] };
      })
      .mockImplementationOnce(() => {
        return { write: (callback) => callback ? callback() : undefined };
      });
    const song = new Song();

    const songListSong = SongList.addSong(song);
    expect(Db.songs.realm).toHaveBeenCalledTimes(5);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(songListSong.index).toBe(0);
    expect(songListSong.song).toBe(song);
    expect(list1.songs.length).toBe(1);
  });

  it("returns undefined if song list not found and cannot be created", () => {
    Db.songs.realm
      .mockImplementationOnce(() => {
        const list = [];
        list.filtered = (query) => list.filter(it => query.includes(`"${it.name}"`));
        return { objects: () => list };
      })
      .mockImplementationOnce(() => {
        return { write: (callback) => callback ? callback() : undefined };
      })
      .mockImplementationOnce(() => {
        return { create: () => undefined };
      })
      .mockImplementationOnce(() => {
        return { objects: () => [] };
      });
    const song = new Song();

    const songListSong = SongList.addSong(song);
    expect(Db.songs.realm).toHaveBeenCalledTimes(4);
    expect(spy).toHaveBeenCalledTimes(0);
    expect(songListSong).toBe(undefined);
    expect(list1.songs.length).toBe(0);
  });

  it("adds song to the end of an already filled list", () => {
    Db.songs.realm.mockImplementation(() => {
      const list = [list1];
      list.filtered = (query) => list.filter(it => query.includes(`"${it.name}"`));
      return {
        objects: () => list,
        write: () => {
          throw Error("error");
        },
        create: () => undefined,
        delete: () => undefined,
      };
    });

    list1.songs.push(new SongListSongModel(0));
    list1.songs.push(new SongListSongModel(1));
    list1.songs.push(new SongListSongModel(0));

    const song = new Song();

    expect(SongList.addSong(song)).toThrow("error");
    expect(Db.songs.realm).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledTimes(0);
    expect(list1.songs.length).toBe(3);
  });
});
