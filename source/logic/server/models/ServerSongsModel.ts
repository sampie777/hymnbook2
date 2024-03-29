import config from "../../../config";

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
  type: SongMetadataType
  value: string = ""
  song: Song | null

  constructor(
    id: number,
    type: SongMetadataType,
    value: string = "",
    song: Song | null,
  ) {
    this.id = id
    this.type = type
    this.value = value
    this.song = song
  }
}

export class AbcSubMelody {
  id: number;
  melody: string = "";
  parentId: number;
  uuid: string = "";

  constructor(
    id: number,
    melody: string = "",
    parentId: number,
    uuid: string
  ) {
    this.id = id;
    this.melody = melody;
    this.parentId = parentId;
    this.uuid = uuid;
  }
}

export class AbcMelody {
  id: number;
  name: string = config.defaultMelodyName;
  melody: string = "";
  uuid: string = "";
  song: Song | null;
  subMelodies: AbcSubMelody[] | null;

  constructor(
    id: number,
    name: string = config.defaultMelodyName,
    melody: string = "",
    uuid: string = "",
    song: Song | null,
    subMelodies: AbcSubMelody[] | null
  ) {
    this.id = id;
    this.name = name;
    this.melody = melody;
    this.uuid = uuid;
    this.song = song;
    this.subMelodies = subMelodies;
  }
}

export class SongVerse {
  id: number;
  name: string;
  content: string;
  language: string;
  index: number;
  uuid: string;
  song: Song | null;
  abcMelodies?: AbcSubMelody[] | null;
  abcLyrics?: string;

  constructor(
    id: number,
    name: string,
    content: string,
    language: string,
    index: number,
    uuid: string,
    song: Song | null,
    abcMelodies?: AbcSubMelody[] | null,
    abcLyrics?: string
  ) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.language = language;
    this.index = index;
    this.uuid = uuid;
    this.song = song;
    this.abcMelodies = abcMelodies;
    this.abcLyrics = abcLyrics;
  }
}

export class Song {
  id: number;
  name: string;
  number?: number;
  language: string;
  verses: Array<SongVerse> | null;
  songBundle: SongBundle | null;
  createdAt: string;
  modifiedAt: string;
  uuid: string;
  abcMelodies?: AbcMelody[] | null;
  metadata?: SongMetadata[] | null;

  constructor(
    id: number,
    name: string,
    language: string,
    verses: Array<SongVerse> | null,
    songBundle: SongBundle | null,
    createdAt: string,
    modifiedAt: string,
    uuid: string,
    number?: number,
    abcMelodies?: AbcMelody[] | null,
    metadata?: SongMetadata[] | null,
  ) {
    this.id = id;
    this.name = name;
    this.number = number;
    this.language = language;
    this.verses = verses;
    this.songBundle = songBundle;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.uuid = uuid;
    this.abcMelodies = abcMelodies;
    this.metadata = metadata ?? [];
  }
}

export class SongBundle {
  id: number;
  abbreviation: string;
  name: string;
  language: string;
  author: string;
  copyright: string;
  songs: Array<Song> | null;
  size?: number;
  createdAt: string;
  modifiedAt: string;
  uuid: string;
  hash: string;

  constructor(id: number,
              abbreviation: string,
              name: string,
              language: string,
              author: string,
              copyright: string,
              songs: Array<Song> | null,
              createdAt: string,
              modifiedAt: string,
              uuid: string,
              hash: string,
              size?: number
  ) {
    this.id = id;
    this.abbreviation = abbreviation;
    this.name = name;
    this.language = language;
    this.author = author;
    this.copyright = copyright;
    this.songs = songs;
    this.size = size;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.uuid = uuid;
    this.hash = hash;
  }
}
