import { Song, Verse } from "../db/models/songs/Songs";
import Db from "../db/db";
import { SongListModel, SongListSongModel, SongListVerseModel } from "../db/models/songs/SongListModel";
import { SongListModelSchema } from "../db/models/songs/SongListModelSchema";
import { VerseSchema } from "../db/models/songs/SongsSchema";
import { rollbar } from "../rollbar";
import { SongDbHelpers } from "./songDbHelpers";
import { isSongValid } from "./utils";

export default class SongList {

  static list(): SongListSongModel[] {
    const songList = this.getFirstSongList();
    if (songList === undefined) return [];

    if (!Db.songs.realm().isInTransaction && songList.songs.some(it => it == null || it.song == null)) {
      this.cleanUpSongListFromNullsAndCorrectIndices(songList);
    }

    return (songList.songs as unknown as Realm.Results<SongListSongModel>)
      .sorted("index")
      // Fix for when null objects come through when database is in transaction
      // (rollbar: #58 Cannot read property of undefined/null expression n)
      .filter(it => it != null && it.song != null);
  }

  static getAllSongLists(): Realm.Results<Realm.Object<SongListModel> & SongListModel> {
    return Db.songs.realm().objects<SongListModel>(SongListModelSchema.name);
  }

  static getFirstSongList(): SongListModel | undefined {
    const songLists = this.getAllSongLists();
    if (songLists.length === 0) return undefined;
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

  static addSong(song: Song): SongListSongModel | undefined {
    this.createSongListIfNotExists("Default");
    const songList = this.getFirstSongList();
    if (songList === undefined) return undefined;

    const index = songList.songs.length;

    const songListSongModel = new SongListSongModel(index, song);
    Db.songs.realm().write(() => {
      songList.songs.push(songListSongModel);
    });

    this.cleanUpSongListFromNullsAndCorrectIndices(songList);
    return songListSongModel;
  }

  static moveSong(fromIndex: number, toIndex: number) {
    const songList = this.getFirstSongList();
    if (songList === undefined) return;
    const dbSong = songList.songs.find(it => it.index == fromIndex);
    if (dbSong === undefined) return;

    if (toIndex < 0 || toIndex > songList.songs.length) {
      rollbar.warning("Can't move song to out of bounds song list index", {
        fromIndex: fromIndex,
        toIndex: toIndex,
        songList: songList,
        dbSong: dbSong
      });
      return;
    }
    if (toIndex == fromIndex || (toIndex == songList.songs.length && fromIndex == toIndex - 1)) return;

    const songsFromIndex = songList.songs
      .filter(it => it.index >= toIndex)
      .filter(it => it.index != fromIndex);

    try {
      Db.songs.realm().write(() => {
        dbSong.index = toIndex;
        songsFromIndex.forEach(it => it.index++);
      });
    } catch (error) {
      throw Error("Could not move song");
    }

    // If index == songs.length, there will be an index gap (e.g. if original index was 3 and there are 5 items,
    // indices will be: 0, 1, 2, 4, 5). But this will be fixed in `unifyIndices()` function.
    this.cleanUpSongListFromNullsAndCorrectIndices(songList);
  }

  static deleteSongAtIndex(index: number) {
    const songList = this.getFirstSongList();
    if (songList === undefined) return;

    Db.songs.realm().write(() => {
      songList.songs.splice(
        songList.songs.findIndex(it => it.index === index), 1);
    });

    this.cleanUpSongListFromNullsAndCorrectIndices(songList);
  }

  static cleanUpSongListFromNullsAndCorrectIndices(songList: SongListModel) {
    Db.songs.realm().write(() => {
      // Delete all models with no song
      songList.songs.filter(it => it.song == null)
        .forEach(SongDbHelpers.deleteSongListSong);

      songList.songs = songList.songs.filter(it => it.song != null);
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

  static cleanUpAllSongLists() {
    this.getAllSongLists().forEach(it => this.cleanUpSongListFromNullsAndCorrectIndices(it));
  }

  static clearAll() {
    const songList = this.getFirstSongList();
    if (songList === undefined) return undefined;

    Db.songs.realm().write(() => {
      for (const child of songList.songs) SongDbHelpers.deleteSongListSong(child);
    });
  }

  static getSongAtIndex(index: number | undefined): SongListSongModel | undefined {
    if (index == undefined) return undefined;

    const songList = this.getFirstSongList();
    if (songList === undefined) return undefined;

    if (index < 0 || index > songList.songs.length) {
      return undefined;
    }

    const song = songList.songs.find(it => it.index === index);
    if (!isSongValid(song)) return undefined;

    return song;
  }

  static previousSong(currentIndex: number): SongListSongModel | undefined {
    return this.getSongAtIndex(currentIndex - 1);
  }

  static nextSong(currentIndex: number): SongListSongModel | undefined {
    return this.getSongAtIndex(currentIndex + 1);
  }

  static saveSelectedVersesForSong(index: number, verses: Verse[]) {
    const songListSong = SongList.getSongAtIndex(index);
    if (songListSong === undefined) return;

    Db.songs.realm().write(() => {
      for (const child of songListSong.selectedVerses) SongDbHelpers.deleteSongListVerse(child);
    });

    if (verses.length === 0) return;

    // "id IN [..]" currently not supported by Realm.
    // See: https://github.com/realm/realm-js/issues/2781#issuecomment-607213640
    const idQuery = verses.map(it => `id = ${it.id}`).join(" OR ");

    const dbVerses = Db.songs.realm().objects<Verse>(VerseSchema.name)
      .filtered(`(${idQuery})`)
      .sorted("index");

    Db.songs.realm().write(() => {
      dbVerses.forEach(it => songListSong.selectedVerses.push(new SongListVerseModel(it)));
    });
  };

  static replaceSong(item: SongListSongModel, newSong: Song) {
    const verses = newSong.verses.filter(verse =>
      item.selectedVerses.some(it => it.verse.uuid == verse.uuid));

    Db.songs.realm().write(() => {
      item.song = newSong;
    });
    SongList.saveSelectedVersesForSong(item.index, verses);
  }
}
