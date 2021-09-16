import Db from "../scripts/db/db";
import { Song } from "./Songs";
import { SongListModelSchema, SongListSongModelSchema } from "./SongListModelSchema";


export class SongListSongModel {
  id: number;
  index: number;
  song: Song;

  constructor(
    index: number,
    song: Song,
    id = Db.songs.getIncrementedPrimaryKey(SongListSongModelSchema)
  ) {
    this.id = id;
    this.index = index;
    this.song = song;
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
