export class AbcSubMelody {
  id: number;
  melody: string = "";
  parentId: number;

  constructor(
    id: number,
    melody: string = "",
    parentId: number
  ) {
    this.id = id;
    this.melody = melody;
    this.parentId = parentId;
  }
}

export class AbcMelody {
  id: number;
  name: string = "Default";
  melody: string = "";
  song: Song | null;
  subMelodies: AbcSubMelody[] | null;

  constructor(
    id: number,
    name: string = "Default",
    melody: string = "",
    song: Song | null,
    subMelodies: AbcSubMelody[] | null
  ) {
    this.id = id;
    this.name = name;
    this.melody = melody;
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
  song: Song | null;
  abcMelodies?: AbcSubMelody[] | null;
  abcLyrics?: string;

  constructor(
    id: number,
    name: string,
    content: string,
    language: string,
    index: number,
    song: Song | null,
    abcMelodies?: AbcSubMelody[] | null,
    abcLyrics?: string
  ) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.language = language;
    this.index = index;
    this.song = song;
    this.abcMelodies = abcMelodies;
    this.abcLyrics = abcLyrics;
  }
}

export class Song {
  id: number;
  name: string;
  number?: number;
  author: string;
  copyright: string;
  language: string;
  verses: Array<SongVerse> | null;
  songBundle: SongBundle | null;
  createdAt: string;
  modifiedAt: string;
  abcMelodies?: AbcMelody[] | null;

  constructor(
    id: number,
    name: string,
    author: string,
    copyright: string,
    language: string,
    verses: Array<SongVerse> | null,
    songBundle: SongBundle | null,
    createdAt: string,
    modifiedAt: string,
    number?: number,
    abcMelodies?: AbcMelody[] | null
  ) {
    this.id = id;
    this.name = name;
    this.number = number;
    this.author = author;
    this.copyright = copyright;
    this.language = language;
    this.verses = verses;
    this.songBundle = songBundle;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.abcMelodies = abcMelodies;
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
  }
}
