import Db from "../db";
import { SongBundleSchema, SongMetadataSchema, SongSchema, VerseSchema } from "./SongsSchema";
import { AbcMelody } from "./AbcMelodies";

export class SongAudio {
  id: number;
  file: string = "";
  name: string = "";
  type: string = "";
  uuid: string | null;
  downloadCount: number = 0;
  fileSize: number | null;

  constructor(
    id: number,
    file: string,
    name: string,
    type: string,
    uuid: string | null,
    downloadCount: number = 0,
    fileSize: number | null = null
  ) {
    this.id = id;
    this.file = file;
    this.name = name;
    this.type = type;
    this.uuid = uuid;
    this.downloadCount = downloadCount;
    this.fileSize = fileSize
  }
}

export enum SongMetadataType {
  AlternativeTitle = "AlternativeTitle",
  Copyright = "Copyright",
  Author = "Author",
  Year = "Year",
  TextSource = "TextSource",
  ScriptureReference = "ScriptureReference",
  Superscription = "Superscription",
}

export class SongMetadata {
  id: number;
  type: SongMetadataType;
  value: string = "";

  constructor(
    type: SongMetadataType,
    value: string = "",
    id = Db.songs.getIncrementedPrimaryKey(SongMetadataSchema)
  ) {
    this.id = id;
    this.type = type;
    this.value = value;
  }

  static clone(obj: SongMetadata): SongMetadata {
    return {
      id: obj.id,
      type: obj.type,
      value: obj.value,
    }
  }
}

export interface VerseProps {
  id: number;
  name: string;
  content: string;
  language: string;
  index: number;
  uuid: string;
  abcLyrics?: string;
}

export class Verse implements VerseProps {
  id: number;
  name: string;
  content: string;
  language: string;
  index: number;
  uuid: string;
  abcLyrics?: string;

  constructor(
    index: number,
    name: string,
    content: string,
    language: string,
    uuid: string,
    abcLyrics?: string,
    id = Db.songs.getIncrementedPrimaryKey(VerseSchema),
  ) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.language = language;
    this.index = index;
    this.uuid = uuid;
    this.abcLyrics = abcLyrics;
  }

  static toObject(verse: VerseProps): VerseProps {
    return {
      id: verse.id,
      name: verse.name,
      content: verse.content,
      language: verse.language,
      index: verse.index,
      uuid: verse.uuid,
      abcLyrics: verse.abcLyrics,
    }
  }
}

export class Song {
  id: number;
  name: string;
  number?: number;
  language: string;
  verses: Verse[];
  createdAt: Date;
  modifiedAt: Date;
  uuid: string;
  abcMelodies: AbcMelody[];
  metadata: SongMetadata[];
  lastUsedMelody?: AbcMelody;
  _songBundles?: SongBundle[];

  constructor(
    name: string,
    language: string,
    createdAt: Date,
    modifiedAt: Date,
    uuid: string,
    verses: Verse[] = [],
    abcMelodies: AbcMelody[] = [],
    metadata: SongMetadata[] = [],
    id = Db.songs.getIncrementedPrimaryKey(SongSchema),
    number?: number,
    songBundle?: SongBundle,
    lastUsedMelody?: AbcMelody
  ) {
    this.id = id;
    this.name = name;
    this.number = number;
    this.language = language;
    this.verses = verses;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.uuid = uuid;
    this.abcMelodies = abcMelodies;
    this.metadata = metadata;
    this.lastUsedMelody = lastUsedMelody;
    this._songBundles = songBundle === undefined ? [] : [songBundle];
  }

  static getSongBundle(song?: Song): SongBundle | undefined {
    if (song === undefined) {
      return undefined;
    }

    if (song._songBundles === undefined || song._songBundles.length === 0) {
      return undefined;
    }

    return song._songBundles[0];
  }

  static clone(obj: Song): Song {
    const result: Song = {
      id: obj.id,
      name: obj.name,
      number: obj.number,
      language: obj.language,
      verses: obj.verses.map(Verse.toObject).sort((a, b) => a.index - b.index),
      createdAt: obj.createdAt,
      modifiedAt: obj.modifiedAt,
      uuid: obj.uuid,
      abcMelodies: obj.abcMelodies.map(AbcMelody.clone),
      metadata: obj.metadata.map(SongMetadata.clone),
      lastUsedMelody: obj.lastUsedMelody ? AbcMelody.clone(obj.lastUsedMelody) : undefined,
      _songBundles: obj._songBundles?.map(it => SongBundle.clone(it, { includeSongs: false })),
    }

    if (result.lastUsedMelody) {
      // Re-assign to keep the pointer reference
      result.lastUsedMelody = result.abcMelodies
        .find(it => it.id === result.lastUsedMelody!.id) ?? result.lastUsedMelody;
    }

    return result;
  }
}

export class SongBundle {
  id: number;
  abbreviation: string;
  name: string;
  language: string;
  author: string;
  copyright: string;
  songs: Song[];
  createdAt: Date;
  modifiedAt: Date;
  uuid: string;
  hash: string;

  constructor(
    abbreviation: string,
    name: string,
    language: string,
    author: string,
    copyright: string,
    createdAt: Date,
    modifiedAt: Date,
    uuid: string,
    hash: string = "",
    songs: Song[] = [],
    id = Db.songs.getIncrementedPrimaryKey(SongBundleSchema)
  ) {
    this.id = id;
    this.abbreviation = abbreviation;
    this.name = name;
    this.language = language;
    this.author = author;
    this.copyright = copyright;
    this.songs = songs;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.uuid = uuid;
    this.hash = hash;
  }

  static clone(obj: SongBundle, options: { includeSongs: boolean } = { includeSongs: false }): SongBundle {
    return {
      id: obj.id,
      abbreviation: obj.abbreviation,
      name: obj.name,
      language: obj.language,
      author: obj.author,
      copyright: obj.copyright,
      songs: !options.includeSongs ? [] : obj.songs.map(Song.clone),
      createdAt: obj.createdAt,
      modifiedAt: obj.modifiedAt,
      uuid: obj.uuid,
      hash: obj.hash
    };
  }
}
