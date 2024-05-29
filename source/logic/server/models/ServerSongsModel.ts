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
  type: SongMetadataType;
  value: string;
  song: Song | null = null;

  constructor(
    id: number,
    type: SongMetadataType,
    value: string = ""
  ) {
    this.id = id;
    this.type = type;
    this.value = value;
  }
}

export class AbcSubMelody {
  id: number;
  name: string;
  melody: string;
  verseUuids: string[];
  uuid: string;
  parent: AbcMelody | null = null;
  verses: SongVerse[] | null = null;

  constructor(
    id: number,
    name: string = "",
    melody: string = "",
    verseUuids: string[] = [],
    uuid: string
  ) {
    this.id = id;
    this.name = name;
    this.melody = melody;
    this.verseUuids = verseUuids;
    this.uuid = uuid;
  }
}

export class AbcMelody {
  id: number;
  name: string;
  melody: string;
  subMelodies: AbcSubMelody[] | null;
  uuid: string;
  song: Song | null = null;
  createdAt: string;
  modifiedAt: string;

  constructor(
    id: number,
    name: string = config.defaultMelodyName,
    melody: string = "",
    subMelodies: AbcSubMelody[] | null = [],
    uuid: string = "",
    createdAt: string = "",
    modifiedAt: string = ""
  ) {
    this.id = id;
    this.name = name;
    this.melody = melody;
    this.subMelodies = subMelodies;
    this.uuid = uuid;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
  }
}

export class SongVerse {
  id: number;
  name: string;
  content: string;
  language: string;
  index: number;
  uuid: string;
  song: Song | null = null;
  abcMelodies: AbcSubMelody[] | null = null;
  abcLyrics: string | null = null;

  constructor(
    id: number,
    name: string,
    content: string,
    language: string,
    index: number,
    uuid: string,
    abcLyrics: string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.language = language;
    this.index = index;
    this.uuid = uuid;
    this.abcLyrics = abcLyrics;
  }
}

export class Song {
  id: number;
  name: string;
  number: number | null;
  language: string;
  verses: Array<SongVerse> | null;
  songBundle: SongBundle | null = null;
  createdAt: string;
  modifiedAt: string;
  uuid: string;
  abcMelodies: AbcMelody[] | null;
  metadata: SongMetadata[] | null;

  constructor(
    id: number,
    name: string,
    language: string,
    verses: Array<SongVerse> | null = null,
    createdAt: string,
    modifiedAt: string,
    uuid: string,
    number: number | null = null,
    abcMelodies: AbcMelody[] | null = null,
    metadata: SongMetadata[] | null = null
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
  size: number = 0;
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
              size: number = 0
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
