import Db from "../scripts/db/db";
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
  song: Song;
  selectedVerses: Array<SongListVerseModel>;

  constructor(
    index: number,
    song: Song,
    selectedVerses: Array<SongListVerseModel> = [],
    id = Db.songs.getIncrementedPrimaryKey(SongListSongModelSchema)
  ) {
    this.id = id;
    this.index = index;
    this.song = song;
    this.selectedVerses = selectedVerses;
  }
}


export class SongListModel {
  id: number;
  name: string;
  songs: Array<SongListSongModel>;
  createdAt: Date;
  modifiedAt: Date;

  constructor(
    name: string,
    createdAt: Date = new Date(),
    modifiedAt: Date = new Date(),
    songs: Array<SongListSongModel> = [],
    id = Db.songs.getIncrementedPrimaryKey(SongListModelSchema)
  ) {
    this.id = id;
    this.name = name;
    this.songs = songs;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
  }
}
