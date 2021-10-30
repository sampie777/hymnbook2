import Db from "../scripts/db/db";
import { SongBundleSchema, SongSchema, VerseSchema } from "./SongsSchema";

export interface VerseProps {
  id: number;
  name: string;
  content: string;
  language: string;
  index: number;
}

export class Verse implements VerseProps {
  id: number;
  name: string;
  content: string;
  language: string;
  index: number;

  constructor(
    index: number,
    name: string,
    content: string,
    language: string,
    id = Db.songs.getIncrementedPrimaryKey(VerseSchema)
  ) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.language = language;
    this.index = index;
  }

  static toObject(verse: VerseProps): VerseProps {
    return {
      id: verse.id,
      name: verse.name,
      content: verse.content,
      language: verse.language,
      index: verse.index
    } as VerseProps;
  }
}

export class Song {
  id: number;
  name: string;
  author: string;
  copyright: string;
  language: string;
  verses: Array<Verse>;
  createdAt: Date;
  modifiedAt: Date;

  constructor(
    name: string,
    author: string,
    copyright: string,
    language: string,
    createdAt: Date,
    modifiedAt: Date,
    verses: Array<Verse> = [],
    id = Db.songs.getIncrementedPrimaryKey(SongSchema)
  ) {
    this.id = id;
    this.name = name;
    this.author = author;
    this.copyright = copyright;
    this.language = language;
    this.verses = verses;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
  }
}

export class SongBundle {
  id: number;
  abbreviation: string;
  name: string;
  language: string;
  songs: Array<Song>;
  createdAt: Date;
  modifiedAt: Date;

  constructor(
    abbreviation: string,
    name: string,
    language: string,
    createdAt: Date,
    modifiedAt: Date,
    songs: Array<Song> = [],
    id = Db.songs.getIncrementedPrimaryKey(SongBundleSchema)
  ) {
    this.id = id;
    this.abbreviation = abbreviation;
    this.name = name;
    this.language = language;
    this.songs = songs;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
  }
}
