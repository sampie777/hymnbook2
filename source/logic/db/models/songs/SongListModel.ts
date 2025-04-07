import Db from "../../db";
import { Song, Verse } from "./Songs";
import { SongListModelSchema, SongListSongModelSchema, SongListVerseModelSchema } from "./SongListModelSchema";


export class SongListVerseModel {
  id: number;
  verse: Verse;

  constructor(
    verse: Verse,
    id = Db.songs.getIncrementedPrimaryKey(SongListVerseModelSchema)
  ) {
    this.id = id;
    this.verse = verse;
  }
}


export class SongListSongModel {
  id: number;
  index: number;
  song: Song & ({} | Realm.Object<Song>);
  selectedVerses: SongListVerseModel[];

  constructor(
    index: number,
    song: Song,
    selectedVerses: SongListVerseModel[] = [],
    id = Db.songs.getIncrementedPrimaryKey(SongListSongModelSchema)
  ) {
    this.id = id;
    this.index = index;
    this.song = song;
    this.selectedVerses = selectedVerses;
  }

  static clone(obj: SongListSongModel): SongListSongModel {
    return {
      id: obj.id,
      index: obj.index,
      song: Song.clone(obj.song),
      selectedVerses: obj.selectedVerses.map(it => ({
        id: it.id,
        verse: Verse.toObject(it.verse)
      }))
    }
  }
}


export class SongListModel {
  id: number;
  name: string;
  songs: SongListSongModel[];
  createdAt: Date;
  modifiedAt: Date;

  constructor(
    name: string,
    createdAt: Date = new Date(),
    modifiedAt: Date = new Date(),
    songs: SongListSongModel[] = [],
    id = Db.songs.getIncrementedPrimaryKey(SongListModelSchema)
  ) {
    this.id = id;
    this.name = name;
    this.songs = songs;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
  }
}
