import { Song, Verse } from "../db/models/Songs";
import Db from "../db/db";
import { SongListModel, SongListSongModel, SongListVerseModel } from "../db/models/SongListModel";
import { SongListModelSchema } from "../db/models/SongListModelSchema";
import { VerseSchema } from "../db/models/SongsSchema";

export default class SongList {

  static list(): Array<SongListSongModel> {
    const songList = this.getFirstSongList();
    if (songList === undefined) {
      return [];
    }

    if (!Db.songs.realm().isInTransaction && songList.songs.some(it => it == null || it.song == null)) {
      this.cleanUpSongListFromNullsAndCorrectIndices(songList);
    }

    return (songList.songs as unknown as Realm.Results<SongListSongModel>)
      .sorted("index")
      // Fix for when null objects come through when database is in transaction
      // (rollbar: #58 Cannot read property of undefined/null expression n)
      .filter(it => it != null && it.song != null) as unknown as Array<SongListSongModel>;
  }

  static getAllSongLists(): Realm.Results<SongListModel> {
    return Db.songs.realm().objects<SongListModel>(SongListModelSchema.name);
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
        .forEach(it => Db.songs.realm().delete(it));

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
      Db.songs.realm().delete(songList.songs);
    });
  }

  static getSongAtIndex(index: number): SongListSongModel | undefined {
    const songList = this.getFirstSongList();
    if (songList === undefined) return undefined;

    if (index < 0 || index > songList.songs.length) {
      return undefined;
    }

    return songList.songs.find(it => it.index === index);
  }

  static previousSong(currentIndex: number): SongListSongModel | undefined {
    return this.getSongAtIndex(currentIndex - 1);
  }

  static nextSong(currentIndex: number): SongListSongModel | undefined {
    return this.getSongAtIndex(currentIndex + 1);
  }

  static saveSelectedVersesForSong(index: number, verses: Array<Verse>) {
    const songListSong = SongList.getSongAtIndex(index);
    if (songListSong === undefined) {
      return;
    }

    if (verses.length === 0) {
      Db.songs.realm().write(() => {
        Db.songs.realm().delete(songListSong.selectedVerses);
      });
      return;
    }

    // "id IN [..]" currently not supported by Realm.
    // See: https://github.com/realm/realm-js/issues/2781#issuecomment-607213640
    const idQuery = verses.map(it => `id = ${it.id}`).join(" OR ");

    const dbVerses = Db.songs.realm().objects<Verse>(VerseSchema.name)
      .filtered(`(${idQuery})`)
      .sorted("index");

    Db.songs.realm().write(() => {
      Db.songs.realm().delete(songListSong.selectedVerses);

      dbVerses.forEach(it => songListSong.selectedVerses.push(new SongListVerseModel(it)));
    });
  };
}
