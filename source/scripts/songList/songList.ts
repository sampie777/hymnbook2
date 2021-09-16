import { Song } from "../../models/Songs";
import Db from "../db/db";
import { SongListModel, SongListSongModel } from "../../models/SongListModel";
import { SongListModelSchema } from "../../models/SongListModelSchema";

export default class SongList {

  static list(): Array<SongListSongModel> {
    const songList = this.getFirstSongList();
    if (songList === undefined) {
      return [];
    }

    return (songList.songs as unknown as Realm.Results<SongListSongModel>)
      .sorted("index") as unknown as Array<SongListSongModel>;
  }

  static getAllSongLists(): Realm.Results<SongListModel> {
    return Db.songs.realm().objects(SongListModelSchema.name) as Realm.Results<SongListModel>;
  }

  static getFirstSongList(): SongListModel | undefined {
    const songLists = this.getAllSongLists();
    if (songLists.length === 0) {
      return undefined;
    }
    return songLists[0];
  }

  static createSongListIfNotExists(name: string) {
    if (this.getAllSongLists().filtered(`name = "${name}"`).length > 0) {
      return;
    }
    Db.songs.realm().write(() => {
      Db.songs.realm().create(SongListModelSchema.name, new SongListModel(name));
    });
  }

  static addSong(song: Song) {
    this.createSongListIfNotExists("Default");
    const songList = this.getFirstSongList();
    if (songList === undefined) return;

    const index = songList.songs.length;

    Db.songs.realm().write(() => {
      songList.songs.push(new SongListSongModel(index, song));
    });
  }

  static deleteSongAtIndex(index: number) {
    const songList = this.getFirstSongList();
    if (songList === undefined) return;

    Db.songs.realm().write(() => {
      songList.songs.splice(
        songList.songs.findIndex(it => it.index === index), 1);
    });

    this.unifyIndices(songList);
  }

  static unifyIndices(songList: SongListModel) {
    let lastIndex = 0;
    Db.songs.realm().write(() => {
      (songList.songs as unknown as Realm.Results<SongListSongModel>)
        .sorted("index")
        .forEach(it => it.index = lastIndex++);
    });
  }

  static previousSong(currentIndex: number): SongListSongModel | undefined {
    const songList = this.getFirstSongList();
    if (songList === undefined) return undefined;

    if (currentIndex === 0) {
      return undefined
    }

    return songList.songs.find(it => it.index === currentIndex - 1);
  }

  static nextSong(currentIndex: number): SongListSongModel | undefined {
    const songList = this.getFirstSongList();
    if (songList === undefined) return undefined;

    if (currentIndex === songList.songs.length - 1) {
      return undefined
    }

    return songList.songs.find(it => it.index === currentIndex + 1);
  }
}
